'use client';

import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/ui/AppLink';
import { locales, localeLabel, htmlLang, type Locale } from '@/i18n/config';
import { stripLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * Menukar bahasa TANPA memindahkan pembaca ke beranda: ia membuang segmen
 * locale dari path saat ini dan membiarkan AppLink memasang yang baru, jadi
 * /en/berita <-> /berita. Switcher yang selalu menuju '/' adalah cara paling
 * cepat kehilangan pembaca yang sudah sampai di halaman dalam.
 *
 * Bukan <select>: daftar dua entri sebagai link berarti bisa dibuka di tab
 * baru, di-crawl, dan tidak butuh JavaScript untuk berpindah.
 */
export function LanguageSwitcher({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const bare = stripLocale(pathname);

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center gap-1">
        {locales.map((l) => {
          const current = l === locale;
          return (
            <li key={l}>
              <AppLink
                href={bare}
                localeOverride={l}
                hrefLang={htmlLang[l]}
                // aria-current memberi tahu screen reader bahasa mana yang aktif;
                // pembeda visual saja tidak sampai ke sana.
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'inline-flex items-center rounded-sm px-2 py-1 text-sm uppercase',
                  current ? 'font-semibold text-fg' : 'text-muted hover:text-fg',
                )}
              >
                <span aria-hidden="true">{l}</span>
                <span className="sr-only">{localeLabel[l]}</span>
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
