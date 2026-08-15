import type { Metadata } from 'next';
import { locales, defaultLocale, htmlLang, type Locale } from './config';
import { localizedPath } from './routing';
import { site } from '@/lib/site';

/**
 * Canonical dan hreflang dibangun dari fungsi yang sama dengan yang dipakai
 * middleware dan AppLink (localizedPath). Kalau metadata menghitung URL-nya
 * sendiri, ia akan menunjuk /id/berita sementara pembaca ada di /berita --
 * mesin pencari lalu meng-index alamat yang me-redirect ke tempat lain.
 */

type BuildArgs = {
  locale: Locale;
  /** Path tanpa prefiks locale, mis. '/berita'. */
  path: string;
  title?: string;
  description?: string;
};

export function buildMetadata({ locale, path, title, description }: BuildArgs): Metadata {
  const canonicalPath = localizedPath(path, locale);
  const resolvedTitle = title ?? site.name;
  const resolvedDescription = description ?? site.description[locale];

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[htmlLang[l]] = localizedPath(path, l);
  }
  // x-default menunjuk locale tanpa prefiks: itu yang dilihat pengunjung yang
  // bahasanya tidak kita punya.
  languages['x-default'] = localizedPath(path, defaultLocale);

  return {
    metadataBase: new URL(site.url),
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: htmlLang[locale],
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
    },
  };
}
