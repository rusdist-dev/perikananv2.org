import Image, { type StaticImageData } from 'next/image';
import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';

type ProgramHeroProps = {
  breadcrumb: BreadcrumbItem[];
  title: string;
  lead: string;
  /** Opsional: beberapa program belum punya foto ilustrasi hero sendiri --
   *  section ilustrasi di bawah cukup dilewati, bukan dipaksa pakai foto
   *  program lain yang tidak relevan. */
  image?: StaticImageData;
  /** Opsional: bayangan tipis di tepi kiri/kanan gambar (dipakai Jogo Laut,
   *  yang foto satelitnya polos sampai ke ujung -- program lain foto
   *  ilustrasinya sudah kontras dengan latar putih di sekitarnya). */
  imageEdgeShadow?: boolean;
};

/** Header dipakai bersama oleh setiap halaman /program/*: breadcrumb + judul +
 *  pernyataan ringkas di atas latar putih, lalu ilustrasi penuh lebar di
 *  bawahnya. Tidak menerima locale -- teks editorial tiap program diketik
 *  langsung di page.tsx pemanggilnya, sama seperti konten editorial lain di
 *  beranda. */
export function ProgramHero({ breadcrumb, title, lead, image, imageEdgeShadow }: ProgramHeroProps) {
  return (
    <section>
      <Container className="page-gutter pt-10 pb-8 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb items={breadcrumb} />
        <h1 className="mt-6 text-2xl text-[#0b3d5c] md:text-3xl">{title}</h1>
        <p className="mt-4 max-w-4xl text-2xl text-[#2d5b87] md:text-3xl lg:text-4xl">
          {lead}
        </p>
      </Container>

      {/* Ilustrasi dekoratif (bukan tangkapan layar data atau peta terukur),
          jadi alt kosong + aria-hidden. Penuh lebar viewport, bukan dibatasi
          Container -- panel nav yang mengambang di atasnya sendiri (z-40)
          yang menyisakan potongan gambar ini tetap terlihat di sisi kiri.
          Tinggi kontainer mengikuti rasio asli gambar (bukan tinggi tetap)
          supaya bannernya tampil utuh, tidak terpotong object-cover. */}
      {image ? (
        <div className="relative w-full" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
          <Image src={image} alt="" aria-hidden fill priority sizes="100vw" className="object-contain" />
          {imageEdgeShadow ? (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 start-0 w-16 bg-gradient-to-r from-black/25 to-transparent md:w-28"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 end-0 w-16 bg-gradient-to-l from-black/25 to-transparent md:w-28"
              />
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
