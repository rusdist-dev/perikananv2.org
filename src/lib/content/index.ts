import { defaultLocale, type Locale } from '@/i18n/config';
import { loadCollection } from './source';
import type { Article } from './schema';

/**
 * Barrel: satu-satunya modul yang boleh diimpor halaman.
 *
 * Halaman TIDAK PERNAH mengimpor src/data/*.json atau ./source langsung. Aturan
 * itu yang membuat sumber data bisa diganti tanpa menyentuh satu pun halaman.
 */

export type { Article } from './schema';

function byNewest(a: Article, b: Article): number {
  return b.publishedAt.localeCompare(a.publishedAt);
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
  const bySlug = new Map<string, Article>();

  for (const article of all) {
    const existing = bySlug.get(article.slug);
    if (!existing) {
      bySlug.set(article.slug, article);
      continue;
    }
    // Versi locale yang diminta selalu menang atas versi fallback.
    if (article.lang === locale && existing.lang !== locale) {
      bySlug.set(article.slug, article);
    }
  }

  return [...bySlug.values()]
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

/** Dipakai generateStaticParams dan sitemap. Slug unik lintas bahasa: satu
 *  artikel yang sama punya satu slug, apa pun bahasanya. */
export async function getArticleSlugs(): Promise<string[]> {
  const all = await loadCollection('articles');
  return [...new Set(all.map((a) => a.slug))];
}
