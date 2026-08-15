'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { localeFromPathname, localizedPath, isExternalHref } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';

/**
 * SATU-SATUNYA cara menautkan ke halaman internal.
 *
 * Ia membaca locale dari URL-nya sendiri (usePathname), bukan dari prop.
 * Meneruskan prop `locale` ke puluhan pemanggil berarti puluhan kesempatan
 * lupa, dan link yang lupa prefiks tidak pernah terlihat rusak: ia tetap
 * menjawab 200 sambil diam-diam melempar pembaca /en kembali ke locale default.
 * Status HTTP tidak bisa menangkap kegagalan itu -- karena itu
 * scripts/check-links.mjs ikut menegakkan prefiksnya dari sisi hasil build.
 *
 * `href` yang dioper SELALU path tanpa locale: '/berita', bukan '/en/berita'.
 */

type AppLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  /** Hanya untuk language switcher, yang memang perlu menunjuk locale lain
   *  daripada locale halaman saat ini. */
  localeOverride?: Locale;
};

export function AppLink({ href, localeOverride, ...props }: AppLinkProps) {
  const pathname = usePathname();

  // href eksternal (https:, mailto:, tel:, #anchor) lewat tanpa disentuh --
  // menambahkan prefiks locale ke mailto: akan merusaknya.
  if (isExternalHref(href)) {
    return <Link href={href} {...props} />;
  }

  const locale = localeOverride ?? localeFromPathname(pathname);
  return <Link href={localizedPath(href, locale)} {...props} />;
}
