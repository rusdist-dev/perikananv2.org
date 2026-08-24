'use client';

import Image, { type StaticImageData } from 'next/image';
import { useRef } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Icon } from '@/components/ui/Icon';

import 'swiper/css';
import 'swiper/css/navigation';

export type GalleryImage = { src: StaticImageData; alt: string };

/**
 * Slider dokumentasi penuh lebar viewport. Tiga gambar terlihat sekaligus di
 * >= lg (sesuai permintaan), menyusut ke dua/satu di layar sempit -- bukan
 * dipaksa tiga di semua ukuran, yang akan membuat tiap gambar terlalu sempit
 * di ponsel.
 *
 * Panah memakai pola ref + slidePrev/Next yang sama dengan ProgramSlider di
 * beranda (lihat komentar di sana): selector string butuh elemen tombolnya
 * sudah ada di DOM saat Swiper diinisialisasi, dan React merender keduanya
 * di render yang sama sehingga urutan itu tidak terjamin.
 */
export function ProgramGallery({
  images,
  previousLabel,
  nextLabel,
  aspectClassName = 'aspect-[210/297]',
  fit = 'contain',
}: {
  images: GalleryImage[];
  previousLabel: string;
  nextLabel: string;
  /** Rasio kotak slide. Default rasio A4, dipakai untuk dokumen/poster. */
  aspectClassName?: string;
  /** 'contain' untuk poster (tidak boleh terpotong), 'cover' untuk foto
   *  dokumentasi bebas rasio (mengisi kotak, sisi yang kepanjangan dipotong). */
  fit?: 'contain' | 'cover';
}) {
  const swiperRef = useRef<SwiperInstance | null>(null);

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]}
        loop
        spaceBetween={2}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className={`relative ${aspectClassName}`}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className={fit === 'cover' ? 'object-cover' : 'object-contain'}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        className="tap-target absolute start-2 top-1/2 z-10 -translate-y-1/2 text-5xl text-white hover:opacity-75"
      >
        <Icon id="left-arrow" />
        <span className="sr-only">{previousLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        className="tap-target absolute end-2 top-1/2 z-10 -translate-y-1/2 text-5xl text-white hover:opacity-75"
      >
        <Icon id="right-arrow" />
        <span className="sr-only">{nextLabel}</span>
      </button>
    </div>
  );
}
