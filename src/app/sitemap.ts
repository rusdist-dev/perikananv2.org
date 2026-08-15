import type { MetadataRoute } from 'next';
import { locales, defaultLocale, htmlLang } from '@/i18n/config';
import { localizedPath } from '@/i18n/routing';
import { getArticleSlugs } from '@/lib/content';
import { staticRoutes } from '@/lib/nav';
import { site } from '@/lib/site';

/**
 * Satu entri per halaman, dalam bentuk KANONIK (locale default tanpa prefiks),
 * dengan `alternates.languages` menunjuk versi bahasa lain. Mendaftarkan
 * /id/... di sini akan mengirim crawler ke URL yang me-redirect.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getArticleSlugs();
  const paths = [...staticRoutes, ...slugs.map((slug) => `/berita/${slug}`)];

  return paths.map((path) => {
    const languages: Record<string, string> = {};
    for (const l of locales) {
      languages[htmlLang[l]] = `${site.url}${localizedPath(path, l)}`;
    }

    return {
      url: `${site.url}${localizedPath(path, defaultLocale)}`,
      alternates: { languages },
    };
  });
}
