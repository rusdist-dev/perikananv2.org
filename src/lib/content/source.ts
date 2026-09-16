import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { stripHtml } from '@/lib/html';
import {
  articleSchema,
  collectionItems,
  collections,
  type Article,
  type ArticleListItem,
  type CollectionName,
} from './schema';
import { getProgramNameByCmsSlug } from './program-taxonomy';

/**
 * Satu-satunya tempat yang tahu DARI MANA konten datang.
 *
 * Halaman tidak pernah mengimpor file ini; ia mengimpor lib/content (barrel).
 * Rantainya source -> schema -> index, dan pindah dari JSON lokal ke CMS adalah
 * perubahan satu file di sini. Tanpa seam ini, alamat sumber data tersebar ke
 * setiap halaman dan migrasi berubah jadi cari-ganti lintas repo.
 *
 * File ini server-only lewat impor node:fs -- menariknya ke komponen klien
 * menggagalkan build alih-alih membocorkan pembacaan filesystem ke browser.
 * Kalau mode 'api' suatu saat jadi satu-satunya jalur dan impor fs hilang,
 * pasang paket `server-only` dan impor di sini sebagai gantinya.
 */

type Mode = 'local' | 'api';

const mode: Mode = process.env.CONTENT_SOURCE === 'api' ? 'api' : 'local';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

async function fetchLocal(name: CollectionName): Promise<unknown> {
  const file = path.join(DATA_DIR, `${name}.json`);
  const raw = await readFile(file, 'utf8');
  return JSON.parse(raw);
}

/** Batas atasnya ditentukan server (`cms.max_per_page`, docs/api-public.md) dan
 *  permintaan yang melebihinya dipotong diam-diam. Seratus sudah diverifikasi
 *  dihormati apa adanya (`meta.per_page: 100` pada respons /news). Kalau suatu
 *  saat server memotong lebih rendah pun tidak ada yang hilang: fetchAllPages
 *  mengikuti `meta.last_page`, bukan mengasumsikan satu halaman memuat
 *  semuanya. */
const API_PAGE_SIZE = 100;

/** Pagar terakhir kalau `meta` berbohong atau server mengabaikan `page`:
 *  tanpa ini, respons yang selamanya mengaku punya halaman berikutnya membuat
 *  build berputar sampai kehabisan memori. 50 x 100 = 5.000 entri per locale,
 *  jauh di atas isi CMS hari ini (240 berita). */
const MAX_PAGES = 50;

/** Satu-satunya hal yang membuat konten CMS pernah berubah tanpa deploy ulang.
 *  Tanpa umur hidup, halaman /berita dibangun sekali saat build dan berita
 *  baru tidak akan pernah muncul -- kegagalan diam yang sama yang dicegah
 *  lemparan CONTENT_API_URL kosong di bawah, dan tidak ada webhook CMS yang
 *  bisa menutupinya (lihat komentar `tags` di fetchAllPages).
 *  Angka ini menurunkan interval revalidasi RUTE yang memakainya (lihat
 *  docs/01-app/02-guides/caching-without-cache-components.md di node_modules/next),
 *  jadi halamannya ikut dibangun ulang, bukan cuma datanya yang kedaluwarsa.
 *
 *  Lima menit, bukan satu jam, karena API-nya punya cache sendiri: permintaan
 *  BERHALAMAN (yang ini -- selalu membawa page & per_page) mengikuti masa
 *  berlaku cache "beberapa menit" per company, bukan jalur tanpa filter yang
 *  diperbarui seketika saat konten disimpan (docs/api-public.md §Cache).
 *  Artinya satu putaran refetch bisa saja masih menerima salinan lama dari
 *  CMS; TTL sependek ini yang membatasi berapa lama salinan itu ikut terkunci
 *  di sisi kita -- dua putaran 5 menit masih jauh lebih cepat daripada satu
 *  putaran 1 jam. */
const CACHE_TTL_SECONDS = 300;

/** Node tidak memasang batas waktu apa pun pada fetch. CMS yang MENGGANTUNG
 *  (bukan menolak) karena itu membuat `next build` menunggu selamanya tanpa
 *  pesan apa pun -- kegagalan paling mahal untuk didiagnosis, karena tidak
 *  terlihat seperti kegagalan. Sepuluh detik jauh di atas waktu jawab normal
 *  endpoint berhalaman ini, jadi yang kena hanyalah koneksi yang memang
 *  sudah mati. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Lima percobaan dengan jeda menaik dan acak.
 *
 *  Tiga percobaan tidak cukup: pada build yang sudah direm pun masih ada satu
 *  artikel yang ketiga percobaannya kebetulan kena HTTP 500 semua, dan satu
 *  halaman gagal berarti seluruh build gagal.
 *
 *  Jitter-nya bukan hiasan: worker build menjalankan permintaan dalam
 *  gelombang, jadi jeda yang persis sama membuat semuanya mencoba lagi pada
 *  detik yang sama -- gelombang kedua yang menjatuhkan CMS persis seperti
 *  gelombang pertama. Acak 0-50% memecah barisannya.
 *
 *  Batas atas kegagalan totalnya ~57 detik (5 x REQUEST_TIMEOUT_MS + jeda).
 *  Jalur itu praktis cuma terjadi saat build atau cache dingin: begitu ada
 *  entri cache, revalidasi yang gagal membuat Next menyajikan halaman lama,
 *  bukan menunggu CMS. */
const MAX_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 500;

const EXCERPT_LENGTH = 200;

/** CMS Rekam sering mengirim excerpt kosong (null) -- daripada kartu artikel
 *  menampilkan ringkasan kosong, potong dari body (sudah teks polos lewat
 *  stripHtml) di batas kata terdekat. */
function deriveExcerpt(bodyText: string): string {
  if (bodyText.length <= EXCERPT_LENGTH) return bodyText;
  const cut = bodyText.slice(0, EXCERPT_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Entri "news" CMS -> bentuk mentah yang divalidasi articleSchema. Satu-
 *  satunya tempat yang tahu nama field asli CMS (published_at, cover_url,
 *  dst) -- schema.ts tidak pernah menyebut mereka. */
function mapNewsItem(raw: Record<string, unknown>, lang: Locale): unknown {
  // Excerpt cadangan butuh TEKS body, bukan HTML tersanitasi -- stripHtml
  // (sekali regex) sudah cukup, dan hasilnya dirender sebagai teks biasa.
  // Menjalankan DOMPurify di sini dulu membuat setiap pemuatan daftar
  // mem-parse body tiap artikel lewat jsdom demi sesuatu yang langsung
  // dibuang.
  const bodyText = typeof raw.body === 'string' ? stripHtml(raw.body) : '';
  const rawExcerpt = typeof raw.excerpt === 'string' ? stripHtml(raw.excerpt) : '';

  // `related_programs` CMS Rekam adalah array slug taksonomi program mentah
  // (contoh: "konservasi-spesies"), bukan nama yang sudah diterjemahkan --
  // program-taxonomy.ts yang tahu cara melokalkannya per `lang`.
  const relatedProgramSlugs = Array.isArray(raw.related_programs)
    ? raw.related_programs.filter((slug): slug is string => typeof slug === 'string')
    : [];
  const programNames = relatedProgramSlugs
    .map((slug) => getProgramNameByCmsSlug(slug, lang))
    .filter((name): name is string => Boolean(name));

  // CMS mengirim `category` sebagai objek {slug, name}; bentuk string dipakai
  // sebagai jaring pengaman untuk entri lama yang belum bermigrasi.
  const categoryObject =
    raw.category && typeof raw.category === 'object' ? (raw.category as Record<string, unknown>) : null;
  const categoryName = categoryObject
    ? typeof categoryObject.name === 'string'
      ? categoryObject.name
      : null
    : typeof raw.category === 'string'
      ? raw.category
      : null;
  const categorySlug = categoryObject && typeof categoryObject.slug === 'string' ? categoryObject.slug : null;

  const tags = [categoryName, ...programNames].filter((tag): tag is string => Boolean(tag));

  // Program pertama HANYA untuk label yang ruangnya satu baris; himpunan
  // lengkapnya ikut sebagai `programs` supaya berita lintas-program tidak
  // hilang dari halaman program lain -- lihat komentar keduanya di schema.ts.
  const primaryProgramSlug = relatedProgramSlugs[0];
  const program = primaryProgramSlug
    ? {
        name: getProgramNameByCmsSlug(primaryProgramSlug, lang) ?? primaryProgramSlug,
        slug: primaryProgramSlug,
      }
    : null;

  return {
    lang,
    slug: raw.slug,
    title: raw.title,
    // articleSchema.excerpt butuh minimal 1 karakter -- body kosong pun (data
    // belum lengkap di CMS) tidak boleh membuat seluruh koleksi gagal parse.
    excerpt: rawExcerpt || deriveExcerpt(bodyText) || '—',
    publishedAt: typeof raw.published_at === 'string' ? raw.published_at.slice(0, 10) : raw.published_at,
    tags,
    image: typeof raw.cover_url === 'string' && raw.cover_url ? raw.cover_url : null,
    category: categoryName,
    categorySlug,
    program,
    programs: relatedProgramSlugs,
    cmsId: typeof raw.id === 'string' || typeof raw.id === 'number' ? raw.id : null,
  };
}

/** Entri "news" CMS -> artikel LENGKAP. Satu-satunya tempat DOMPurify
 *  dijalankan atas body, dan satu-satunya jalur yang menghasilkan `Article`
 *  (bukan `ArticleListItem`). */
function mapFullNewsItem(raw: Record<string, unknown>, lang: Locale): unknown {
  const listItem = mapNewsItem(raw, lang) as Record<string, unknown>;
  return {
    ...listItem,
    body: typeof raw.body === 'string' ? DOMPurify.sanitize(raw.body) : '',
  };
}

/** Entri "publications" CMS -> bentuk mentah yang divalidasi
 *  publicationSchema. `lang` tidak dipakai -- publikasi tidak diterjemahkan
 *  per locale (lihat komentar publicationSchema) -- tapi tetap diterima
 *  supaya bentuknya sama dengan mapItem koleksi lain (ApiCollectionConfig
 *  di bawah). */
function mapPublicationItem(raw: Record<string, unknown>): unknown {
  return {
    title: raw.title,
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : null,
    pdfUrl: raw.file_url,
    image: typeof raw.cover_url === 'string' && raw.cover_url ? raw.cover_url : null,
    isFeatured: raw.is_featured === true,
  };
}

/** Satu anggota tim di dalam satu grup "team" CMS -> bentuk mentah yang
 *  divalidasi teamMemberSchema. `level` datang dari grup pembungkusnya
 *  (mapTeamGroup), bukan dari entri anggota itu sendiri. */
function mapTeamMember(raw: Record<string, unknown>, lang: Locale, level: unknown): unknown {
  const socials = (raw.socials as Record<string, unknown> | null | undefined) ?? {};

  return {
    lang,
    level,
    slug: raw.slug,
    name: raw.name,
    position: raw.position,
    bio: typeof raw.bio === 'string' ? DOMPurify.sanitize(raw.bio) : '',
    image: typeof raw.photo_url === 'string' && raw.photo_url ? raw.photo_url : null,
    email: typeof raw.email === 'string' && raw.email ? raw.email : null,
    socials: {
      linkedin: typeof socials.linkedin === 'string' && socials.linkedin ? socials.linkedin : null,
      instagram: typeof socials.instagram === 'string' && socials.instagram ? socials.instagram : null,
    },
  };
}

/** Entri "team" CMS dikelompokkan per jenjang (`{ level: {value,label},
 *  members: [...] }`), BUKAN array flat seperti "news"/"publications" --
 *  satu entri di `json.data` menghasilkan BANYAK anggota tim sekaligus.
 *  Itu sebabnya mapItem di ApiCollectionConfig mengembalikan array, bukan
 *  satu item, supaya koleksi "team" bisa lewat jalur yang sama dengan
 *  koleksi lain di fetchApi. */
function mapTeamGroup(raw: Record<string, unknown>, lang: Locale): unknown[] {
  const level = (raw.level as { value?: unknown } | null | undefined)?.value;
  const members = Array.isArray(raw.members) ? raw.members : [];
  return members.map((member) => mapTeamMember(member as Record<string, unknown>, lang, level));
}

/** Entri "milestones" CMS -> bentuk mentah yang divalidasi milestoneSchema.
 *  CMS Rekam mengirim isinya sebagai satu field teks (`body`) berbaris-baris
 *  (dipisah \r\n), bukan dua field terpisah -- baris tunggal jadi paragraf
 *  (`description`), lebih dari satu baris jadi daftar poin (`bullets`),
 *  meniru persis union Milestone yang dulu ditulis manual di
 *  achievements/page.tsx per tahun. */
function mapMilestoneItem(raw: Record<string, unknown>, lang: Locale): unknown {
  const lines =
    typeof raw.body === 'string'
      ? raw.body
          .split(/\r\n|\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

  return {
    lang,
    year: raw.year,
    title: raw.title,
    description: lines.length === 1 ? lines[0] : null,
    bullets: lines.length > 1 ? lines : [],
    image: typeof raw.cover_url === 'string' && raw.cover_url ? raw.cover_url : null,
  };
}

/** Entri "programs" CMS (`{value, label}`) -> programOptionSchema. `lang`
 *  ikut disematkan karena label-nya diterjemahkan, sementara `value` sama di
 *  kedua bahasa -- itu yang jadi kunci gabung locale di index.ts. */
function mapProgramOptionItem(raw: Record<string, unknown>, lang: Locale): unknown {
  return { lang, value: raw.value, label: raw.label };
}

/** Entri "news-categories" CMS (`{id, slug, name}`) -> newsCategorySchema.
 *  `id` CMS dibuang: tidak ada yang memakainya, dan menyimpannya cuma
 *  mengundang orang memakainya sebagai kunci padahal `slug` yang stabil. */
function mapNewsCategoryItem(raw: Record<string, unknown>, lang: Locale): unknown {
  return { lang, slug: raw.slug, name: raw.name };
}

/** `data` bisa array (endpoint daftar) atau satu objek (`/news/{slug}`,
 *  docs/api-public.md §Amplop respons) -- pemanggil yang menyempitkannya. */
type ApiEnvelope = {
  data?: unknown;
  meta?: { current_page: number; last_page: number; per_page?: number; total?: number };
};

/** Satu koleksi kita bisa jadi nama resource yang berbeda di CMS (kita
 *  bilang "articles", CMS Rekam bilang "news"), dan tidak semua koleksi
 *  perlu diminta per-locale (lihat komentar mapPublicationItem) -- tabel ini
 *  satu-satunya tempat yang tahu bedanya per koleksi. */
type ApiCollectionConfig = {
  resource: string;
  /** true: fetch dipanggil sekali per locale (?lang=id, ?lang=en) dan
   *  hasilnya digabung -- lihat komentar mapNewsItem soal kenapa. false:
   *  fetch dipanggil sekali saja, tanpa parameter lang. */
  perLocale: boolean;
  /** Array, bukan satu item -- satu entri mentah CMS bisa memetakan ke
   *  banyak (team, lihat mapTeamGroup) atau satu (news/publications, yang
   *  cukup membungkusnya sendiri dalam array satu elemen). */
  mapItem: (raw: Record<string, unknown>, lang: Locale) => unknown[];
  /** true: respons membawa `meta` dan ditarik halaman demi halaman; `meta`
   *  yang hilang berarti galat. false: respons memang tidak pernah punya
   *  `meta`, diminta sekali tanpa parameter halaman sama sekali.
   *
   *  Bukan tebakan: keenam nilai di bawah diverifikasi langsung ke API --
   *  news/publications/milestones mengembalikan meta (masing-masing
   *  last_page 3/1/1), team/programs/news-categories tidak mengembalikan
   *  apa pun. Membedakannya di sini yang membuat "tidak ada meta" bisa
   *  diperlakukan sebagai galat pada yang pertama tanpa menyalahkan yang
   *  kedua. */
  paginated: boolean;
};

const apiCollections: Record<CollectionName, ApiCollectionConfig> = {
  articles: {
    resource: 'news',
    perLocale: true,
    paginated: true,
    mapItem: (raw, lang) => [mapNewsItem(raw, lang)],
  },
  publications: {
    resource: 'publications',
    perLocale: false,
    paginated: true,
    mapItem: (raw) => [mapPublicationItem(raw)],
  },
  team: {
    resource: 'team',
    perLocale: true,
    paginated: false,
    mapItem: mapTeamGroup,
  },
  milestones: {
    resource: 'milestones',
    perLocale: true,
    paginated: true,
    mapItem: (raw, lang) => [mapMilestoneItem(raw, lang)],
  },
  programOptions: {
    resource: 'programs',
    perLocale: true,
    paginated: false,
    mapItem: (raw, lang) => [mapProgramOptionItem(raw, lang)],
  },
  newsCategories: {
    resource: 'news-categories',
    perLocale: true,
    paginated: false,
    mapItem: (raw, lang) => [mapNewsCategoryItem(raw, lang)],
  },
};

/** Menyempitkan `data` amplop jadi array entri. Bentuk lain (objek tunggal,
 *  null) menghasilkan array kosong -- validasi per entri di bawah yang
 *  memutuskan apakah itu masalah. */
function asArray(data: unknown): Record<string, unknown>[] {
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
}

/**
 * Batas permintaan serentak ke CMS, per proses.
 *
 * Bukan optimasi kecepatan -- justru sebaliknya. CMS ini menjawab HTTP 500
 * begitu dibanjiri: `next build` menjalankan 15 worker paralel, dan tanpa
 * rem ini satu build menghasilkan ratusan 500 yang menggagalkan prerender
 * (terukur: 269 kegagalan sebelum halaman detail berhenti menarik arsip
 * penuh, 150 sesudahnya). Melambat sedikit jauh lebih murah daripada build
 * yang gagal.
 *
 * Batasnya PER PROSES, jadi konkurensi sesungguhnya saat build adalah
 * jumlah worker x angka ini -- lihat `experimental.cpus` di next.config.ts
 * untuk sisi satunya.
 */
const MAX_CONCURRENT_REQUESTS = 2;

let inFlight = 0;
const waiting: (() => void)[] = [];

async function withRequestSlot<T>(run: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_CONCURRENT_REQUESTS) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  inFlight += 1;
  try {
    return await run();
  } finally {
    inFlight -= 1;
    waiting.shift()?.();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 5xx dan 429 itu keadaan sesaat -- CMS sedang di-deploy, di-restart, atau
 *  sedang sibuk. 401/403/404 sebaliknya: mengulangnya tidak akan pernah
 *  berhasil, cuma menunda pesan galat yang sudah benar. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Satu halaman, dengan batas waktu dan percobaan ulang.
 *
 * `signal` sengaja dipakai meski ia mematikan memoization Next per render
 * pass: yang mahal adalah panggilan JARINGAN, dan itu dicegah oleh
 * `cache: 'force-cache'` yang menurut dokumen memang terpisah dari
 * memoization ("Memoization ... is separate from persistent caching",
 * docs/01-app/03-api-reference/04-functions/fetch.md). Yang hilang cuma
 * penggabungan beberapa panggilan identik dalam satu render jadi satu
 * pembacaan cache -- harga yang jauh lebih murah daripada build yang
 * menggantung tanpa batas waktu.
 */
async function fetchPage(
  url: URL,
  headers: HeadersInit,
  tag: string,
  /** null untuk resource yang tidak berhalaman -- supaya pesan galatnya tidak
   *  menyebut "page=1" untuk permintaan yang tidak pernah mengirim `page`. */
  page: number | null,
): Promise<Response> {
  let lastReason = 'sebab tidak diketahui';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await withRequestSlot(() =>
        fetch(url, {
          headers,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          // Caching fetch di Next 16 itu opt-in (default "auto no cache"), dan
          // "tidak di-cache" di sini TIDAK berarti selalu segar: halaman yang
          // memakainya tetap di-prerender sekali saat build, lalu isinya beku
          // sampai deploy berikutnya. `revalidate` di bawah yang mencairkannya
          // -- dan ia butuh entri cache untuk diberi umur hidup, jadi baris ini
          // syarat, bukan optimasi. Header X-Api-Key tidak menghalangi:
          // force-cache eksplisit meng-cache request yang membawa kredensial.
          cache: 'force-cache',
          // Tag-nya disiapkan, tapi BELUM ada yang memanggil revalidateTag():
          // API CMS Rekam baca-saja dan tidak punya webhook yang bisa memberi
          // tahu kita saat konten terbit (docs/api-public.md). Jadi kesegaran
          // konten sepenuhnya bertumpu pada `revalidate`, bukan pada invalidasi
          // on-demand. Kalau webhook itu suatu saat ada, tag inilah sasarannya
          // dan yang perlu ditambah cuma route handler pemanggilnya.
          next: { tags: [tag], revalidate: CACHE_TTL_SECONDS },
        }),
      );

      // Status permanen dikembalikan apa adanya -- pemanggil yang menyusun
      // pesan galatnya, lengkap dengan petunjuk 404/401 di bawah.
      if (res.ok || !isRetryableStatus(res.status)) return res;
      lastReason = `HTTP ${res.status}`;
    } catch (error) {
      // AbortSignal.timeout melempar TimeoutError di sini, sama jalurnya
      // dengan koneksi yang ditolak atau DNS yang gagal.
      lastReason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }

    if (attempt < MAX_ATTEMPTS) {
      // Percobaan ulang yang berhasil tetap dicatat: CMS yang mulai goyah
      // akan terlihat di log jauh sebelum ia benar-benar menjatuhkan build.
      console.warn(
        `[konten] "${url.pathname}"${page === null ? '' : ` (page=${page})`} gagal pada percobaan ${attempt}/${MAX_ATTEMPTS} -- ${lastReason}; mencoba lagi.`,
      );
      await delay(RETRY_BASE_DELAY_MS * attempt * (1 + Math.random() * 0.5));
    }
  }

  throw new Error(
    `Gagal menghubungi "${url.pathname}"${page === null ? '' : ` (page=${page})`} setelah ${MAX_ATTEMPTS} percobaan: ${lastReason}`,
  );
}

/** Menarik satu resource sampai habis, mengikuti `meta.current_page` /
 *  `meta.last_page` yang dikembalikan CMS Rekam -- `url` sudah membawa semua
 *  parameter query TETAP (lang, per_page); `page` ditambahkan/ditimpa di
 *  sini tiap putaran. */
/** Satu permintaan: kirim, periksa statusnya, kembalikan amplopnya. Dipakai
 *  dua jalur di bawah supaya penanganan status permanen (404 modul nonaktif,
 *  401 kunci salah) tidak ditulis dua kali. */
async function fetchEnvelope(
  url: URL,
  headers: HeadersInit,
  tag: string,
  page: number | null,
  /** true khusus untuk pencarian satu record (`/news/{slug}`): di sana 404
   *  berarti "artikelnya tidak ada" -- jawaban yang sah yang berujung
   *  notFound(), bukan kegagalan konfigurasi. Untuk endpoint daftar, 404
   *  tetap galat (modul nonaktif). */
  allowNotFound = false,
): Promise<ApiEnvelope | null> {
  const res = await fetchPage(url, headers, tag, page);

  if (res.status === 404 && allowNotFound) return null;

  if (!res.ok) {
    // 404 di sini hampir tidak pernah berarti "salah alamat": endpoint yang
    // modulnya nonaktif untuk company ini memang tidak terdaftar sama sekali
    // (docs/api-public.md §Endpoint), dan 401 berarti X_API_KEY salah atau
    // company-nya dinonaktifkan. Menyebutnya di pesan menghemat satu putaran
    // penyelidikan yang salah arah.
    const hint =
      res.status === 404
        ? ' -- modul untuk resource ini kemungkinan nonaktif di CMS'
        : res.status === 401
          ? ' -- X_API_KEY tidak valid atau company-nya nonaktif'
          : '';
    throw new Error(
      `Gagal memuat "${url.pathname}"${page === null ? '' : ` (page=${page})`} dari CMS: HTTP ${res.status}${hint}`,
    );
  }

  return (await res.json()) as ApiEnvelope;
}

/**
 * Resource yang TIDAK berhalaman (`team`, `programs`, `news-categories`):
 * satu permintaan, tanpa `page` maupun `per_page`.
 *
 * Tidak mengirim parameter halaman itu disengaja dua kali: respons ini memang
 * tidak membawa `meta` sama sekali, dan menurut docs/api-public.md §Cache
 * permintaan TANPA filter/halaman adalah jalur yang diperbarui seketika saat
 * konten disimpan -- bukan jalur yang mengikuti cache beberapa menit.
 */
async function fetchSingleResponse(
  url: URL,
  headers: HeadersInit,
  tag: string,
): Promise<Record<string, unknown>[]> {
  const json = await fetchEnvelope(url, headers, tag, null);
  return asArray(json?.data);
}

/**
 * Resource BERHALAMAN (`news`, `publications`, `milestones`) ditarik sampai
 * habis, mengikuti `meta.current_page` / `meta.last_page`.
 *
 * `meta` yang hilang di sini adalah galat, bukan tanda "sudah habis". Versi
 * sebelumnya memperlakukan keduanya sama (`if (!meta || ...) break`), jadi
 * respons yang kehilangan `meta` -- karena perubahan API, proxy yang
 * memangkas, atau modul yang setengah aktif -- diam-diam menghasilkan 100
 * berita pertama saja. Situs tetap tampil normal; yang hilang cuma dua pertiga
 * arsipnya, dan tidak ada yang tahu sampai ada yang mencari berita lama.
 */
async function fetchAllPages(url: URL, headers: HeadersInit, tag: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  url.searchParams.set('per_page', String(API_PAGE_SIZE));
  let page = 1;

  for (;;) {
    url.searchParams.set('page', String(page));

    const json = await fetchEnvelope(url, headers, tag, page);
    for (const raw of asArray(json?.data)) items.push(raw);

    const meta = json?.meta;
    if (!meta) {
      throw new Error(
        `"${url.pathname}" (page=${page}) tidak mengembalikan "meta" padahal resource ini berhalaman. ` +
          `${items.length} entri yang sudah terkumpul tidak bisa dipastikan lengkap, ` +
          'jadi lebih baik gagal daripada menyajikan arsip yang terpotong diam-diam.',
      );
    }

    if (meta.current_page >= meta.last_page) break;

    page += 1;
    if (page > MAX_PAGES) {
      throw new Error(
        `"${url.pathname}" masih meminta halaman ke-${page} setelah ${items.length} entri ` +
          `(batas ${MAX_PAGES} halaman). Kemungkinan besar server mengabaikan parameter "page" ` +
          'atau "meta.last_page" tidak pernah tercapai.',
      );
    }
  }

  return items;
}

/** `extraQuery` menempel ke SETIAP putaran locale dan halaman -- dipakai
 *  loadArticlesByProgram untuk `?program=<slug>`. Sengaja dibiarkan generik
 *  (bukan parameter `program` khusus) karena CMS punya filter lain dengan
 *  bentuk yang sama persis (`category`, `upcoming`, docs/api-public.md), dan
 *  yang membedakannya cuma nama kuncinya. */
/** Alamat + kredensial CMS, divalidasi sekali di satu tempat. Berisik saat
 *  kosong, bukan diam-diam jatuh balik ke JSON lokal: deploy yang mengira
 *  dirinya membaca CMS tapi menyajikan konten build-time adalah kegagalan yang
 *  tidak terlihat sampai konten jadi basi berminggu-minggu. */
function apiAccess(): { base: string; headers: Record<string, string> } {
  const base = process.env.CONTENT_API_URL;
  if (!base) throw new Error('CONTENT_SOURCE=api tetapi CONTENT_API_URL tidak diisi.');

  const apiKey = process.env.X_API_KEY;
  if (!apiKey) throw new Error('CONTENT_SOURCE=api tetapi X_API_KEY tidak diisi.');

  return {
    base: base.replace(/\/$/, ''),
    headers: { Accept: 'application/json', 'X-Api-Key': apiKey },
  };
}

async function fetchApi(name: CollectionName, extraQuery: Record<string, string> = {}): Promise<unknown> {
  const { base, headers } = apiAccess();
  const config = apiCollections[name];
  // CMS-nya tidak punya "semua bahasa sekaligus" untuk koleksi yang
  // diterjemahkan -- lang jadi parameter kueri dan setiap artikel yang belum
  // diterjemahkan sudah di-fallback-kan CMS sendiri. Jadi untuk koleksi
  // perLocale, cukup memanggil sekali per locale yang kita dukung, menandai
  // setiap hasilnya dengan locale yang diminta, dan membiarkan pickForLocale
  // (lib/content/index.ts) memilih yang cocok -- sama seperti bentuk
  // src/data/articles.json yang dulu mencampur kedua bahasa. Koleksi yang
  // tidak diterjemahkan (publications) cukup satu putaran.
  const langsToFetch = config.perLocale ? locales : [defaultLocale];

  const items: unknown[] = [];
  for (const lang of langsToFetch) {
    const url = new URL(`${base}/${config.resource}`);
    if (config.perLocale) url.searchParams.set('lang', lang);
    for (const [key, value] of Object.entries(extraQuery)) url.searchParams.set(key, value);

    const raw = config.paginated
      ? await fetchAllPages(url, headers, name)
      : await fetchSingleResponse(url, headers, name);
    for (const item of raw) items.push(...config.mapItem(item, lang));
  }

  return items;
}

/** Sebutan sependek mungkin untuk entri yang dibuang, supaya barisnya bisa
 *  langsung dicari editor di CMS. Field-nya dicoba berurutan karena tiap
 *  koleksi punya identitas yang berbeda (berita punya slug, milestone punya
 *  year, opsi program punya value). */
function formatIssues(issues: { path: PropertyKey[]; message: string }[]): string {
  return issues.map((issue) => `${issue.path.join('.') || '(akar)'}: ${issue.message}`).join('; ');
}

function describeItem(item: unknown, index: number): string {
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>;
    for (const key of ['slug', 'value', 'title', 'name', 'year']) {
      const candidate = record[key];
      if (typeof candidate === 'string' && candidate) return `${key}="${candidate}"`;
      if (typeof candidate === 'number') return `${key}=${candidate}`;
    }
  }
  return `entri ke-${index + 1}`;
}

/**
 * Validasi PER ENTRI, bukan sekali untuk seluruh array.
 *
 * Sebelumnya satu artikel cacat di CMS -- body kosong, slug bergenerate yang
 * mengandung titik, tanggal berformat lain -- menggagalkan parse seluruh
 * koleksi, dan karena getArticles() dipakai beranda, enam halaman program,
 * /cari, dan /berita, satu baris itu menjatuhkan separuh situs sekaligus.
 * Satu entri yang salah sekarang membuang dirinya sendiri; sisanya tetap
 * tampil.
 *
 * Yang TIDAK diampuni: payload yang sama sekali bukan array, dan kasus
 * "tidak ada satu pun entri yang lolos" padahal CMS mengirim isi. Keduanya
 * berarti kontraknya yang berubah, bukan satu editor yang salah isi --
 * menyajikan halaman kosong di situasi itu adalah kegagalan diam persis
 * seperti yang dicegah lemparan CONTENT_API_URL kosong di bawah.
 *
 * Sengaja tanpa ambang proporsi ("lempar kalau >50% gagal"): angkanya tidak
 * bisa dibenarkan dari apa pun, sementara log di bawah sudah berisik untuk
 * setiap entri yang jatuh.
 */
/** Satu artikel, kebijakan sama dengan validate(): yang cacat dibuang sambil
 *  dicatat, bukan menjatuhkan halaman. Dipakai jalur satu-record
 *  (`/news/{slug}`) dan pratinjau, yang tidak melewati validate() karena tidak
 *  berbentuk koleksi. */
function validateArticleListItem(raw: unknown): ArticleListItem | null {
  const parsed = collectionItems.articles.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] artikel ${describeItem(raw, 0)} dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/** Sama, untuk artikel lengkap dari `/news/{slug}`. */
function validateFullArticle(raw: unknown): Article | null {
  const parsed = articleSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] artikel ${describeItem(raw, 0)} dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

function validate<K extends CollectionName>(
  name: K,
  raw: unknown,
): ReturnType<(typeof collections)[K]['parse']> {
  if (!Array.isArray(raw)) {
    throw new Error(`Koleksi "${name}" (${mode}) bukan array -- dapat ${typeof raw}.`);
  }

  const itemSchema = collectionItems[name];
  const items: unknown[] = [];
  const dropped: string[] = [];

  raw.forEach((item, index) => {
    const parsed = itemSchema.safeParse(item);
    if (parsed.success) {
      items.push(parsed.data);
      return;
    }
    dropped.push(`${describeItem(item, index)} -- ${formatIssues(parsed.error.issues)}`);
  });

  if (dropped.length > 0) {
    // console.error, bukan warn: ini konten yang HILANG dari situs, dan
    // seseorang perlu memperbaikinya di CMS. Dicetak per entri supaya yang
    // salah bisa langsung dibuka, bukan cuma jumlahnya.
    console.error(
      `[konten] ${dropped.length} dari ${raw.length} entri koleksi "${name}" dibuang karena tidak lolos validasi (${mode}):\n` +
        dropped.map((line) => `  - ${line}`).join('\n'),
    );
  }

  if (items.length === 0 && raw.length > 0) {
    throw new Error(
      `Koleksi "${name}" (${mode}): tidak ada satu pun dari ${raw.length} entri yang lolos validasi -- ` +
        'ini perubahan kontrak CMS, bukan satu entri yang salah isi.\n' +
        dropped.map((line) => `  - ${line}`).join('\n'),
    );
  }

  return items as ReturnType<(typeof collections)[K]['parse']>;
}

/**
 * Memo per render pass, bukan pengganti cache Next.
 *
 * `cache()` React menyatukan pemanggilan dengan argumen sama di dalam SATU
 * render. Itu penting karena cache fetch Next hanya menghemat panggilan
 * jaringannya -- pemetaan (DOMPurify atas tiap body) dan validasi tetap
 * berjalan ulang setiap kali loadCollection dipanggil, dan itu ~700ms untuk
 * koleksi artikel (sudah diukur). Halaman yang memanggilnya tiga kali karena
 * itu membayar tiga kali tanpa memo ini.
 *
 * Dipakai lewat pembungkus generik di bawah supaya tanda tangan publiknya
 * tetap mengembalikan tipe koleksi yang tepat, bukan `unknown`.
 */
const loadCollectionMemo = cache(async (name: CollectionName): Promise<unknown> => {
  const raw = mode === 'api' ? await fetchApi(name) : await fetchLocal(name);
  return validate(name, raw);
});

/** Ambil + validasi satu koleksi. Melempar kalau bentuknya tidak sesuai skema. */
export async function loadCollection<K extends CollectionName>(
  name: K,
): Promise<ReturnType<(typeof collections)[K]['parse']>> {
  return (await loadCollectionMemo(name)) as ReturnType<(typeof collections)[K]['parse']>;
}

/**
 * Berita satu program saja, disaring DI CMS lewat `?program=<slug>`
 * (docs/api-public.md §Berita) -- bukan menarik seluruh koleksi lalu memilah
 * di sini.
 *
 * Bukan cuma soal hemat: penyaringan lokal yang digantikannya membandingkan
 * `article.program?.slug`, yaitu program PERTAMA saja, sehingga satu berita
 * yang ditandai banyak program cuma muncul di satu halaman program dan hilang
 * dari sisanya. CMS mencocokkan ke seluruh `related_programs`, jadi
 * menyerahkan penyaringan ke sana sekaligus menutup celah itu.
 *
 * `cmsProgramSlug` adalah slug taksonomi CMS (lihat program-taxonomy.ts),
 * bukan slug rute frontend. Tag cache-nya tetap "articles", sama dengan
 * koleksi penuhnya.
 */
const loadArticlesByProgramMemo = cache(async (cmsProgramSlug: string): Promise<ArticleListItem[]> => {
  if (mode !== 'api') {
    // Mode lokal tidak punya server yang bisa menyaring, jadi disaring di
    // sini -- lewat `programs` (himpunan lengkap), bukan `program`, supaya
    // hasilnya sama persis dengan yang dikembalikan CMS. Dua mode yang
    // diam-diam menjawab berbeda untuk kueri yang sama adalah bug yang baru
    // ketahuan setelah deploy.
    const all = validate('articles', await fetchLocal('articles'));
    return all.filter((article) => article.programs.includes(cmsProgramSlug));
  }

  return validate('articles', await fetchApi('articles', { program: cmsProgramSlug }));
});

export function loadArticlesByProgram(cmsProgramSlug: string): Promise<ArticleListItem[]> {
  return loadArticlesByProgramMemo(cmsProgramSlug);
}

/**
 * SATU artikel lewat `/news/{slug}` -- bukan menarik seluruh arsip lalu
 * mencarinya.
 *
 * Inilah perbedaan yang membuat `next build` bisa selesai. Versi sebelumnya
 * membangun halaman detail dari getArticles(), yang berarti setiap satu dari
 * 480 halaman artikel menarik dan memvalidasi SELURUH 240 artikel x 2 bahasa,
 * tiga kali. Dengan 15 worker paralel, CMS menjawab 269 kali HTTP 500 dan
 * build berhenti.
 *
 * Perilaku endpointnya sudah diverifikasi langsung: ia menerima slug bahasa
 * mana pun, lalu mengembalikan artikel DALAM bahasa yang diminta beserta slug
 * bahasa itu. Itu juga yang membuat getArticleLocaleSlugs cukup memanggil ini
 * sekali lagi per locale, bukan membaca seluruh koleksi.
 *
 * null berarti CMS menjawab 404 -- artikelnya memang tidak ada, dan halaman
 * memanggil notFound(). Artikel yang ADA tapi gagal validasi juga null:
 * konsisten dengan koleksi, yang membuang entri cacat alih-alih menjatuhkan
 * seluruh halaman (lihat validate()).
 */
const loadArticleBySlugMemo = cache(async (slug: string, lang: Locale): Promise<Article | null> => {
  if (mode !== 'api') {
    // Fixture lokal memakai bentuk yang sama dengan entri daftar, jadi `body`
    // diambil apa adanya dari berkasnya -- di sana isinya teks polos, bukan
    // HTML yang perlu disanitasi (lihat komentar articleSchema.body).
    const raw = (await fetchLocal('articles')) as Record<string, unknown>[];
    const match =
      raw.find((item) => item.slug === slug && item.lang === lang) ??
      raw.find((item) => item.slug === slug);
    return match ? validateFullArticle(match) : null;
  }

  const { base, headers } = apiAccess();
  const url = new URL(`${base}/news/${encodeURIComponent(slug)}`);
  url.searchParams.set('lang', lang);

  const json = await fetchEnvelope(url, headers, 'articles', null, true);
  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  return validateFullArticle(mapFullNewsItem(json.data as Record<string, unknown>, lang));
});

export function loadArticleBySlug(slug: string, lang: Locale): Promise<Article | null> {
  return loadArticleBySlugMemo(slug, lang);
}

/**
 * Beberapa artikel terbaru saja -- satu halaman, tanpa mengikuti paginasi.
 * Dipakai untuk kartu "related" di bawah artikel, yang cuma butuh tiga.
 *
 * Satu locale saja (tidak seperti koleksi penuh yang ditarik per bahasa lalu
 * digabung): CMS sudah jatuh balik sendiri ke bahasa Indonesia saat terjemahan
 * Inggrisnya kosong (docs/api-public.md §Bahasa), dan kartu ringkas tidak
 * menampilkan atribut lang seperti halaman detail. Menarik dua bahasa untuk
 * tiga kartu cuma menggandakan permintaan tanpa mengubah yang tampil.
 */
const loadArticlePreviewsMemo = cache(
  async (lang: Locale, limit: number, programSlug: string | null): Promise<ArticleListItem[]> => {
    if (mode !== 'api') {
      const all = validate('articles', await fetchLocal('articles'));
      return all
        .filter((a) => a.lang === lang && (!programSlug || a.programs.includes(programSlug)))
        .slice(0, limit);
    }

    const { base, headers } = apiAccess();
    const url = new URL(`${base}/news`);
    url.searchParams.set('lang', lang);
    url.searchParams.set('per_page', String(limit));
    url.searchParams.set('page', '1');
    if (programSlug) url.searchParams.set('program', programSlug);

    const json = await fetchEnvelope(url, headers, 'articles', 1);
    const mapped = asArray(json?.data).map((raw) => mapNewsItem(raw, lang));
    return mapped
      .map(validateArticleListItem)
      .filter((article): article is ArticleListItem => article !== null);
  },
);

/** Kueri daftar berita yang seluruhnya dilayani CMS. `page` di sini nomor
 *  halaman YANG DILIHAT PENGUNJUNG -- untuk urutan terlama ia tidak sama
 *  dengan nomor halaman API (lihat loadArticlesQuery). */
export type ArticleQuery = {
  lang: Locale;
  search: string;
  year: string;
  program: string;
  category: string;
  sort: 'newest' | 'oldest';
  page: number;
  perPage: number;
};

export type ArticlePage = {
  articles: ArticleListItem[];
  /** Jumlah artikel yang cocok dengan filter, langsung dari `meta.total`. */
  total: number;
  totalPages: number;
};

/** Satu halaman API apa adanya, plus totalnya. `apiPage` di sini benar-benar
 *  nomor halaman yang dikirim ke CMS. */
async function fetchNewsPage(
  query: ArticleQuery,
  apiPage: number,
  perPage: number,
): Promise<{ items: ArticleListItem[]; total: number }> {
  const { base, headers } = apiAccess();
  const url = new URL(`${base}/news`);
  url.searchParams.set('lang', query.lang);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(apiPage));
  // Nilai kosong sengaja tidak dikirim: CMS memang mengabaikannya, tapi
  // setiap parameter yang ikut mengubah kunci cache -- "?search=" dan tanpa
  // search akan jadi dua entri cache untuk hasil yang sama persis.
  if (query.search) url.searchParams.set('search', query.search);
  if (query.year) url.searchParams.set('year', query.year);
  if (query.program) url.searchParams.set('program', query.program);
  if (query.category) url.searchParams.set('category', query.category);
  // `desc` adalah bawaan CMS, jadi hanya urutan sebaliknya yang perlu disebut
  // -- menyertakannya selalu cuma memecah kunci cache jadi dua untuk hasil
  // yang sama.
  if (query.sort === 'oldest') url.searchParams.set('sort', 'asc');

  const json = await fetchEnvelope(url, headers, 'articles', apiPage);
  const items = asArray(json?.data)
    .map((raw) => validateArticleListItem(mapNewsItem(raw, query.lang)))
    .filter((article): article is ArticleListItem => article !== null);

  return { items, total: json?.meta?.total ?? items.length };
}

/**
 * Satu halaman daftar berita, disaring dan dipaginasi SEPENUHNYA oleh CMS.
 *
 * Menggantikan pola lama "kirim seluruh arsip ke browser lalu saring di
 * sana": halaman /berita dulu membawa 240 artikel (~34 KB gzip) supaya filter
 * terasa seketika. Sejak CMS mendukung `search` dan `year` (docs/api-public.md),
 * seluruh panel filter bisa dilayani server dan yang dikirim tinggal satu
 * halaman.
 *
 * Termasuk urutannya: `sort=asc` dilayani CMS. Sempat ada cabang di sini yang
 * menghitung halaman terlama sendiri dengan membalik indeks terhadap
 * `meta.total` -- perlu saat parameter itu belum ada, dan dihapus begitu ada.
 */
const loadArticlesQueryMemo = cache(async (key: string): Promise<ArticlePage> => {
  const query = JSON.parse(key) as ArticleQuery;
  const { perPage } = query;

  const { items, total } = await fetchNewsPage(query, query.page, perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Halaman di luar rentang dijepit ke halaman terakhir, bukan disajikan
  // kosong. Daftar kosong yang berdampingan dengan "menampilkan 0-0 dari 9"
  // membaca seperti kerusakan, padahal yang terjadi cuma nomor halaman basi --
  // URL lama yang di-bookmark saat arsipnya masih lebih pendek, atau angka
  // yang disunting tangan. Permintaan kedua ini hanya terjadi di kasus itu.
  if (items.length === 0 && total > 0 && query.page > totalPages) {
    const last = await fetchNewsPage(query, totalPages, perPage);
    return { articles: last.items, total, totalPages };
  }

  return { articles: items, total, totalPages };
});

export function loadArticlesQuery(query: ArticleQuery): Promise<ArticlePage> {
  // Kuncinya string supaya cache() React bisa mencocokkan argumen objek.
  return loadArticlesQueryMemo(JSON.stringify(query));
}

export function loadArticlePreviews(
  lang: Locale,
  limit: number,
  programSlug: string | null,
): Promise<ArticleListItem[]> {
  return loadArticlePreviewsMemo(lang, limit, programSlug);
}
