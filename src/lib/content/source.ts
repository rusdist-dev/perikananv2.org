import { readFile } from 'node:fs/promises';
import path from 'node:path';
import DOMPurify from 'isomorphic-dompurify';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { stripHtml } from '@/lib/html';
import { collections, type Article, type CollectionName } from './schema';
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
 *  permintaan yang melebihinya dipotong diam-diam -- lebih baik eksplisit di
 *  sini daripada mengira sedang meminta lebih banyak dari yang sebenarnya
 *  didapat. Kalau server memotong lebih rendah dari ini pun tidak ada yang
 *  hilang: fetchAllPages mengikuti `meta.last_page`, bukan mengasumsikan satu
 *  halaman sudah memuat semuanya. */
const API_PAGE_SIZE = 100;

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
  const bodyHtml = typeof raw.body === 'string' ? DOMPurify.sanitize(raw.body) : '';
  const bodyText = stripHtml(bodyHtml);
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
  const categorySlug =
    categoryObject && typeof categoryObject.slug === 'string' ? categoryObject.slug : null;

  const tags = [categoryName, ...programNames].filter((tag): tag is string => Boolean(tag));

  // Program pertama HANYA untuk label yang ruangnya satu baris; himpunan
  // lengkapnya ikut sebagai `programs` supaya berita lintas-program tidak
  // hilang dari halaman program lain -- lihat komentar keduanya di schema.ts.
  const primaryProgramSlug = relatedProgramSlugs[0];
  const program = primaryProgramSlug
    ? { name: getProgramNameByCmsSlug(primaryProgramSlug, lang) ?? primaryProgramSlug, slug: primaryProgramSlug }
    : null;

  return {
    lang,
    slug: raw.slug,
    title: raw.title,
    // articleSchema.excerpt butuh minimal 1 karakter -- body kosong pun (data
    // belum lengkap di CMS) tidak boleh membuat seluruh koleksi gagal parse.
    excerpt: rawExcerpt || deriveExcerpt(bodyText) || '—',
    body: bodyHtml,
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

type ApiPage = { data?: unknown[]; meta?: { current_page: number; last_page: number } };

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
};

const apiCollections: Record<CollectionName, ApiCollectionConfig> = {
  articles: { resource: 'news', perLocale: true, mapItem: (raw, lang) => [mapNewsItem(raw, lang)] },
  publications: { resource: 'publications', perLocale: false, mapItem: (raw) => [mapPublicationItem(raw)] },
  team: { resource: 'team', perLocale: true, mapItem: mapTeamGroup },
  milestones: { resource: 'milestones', perLocale: true, mapItem: (raw, lang) => [mapMilestoneItem(raw, lang)] },
  programOptions: {
    resource: 'programs',
    perLocale: true,
    mapItem: (raw, lang) => [mapProgramOptionItem(raw, lang)],
  },
  newsCategories: {
    resource: 'news-categories',
    perLocale: true,
    mapItem: (raw, lang) => [mapNewsCategoryItem(raw, lang)],
  },
};

/** Menarik satu resource sampai habis, mengikuti `meta.current_page` /
 *  `meta.last_page` yang dikembalikan CMS Rekam -- `url` sudah membawa semua
 *  parameter query TETAP (lang, per_page); `page` ditambahkan/ditimpa di
 *  sini tiap putaran. */
async function fetchAllPages(
  url: URL,
  headers: HeadersInit,
  tag: string,
): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let page = 1;

  for (;;) {
    url.searchParams.set('page', String(page));

    const res = await fetch(url, {
      headers,
      // Caching fetch di Next 16 itu opt-in (default "auto no cache"), dan
      // "tidak di-cache" di sini TIDAK berarti selalu segar: halaman yang
      // memakainya tetap di-prerender sekali saat build, lalu isinya beku
      // sampai deploy berikutnya. `revalidate` di bawah yang mencairkannya --
      // dan ia butuh entri cache untuk diberi umur hidup, jadi baris ini
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
    });

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
        `Gagal memuat "${url.pathname}" dari CMS (page=${page}): HTTP ${res.status}${hint}`,
      );
    }

    const json = (await res.json()) as ApiPage;
    for (const raw of json.data ?? []) items.push(raw as Record<string, unknown>);

    const meta = json.meta;
    if (!meta || meta.current_page >= meta.last_page) break;
    page += 1;
  }

  return items;
}

/** `extraQuery` menempel ke SETIAP putaran locale dan halaman -- dipakai
 *  loadArticlesByProgram untuk `?program=<slug>`. Sengaja dibiarkan generik
 *  (bukan parameter `program` khusus) karena CMS punya filter lain dengan
 *  bentuk yang sama persis (`category`, `upcoming`, docs/api-public.md), dan
 *  yang membedakannya cuma nama kuncinya. */
async function fetchApi(
  name: CollectionName,
  extraQuery: Record<string, string> = {},
): Promise<unknown> {
  const base = process.env.CONTENT_API_URL;
  if (!base) {
    // Berisik, bukan diam-diam jatuh balik ke JSON lokal: deploy yang mengira
    // dirinya membaca CMS tapi menyajikan konten build-time adalah kegagalan
    // yang tidak terlihat sampai konten jadi basi berminggu-minggu.
    throw new Error('CONTENT_SOURCE=api tetapi CONTENT_API_URL tidak diisi.');
  }

  const apiKey = process.env.X_API_KEY;
  if (!apiKey) {
    throw new Error('CONTENT_SOURCE=api tetapi X_API_KEY tidak diisi.');
  }

  const config = apiCollections[name];
  const headers = { Accept: 'application/json', 'X-Api-Key': apiKey };
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
    const url = new URL(`${base.replace(/\/$/, '')}/${config.resource}`);
    if (config.perLocale) url.searchParams.set('lang', lang);
    url.searchParams.set('per_page', String(API_PAGE_SIZE));
    for (const [key, value] of Object.entries(extraQuery)) url.searchParams.set(key, value);

    const raw = await fetchAllPages(url, headers, name);
    for (const item of raw) items.push(...config.mapItem(item, lang));
  }

  return items;
}

function validate<K extends CollectionName>(
  name: K,
  raw: unknown,
): ReturnType<(typeof collections)[K]['parse']> {
  const parsed = collections[name].safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `Koleksi "${name}" tidak lolos validasi (${mode}):\n` +
        JSON.stringify(parsed.error.issues, null, 2),
    );
  }

  return parsed.data as ReturnType<(typeof collections)[K]['parse']>;
}

/** Ambil + validasi satu koleksi. Melempar kalau bentuknya tidak sesuai skema. */
export async function loadCollection<K extends CollectionName>(
  name: K,
): Promise<ReturnType<(typeof collections)[K]['parse']>> {
  const raw = mode === 'api' ? await fetchApi(name) : await fetchLocal(name);
  return validate(name, raw);
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
export async function loadArticlesByProgram(cmsProgramSlug: string): Promise<Article[]> {
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
}
