import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { cmsAccess } from '@/lib/cms';
import { stripHtml } from '@/lib/html';
import {
  IKAN_CATCH_CHART_LEVELS,
  IKAN_LENGTH_CHART_LEVELS,
  IKAN_LEVEL_ENDPOINT,
  IKAN_LEVEL_PARAM,
  IKAN_TRIP_CHART_LEVELS,
  ancestorSelection,
  isIsoDate,
  type IkanCatchQuery,
  type IkanFilterLevel,
  type IkanLengthQuery,
  type IkanOption,
  type IkanSelection,
  type IkanTripQuery,
} from '@/lib/ikan-filters';
import {
  BSC_CATCH_CHART_LEVELS,
  BSC_LEVEL_ENDPOINT,
  BSC_LEVEL_PARAM,
  BSC_TRIP_CHART_LEVELS,
  BSC_WIDTH_CHART_LEVELS,
  // Dialiaskan karena ikan-filters mengekspor nama yang sama: keduanya
  // memotong hierarki yang BERBEDA (BSC tanpa WPPNRI), jadi memanggil yang
  // salah akan mengirim parameter yang tidak dikenal endpointnya.
  ancestorSelection as bscAncestorSelection,
  type BscCatchQuery,
  type BscFilterLevel,
  type BscOption,
  type BscSelection,
  type BscTripQuery,
  type BscWidthQuery,
} from '@/lib/bsc-filters';
import {
  type HiupariLengthQuery,
  type HiupariOption,
} from '@/lib/hiupari-filters';
import {
  type StscArmadaQuery,
  type StscKomoditasOption,
  type StscProduksiQuery,
  type StscWppOption,
} from '@/lib/stsc-filters';
import {
  articleSchema,
  bscCatchChartSchema,
  bscOptionsSchema,
  bscTripChartSchema,
  bscWidthChartSchema,
  hiupariLengthChartSchema,
  hiupariOptionsSchema,
  stscArmadaChartSchema,
  stscKomoditasOptionsSchema,
  stscProduksiChartSchema,
  stscWppOptionsSchema,
  coastStatsSchema,
  collectionItems,
  collections,
  ikanCatchChartSchema,
  ikanLengthChartSchema,
  ikanOptionsSchema,
  ikanTripChartSchema,
  villageDetailSchema,
  type Article,
  type ArticleListItem,
  type BscCatchChart,
  type BscTripChart,
  type BscWidthChart,
  type CoastStats,
  type CollectionName,
  type HiupariLengthChart,
  type StscArmadaChart,
  type StscProduksiChart,
  type IkanCatchChart,
  type IkanLengthChart,
  type IkanTripChart,
  type VillageDetail,
} from './schema';
import { getProgramNameByCmsSlug } from './program-taxonomy';
import { parseJogoLautMonitoring, type JogoLautMonitoring } from './jogolaut';

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

/** Fixture mode lokal yang BUKAN koleksi: detail desa diambil satu record
 *  (lihat loadVillageDetail) dan statistik agregat memang satu objek, jadi
 *  keduanya tidak punya entri di `collections` -- tapi mode lokal tetap butuh
 *  berkasnya supaya panel dan kartu totalan Our Impact tidak kosong saat
 *  CONTENT_SOURCE belum 'api'. Ditulis sebagai union, bukan `string`, supaya
 *  salah ketik nama berkas tetap gagal saat typecheck. */
type LocalFixture =
  | CollectionName
  | 'villageDetails'
  | 'coastStats'
  | 'ikanOptions'
  | 'ikanTripChart'
  | 'ikanCatchChart'
  | 'ikanLengthChart'
  | 'bscOptions'
  | 'bscTripChart'
  | 'bscCatchChart'
  | 'bscWidthChart'
  | 'hiupariOptions'
  | 'hiupariLengthChart'
  | 'stscWppOptions'
  | 'stscKomoditasOptions'
  | 'stscArmadaChart'
  | 'stscProduksiChart'
  | 'jogoLautMonitoring';

async function fetchLocal(name: LocalFixture): Promise<unknown> {
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

/** Angka dari CMS yang boleh saja kosong. String kosong, null, dan nilai yang
 *  bukan angka sama-sama jadi null -- BUKAN 0: "belum didata" dan "nol"
 *  adalah dua pernyataan berbeda, dan panel menampilkannya berbeda pula. */
function optionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

/** Koordinat desa. `koordinat` yang null (desa tanpa baris boundary di CMS)
 *  menghasilkan lat/lng null berdua, bukan salah satunya -- setengah koordinat
 *  tidak bisa dipakai untuk apa pun. */
function mapKoordinat(raw: unknown): { lat: number | null; lng: number | null } {
  if (!raw || typeof raw !== 'object') return { lat: null, lng: null };
  const point = raw as Record<string, unknown>;
  const lat = optionalNumber(point.lat);
  const lng = optionalNumber(point.lng);
  return lat === null || lng === null ? { lat: null, lng: null } : { lat, lng };
}

/** Enam desimal ~ 11 cm di khatulistiwa.
 *
 *  API mengirim 14-15 desimal (-7.711906403999933), yaitu presisi sisa
 *  perhitungan floating point, bukan presisi survei: digit ke-8 dan seterusnya
 *  menyatakan jarak di bawah sepersejuta meter. Yang dipotong di sini karena
 *  itu bukan ketelitian, melainkan noise yang harus diangkut ke browser setiap
 *  kali desa diklik -- dan batas desa adalah bagian terbesar muatan itu
 *  (25 KB untuk Ujungalang sebelum dipangkas, lebih besar dari seluruh sisa
 *  detailnya digabung). Pada zoom maksimum peta ini satu piksel masih ~19
 *  meter, jadi selisihnya tidak akan pernah terlihat. */
const COORD_DECIMALS = 1e6;

function roundCoord(value: number): number {
  return Math.round(value * COORD_DECIMALS) / COORD_DECIMALS;
}

function isCoord(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

/** Satu cincin tertutup. Kurang dari tiga titik bukan bidang apa pun, jadi
 *  dibuang -- Leaflet akan menggambarnya sebagai garis atau tidak sama sekali,
 *  dan itu terbaca seperti peta yang rusak. */
function mapRing(raw: unknown): [number, number][] | null {
  if (!Array.isArray(raw)) return null;

  const points = raw
    .filter(isCoord)
    .map(([lat, lng]): [number, number] => [roundCoord(lat), roundCoord(lng)]);

  return points.length >= 3 ? points : null;
}

function mapPolygon(raw: unknown): [number, number][][] | null {
  if (!Array.isArray(raw)) return null;

  const rings = raw.map(mapRing).filter((ring): ring is [number, number][] => ring !== null);
  return rings.length > 0 ? rings : null;
}

/**
 * `peta.path` -> daftar poligon yang seragam.
 *
 * Ada karena API mengirim DUA bentuk berbeda untuk field yang sama, dan ini
 * sudah diperiksa langsung ke endpoint-nya:
 *
 *   - Depok  : `[ cincin, ... ]`            (kedalaman 3) -- satu bidang
 *   - Ujungalang, Kapoposang Bali
 *              `[ [ cincin, ... ], ... ]`   (kedalaman 4) -- banyak bidang
 *
 * Keduanya dinormalkan jadi bentuk kedua. Yang membedakan keduanya cuma satu
 * pertanyaan: apakah elemen pertama dari elemen pertama sudah berupa TITIK?
 * Kalau ya, seluruh `path` adalah satu poligon dan cincin-cincinnya ada di
 * tingkat atas; kalau tidak, tingkat atas itu daftar poligon.
 *
 * Menebak dari `length` tidak bisa dipakai: desa berbidang tunggal dan desa
 * berbidang banyak sama-sama bisa punya panjang berapa pun.
 */
function mapVillageBoundary(raw: unknown): [number, number][][][] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const first = raw[0];
  if (Array.isArray(first) && isCoord(first[0])) {
    const polygon = mapPolygon(raw);
    return polygon ? [polygon] : [];
  }

  return raw
    .map(mapPolygon)
    .filter((polygon): polygon is [number, number][][] => polygon !== null);
}

/** Satu entri `/ext/coast/desa`. Nama field API-nya snake_case dan sebagian
 *  panjang (`kabupaten_kota`); pemetaan ke nama skema terjadi di sini supaya
 *  komponen tidak pernah menyentuh bentuk mentah CMS. */
function mapImpactVillageItem(raw: Record<string, unknown>): unknown {
  return {
    kode: raw.desa_kode,
    desa: raw.desa,
    kecamatan: raw.kecamatan,
    kabupaten: raw.kabupaten_kota,
    provinsi: raw.provinsi,
    ...mapKoordinat(raw.koordinat),
    jumlahForm: optionalNumber(raw.jumlah_form) ?? 0,
    pendataanTerakhir: optionalText(raw.pendataan_terakhir),
  };
}

/** Satu entri `/ext/coast/kawasan-konservasi`.
 *
 *  Yang benar-benar dipakai peta cuma `id_mpa`; sisanya mengisi tooltip dan
 *  keterangan. Nama panjangnya dibiarkan apa adanya dari CMS -- termasuk huruf
 *  besar-kecil yang tidak seragam -- karena yang dipakai mencocokkan poligon
 *  memang bukan nama. */
function mapConservationAreaItem(raw: Record<string, unknown>): unknown {
  return {
    id: optionalNumber(raw.id),
    nama: optionalText(raw.nama_kawasan),
    idMpa: optionalText(raw.id_mpa),
    luas: optionalNumber(raw.luas_area_dikonservasi),
    pelaksana: optionalText(raw.pelaksana_konservasi),
  };
}

/** Satu metrik statistik beserta rinciannya, rekursif.
 *
 *  Sarangnya diikuti sampai habis, bukan dipotong di tingkat kedua: data hari
 *  ini tiga tingkat ("Dampak Ekonomi (Produksi)" -> "Perikanan Tangkap" ->
 *  "Lainnya"), dan komoditas baru di CMS bisa menambah tingkat tanpa memberi
 *  tahu siapa pun.
 *
 *  `children_sum_to_total` dibaca sebagai boolean apa adanya -- undefined
 *  (metrik daun, CMS tidak mengirim field ini) jadi null, bukan false: "tidak
 *  menjumlah" adalah pernyataan tentang rincian yang ADA, dan baris tanpa
 *  rincian tidak menyatakan apa-apa. */
function mapVillageMetric(raw: Record<string, unknown>): unknown {
  return {
    key: raw.key,
    label: raw.label,
    unit: optionalText(raw.unit),
    decimals: optionalNumber(raw.decimals) ?? 0,
    baru: optionalNumber(raw.baru),
    lama: optionalNumber(raw.lama),
    childrenSumToTotal:
      typeof raw.children_sum_to_total === 'boolean' ? raw.children_sum_to_total : null,
    children: asArray(raw.children).map(mapVillageMetric),
  };
}

/**
 * Satu respons `/ext/coast/desa/{desa_kode}`, diratakan.
 *
 * Bentuk API-nya bersarang (`wilayah`, `peta`, `pendataan`, `statistik.metrik`)
 * sementara skemanya rata: yang bersarang di sana adalah asal datanya di CMS,
 * bukan cara panel memakainya -- panel butuh "desa", "tahun pembanding", dan
 * tiga daftar, bukan empat objek yang harus ditelusuri ulang di JSX.
 *
 * `peta.path` diratakan lewat mapVillageBoundary() di bawah -- lihat di sana
 * soal dua bentuk sarang berbeda yang dikirim API untuk field yang sama.
 */
function mapVillageDetail(raw: Record<string, unknown>): unknown {
  const wilayah = (raw.wilayah ?? {}) as Record<string, unknown>;
  const peta = (raw.peta ?? {}) as Record<string, unknown>;
  const pendataan = (raw.pendataan ?? {}) as Record<string, unknown>;
  const statistik = (raw.statistik ?? {}) as Record<string, unknown>;

  return {
    kode: wilayah.desa_kode,
    desa: wilayah.desa,
    kecamatan: wilayah.kecamatan,
    kabupaten: wilayah.kabupaten_kota,
    provinsi: wilayah.provinsi,
    lat: optionalNumber(peta.lat),
    lng: optionalNumber(peta.lng),
    jumlahForm: optionalNumber(pendataan.jumlah_form) ?? 0,
    pendataanTerakhir: optionalText(pendataan.terakhir),
    tahunBaru: optionalNumber(statistik.tahun_baru),
    tahunLama: optionalNumber(statistik.tahun_lama),
    metrik: asArray(statistik.metrik).map(mapVillageMetric),
    gambar: asArray(raw.gambar)
      // Entri tanpa url dibuang di sini, bukan dibiarkan gagal validasi:
      // gambar yang hilang bukan alasan untuk menjatuhkan seluruh detail desa.
      .filter((image) => typeof image.url === 'string' && image.url !== '')
      .map((image) => ({ url: image.url, keterangan: optionalText(image.keterangan) })),
    rehabilitasi: asArray(raw.rehabilitasi).map((item) => ({
      tanggal: optionalText(item.tanggal),
      ekosistem: optionalText(item.ekosistem),
      statusLahan: optionalText(item.status_lahan),
      luas: optionalNumber(item.luas_area_direhabilitasi),
      pelaksana: optionalText(item.pelaksana),
      kolaborator: optionalText(item.kolaborator),
      jumlahBibit: optionalNumber(item.jumlah_bibit),
      survivalRate: optionalNumber(item.survival_rate),
    })),
    batas: mapVillageBoundary(peta.path),
    pelatihan: asArray(raw.pelatihan).map((item) => ({
      tanggal: optionalText(item.tanggal),
      nama: optionalText(item.nama),
      peserta: optionalNumber(item.peserta),
      pria: optionalNumber(item.peserta_pria),
      wanita: optionalNumber(item.peserta_wanita),
      remaja: optionalNumber(item.peserta_remaja),
      lansia: optionalNumber(item.peserta_lansia),
      disabilitas: optionalNumber(item.peserta_disabilitas),
    })),
  };
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
  impactVillages: {
    // Resource-nya ber-segmen dua: endpoint pendataan pesisir hidup di bawah
    // awalan `ext/`, bukan sejajar dengan /news dan /publications.
    resource: 'ext/coast/desa',
    // Tidak per-locale: endpoint ini tidak menerima `?lang=` sama sekali, dan
    // isinya nama wilayah administratif yang memang tidak diterjemahkan.
    perLocale: false,
    // Tidak dipaginasi -- ini yang dijanjikan dokumentasinya ("peta butuh semua
    // marker sekaligus") dan sudah diverifikasi: responsnya datang tanpa `meta`
    // sama sekali, sama seperti team/programs/news-categories.
    paginated: false,
    mapItem: (raw) => [mapImpactVillageItem(raw)],
  },
  conservationAreas: {
    resource: 'ext/coast/kawasan-konservasi',
    // Sama seperti ext/coast/desa: tanpa `?lang=` (isinya nama kawasan versi
    // KKP) dan tanpa `meta` -- 11 baris datang sekaligus.
    perLocale: false,
    paginated: false,
    mapItem: (raw) => [mapConservationAreaItem(raw)],
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
/** Pengecualian batas waktu/percobaan untuk endpoint yang profilnya berbeda
 *  dari endpoint konten biasa. Bawaannya REQUEST_TIMEOUT_MS dan MAX_ATTEMPTS. */
type FetchLimits = { timeoutMs?: number; attempts?: number };

async function fetchPage(
  url: URL,
  headers: HeadersInit,
  tag: string,
  /** null untuk resource yang tidak berhalaman -- supaya pesan galatnya tidak
   *  menyebut "page=1" untuk permintaan yang tidak pernah mengirim `page`. */
  page: number | null,
  limits: FetchLimits = {},
): Promise<Response> {
  const timeoutMs = limits.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const maxAttempts = limits.attempts ?? MAX_ATTEMPTS;
  let lastReason = 'sebab tidak diketahui';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const res = await withRequestSlot(() =>
        fetch(url, {
          headers,
          signal: AbortSignal.timeout(timeoutMs),
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

    if (attempt < maxAttempts) {
      // Percobaan ulang yang berhasil tetap dicatat: CMS yang mulai goyah
      // akan terlihat di log jauh sebelum ia benar-benar menjatuhkan build.
      console.warn(
        `[konten] "${url.pathname}"${page === null ? '' : ` (page=${page})`} gagal pada percobaan ${attempt}/${maxAttempts} -- ${lastReason}; mencoba lagi.`,
      );
      await delay(RETRY_BASE_DELAY_MS * attempt * (1 + Math.random() * 0.5));
    }
  }

  throw new Error(
    `Gagal menghubungi "${url.pathname}"${page === null ? '' : ` (page=${page})`} setelah ${maxAttempts} percobaan: ${lastReason}`,
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
  limits: FetchLimits = {},
): Promise<ApiEnvelope | null> {
  const res = await fetchPage(url, headers, tag, page, limits);

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
async function fetchApi(name: CollectionName, extraQuery: Record<string, string> = {}): Promise<unknown> {
  const { base, headers } = cmsAccess();
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

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/news/${encodeURIComponent(slug)}`);
  url.searchParams.set('lang', lang);

  const json = await fetchEnvelope(url, headers, 'articles', null, true);
  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  return validateFullArticle(mapFullNewsItem(json.data as Record<string, unknown>, lang));
});

export function loadArticleBySlug(slug: string, lang: Locale): Promise<Article | null> {
  return loadArticleBySlugMemo(slug, lang);
}

/** Sama kebijakannya dengan validate(): detail yang cacat dicatat lalu
 *  dianggap tidak ada, bukan melempar -- panel menampilkan keadaan kosongnya
 *  dan sisa halaman (peta, dropdown) tetap hidup. */
function validateVillageDetail(raw: unknown): VillageDetail | null {
  const parsed = villageDetailSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] detail desa ${describeItem(raw, 0)} dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/**
 * SATU desa lewat `/ext/coast/desa/{desa_kode}` -- dipanggil saat pengunjung
 * memilih desa, bukan saat halaman dibuka.
 *
 * Alasannya sama dengan loadArticleBySlug: menarik ke-19 detail di muka
 * berarti 19 permintaan (masing-masing dengan 24 metrik dan daftar
 * kegiatannya) untuk mengisi satu panel yang hanya menampilkan satu desa --
 * dan CMS ini sudah terbukti menjawab 500 begitu dibanjiri (lihat
 * MAX_CONCURRENT_REQUESTS).
 *
 * null berarti dua hal yang sengaja tidak dibedakan pemanggil: CMS menjawab
 * 404 (desa itu tidak punya form terverifikasi), atau detailnya ada tapi gagal
 * validasi. Keduanya berujung pada panel yang mengatakan datanya belum ada,
 * bukan halaman yang jatuh.
 */
const loadVillageDetailMemo = cache(async (kode: string): Promise<VillageDetail | null> => {
  if (mode !== 'api') {
    const raw = (await fetchLocal('villageDetails')) as Record<string, unknown>[];
    const match = raw.find((item) => item.kode === kode);
    return match ? validateVillageDetail(match) : null;
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/coast/desa/${encodeURIComponent(kode)}`);

  const json = await fetchEnvelope(url, headers, 'impactVillages', null, true);
  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  return validateVillageDetail(mapVillageDetail(json.data as Record<string, unknown>));
});

/**
 * Opsi satu tingkat filter IKAN, disaring oleh pilihan tingkat-tingkat di
 * atasnya.
 *
 * TIDAK lewat loadCollection: parameternya berubah mengikuti pilihan pengunjung,
 * jadi tidak ada satu "koleksi" yang bisa ditarik sekali lalu disaring di sisi
 * kita. Justru sebaliknya yang benar di sini -- 374 spesies menyusut jadi
 * belasan begitu WPPNRI dan alat tangkap dipilih, dan CMS yang tahu kombinasi
 * mana yang benar-benar punya catatan.
 *
 * Array kosong adalah jawaban yang SAH, bukan kegagalan: kombinasi seperti
 * "WPPNRI-713 + Provinsi Aceh" memang tidak pernah tercatat, dan dropdown yang
 * kosong adalah cara paling jujur menyampaikannya.
 *
 * Mode lokal mengabaikan penyaringnya dan selalu mengembalikan daftar penuh
 * tingkat itu (lihat src/data/ikanOptions.json). Fixture yang meniru seluruh
 * kombinasi berarti menyalin basis data pendataan ke dalam repo; yang
 * dibutuhkan mode lokal cuma form yang terisi.
 */
const loadIkanOptionsMemo = cache(
  async (level: IkanFilterLevel, selectionKey: string): Promise<IkanOption[]> => {
    const selection = JSON.parse(selectionKey) as IkanSelection;

    if (mode !== 'api') {
      const fixture = (await fetchLocal('ikanOptions')) as Record<string, unknown>;
      return validateIkanOptions(level, fixture[level] ?? []);
    }

    const { base, headers } = cmsAccess();
    const url = new URL(`${base}/ext/ikan/opsi/${IKAN_LEVEL_ENDPOINT[level]}`);

    // Hanya tingkat DI ATAS `level` yang ikut -- lihat ancestorSelection.
    for (const [ancestor, value] of Object.entries(ancestorSelection(level, selection))) {
      url.searchParams.set(IKAN_LEVEL_PARAM[ancestor as IkanFilterLevel], value);
    }

    const json = await fetchEnvelope(url, headers, 'ikanOptions', null, true);
    if (!json) return [];

    return validateIkanOptions(
      level,
      asArray(json.data).map((raw) => ({
        value: optionalText(raw.value),
        jumlahTrip: optionalNumber(raw.jumlah_trip) ?? 0,
      })),
    );
  },
);

/** Opsi yang cacat dibuang SELURUH daftarnya, tidak per entri seperti koleksi
 *  lain: dropdown yang diam-diam kehilangan satu pilihan lebih berbahaya
 *  daripada dropdown yang kosong -- pilihan yang hilang tidak terlihat hilang,
 *  dan orang menyimpulkan datanya yang tidak ada. */
function validateIkanOptions(level: IkanFilterLevel, raw: unknown): IkanOption[] {
  const parsed = ikanOptionsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] opsi filter IKAN "${level}" dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return [];
}

/** `selection` diserialkan jadi kunci string supaya memo React (yang
 *  membandingkan argumen dengan Object.is) benar-benar mengena: objek pilihan
 *  yang isinya sama tapi identitasnya beda akan meminta ulang ke CMS setiap
 *  kali. Kuncinya disusun dari urutan tingkat yang tetap, bukan dari urutan
 *  kunci objek yang kebetulan. */
export function loadIkanOptions(
  level: IkanFilterLevel,
  selection: IkanSelection,
): Promise<IkanOption[]> {
  return loadIkanOptionsMemo(level, JSON.stringify(ancestorSelection(level, selection)));
}

/**
 * Dua grafik tab Summary `/data/ikan` dalam satu permintaan
 * (`/ext/ikan/grafik/trip`).
 *
 * null = grafiknya tidak bisa diambil. Termasuk di dalamnya kiriman yang
 * DITOLAK CMS (HTTP 422: `tipe_tanggal` di luar enum, tanggal salah bentuk,
 * rentang terbalik) -- fetchEnvelope melemparkan status itu seperti status
 * galat lainnya, dan di sini lemparannya ditangkap supaya satu kartu grafik
 * yang kosong tidak menjatuhkan seluruh halaman. Pemanggilnya menampilkan
 * keadaan gagal; form filternya tetap bisa dipakai untuk mencoba lagi.
 *
 * Kombinasi yang memang tidak punya catatan BUKAN kasus itu: CMS menjawab 200
 * dengan dua daftar kosong dan `total_trip: 0`, dan itu tiba di sini sebagai
 * data yang sah.
 */
const loadIkanTripChartMemo = cache(async (queryKey: string): Promise<IkanTripChart | null> => {
  const query = JSON.parse(queryKey) as IkanTripQuery;

  if (mode !== 'api') {
    return validateIkanTripChart(await fetchLocal('ikanTripChart'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/ikan/grafik/trip`);

  for (const level of IKAN_TRIP_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) url.searchParams.set(IKAN_LEVEL_PARAM[level], value);
  }

  url.searchParams.set('tipe_tanggal', query.period);
  // Tanggal yang salah bentuk tidak dikirim sama sekali: lebih baik grafiknya
  // menampilkan seluruh rentang daripada CMS menolak permintaannya.
  if (isIsoDate(query.dari)) url.searchParams.set('dari', query.dari);
  if (isIsoDate(query.sampai)) url.searchParams.set('sampai', query.sampai);

  let json;
  try {
    json = await fetchEnvelope(url, headers, 'ikanTrip', null, true);
  } catch (error) {
    console.error('[konten] grafik trip IKAN gagal diambil:', error);
    return null;
  }

  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const filter = (data.filter ?? {}) as Record<string, unknown>;

  return validateIkanTripChart({
    tipeTanggal: filter.tipe_tanggal,
    dari: optionalText(filter.dari),
    sampai: optionalText(filter.sampai),
    totalTrip: optionalNumber(data.total_trip) ?? 0,
    perPeriode: asArray(data.per_tanggal).map((row) => ({
      periode: optionalText(row.periode),
      jumlahTrip: optionalNumber(row.jumlah_trip) ?? 0,
    })),
    perLokasi: asArray(data.per_lokasi_pendaratan).map((row) => ({
      lokasi: optionalText(row.lokasi_pendaratan),
      jumlahTrip: optionalNumber(row.jumlah_trip) ?? 0,
    })),
  });
});

function validateIkanTripChart(raw: unknown): IkanTripChart | null {
  const parsed = ikanTripChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik trip IKAN dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/** Kuncinya disusun dari field yang TETAP urutannya, bukan dari JSON objek apa
 *  adanya: memo React membandingkan argumen dengan Object.is, dan dua objek
 *  filter yang isinya sama tapi urutan kuncinya berbeda akan terbaca sebagai
 *  dua permintaan berbeda. */
export function loadIkanTripChart(query: IkanTripQuery): Promise<IkanTripChart | null> {
  const selection: IkanSelection = {};
  for (const level of IKAN_TRIP_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) selection[level] = value;
  }

  return loadIkanTripChartMemo(
    JSON.stringify({
      selection,
      period: query.period,
      dari: query.dari,
      sampai: query.sampai,
    }),
  );
}

/**
 * Komposisi tangkapan per spesies (`/ext/ikan/grafik/tangkapan`).
 *
 * Penanganan galatnya sama persis dengan loadIkanTripChart -- termasuk
 * menangkap HTTP 422 dari kiriman yang ditolak CMS -- karena kegagalannya
 * berujung ke tempat yang sama: satu kartu grafik yang mengaku gagal, bukan
 * halaman yang jatuh.
 */
const loadIkanCatchChartMemo = cache(async (queryKey: string): Promise<IkanCatchChart | null> => {
  const query = JSON.parse(queryKey) as IkanCatchQuery;

  if (mode !== 'api') {
    return validateIkanCatchChart(await fetchLocal('ikanCatchChart'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/ikan/grafik/tangkapan`);

  for (const level of IKAN_CATCH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) url.searchParams.set(IKAN_LEVEL_PARAM[level], value);
  }

  if (isIsoDate(query.dari)) url.searchParams.set('dari', query.dari);
  if (isIsoDate(query.sampai)) url.searchParams.set('sampai', query.sampai);

  let json;
  try {
    json = await fetchEnvelope(url, headers, 'ikanTangkapan', null, true);
  } catch (error) {
    console.error('[konten] grafik tangkapan IKAN gagal diambil:', error);
    return null;
  }

  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const filter = (data.filter ?? {}) as Record<string, unknown>;

  return validateIkanCatchChart({
    dari: optionalText(filter.dari),
    sampai: optionalText(filter.sampai),
    unit: optionalText(data.unit) ?? 'kg',
    totalCatch: optionalNumber(data.total_catch) ?? 0,
    perSpesies: asArray(data.per_spesies).map((row) => ({
      spesies: optionalText(row.spesies),
      totalCatch: optionalNumber(row.total_catch) ?? 0,
    })),
  });
});

function validateIkanCatchChart(raw: unknown): IkanCatchChart | null {
  const parsed = ikanCatchChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik tangkapan IKAN dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/** Kunci memo disusun dari field berurutan tetap, alasannya sama dengan
 *  loadIkanTripChart. */
export function loadIkanCatchChart(query: IkanCatchQuery): Promise<IkanCatchChart | null> {
  const selection: IkanSelection = {};
  for (const level of IKAN_CATCH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) selection[level] = value;
  }

  return loadIkanCatchChartMemo(
    JSON.stringify({ selection, dari: query.dari, sampai: query.sampai }),
  );
}

/**
 * Sebaran panjang ikan (`/ext/ikan/grafik/frekuensi-panjang`).
 *
 * Endpoint dengan parameter terbanyak di dataset ini: delapan tingkat filter
 * ditambah rentang tanggal, cara ukur, lebar selang kelas, dan Lm.
 *
 * `tipe_panjang` HANYA dikirim kalau terisi: dikosongkan berarti TL dan FL
 * digabung, dan mengirim string kosong akan ditolak 422 oleh enum-nya.
 */
const loadIkanLengthChartMemo = cache(async (queryKey: string): Promise<IkanLengthChart | null> => {
  const query = JSON.parse(queryKey) as IkanLengthQuery;

  if (mode !== 'api') {
    return validateIkanLengthChart(await fetchLocal('ikanLengthChart'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/ikan/grafik/frekuensi-panjang`);

  for (const level of IKAN_LENGTH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) url.searchParams.set(IKAN_LEVEL_PARAM[level], value);
  }

  if (isIsoDate(query.dari)) url.searchParams.set('dari', query.dari);
  if (isIsoDate(query.sampai)) url.searchParams.set('sampai', query.sampai);
  if (query.tipePanjang) url.searchParams.set('tipe_panjang', query.tipePanjang);
  url.searchParams.set('selang_kelas', String(query.selangKelas));
  if (query.lm !== null) url.searchParams.set('lm', String(query.lm));

  let json;
  try {
    json = await fetchEnvelope(url, headers, 'ikanFrekuensiPanjang', null, true);
  } catch (error) {
    console.error('[konten] grafik frekuensi panjang IKAN gagal diambil:', error);
    return null;
  }

  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const ringkasan = (data.ringkasan ?? {}) as Record<string, unknown>;
  const indikator = (data.indikator ?? {}) as Record<string, unknown>;
  // `filter` datang sebagai objek saat ada isinya dan sebagai ARRAY KOSONG saat
  // tidak -- bentuk khas PHP yang tidak membedakan keduanya. Yang dibaca cuma
  // tipe_panjang-nya, jadi array kosong cukup diperlakukan sebagai "tidak ada".
  const filter = (Array.isArray(data.filter) ? {} : (data.filter ?? {})) as Record<string, unknown>;

  return validateIkanLengthChart({
    unit: optionalText(data.unit) ?? 'cm',
    selangKelas: optionalNumber(data.selang_kelas) ?? 1,
    tipePanjang: optionalText(filter.tipe_panjang),
    ringkasan: {
      jumlahIkan: optionalNumber(ringkasan.jumlah_ikan) ?? 0,
      panjangMin: optionalNumber(ringkasan.panjang_min),
      panjangMaks: optionalNumber(ringkasan.panjang_maks),
      rataRata: optionalNumber(ringkasan.rata_rata),
      median: optionalNumber(ringkasan.median),
      modus: optionalNumber(ringkasan.modus),
    },
    komposisiTipePanjang: asArray(data.komposisi_tipe_panjang).map((row) => ({
      tipe: optionalText(row.tipe_panjang),
      jumlah: optionalNumber(row.jumlah) ?? 0,
    })),
    indikator: {
      lc: optionalNumber(indikator.lc),
      lcMetode: optionalText(indikator.lc_metode),
      lm: optionalNumber(indikator.lm),
      persenDiBawahLm: optionalNumber(indikator.persen_di_bawah_lm),
    },
    kelas: asArray(data.kelas).map((row) => ({
      batasBawah: optionalNumber(row.batas_bawah),
      batasAtas: optionalNumber(row.batas_atas),
      nilaiTengah: optionalNumber(row.nilai_tengah),
      jumlah: optionalNumber(row.jumlah) ?? 0,
      persen: optionalNumber(row.persen) ?? 0,
      kumulatifPersen: optionalNumber(row.kumulatif_persen) ?? 0,
    })),
  });
});

function validateIkanLengthChart(raw: unknown): IkanLengthChart | null {
  const parsed = ikanLengthChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik frekuensi panjang IKAN dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

export function loadIkanLengthChart(query: IkanLengthQuery): Promise<IkanLengthChart | null> {
  const selection: IkanSelection = {};
  for (const level of IKAN_LENGTH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) selection[level] = value;
  }

  return loadIkanLengthChartMemo(
    JSON.stringify({
      selection,
      dari: query.dari,
      sampai: query.sampai,
      tipePanjang: query.tipePanjang,
      selangKelas: query.selangKelas,
      lm: query.lm,
    }),
  );
}

/**
 * Opsi satu tingkat filter BSC, disaring oleh pilihan tingkat-tingkat di
 * atasnya (`/ext/bsc/opsi/{tingkat}`).
 *
 * Alasannya sama persis dengan loadIkanOptions: parameternya berubah mengikuti
 * pilihan pengunjung, jadi tidak ada satu "koleksi" yang bisa ditarik sekali
 * lalu disaring di sisi kita -- CMS yang tahu kombinasi mana yang punya
 * catatan.
 *
 * Array kosong adalah jawaban yang SAH, bukan kegagalan: "MALUKU + BUBU LIPAT"
 * memang tidak pernah tercatat, dan dropdown kosong adalah cara paling jujur
 * menyampaikannya.
 */
const loadBscOptionsMemo = cache(
  async (level: BscFilterLevel, selectionKey: string): Promise<BscOption[]> => {
    const selection = JSON.parse(selectionKey) as BscSelection;

    if (mode !== 'api') {
      const fixture = (await fetchLocal('bscOptions')) as Record<string, unknown>;
      return validateBscOptions(level, fixture[level] ?? []);
    }

    const { base, headers } = cmsAccess();
    const url = new URL(`${base}/ext/bsc/opsi/${BSC_LEVEL_ENDPOINT[level]}`);

    // Hanya tingkat DI ATAS `level` yang ikut -- lihat bscAncestorSelection.
    for (const [ancestor, value] of Object.entries(bscAncestorSelection(level, selection))) {
      url.searchParams.set(BSC_LEVEL_PARAM[ancestor as BscFilterLevel], value);
    }

    const json = await fetchEnvelope(url, headers, 'bscOptions', null, true);
    if (!json) return [];

    return validateBscOptions(
      level,
      asArray(json.data).map((raw) => ({
        value: optionalText(raw.value),
        jumlahTrip: optionalNumber(raw.jumlah_trip) ?? 0,
      })),
    );
  },
);

/** Opsi yang cacat dibuang SELURUH daftarnya, bukan per entri -- alasannya sama
 *  dengan validateIkanOptions: pilihan yang hilang diam-diam tidak terlihat
 *  hilang, dan orang menyimpulkan datanya yang tidak ada. */
function validateBscOptions(level: BscFilterLevel, raw: unknown): BscOption[] {
  const parsed = bscOptionsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] opsi filter BSC "${level}" dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return [];
}

/** `selection` diserialkan jadi kunci string supaya memo React (yang
 *  membandingkan argumen dengan Object.is) benar-benar mengena. */
export function loadBscOptions(
  level: BscFilterLevel,
  selection: BscSelection,
): Promise<BscOption[]> {
  return loadBscOptionsMemo(level, JSON.stringify(bscAncestorSelection(level, selection)));
}

/**
 * Dua grafik tab Summary `/data/data-crab` dalam satu permintaan
 * (`/ext/bsc/grafik/trip`).
 *
 * null = grafiknya tidak bisa diambil, termasuk kiriman yang DITOLAK CMS.
 * Lemparan fetchEnvelope ditangkap di sini supaya satu kartu grafik yang
 * kosong tidak menjatuhkan seluruh halaman.
 *
 * Kombinasi yang memang tidak punya catatan BUKAN kasus itu: CMS menjawab 200
 * dengan dua daftar kosong dan `total_trip: 0`.
 */
const loadBscTripChartMemo = cache(async (queryKey: string): Promise<BscTripChart | null> => {
  const query = JSON.parse(queryKey) as BscTripQuery;

  if (mode !== 'api') {
    return validateBscTripChart(await fetchLocal('bscTripChart'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/bsc/grafik/trip`);

  for (const level of BSC_TRIP_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) url.searchParams.set(BSC_LEVEL_PARAM[level], value);
  }

  url.searchParams.set('tipe_tanggal', query.period);
  // Tanggal salah bentuk tidak dikirim sama sekali: lebih baik grafiknya
  // menampilkan seluruh rentang daripada CMS menolak permintaannya.
  if (isIsoDate(query.dari)) url.searchParams.set('dari', query.dari);
  if (isIsoDate(query.sampai)) url.searchParams.set('sampai', query.sampai);

  let json;
  try {
    json = await fetchEnvelope(url, headers, 'bscTrip', null, true);
  } catch (error) {
    console.error('[konten] grafik trip BSC gagal diambil:', error);
    return null;
  }

  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const filter = (Array.isArray(data.filter) ? {} : (data.filter ?? {})) as Record<string, unknown>;

  return validateBscTripChart({
    tipeTanggal: filter.tipe_tanggal,
    dari: optionalText(filter.dari),
    sampai: optionalText(filter.sampai),
    totalTrip: optionalNumber(data.total_trip) ?? 0,
    perPeriode: asArray(data.per_tanggal).map((row) => ({
      periode: optionalText(row.periode),
      jumlahTrip: optionalNumber(row.jumlah_trip) ?? 0,
    })),
    perLokasi: asArray(data.per_lokasi_pendaratan).map((row) => ({
      lokasi: optionalText(row.lokasi_pendaratan),
      jumlahTrip: optionalNumber(row.jumlah_trip) ?? 0,
    })),
  });
});

function validateBscTripChart(raw: unknown): BscTripChart | null {
  const parsed = bscTripChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik trip BSC dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/** Kunci memo disusun dari field yang TETAP urutannya, bukan dari JSON objek apa
 *  adanya -- dua objek filter yang isinya sama tapi urutan kuncinya berbeda
 *  akan terbaca sebagai dua permintaan berbeda. */
export function loadBscTripChart(query: BscTripQuery): Promise<BscTripChart | null> {
  const selection: BscSelection = {};
  for (const level of BSC_TRIP_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) selection[level] = value;
  }

  return loadBscTripChartMemo(
    JSON.stringify({
      selection,
      period: query.period,
      dari: query.dari,
      sampai: query.sampai,
    }),
  );
}

/**
 * Komposisi tangkapan per spesies (`/ext/bsc/grafik/tangkapan`).
 *
 * Bedanya dengan padanan IKAN ada di nama field bobotnya (`total_bobot`, bukan
 * `total_catch`) dan satuannya (gram, bukan kg) -- dua hal yang justru membuat
 * mapper-nya tidak bisa dipakai bersama.
 */
const loadBscCatchChartMemo = cache(async (queryKey: string): Promise<BscCatchChart | null> => {
  const query = JSON.parse(queryKey) as BscCatchQuery;

  if (mode !== 'api') {
    return validateBscCatchChart(await fetchLocal('bscCatchChart'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/bsc/grafik/tangkapan`);

  for (const level of BSC_CATCH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) url.searchParams.set(BSC_LEVEL_PARAM[level], value);
  }

  if (isIsoDate(query.dari)) url.searchParams.set('dari', query.dari);
  if (isIsoDate(query.sampai)) url.searchParams.set('sampai', query.sampai);

  let json;
  try {
    json = await fetchEnvelope(url, headers, 'bscTangkapan', null, true);
  } catch (error) {
    console.error('[konten] grafik tangkapan BSC gagal diambil:', error);
    return null;
  }

  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const filter = (Array.isArray(data.filter) ? {} : (data.filter ?? {})) as Record<string, unknown>;

  return validateBscCatchChart({
    dari: optionalText(filter.dari),
    sampai: optionalText(filter.sampai),
    unit: optionalText(data.unit) ?? 'gram',
    totalBobot: optionalNumber(data.total_bobot) ?? 0,
    perSpesies: asArray(data.per_spesies).map((row) => ({
      spesies: optionalText(row.spesies),
      totalBobot: optionalNumber(row.total_bobot) ?? 0,
    })),
  });
});

function validateBscCatchChart(raw: unknown): BscCatchChart | null {
  const parsed = bscCatchChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik tangkapan BSC dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

export function loadBscCatchChart(query: BscCatchQuery): Promise<BscCatchChart | null> {
  const selection: BscSelection = {};
  for (const level of BSC_CATCH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) selection[level] = value;
  }

  return loadBscCatchChartMemo(
    JSON.stringify({ selection, dari: query.dari, sampai: query.sampai }),
  );
}

/**
 * Sebaran lebar karapas (`/ext/bsc/grafik/frekuensi-lebar`).
 *
 * `jenis_kelamin` HANYA dikirim kalau terisi: dikosongkan berarti jantan dan
 * betina digabung, dan mengirim string kosong akan ditolak enum-nya.
 *
 * `selang_kelas` dan `tkg_matang` SELALU dikirim: keduanya punya bawaan di
 * server (1 dan 2), tapi mengandalkan bawaan berarti nilai yang tampil di form
 * dan nilai yang dipakai server bisa berbeda tanpa ada yang tahu.
 */
const loadBscWidthChartMemo = cache(async (queryKey: string): Promise<BscWidthChart | null> => {
  const query = JSON.parse(queryKey) as BscWidthQuery;

  if (mode !== 'api') {
    return validateBscWidthChart(await fetchLocal('bscWidthChart'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/bsc/grafik/frekuensi-lebar`);

  for (const level of BSC_WIDTH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) url.searchParams.set(BSC_LEVEL_PARAM[level], value);
  }

  if (isIsoDate(query.dari)) url.searchParams.set('dari', query.dari);
  if (isIsoDate(query.sampai)) url.searchParams.set('sampai', query.sampai);
  if (query.jenisKelamin) url.searchParams.set('jenis_kelamin', query.jenisKelamin);
  url.searchParams.set('selang_kelas', String(query.selangKelas));
  url.searchParams.set('tkg_matang', String(query.tkgMatang));

  let json;
  try {
    json = await fetchEnvelope(url, headers, 'bscFrekuensiLebar', null, true);
  } catch (error) {
    console.error('[konten] grafik frekuensi lebar BSC gagal diambil:', error);
    return null;
  }

  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const ringkasan = (data.ringkasan ?? {}) as Record<string, unknown>;
  const indikator = (data.indikator ?? {}) as Record<string, unknown>;
  // `filter` datang sebagai objek saat ada isinya dan sebagai ARRAY KOSONG saat
  // tidak -- bentuk khas PHP yang tidak membedakan keduanya. Yang dibaca cuma
  // jenis_kelamin-nya, jadi array kosong cukup diperlakukan sebagai "tidak ada".
  const filter = (Array.isArray(data.filter) ? {} : (data.filter ?? {})) as Record<string, unknown>;

  return validateBscWidthChart({
    unit: optionalText(data.unit) ?? 'cm',
    selangKelas: optionalNumber(data.selang_kelas) ?? 1,
    tkgMatang: optionalNumber(data.tkg_matang) ?? 2,
    jenisKelamin: optionalText(filter.jenis_kelamin),
    ringkasan: {
      jumlahIndividu: optionalNumber(ringkasan.jumlah_individu) ?? 0,
      lebarMin: optionalNumber(ringkasan.lebar_min),
      lebarMaks: optionalNumber(ringkasan.lebar_maks),
      rataRata: optionalNumber(ringkasan.rata_rata),
      median: optionalNumber(ringkasan.median),
      modus: optionalNumber(ringkasan.modus),
      tanpaTkg: optionalNumber(ringkasan.tanpa_tkg) ?? 0,
    },
    komposisiJenisKelamin: asArray(data.komposisi_jenis_kelamin).map((row) => ({
      jenisKelamin: optionalText(row.jenis_kelamin),
      jumlah: optionalNumber(row.jumlah) ?? 0,
    })),
    indikator: {
      lc: optionalNumber(indikator.lc),
      lcMetode: optionalText(indikator.lc_metode),
      lm: optionalNumber(indikator.lm),
      lmMetode: optionalText(indikator.lm_metode),
      persenMatang: optionalNumber(indikator.persen_matang),
    },
    kelas: asArray(data.kelas).map((row) => ({
      batasBawah: optionalNumber(row.batas_bawah),
      batasAtas: optionalNumber(row.batas_atas),
      nilaiTengah: optionalNumber(row.nilai_tengah),
      jumlah: optionalNumber(row.jumlah) ?? 0,
      jumlahMatang: optionalNumber(row.jumlah_matang) ?? 0,
      persen: optionalNumber(row.persen) ?? 0,
      kumulatifPersen: optionalNumber(row.kumulatif_persen) ?? 0,
      // TANPA `?? 0`, tidak seperti tetangganya: null di sini berarti kelasnya
      // kosong sehingga persentasenya tak terdefinisi, dan menjadikannya nol
      // mengarang angka yang tidak pernah dihitung.
      persenMatang: optionalNumber(row.persen_matang),
    })),
  });
});

function validateBscWidthChart(raw: unknown): BscWidthChart | null {
  const parsed = bscWidthChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik frekuensi lebar BSC dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

export function loadBscWidthChart(query: BscWidthQuery): Promise<BscWidthChart | null> {
  const selection: BscSelection = {};
  for (const level of BSC_WIDTH_CHART_LEVELS) {
    const value = query.selection[level];
    if (value) selection[level] = value;
  }

  return loadBscWidthChartMemo(
    JSON.stringify({
      selection,
      dari: query.dari,
      sampai: query.sampai,
      jenisKelamin: query.jenisKelamin,
      selangKelas: query.selangKelas,
      tkgMatang: query.tkgMatang,
    }),
  );
}

/**
 * Daftar spesies HIUPARI (`/ext/hiupari/opsi/spesies`).
 *
 * Tanpa parameter penyaring apa pun -- tidak seperti opsi IKAN dan BSC yang
 * menyempit mengikuti pilihan di atasnya. Dataset ini tidak punya hierarki
 * wilayah, jadi daftarnya SATU dan selalu sama: 20 spesies hari ini.
 *
 * Itu juga yang membuatnya tidak butuh kunci memo: tidak ada argumen yang bisa
 * membedakan satu panggilan dari panggilan lain.
 */
const loadHiupariOptionsMemo = cache(async (): Promise<HiupariOption[]> => {
  if (mode !== 'api') {
    return validateHiupariOptions(await fetchLocal('hiupariOptions'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/hiupari/opsi/spesies`);

  const json = await fetchEnvelope(url, headers, 'hiupariOptions', null, true);
  if (!json) return [];

  return validateHiupariOptions(
    asArray(json.data).map((raw) => ({
      value: optionalText(raw.value),
      // `jumlah_individu`, bukan `jumlah_trip`: dataset ini mencacah individu
      // yang diukur, dan tidak mengenal trip sama sekali.
      jumlahIndividu: optionalNumber(raw.jumlah_individu) ?? 0,
    })),
  );
});

/** Opsi yang cacat dibuang SELURUH daftarnya, bukan per entri -- alasannya sama
 *  dengan validateIkanOptions: pilihan yang hilang diam-diam tidak terlihat
 *  hilang, dan orang menyimpulkan datanya yang tidak ada. */
function validateHiupariOptions(raw: unknown): HiupariOption[] {
  const parsed = hiupariOptionsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] opsi spesies HIUPARI dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return [];
}

export function loadHiupariOptions(): Promise<HiupariOption[]> {
  return loadHiupariOptionsMemo();
}

/**
 * Sebaran panjang hiu dan pari (`/ext/hiupari/grafik/frekuensi-panjang`).
 *
 * SATU-SATUNYA endpoint grafik dataset ini -- halaman Shark and Ray memang
 * cuma punya satu bagian, bukan tiga tab seperti IKAN dan Data Crab.
 *
 * `spesies` dan `jenis_kelamin` HANYA dikirim kalau terisi: dikosongkan berarti
 * "semua", dan mengirim string kosong akan ditolak enum-nya. `jenis_ukuran`,
 * `selang_kelas`, dan `kematangan_matang` SELALU dikirim: ketiganya punya
 * bawaan di server, tapi mengandalkan bawaan berarti nilai yang tampil di form
 * dan nilai yang dipakai server bisa berbeda tanpa ada yang tahu.
 *
 * null = grafiknya tidak bisa diambil. Kiriman yang ditolak CMS termasuk di
 * dalamnya: lemparan fetchEnvelope ditangkap di sini supaya satu kartu grafik
 * yang kosong tidak menjatuhkan seluruh halaman.
 */
const loadHiupariLengthChartMemo = cache(
  async (queryKey: string): Promise<HiupariLengthChart | null> => {
    const query = JSON.parse(queryKey) as HiupariLengthQuery;

    if (mode !== 'api') {
      return validateHiupariLengthChart(await fetchLocal('hiupariLengthChart'));
    }

    const { base, headers } = cmsAccess();
    const url = new URL(`${base}/ext/hiupari/grafik/frekuensi-panjang`);

    if (query.spesies) url.searchParams.set('spesies', query.spesies);
    if (query.jenisKelamin) url.searchParams.set('jenis_kelamin', query.jenisKelamin);
    url.searchParams.set('jenis_ukuran', query.jenisUkuran);
    url.searchParams.set('selang_kelas', String(query.selangKelas));
    url.searchParams.set('kematangan_matang', String(query.kematanganMatang));

    let json;
    try {
      json = await fetchEnvelope(url, headers, 'hiupariFrekuensiPanjang', null, true);
    } catch (error) {
      console.error('[konten] grafik frekuensi panjang HIUPARI gagal diambil:', error);
      return null;
    }

    if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data))
      return null;

    const data = json.data as Record<string, unknown>;
    const ringkasan = (data.ringkasan ?? {}) as Record<string, unknown>;
    const indikator = (data.indikator ?? {}) as Record<string, unknown>;
    // `filter` datang sebagai objek saat ada isinya dan sebagai ARRAY KOSONG
    // saat tidak -- bentuk khas PHP yang tidak membedakan keduanya.
    const filter = (Array.isArray(data.filter) ? {} : (data.filter ?? {})) as Record<
      string,
      unknown
    >;

    return validateHiupariLengthChart({
      jenisUkuran: optionalText(data.jenis_ukuran) ?? 'panjang_total',
      jenisKelamin: optionalText(filter.jenis_kelamin),
      spesies: optionalText(filter.spesies),
      unit: optionalText(data.unit) ?? 'cm',
      selangKelas: optionalNumber(data.selang_kelas) ?? 1,
      kematanganMatang: optionalNumber(data.kematangan_matang) ?? 3,
      ringkasan: {
        jumlahIndividu: optionalNumber(ringkasan.jumlah_individu) ?? 0,
        jumlahTanpaUkuran: optionalNumber(ringkasan.jumlah_tanpa_ukuran) ?? 0,
        panjangMin: optionalNumber(ringkasan.panjang_min),
        panjangMaks: optionalNumber(ringkasan.panjang_maks),
        rataRata: optionalNumber(ringkasan.rata_rata),
        median: optionalNumber(ringkasan.median),
        modus: optionalNumber(ringkasan.modus),
      },
      ketersediaanUkuran: asArray(data.ketersediaan_ukuran).map((row) => ({
        jenisUkuran: optionalText(row.jenis_ukuran),
        jumlahIndividu: optionalNumber(row.jumlah_individu) ?? 0,
      })),
      indikator: {
        linf: optionalNumber(indikator.linf),
        linfMetode: optionalText(indikator.linf_metode),
        lm: optionalNumber(indikator.lm),
        lmMetode: optionalText(indikator.lm_metode),
        persenMatang: optionalNumber(indikator.persen_matang),
      },
      // TANPA `?? 0` pada dua field kematangan: null di sini berarti kematangan
      // tidak terdefinisi (jenis kelamin bukan M), dan menjadikannya nol akan
      // terbaca sebagai "tidak ada yang matang" -- jawaban yang berbeda.
      kelas: asArray(data.kelas).map((row) => ({
        batasBawah: optionalNumber(row.batas_bawah),
        batasAtas: optionalNumber(row.batas_atas),
        nilaiTengah: optionalNumber(row.nilai_tengah),
        jumlah: optionalNumber(row.jumlah) ?? 0,
        jumlahMatang: optionalNumber(row.jumlah_matang),
        persen: optionalNumber(row.persen) ?? 0,
        kumulatifPersen: optionalNumber(row.kumulatif_persen) ?? 0,
        persenMatang: optionalNumber(row.persen_matang),
      })),
    });
  },
);

function validateHiupariLengthChart(raw: unknown): HiupariLengthChart | null {
  const parsed = hiupariLengthChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik frekuensi panjang HIUPARI dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/** Kunci memo disusun dari field yang TETAP urutannya, bukan dari JSON objek
 *  apa adanya: memo React membandingkan argumen dengan Object.is, dan dua objek
 *  filter yang isinya sama tapi urutan kuncinya berbeda akan terbaca sebagai
 *  dua permintaan berbeda. */
export function loadHiupariLengthChart(
  query: HiupariLengthQuery,
): Promise<HiupariLengthChart | null> {
  return loadHiupariLengthChartMemo(
    JSON.stringify({
      spesies: query.spesies,
      jenisKelamin: query.jenisKelamin,
      jenisUkuran: query.jenisUkuran,
      selangKelas: query.selangKelas,
      kematanganMatang: query.kematanganMatang,
    }),
  );
}

/**
 * Daftar WPP untuk dropdown `/data/production-data` dan `/data/vessel-data`
 * (`/ext/stsc/opsi/wpp`).
 *
 * Tanpa parameter penyaring: kesebelas WPP laut RI adalah daftar tetap, dan
 * yang berubah cuma rentang tahun yang dimiliki masing-masing. Itu sebabnya ia
 * tidak butuh kunci memo -- tidak ada argumen yang bisa membedakan satu
 * panggilan dari panggilan lain.
 */
const loadStscWppOptionsMemo = cache(async (): Promise<StscWppOption[]> => {
  if (mode !== 'api') {
    return validateStscWppOptions(await fetchLocal('stscWppOptions'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/stsc/opsi/wpp`);

  const json = await fetchEnvelope(url, headers, 'stscWppOptions', null, true);
  if (!json) return [];

  return validateStscWppOptions(
    asArray(json.data).map((raw) => ({
      value: optionalText(raw.value),
      tahunAwal: optionalNumber(raw.tahun_awal),
      tahunAkhir: optionalNumber(raw.tahun_akhir),
      // Inline, bukan lewat asArray: yang datang array STRING, sementara
      // asArray membentuk array objek.
      sumber: Array.isArray(raw.sumber)
        ? raw.sumber.filter((item): item is string => typeof item === 'string')
        : [],
    })),
  );
});

/** Opsi yang cacat dibuang SELURUH daftarnya, bukan per entri -- alasannya sama
 *  dengan validateIkanOptions: pilihan yang hilang diam-diam tidak terlihat
 *  hilang, dan orang menyimpulkan datanya yang tidak ada. */
function validateStscWppOptions(raw: unknown): StscWppOption[] {
  const parsed = stscWppOptionsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] opsi WPP STSC dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return [];
}

export function loadStscWppOptions(): Promise<StscWppOption[]> {
  return loadStscWppOptionsMemo();
}

/**
 * Daftar komoditas untuk dropdown `/data/production-data`
 * (`/ext/stsc/opsi/komoditas`).
 *
 * `wpp` menyaring CACAHNYA (`jumlah_wpp`), bukan daftarnya: kesebelas komoditas
 * tercatat di kesebelas WPP, jadi `?wpp=712` mengembalikan sebelas entri yang
 * sama dengan `jumlah_wpp: 1`. Parameternya tetap dikirim karena angka itu yang
 * dicetak di dropdown.
 */
const loadStscKomoditasOptionsMemo = cache(
  async (wpp: string | null): Promise<StscKomoditasOption[]> => {
    if (mode !== 'api') {
      return validateStscKomoditasOptions(await fetchLocal('stscKomoditasOptions'));
    }

    const { base, headers } = cmsAccess();
    const url = new URL(`${base}/ext/stsc/opsi/komoditas`);
    if (wpp) url.searchParams.set('wpp', wpp);

    const json = await fetchEnvelope(url, headers, 'stscKomoditasOptions', null, true);
    if (!json) return [];

    return validateStscKomoditasOptions(
      asArray(json.data).map((raw) => ({
        value: optionalText(raw.value),
        jumlahWpp: optionalNumber(raw.jumlah_wpp) ?? 0,
        tahunAwal: optionalNumber(raw.tahun_awal),
        tahunAkhir: optionalNumber(raw.tahun_akhir),
      })),
    );
  },
);

function validateStscKomoditasOptions(raw: unknown): StscKomoditasOption[] {
  const parsed = stscKomoditasOptionsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] opsi komoditas STSC dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return [];
}

export function loadStscKomoditasOptions(wpp: string | null): Promise<StscKomoditasOption[]> {
  return loadStscKomoditasOptionsMemo(wpp);
}

/** Sumbu-x bersama: array TAHUN mentah, bukan array objek -- jadi asArray
 *  (yang membentuk Record[]) tidak berlaku di sini. Entri yang bukan angka
 *  dibiarkan lewat sebagai null supaya skema yang MENOLAKNYA, bukan mapper
 *  yang diam-diam menambalnya dengan nol: tahun nol di sumbu waktu adalah
 *  kesalahan yang harus terlihat. */
function mapStscYears(raw: unknown): (number | null)[] {
  return Array.isArray(raw) ? raw.map((value) => optionalNumber(value)) : [];
}

/** Deret per WPP, bentuk yang sama di ketiga tempat ia muncul (armada, GT, dan
 *  produksi per komoditas). Satu mapper, bukan tiga salinan.
 *
 *  Tipe kembaliannya membiarkan null lewat, sama seperti mapper lain di berkas
 *  ini: yang keluar dari sini CALON data, dan skema zod yang memutuskan ia sah
 *  atau tidak. Memaksakan `string` di sini cuma memindahkan kebohongan dari
 *  runtime ke tipe. */
function mapStscSeries(
  raw: unknown,
): { wpp: string | null; titik: { tahun: number | null; nilai: number }[] }[] {
  return asArray(raw).map((series) => ({
    wpp: optionalText(series.wpp),
    titik: asArray(series.titik).map((point) => ({
      tahun: optionalNumber(point.tahun),
      nilai: optionalNumber(point.nilai) ?? 0,
    })),
  }));
}

/**
 * Jumlah armada dan total tonase per WPP (`/ext/stsc/grafik/armada`).
 *
 * `wpp` HANYA dikirim kalau terisi: dikosongkan berarti kesebelas WPP
 * sekaligus, dan itu keadaan bawaan halamannya.
 *
 * Kedua tahun SELALU dikirim. Bukan kerapian: tanpa keduanya API memakai
 * rentang penuh, dan rentang penuh yang tidak disebut di kiriman berarti
 * kartu grafik tidak tahu tahun berapa yang sedang digambarnya.
 *
 * null = grafiknya tidak bisa diambil. Kiriman yang DITOLAK CMS termasuk di
 * dalamnya, dan penolakannya di sini berbentuk khusus: endpoint STSC menjawab
 * tahun salah bentuk atau WPP tak dikenal dengan PENGALIHAN 302 ke halaman
 * depan, bukan 422. Yang tiba kemudian HTML, bukan JSON, jadi lemparannya
 * datang dari parser -- dan tetap ditangkap di sini supaya satu kartu grafik
 * yang kosong tidak menjatuhkan seluruh halaman.
 */
const loadStscArmadaChartMemo = cache(async (queryKey: string): Promise<StscArmadaChart | null> => {
  const query = JSON.parse(queryKey) as StscArmadaQuery;

  if (mode !== 'api') {
    return validateStscArmadaChart(await fetchLocal('stscArmadaChart'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/stsc/grafik/armada`);

  if (query.wpp) url.searchParams.set('wpp', query.wpp);
  url.searchParams.set('dari_tahun', String(query.dariTahun));
  url.searchParams.set('sampai_tahun', String(query.sampaiTahun));

  let json;
  try {
    json = await fetchEnvelope(url, headers, 'stscArmada', null, true);
  } catch (error) {
    console.error('[konten] grafik armada STSC gagal diambil:', error);
    return null;
  }

  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const filter = (Array.isArray(data.filter) ? {} : (data.filter ?? {})) as Record<string, unknown>;
  const unit = (Array.isArray(data.unit) ? {} : (data.unit ?? {})) as Record<string, unknown>;

  return validateStscArmadaChart({
    wpp: optionalText(filter.wpp),
    dariTahun: optionalNumber(filter.dari_tahun),
    sampaiTahun: optionalNumber(filter.sampai_tahun),
    unitArmada: optionalText(unit.armada) ?? 'unit',
    unitGt: optionalText(unit.gt) ?? 'GT',
    tahun: mapStscYears(data.tahun),
    armada: mapStscSeries(data.armada),
    gt: mapStscSeries(data.gt),
  });
});

function validateStscArmadaChart(raw: unknown): StscArmadaChart | null {
  const parsed = stscArmadaChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik armada STSC dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/** Kunci memo disusun dari field yang TETAP urutannya, bukan dari JSON objek
 *  apa adanya: memo React membandingkan argumen dengan Object.is, dan dua objek
 *  filter yang isinya sama tapi urutan kuncinya berbeda akan terbaca sebagai
 *  dua permintaan berbeda. */
export function loadStscArmadaChart(query: StscArmadaQuery): Promise<StscArmadaChart | null> {
  return loadStscArmadaChartMemo(
    JSON.stringify({
      wpp: query.wpp,
      dariTahun: query.dariTahun,
      sampaiTahun: query.sampaiTahun,
    }),
  );
}

/**
 * Produksi per komoditas per WPP (`/ext/stsc/grafik/produksi`).
 *
 * Penanganan galatnya sama persis dengan loadStscArmadaChart -- termasuk
 * pengalihan 302 yang menyamar sebagai kegagalan parser.
 *
 * Komoditas yang tidak dikenal BUKAN kasus itu: API menjawab 200 dengan
 * `komoditas: []` dan `total_produksi_ton: 0`, dan itu tiba di sini sebagai
 * data yang sah -- "tidak ada catatan", bukan "permintaannya gagal".
 */
const loadStscProduksiChartMemo = cache(
  async (queryKey: string): Promise<StscProduksiChart | null> => {
    const query = JSON.parse(queryKey) as StscProduksiQuery;

    if (mode !== 'api') {
      return validateStscProduksiChart(await fetchLocal('stscProduksiChart'));
    }

    const { base, headers } = cmsAccess();
    const url = new URL(`${base}/ext/stsc/grafik/produksi`);

    if (query.wpp) url.searchParams.set('wpp', query.wpp);
    if (query.komoditas) url.searchParams.set('komoditas', query.komoditas);
    url.searchParams.set('dari_tahun', String(query.dariTahun));
    url.searchParams.set('sampai_tahun', String(query.sampaiTahun));

    let json;
    try {
      json = await fetchEnvelope(url, headers, 'stscProduksi', null, true);
    } catch (error) {
      console.error('[konten] grafik produksi STSC gagal diambil:', error);
      return null;
    }

    if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data))
      return null;

    const data = json.data as Record<string, unknown>;
    const filter = (Array.isArray(data.filter) ? {} : (data.filter ?? {})) as Record<
      string,
      unknown
    >;

    return validateStscProduksiChart({
      wpp: optionalText(filter.wpp),
      komoditasFilter: optionalText(filter.komoditas),
      dariTahun: optionalNumber(filter.dari_tahun),
      sampaiTahun: optionalNumber(filter.sampai_tahun),
      unit: optionalText(data.unit) ?? 'ton',
      tahun: mapStscYears(data.tahun),
      totalProduksi: optionalNumber(data.total_produksi_ton) ?? 0,
      komoditas: asArray(data.komoditas).map((row) => ({
        komoditas: optionalText(row.komoditas),
        totalProduksi: optionalNumber(row.total_produksi_ton) ?? 0,
        seri: mapStscSeries(row.seri),
      })),
    });
  },
);

function validateStscProduksiChart(raw: unknown): StscProduksiChart | null {
  const parsed = stscProduksiChartSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] grafik produksi STSC dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

export function loadStscProduksiChart(query: StscProduksiQuery): Promise<StscProduksiChart | null> {
  return loadStscProduksiChartMemo(
    JSON.stringify({
      wpp: query.wpp,
      komoditas: query.komoditas,
      dariTahun: query.dariTahun,
      sampaiTahun: query.sampaiTahun,
    }),
  );
}

/** Sama kebijakannya dengan validateVillageDetail: yang cacat dicatat lalu
 *  dianggap tidak ada. Kartu totalannya hilang, halaman Our Impact selebihnya
 *  tetap hidup. */
function validateCoastStats(raw: unknown): CoastStats | null {
  const parsed = coastStatsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  console.error(
    `[konten] statistik pesisir dibuang karena tidak lolos validasi (${mode}): ` +
      formatIssues(parsed.error.issues),
  );
  return null;
}

/**
 * Totalan statistik SELURUH desa lewat `/ext/coast/statistik`.
 *
 * Satu objek, bukan koleksi -- karena itu ia tidak lewat loadCollection: tidak
 * ada entri untuk divalidasi satu per satu dan tidak ada halaman untuk diikuti.
 *
 * Bentuk responsnya bersarang (`pendataan` + `statistik`) sementara skemanya
 * rata, dengan alasan yang sama seperti mapVillageDetail: yang bersarang itu
 * asal datanya di CMS, bukan cara kartu totalan memakainya.
 *
 * null = totalannya tidak bisa diambil atau tidak lolos validasi. Pemanggil
 * tidak merender kartunya sama sekali; peta di atasnya tidak ikut terpengaruh.
 */
const loadCoastStatsMemo = cache(async (): Promise<CoastStats | null> => {
  if (mode !== 'api') {
    return validateCoastStats(await fetchLocal('coastStats'));
  }

  const { base, headers } = cmsAccess();
  const url = new URL(`${base}/ext/coast/statistik`);

  const json = await fetchEnvelope(url, headers, 'impactVillages', null, true);
  if (!json || !json.data || typeof json.data !== 'object' || Array.isArray(json.data)) return null;

  const data = json.data as Record<string, unknown>;
  const pendataan = (data.pendataan ?? {}) as Record<string, unknown>;
  const statistik = (data.statistik ?? {}) as Record<string, unknown>;

  return validateCoastStats({
    jumlahForm: optionalNumber(pendataan.jumlah_form) ?? 0,
    jumlahDesa: optionalNumber(pendataan.jumlah_desa) ?? 0,
    pendataanTerakhir: optionalText(pendataan.terakhir),
    tahunBaru: optionalNumber(statistik.tahun_baru),
    tahunLama: optionalNumber(statistik.tahun_lama),
    metrik: asArray(statistik.metrik).map(mapVillageMetric),
  });
});

export function loadCoastStats(): Promise<CoastStats | null> {
  return loadCoastStatsMemo();
}

export function loadVillageDetail(kode: string): Promise<VillageDetail | null> {
  return loadVillageDetailMemo(kode);
}

/**
 * Dasbor stasiun Jogo Laut (`/ext/jogolaut/monitoring`): seluruh section dalam
 * satu permintaan, dengan parameter bawaan API (7 hari, MA pasut 11, tabel 10
 * baris terbaru).
 *
 * Revalidasinya memakai CACHE_TTL_SECONDS yang sama dengan konten lain, dan
 * kebetulan itu juga lebar blok cache API-nya sendiri (5 menit): memperbarui
 * lebih sering cuma akan menerima salinan yang sama dari cache CMS.
 *
 * null = dasbornya tidak bisa diambil: env CMS kosong, datasource belum
 * dikonfigurasi di CMS (HTTP 503), kunci ditolak, atau bentuknya tidak
 * dikenali. Pemanggil menampilkan pemberitahuan "data tidak tersedia" alih-
 * alih menjatuhkan halaman -- hero dan teks halamannya tidak bergantung pada
 * sensor. Section yang kosong satu per satu BUKAN kasus itu; lihat
 * lib/content/jogolaut.ts.
 */
/** Endpoint ini menghitung 14 section dari tujuh tabel sensor. Dengan cache
 *  CMS yang dingin, jawabannya terukur ~9 detik (kadang melewati 10 detik);
 *  dengan cache hangat ~0,3 detik. Batas bawaan 10 detik x 5 percobaan
 *  karena itu GAGAL tiap kali cache dingin: tiap percobaan diputus tepat
 *  sebelum selesai, lalu diulang dari nol. Satu percobaan panjang lebih
 *  berguna di sini daripada lima yang pendek. */
const JOGOLAUT_LIMITS: FetchLimits = { timeoutMs: 30_000, attempts: 2 };

const loadJogoLautMonitoringMemo = cache(
  async (lang: Locale): Promise<JogoLautMonitoring | null> => {
    if (mode !== 'api') {
      const local = await fetchLocal('jogoLautMonitoring');
      return parseJogoLautMonitoring((local as { data?: unknown }).data);
    }

    try {
      const { base, headers } = cmsAccess();
      const url = new URL(`${base}/ext/jogolaut/monitoring`);
      // Hanya mengubah label (nama seri, tingkat, deskripsi), tidak pernah key.
      url.searchParams.set('locale', lang);

      const json = await fetchEnvelope(url, headers, 'jogoLaut', null, false, JOGOLAUT_LIMITS);
      const parsed = parseJogoLautMonitoring(json?.data);
      if (!parsed) console.error('[konten] respons Jogo Laut tidak dikenali bentuknya.');
      return parsed;
    } catch (error) {
      console.error('[konten] dasbor Jogo Laut gagal diambil:', error);
      return null;
    }
  },
);

export function loadJogoLautMonitoring(lang: Locale): Promise<JogoLautMonitoring | null> {
  return loadJogoLautMonitoringMemo(lang);
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

    const { base, headers } = cmsAccess();
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
  const { base, headers } = cmsAccess();
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
