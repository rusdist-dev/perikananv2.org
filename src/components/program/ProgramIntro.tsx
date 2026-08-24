import type { ReactNode } from 'react';
import { Container } from '@/components/layout/Container';

/** Blok paragraf pembuka di atas latar putih, tepat di bawah ProgramHero.
 *  Menerima `children` (bukan string) supaya pemanggil bebas menyisipkan
 *  <span className="text-secondary"> untuk menonjolkan istilah kunci --
 *  sesuatu yang tidak bisa diekspresikan lewat prop string biasa. */
export function ProgramIntro({ children }: { children: ReactNode }) {
  return (
    <Container className="page-gutter py-12 lg:pe-(--spacing-panel-gutter)">
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-[#5b6360] md:text-base text-justify">
        {children}
      </div>
    </Container>
  );
}
