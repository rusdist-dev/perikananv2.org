import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerProps = {
  as?: ElementType;
  width?: 'content' | 'wide';
  className?: string;
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
  children,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'lg:ps-panel-gutter mx-auto w-full',
        width === 'content' ? 'max-w-content' : 'w-full',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
