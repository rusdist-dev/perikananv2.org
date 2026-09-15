import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { loadArticlesByProgram, loadCollection } from './source';
import { getCmsSlugByFrontendSlug } from './program-taxonomy';
import type { Article, Publication, TeamMember, Milestone, ProgramOption, NewsCategory } from './schema';

/**
 * Barrel: satu-satunya modul yang boleh diimpor halaman.
 *
 * Halaman TIDAK PERNAH mengimpor src/data/*.json atau ./source langsung. Aturan
 * itu yang membuat sumber data bisa diganti tanpa menyentuh satu pun halaman.
 */

export type { Article, Publication, TeamMember, Milestone, ProgramOption, NewsCategory } from './schema';

function byNewest(a: Article, b: Article): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** Kunci gabung varian id/en dari artikel yang sama. CMS Rekam menerbitkan
 *  slug yang di-generate dari judul per bahasa -- begitu judulnya
 *  diterjemahkan, slug-nya ikut berubah, jadi slug TIDAK bisa dipakai sebagai
 *  identitas lintas bahasa (lihat komentar `cmsId` di schema.ts). `cmsId`
 *  yang jadi identitas sesungguhnya di mode CMS; mode lokal tidak
 *  mengenalnya (JSON tidak membawa ID CMS), jadi jatuh balik ke slug --
 *  aman di sana karena data lokal memang satu slug per artikel. */
function mergeKey(article: Article): string {
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
function pickForLocale(all: Article[], locale: Locale): Article[] {
  const byKey = new Map<string, Article>();

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

export async function getArticles(locale: Locale): Promise<Article[]> {
  const all = await loadCollection('articles');
  return pickForLocale(all, locale);
}

export async function getArticle(slug: string, locale: Locale): Promise<Article | null> {
  const articles = await getArticles(locale);
  return articles.find((a) => a.slug === slug) ?? null;
}

/** Slug artikel yang sama (lihat mergeKey) di tiap locale -- dipakai
 *  LanguageSwitcher HANYA di halaman detail berita, supaya tombol ganti
 *  bahasa menuju artikel yang sama alih-alih menukar prefiks locale pada
 *  slug yang sama persis (yang 404 begitu slug-nya berbeda per bahasa,
 *  lihat komentar `cmsId` di schema.ts). Locale yang tidak muncul di hasil
 *  berarti CMS memang tidak mengembalikan varian untuk locale itu. */
export async function getArticleLocaleSlugs(article: Article): Promise<Partial<Record<Locale, string>>> {
  const all = await loadCollection('articles');
  const key = mergeKey(article);
  const slugs: Partial<Record<Locale, string>> = {};

  for (const candidate of all) {
    if (mergeKey(candidate) === key) slugs[candidate.lang] = candidate.slug;
  }

  return slugs;
}

/** Dipakai sitemap (satu path kanonik per artikel, lihat app/sitemap.ts). */
export async function getArticleSlugs(): Promise<string[]> {
  const all = await loadCollection('articles');
  return [...new Set(all.map((a) => a.slug))];
}

/** Dipakai generateStaticParams /berita/[slug] -- BUKAN cross product locale x
 *  slug (perkalian setiap locale dengan getArticleSlugs()), karena sejak
 *  slug bisa berbeda antara varian id/en artikel yang sama (lihat komentar
 *  mergeKey), cross product itu membuat kombinasi (locale, slug) yang tidak
 *  pernah cocok dengan artikel manapun di locale itu. Ini membangun pasangan
 *  yang benar-benar valid, langsung dari slug hasil getArticles per locale. */
export async function getArticleRouteParams(): Promise<{ locale: Locale; slug: string }[]> {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of locales) {
    const articles = await getArticles(locale);
    for (const article of articles) params.push({ locale, slug: article.slug });
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
export async function getArticlesByProgram(locale: Locale, frontendProgramSlug: string): Promise<Article[]> {
  const cmsSlug = getCmsSlugByFrontendSlug(frontendProgramSlug);
  if (!cmsSlug) return [];

  const articles = await loadArticlesByProgram(cmsSlug);
  return pickForLocale(articles, locale);
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
