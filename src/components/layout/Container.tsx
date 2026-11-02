import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerProps = {
  as?: ElementType;
  width?: 'content' | 'wide';
  className?: string;
  /** Untuk custom property CSS yang dibaca anak-anaknya (lihat hero beranda);
   *  bukan pintu belakang buat styling yang semestinya lewat className. */
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Lebar maksimum + gutter, dua nilai yang harus sama di header, footer, dan
 * setiap section. Ditulis manual, satu tempat pasti menyimpang saat salah
 * satunya berubah -- dan penyimpangan itu terlihat sebagai konten yang tidak
 * sejajar dengan headernya.
 */
export function Container({
  as: Tag = 'div',
  width = 'wide',
  className,
  style,
  children,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'lg:ps-panel-gutter mx-auto w-full',
        width === 'content' ? 'max-w-content' : 'w-full',
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}
