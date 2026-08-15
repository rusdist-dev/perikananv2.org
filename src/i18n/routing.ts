import { defaultLocale, isLocale, type Locale } from './config';

/**
 * Satu-satunya tempat aturan "default locale tanpa prefiks" diterjemahkan
 * menjadi string URL. middleware, AppLink, sitemap, dan check-links semuanya
 * memanggil fungsi di sini -- kalau aturannya berubah, ia berubah sekali.
 */

/** Membaca locale dari pathname apa adanya. `/en/berita` -> 'en'; `/berita` -> 'id'. */
export function localeFromPathname(pathname: string): Locale {
  const first = pathname.split('/')[1] ?? '';
  return isLocale(first) ? first : defaultLocale;
}

/** Membuang segmen locale kalau ada. `/en/berita` -> `/berita`; `/en` -> `/`. */
export function stripLocale(pathname: string): string {
  const first = pathname.split('/')[1] ?? '';
  if (!isLocale(first)) return pathname;
  const rest = pathname.slice(first.length + 1);
  return rest === '' ? '/' : rest;
}

/**
 * Bentuk kanonik sebuah path untuk satu locale.
 * `path` selalu path tanpa locale, diawali '/'.
 */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
}

/** Path internal yang dilihat App Router: selalu berprefiks locale. */
export function internalPath(path: string, locale: Locale): string {
  const clean = path === '/' ? '' : path;
  return `/${locale}${clean}`;
}

/** true untuk href yang bukan navigasi internal (mailto:, https:, #, tel:). */
export function isExternalHref(href: string): boolean {
  return !href.startsWith('/') || href.startsWith('//');
}
