import { cn } from '@/lib/cn';
import type { IconId } from '@/icons/generated';

type IconProps = {
  id: IconId;
  className?: string;
  /** Isi HANYA kalau ikon menyampaikan makna yang tidak ada di teks sekitarnya.
   *  Ikon di samping label yang sudah terbaca justru harus tetap aria-hidden --
   *  kalau tidak, screen reader membacakan hal yang sama dua kali. */
  title?: string;
};

export function Icon({ id, className, title }: IconProps) {
  const decorative = title === undefined;

  return (
    <svg
      className={cn('inline-block size-[1em] shrink-0', className)}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : 'img'}
      aria-label={title}
      focusable="false"
    >
      <use href={`#i-${id}`} />
    </svg>
  );
}
