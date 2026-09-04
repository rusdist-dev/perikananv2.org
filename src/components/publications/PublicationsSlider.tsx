'use client';

import Image, { type StaticImageData } from 'next/image';
import { useRef, useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { AppLink } from '@/components/ui/AppLink';
import { Icon } from '@/components/ui/Icon';
import { PdfViewerModal } from '@/components/publications/PdfViewerModal';

import 'swiper/css';
import 'swiper/css/navigation';

export type PublicationSlide = {
  image: StaticImageData;
  category: string;
  title: string;
  pdfUrl: string | null;
};

/**
 * Panah memakai pola ref + slidePrev/Next() yang sama dengan ProgramSlider
 * dan ProgramGallery (lihat komentar di keduanya soal kenapa bukan selector
 * string). Bedanya dari ProgramGallery: panah di sini duduk di padding
 * pembungkus (start-0/end-0 pada `px-10`), bukan menumpuk di atas slide --
 * kartu di sini berlatar putih dengan tombol di bagian bawah, jadi panah yang
 * menumpang di atasnya akan menutupi kontennya, beda dari ProgramGallery yang
 * slide-nya foto penuh dan aman ditumpangi panah putih.
 */
export function PublicationsSlider({
  publications,
  downloadLabel,
  readLabel,
  previousLabel,
  nextLabel,
  pdfUnavailableLabel,
  closeLabel,
}: {
  publications: PublicationSlide[];
  downloadLabel: string;
  readLabel: string;
  previousLabel: string;
  nextLabel: string;
  pdfUnavailableLabel: string;
  closeLabel: string;
}) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openPublication = openIndex !== null ? publications[openIndex] : null;

  return (
    <>
      <PdfViewerModal
        isOpen={openPublication !== null}
        pdfUrl={openPublication?.pdfUrl ?? null}
        title={openPublication?.title ?? ''}
        unavailableLabel={pdfUnavailableLabel}
        closeLabel={closeLabel}
        onClose={() => setOpenIndex(null)}
      />
    <div className="relative px-6 sm:px-8">
      <Swiper
        modules={[Navigation]}
        loop
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {publications.map((publication, index) => (
          <SwiperSlide key={index} className="h-auto py-1">
            <article className="flex h-full flex-col overflow-hidden rounded-lg bg-bg shadow-md">
              <div className="relative aspect-[3/4]">
                <Image
                  src={publication.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                {/* min-h + line-clamp dipasang di DUA field ini (bukan cuma
                    title) supaya tinggi kartu seragam terlepas dari panjang
                    kategori/judul -- tanpa min-h, kartu berkategori 1 baris
                    ("Guidebook") akan lebih pendek dari yang 2 baris
                    ("Species Documentation"), dan mt-auto di bawah membuat
                    baris tombolnya ikut tidak sejajar antar kartu. */}
                <p className="line-clamp-2 min-h-[2rem] text-xs font-bold uppercase leading-tight tracking-wide text-secondary">
                  {publication.category}
                </p>
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-snug font-semibold text-primary">
                  {publication.title}
                </h3>
                {/* Download langsung lewat <a download> ke pdfUrl -- BUKAN
                    AppLink, berkas publik seperti ini tidak boleh diberi
                    prefiks locale (lihat PdfViewerModal). §4j: publikasi yang
                    `pdfUrl`-nya masih null tetap href="#" apa adanya; Read
                    sudah tersambung ke PdfViewerModal, yang menampilkan pesan
                    "belum tersedia" untuk kasus itu. */}
                <div className="mt-auto flex gap-1 pt-2">
                  {publication.pdfUrl ? (
                    <a
                      href={publication.pdfUrl}
                      download
                      className="min-w-0 flex-1 truncate rounded-md border border-primary px-1 py-2.5 text-center text-xs font-bold uppercase text-primary lg:py-1.5 lg:text-[0.6rem] hover:bg-primary hover:text-primary-fg"
                    >
                      {downloadLabel}
                    </a>
                  ) : (
                    <AppLink
                      href="#"
                      className="min-w-0 flex-1 truncate rounded-md border border-primary px-1 py-2.5 text-center text-xs font-bold uppercase text-primary lg:py-1.5 lg:text-[0.6rem] hover:bg-primary hover:text-primary-fg"
                    >
                      {downloadLabel}
                    </AppLink>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="min-w-0 flex-1 truncate rounded-md border border-primary px-1 py-2.5 text-center text-xs font-bold uppercase text-primary lg:py-1.5 lg:text-[0.6rem] hover:bg-primary hover:text-primary-fg"
                  >
                    {readLabel}
                  </button>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        className="tap-target absolute start-0 top-1/2 z-10 -translate-y-1/2 text-4xl text-secondary hover:opacity-75"
      >
        <Icon id="left-arrow" />
        <span className="sr-only">{previousLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        className="tap-target absolute end-0 top-1/2 z-10 -translate-y-1/2 text-4xl text-secondary hover:opacity-75"
      >
        <Icon id="right-arrow" />
        <span className="sr-only">{nextLabel}</span>
      </button>
    </div>
    </>
  );
}
