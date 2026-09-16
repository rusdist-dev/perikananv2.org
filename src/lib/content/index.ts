import { defaultLocale, locales, type Locale } from '@/i18n/config';
import {
  loadArticleBySlug,
  loadArticlePreviews,
  loadArticlesByProgram,
  loadArticlesQuery,
  loadCollection,
  type ArticlePage,
  type ArticleQuery,
} from './source';
import { getCmsSlugByFrontendSlug } from './program-taxonomy';
import type {
  Article,
  ArticleListItem,
  Publication,
  TeamMember,
  Milestone,
  ProgramOption,
  NewsCategory,
} from './schema';

/**
 * Barrel: satu-satunya modul yang boleh diimpor halaman.
 *
 * Halaman TIDAK PERNAH mengimpor src/data/*.json atau ./source langsung. Aturan
 * itu yang membuat sumber data bisa diganti tanpa menyentuh satu pun halaman.
 */

export type {
  Article,
  ArticleListItem,
  Publication,
  TeamMember,
  Milestone,
  ProgramOption,
  NewsCategory,
} from './schema';
export type { ArticlePage } from './source';

function byNewest(a: ArticleListItem, b: ArticleListItem): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** Kunci gabung varian id/en dari artikel yang sama. CMS Rekam menerbitkan
 *  slug yang di-generate dari judul per bahasa -- begitu judulnya
 *  diterjemahkan, slug-nya ikut berubah, jadi slug TIDAK bisa dipakai sebagai
 *  identitas lintas bahasa (lihat komentar `cmsId` di schema.ts). `cmsId`
 *  yang jadi identitas sesungguhnya di mode CMS; mode lokal tidak
 *  mengenalnya (JSON tidak membawa ID CMS), jadi jatuh balik ke slug --
 *  aman di sana karena data lokal memang satu slug per artikel. */
function mergeKey(article: ArticleListItem): string {
  return article.cmsId !== null ? `id:${article.cmsId}` : `slug:${article.slug}`;
}

/**
 * Fallback locale ada di lapisan kueri, bukan di halaman.
 *
 * Alasannya: sebuah artikel boleh belum diterjemahkan, dan pembaca /en yang
 * membuka daftar seharusnya melihat artikel itu (dalam bahasa asli) daripada
 * melihat daftar yang bolong. Kalau tiap halaman mengurus fallback sendiri,
 * separuhnya akan lupa.
 */
function pickForLocale(all: ArticleListItem[], locale: Locale): ArticleListItem[] {
  const byKey = new Map<string, ArticleListItem>();

  for (const article of all) {
    const key = mergeKey(article);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, article);
      continue;
    }
    // Versi locale yang diminta selalu menang atas versi fallback.
    if (article.lang === locale && existing.lang !== locale) {
      byKey.set(key, article);
    }
  }

  return [...byKey.values()]
    .filter((a) => a.lang === locale || a.lang === defaultLocale)
    .sort(byNewest);
}

export async function getArticles(locale: Locale): Promise<ArticleListItem[]> {
  const all = await loadCollection('articles');
  return pickForLocale(all, locale);
}

/** Satu artikel, langsung dari `/news/{slug}` -- BUKAN getArticles() lalu
 *  dicari slug-nya. Halaman detail tidak butuh arsipnya, dan menariknya
 *  sekali per halaman artikel adalah yang membuat `next build` menjatuhkan
 *  CMS (lihat komentar loadArticleBySlug di source.ts). */
export async function getArticle(slug: string, locale: Locale): Promise<Article | null> {
  return loadArticleBySlug(slug, locale);
}

/** Slug artikel yang sama (lihat mergeKey) di tiap locale -- dipakai
 *  LanguageSwitcher HANYA di halaman detail berita, supaya tombol ganti
 *  bahasa menuju artikel yang sama alih-alih menukar prefiks locale pada
 *  slug yang sama persis (yang 404 begitu slug-nya berbeda per bahasa,
 *  lihat komentar `cmsId` di schema.ts). Locale yang tidak muncul di hasil
 *  berarti CMS memang tidak mengembalikan varian untuk locale itu. */
export async function getArticleLocaleSlugs(
  article: ArticleListItem,
): Promise<Partial<Record<Locale, string>>> {
  const slugs: Partial<Record<Locale, string>> = {};

  // Satu permintaan kecil per locale, bukan seluruh koleksi. Endpoint
  // `/news/{slug}` menerima slug bahasa MANA PUN dan mengembalikan varian
  // bahasa yang diminta beserta slug bahasa itu (sudah diverifikasi langsung
  // ke API), jadi slug yang sedang dibuka cukup ditanyakan ulang per bahasa.
  // Panggilan untuk locale yang sedang dirender dijawab dari memo
  // loadArticleBySlug -- halaman detail sudah memintanya lebih dulu.
  await Promise.all(
    locales.map(async (locale) => {
      const variant = await loadArticleBySlug(article.slug, locale);
      if (variant) slugs[locale] = variant.slug;
    }),
  );

  return slugs;
}

/** Dipakai sitemap (satu path kanonik per artikel, lihat app/sitemap.ts). */
export async function getArticleSlugs(): Promise<string[]> {
  const all = await loadCollection('articles');
  return [...new Set(all.map((a) => a.slug))];
}

/**
 * Pasangan (locale, slug) yang dibangun saat build oleh generateStaticParams
 * /berita/[slug] -- SEBAGIAN saja, bukan semuanya.
 *
 * `perLocale` artikel terbaru per bahasa yang dibangun di muka; sisanya
 * dirender saat pertama dibuka lalu ikut di-cache (dynamicParams default
 * true, lihat komentar di halaman detailnya). Mem-prerender keseluruhan
 * 240 artikel x 2 bahasa berarti ratusan permintaan dalam beberapa menit,
 * dan CMS menjawabnya dengan HTTP 500 sampai build gagal -- terukur di lima
 * kali percobaan build. Yang dibangun di muka sengaja yang terbaru: itu yang
 * ditautkan beranda dan halaman pertama /berita, jadi yang paling mungkin
 * dibuka lebih dulu.
 *
 * BUKAN cross product locale x slug (perkalian setiap locale dengan
 * getArticleSlugs()): sejak slug bisa berbeda antara varian id/en artikel
 * yang sama (lihat komentar mergeKey), cross product itu membuat kombinasi
 * yang tidak pernah cocok dengan artikel manapun di locale itu.
 */
export async function getArticleRouteParams(
  perLocale: number,
): Promise<{ locale: Locale; slug: string }[]> {
  const params: { locale: Locale; slug: string }[] = [];

  for (const locale of locales) {
    // Permintaan kecil per bahasa, bukan menarik seluruh arsip cuma untuk
    // mengetahui slug mana yang terbaru.
    const articles = await loadArticlePreviews(locale, perLocale, null);
    for (const article of [...articles].sort(byNewest).slice(0, perLocale)) {
      params.push({ locale, slug: article.slug });
    }
  }

  return params;
}

/** Dipakai halaman /program/<slug> untuk seksi "Related Stories".
 *  `frontendProgramSlug` adalah slug rute (mis. "species-conservation"),
 *  dikonversi ke slug taksonomi CMS lewat program-taxonomy.ts. Slug yang
 *  tidak dikenal menghasilkan daftar kosong, bukan error -- halaman program
 *  tetap bisa dirender tanpa berita terkait.
 *
 *  Penyaringannya diserahkan ke CMS (loadArticlesByProgram), bukan menyaring
 *  hasil getArticles() di sini. Versi lama melakukan yang kedua dan
 *  membandingkan `article.program?.slug` -- program pertama saja -- sehingga
 *  berita yang ditandai beberapa program sekaligus cuma tampil di satu
 *  halaman program. Fallback locale tetap di sini, karena CMS menyaring per
 *  program, bukan menggabungkan varian bahasa. */
export async function getArticlesByProgram(
  locale: Locale,
  frontendProgramSlug: string,
): Promise<ArticleListItem[]> {
  const cmsSlug = getCmsSlugByFrontendSlug(frontendProgramSlug);
  if (!cmsSlug) return [];

  const articles = await loadArticlesByProgram(cmsSlug);
  return pickForLocale(articles, locale);
}

/** Batas hasil berita untuk /cari. Seratus adalah `per_page` maksimum yang
 *  dihormati CMS, dan kueri terluas yang diuji ("hiu") menghasilkan 46 --
 *  masih jauh di bawahnya. Kueri yang menembus batas ini akan terpotong diam-
 *  diam, jadi kalau arsipnya tumbuh jauh, pencarian perlu ikut dipaginasi. */
export const NEWS_SEARCH_LIMIT = 100;

/**
 * Pencarian berita, dikerjakan CMS lewat `?search=`.
 *
 * Bukan sekadar memindahkan pekerjaan: pencocokan lokal hanya melihat judul,
 * excerpt, dan tag, sementara CMS ikut mencari ISI artikel dan di KEDUA
 * bahasa (docs/api-public.md). Terukur jauh lebih luas -- "mangrove" 10 -> 35
 * hasil, "blue carbon" 3 -> 22. Sejak entri daftar tidak lagi membawa body,
 * pencocokan lokal juga tidak mungkin lagi menyamainya.
 *
 * Yang hilang: artikel yang cocok HANYA lewat nama programnya (1-2 per kueri
 * pada pengujian) -- teksnya tidak pernah menyebut kata itu, cuma tag-nya.
 * Penggantinya adalah filter program di /berita, yang memang untuk itu.
 */
export async function searchArticles(
  locale: Locale,
  query: string,
  limit: number,
): Promise<ArticleListItem[]> {
  const search = query.trim();
  if (!search) return [];

  const page = await loadArticlesQuery({
    lang: locale,
    search,
    year: '',
    program: '',
    category: '',
    sort: 'newest',
    page: 1,
    perPage: limit,
  });

  return page.articles;
}

/**
 * Beberapa artikel terbaru -- dipakai seksi berita di beranda.
 *
 * Diminta ke CMS dengan `per_page` sekecil yang ditampilkan. Beranda dulu
 * memanggil getArticles() lalu mengambil tiga teratas, yang berarti menarik,
 * memetakan, dan memvalidasi 240 artikel x 2 bahasa untuk merender tiga kartu.
 *
 * Satu locale saja, tanpa penggabungan varian bahasa: CMS sudah jatuh balik
 * sendiri ke bahasa Indonesia saat terjemahan Inggrisnya kosong
 * (docs/api-public.md §Bahasa), dan kartu ringkas tidak menampilkan atribut
 * lang seperti halaman detail.
 */
export async function getLatestArticles(locale: Locale, limit: number): Promise<ArticleListItem[]> {
  return loadArticlePreviews(locale, limit, null);
}

/**
 * Tahun-tahun yang boleh dipilih di filter /berita.
 *
 * CMS tidak menerbitkan daftar tahun, jadi rentangnya diturunkan dari artikel
 * tertua sampai yang terbaru -- dua permintaan kecil, bukan menarik arsip
 * hanya untuk mengumpulkan tahun uniknya. Rentang, bukan himpunan: tahun yang
 * kebetulan tidak punya berita tetap muncul dan menghasilkan daftar kosong,
 * dan itu jawaban yang jujur ("tidak ada berita tahun itu") ketimbang tahunnya
 * hilang dari dropdown tanpa penjelasan.
 */
export async function getNewsYears(locale: Locale): Promise<number[]> {
  const [newest, oldest] = await Promise.all([
    loadArticlePreviews(locale, 1, null),
    loadArticlesQuery({
      lang: locale,
      search: '',
      year: '',
      program: '',
      category: '',
      sort: 'oldest',
      page: 1,
      perPage: 1,
    }),
  ]);

  const newestYear = newest[0] ? Number(newest[0].publishedAt.slice(0, 4)) : null;
  const oldestYear = oldest.articles[0] ? Number(oldest.articles[0].publishedAt.slice(0, 4)) : null;
  if (!newestYear || !oldestYear || oldestYear > newestYear) return [];

  return Array.from({ length: newestYear - oldestYear + 1 }, (_, i) => newestYear - i);
}

/** Artikel terbaru tanpa filter apa pun -- dipakai kartu utama (hero)
 *  /berita, yang memang tidak ikut menyempit saat pengunjung memfilter.
 *  Satu permintaan kecil, bukan mengambil kepala dari seluruh arsip. */
export async function getNewestArticle(locale: Locale): Promise<ArticleListItem | null> {
  const [newest] = await loadArticlePreviews(locale, 1, null);
  return newest ?? null;
}

/** Berapa kartu per halaman /berita. Di sini, bukan di komponennya: angka ini
 *  menentukan `per_page` yang diminta ke CMS sekaligus pembagi jumlah halaman,
 *  jadi dua hal yang harus selalu sama. */
export const NEWS_PAGE_SIZE = 9;

/**
 * Satu halaman /berita sesuai filter di URL -- disaring dan dipaginasi CMS.
 *
 * Nilai kosong berarti "tanpa filter", jadi pemanggil boleh mengoper isi
 * searchParams apa adanya tanpa membersihkannya dulu. Halaman di luar rentang
 * bukan galat: CMS mengembalikan daftar kosong dan halaman menampilkan pesan
 * "tidak ada hasil", sama seperti kombinasi filter yang tidak cocok.
 */
export async function getNewsPage(
  locale: Locale,
  params: {
    search?: string;
    year?: string;
    program?: string;
    category?: string;
    sort?: string;
    page?: string;
  },
): Promise<ArticlePage> {
  const page = Number.parseInt(params.page ?? '1', 10);
  const year = params.year ?? '';

  const query: ArticleQuery = {
    lang: locale,
    search: (params.search ?? '').trim(),
    // CMS sendiri mengabaikan tahun yang bukan 4 digit, tapi menyaringnya di
    // sini menjaga kunci cache tidak ikut kotor oleh nilai sampah dari URL.
    year: /^[0-9]{4}$/.test(year) ? year : '',
    program: params.program ?? '',
    category: params.category ?? '',
    sort: params.sort === 'oldest' ? 'oldest' : 'newest',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: NEWS_PAGE_SIZE,
  };

  return loadArticlesQuery(query);
}

/**
 * Kartu "related" di bawah artikel: beberapa artikel program yang sama, atau
 * yang terbaru kalau artikelnya belum ditandai program.
 *
 * Diminta ke CMS dengan `per_page` sekecil yang ditampilkan -- versi
 * sebelumnya memanggil getArticles() (seluruh arsip) lalu membuang hampir
 * semuanya untuk mengambil tiga kartu.
 */
export async function getRelatedArticles(
  article: ArticleListItem,
  locale: Locale,
  limit: number,
): Promise<ArticleListItem[]> {
  const picked: ArticleListItem[] = [];
  const seen = new Set([article.slug]);

  const take = (candidates: ArticleListItem[]) => {
    for (const candidate of candidates) {
      if (picked.length >= limit) return;
      if (seen.has(candidate.slug)) continue;
      seen.add(candidate.slug);
      picked.push(candidate);
    }
  };

  // +1 di tiap permintaan karena artikelnya sendiri hampir pasti ikut
  // terjaring lalu dibuang.
  const programSlug = article.programs[0];
  if (programSlug) take(await loadArticlePreviews(locale, limit + 1, programSlug));

  // Ditambal artikel terbaru kalau programnya belum punya cukup berita --
  // dan itu sering: sebagian program di CMS baru berisi satu artikel, yaitu
  // yang sedang dibaca. Tanpa penambal ini seksi "Related Story" hilang sama
  // sekali di halaman-halaman itu. Permintaan kedua ini hanya terjadi saat
  // memang kurang, bukan di setiap halaman.
  if (picked.length < limit) take(await loadArticlePreviews(locale, limit + 1, null));

  return picked;
}

/** Menggabungkan varian id/en sebuah daftar opsi filter: kunci gabungnya
 *  nilai yang TIDAK diterjemahkan (slug/value), versi locale yang diminta
 *  menang, sisanya jatuh balik ke bahasa default. Pola yang sama dengan
 *  pickForLocale/pickTeamForLocale, cuma tanpa pengurutan -- urutan dropdown
 *  mengikuti urutan CMS, yang memang sudah diatur di Pengaturan › Taksonomi. */
function pickOptionsForLocale<T extends { lang: Locale }>(all: T[], locale: Locale, keyOf: (item: T) => string): T[] {
  const byKey = new Map<string, T>();

  for (const item of all) {
    const key = keyOf(item);
    const existing = byKey.get(key);
    if (!existing || (item.lang === locale && existing.lang !== locale)) {
      byKey.set(key, item);
    }
  }

  return [...byKey.values()].filter((item) => item.lang === locale || item.lang === defaultLocale);
}

/** Opsi dropdown "Program" di /berita, langsung dari taksonomi CMS
 *  (`/programs`) -- bukan diturunkan dari artikel yang kebetulan sudah
 *  ditarik, dan bukan pula dari panelNav. Program tanpa berita pun tetap
 *  muncul, dan menambah program baru di CMS tidak perlu menyentuh kode. */
export async function getProgramOptions(locale: Locale): Promise<ProgramOption[]> {
  const all = await loadCollection('programOptions');
  return pickOptionsForLocale(all, locale, (option) => option.value);
}

/** Opsi dropdown "Category" di /berita, dari `/news-categories` CMS. Daftar
 *  kategori sesungguhnya -- sebelumnya dropdown ini diisi tag artikel, yang
 *  mencampur nama kategori dengan nama program. */
export async function getNewsCategories(locale: Locale): Promise<NewsCategory[]> {
  const all = await loadCollection('newsCategories');
  return pickOptionsForLocale(all, locale, (category) => category.slug);
}

/** Tidak ada pickForLocale di sini -- publikasi tidak diterjemahkan per
 *  locale (lihat komentar publicationSchema), jadi satu daftar dipakai apa
 *  adanya untuk /id maupun /en. */
export async function getPublications(): Promise<Publication[]> {
  return loadCollection('publications');
}

/** Urutan section /discover/our-team: Advisor -> Manager -> Officer, tak
 *  peduli urutan grup yang dikembalikan CMS. */
const TEAM_LEVEL_ORDER: Record<TeamMember['level'], number> = {
  penasihat: 0,
  manajer: 1,
  staff: 2,
};

function byTeamOrder(a: TeamMember, b: TeamMember): number {
  return TEAM_LEVEL_ORDER[a.level] - TEAM_LEVEL_ORDER[b.level];
}

/** Sama seperti pickForLocale, tapi kunci gabungnya `slug` -- bukan cmsId.
 *  Nama orang tidak diterjemahkan seperti judul artikel, jadi slug anggota
 *  tim SAMA di id maupun en (diverifikasi langsung ke CMS, lihat komentar
 *  `slug` di teamMemberSchema), tidak butuh akal-akalan cmsId seperti
 *  Article. */
function pickTeamForLocale(all: TeamMember[], locale: Locale): TeamMember[] {
  const bySlug = new Map<string, TeamMember>();

  for (const member of all) {
    const existing = bySlug.get(member.slug);
    if (!existing) {
      bySlug.set(member.slug, member);
      continue;
    }
    if (member.lang === locale && existing.lang !== locale) {
      bySlug.set(member.slug, member);
    }
  }

  return [...bySlug.values()]
    .filter((m) => m.lang === locale || m.lang === defaultLocale)
    .sort(byTeamOrder);
}

/** Seluruh tim, tiga jenjang sekaligus -- dipakai /discover/our-team. */
export async function getTeam(locale: Locale): Promise<TeamMember[]> {
  const all = await loadCollection('team');
  return pickTeamForLocale(all, locale);
}

/** Hanya Dewan Penasihat -- dipakai /discover/about-us, yang cuma
 *  menampilkan jenjang ini (beda dari /discover/our-team yang menampilkan
 *  ketiganya). */
export async function getAdvisors(locale: Locale): Promise<TeamMember[]> {
  return (await getTeam(locale)).filter((m) => m.level === 'penasihat');
}

function byMilestoneYear(a: Milestone, b: Milestone): number {
  return a.year - b.year;
}

/** Sama seperti pickTeamForLocale, tapi kunci gabungnya `year` -- angka
 *  tahun tidak diterjemahkan, jadi aman dipakai sebagai identitas lintas
 *  bahasa (diverifikasi langsung ke CMS: satu milestone punya `year` yang
 *  sama persis di kedua locale). */
function pickMilestonesForLocale(all: Milestone[], locale: Locale): Milestone[] {
  const byYear = new Map<number, Milestone>();

  for (const milestone of all) {
    const existing = byYear.get(milestone.year);
    if (!existing) {
      byYear.set(milestone.year, milestone);
      continue;
    }
    if (milestone.lang === locale && existing.lang !== locale) {
      byYear.set(milestone.year, milestone);
    }
  }

  return [...byYear.values()]
    .filter((m) => m.lang === locale || m.lang === defaultLocale)
    .sort(byMilestoneYear);
}

/** Dipakai /discover/achievements untuk grid timeline milestone. */
export async function getMilestones(locale: Locale): Promise<Milestone[]> {
  const all = await loadCollection('milestones');
  return pickMilestonesForLocale(all, locale);
}
