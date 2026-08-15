import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /id/* selalu 308 ke bentuk tanpa prefiks. Melarangnya di sini mencegah
      // crawler membakar budget pada redirect yang sudah pasti.
      disallow: ['/id/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
