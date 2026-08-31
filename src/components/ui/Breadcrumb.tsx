import { AppLink } from './AppLink';
import { cn } from '@/lib/cn';

export type BreadcrumbItem = { label: string; href?: string };

/**
 * Setiap item ber-`href` jadi link yang bisa diklik -- termasuk item
 * terakhir (halaman saat ini), yang menunjuk ke dirinya sendiri. Hanya item
 * tanpa `href` yang jatuh ke teks biasa. `aria-current="page"` tetap dipasang
 * pada item terakhir walau ia sekarang link, supaya screen reader tetap tahu
 * itu lokasi pembaca sekarang.
 *
 * `tone="on-dark"` memakai --color-breadcrumb-fg (putih) alih-alih
 * --color-breadcrumb (cokelat) -- untuk breadcrumb yang duduk di atas foto
 * atau latar biru gelap, bukan di atas putih.
 */
export function Breadcrumb({
  items,
  tone = 'default',
}: {
  items: BreadcrumbItem[];
  tone?: 'default' | 'on-dark';
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          'flex flex-wrap items-center gap-x-2 text-sm',
          tone === 'on-dark' ? 'text-breadcrumb-fg' : 'text-breadcrumb',
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-x-2">
              {index > 0 ? <span aria-hidden>/</span> : null}
              {item.href ? (
                <AppLink
                  href={item.href}
                  aria-current={isLast ? 'page' : undefined}
                  className="-my-1 py-1 hover:underline underline-offset-2"
                >
                  {item.label}
                </AppLink>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
