import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale } from '@/i18n/config';

/**
 * Dulu namanya middleware.ts. Next 16.3 men-deprecate konvensi itu dan
 * memintanya jadi proxy.ts dengan export bernama `proxy`; perannya tidak
 * berubah sama sekali.
 *
 * ---
 *
 * Locale default hidup TANPA prefiks di address bar, tapi App Router hanya
 * mengenal rute berprefiks (app/[locale]/...). File ini yang menjembatani:
 *
 *   /berita     -> rewrite internal ke /id/berita   (URL tetap /berita)
 *   /id/berita  -> redirect 308 ke /berita          (bentuk kanonik)
 *   /en/berita  -> lewat apa adanya
 *
 * Redirect (bukan rewrite) untuk /id/* itu yang mencegah satu halaman hidup di
 * dua URL sekaligus -- duplikat yang membelah sinyal SEO dan membuat canonical
 * berselisih dengan alamat yang benar-benar dibuka pembaca.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split('/')[1] ?? '';

  if (segment === defaultLocale) {
    const stripped = pathname.slice(defaultLocale.length + 1) || '/';
    const url = new URL(stripped, request.url);
    url.search = request.nextUrl.search;
    // 308, bukan 307: permanen dan menjaga metode, jadi klien boleh meng-cache-nya.
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(segment)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /**
   * Berbasis ekstensi, bukan daftar kecualian per file.
   *
   * Versi yang menyebut sitemap.xml/robots.txt/favicon.ico satu per satu selalu
   * ketinggalan aset berikutnya: /logo.svg diam-diam di-rewrite jadi
   * /id/logo.svg lalu 404, dan tidak ada yang menyadarinya sampai gambarnya
   * hilang di produksi. Slug rute tidak pernah mengandung titik (ditegakkan
   * regex slug di lib/content/schema.ts), jadi aturan "ada titik = bukan rute"
   * tidak mengorbankan apa pun.
   */
  matcher: ['/((?!_next/|api/|.*\\.).*)'],
};
