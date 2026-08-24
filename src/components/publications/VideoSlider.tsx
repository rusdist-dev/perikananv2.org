'use client';

import Image, { type StaticImageData } from 'next/image';
import { useRef } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { AppLink } from '@/components/ui/AppLink';
import { Icon } from '@/components/ui/Icon';

import 'swiper/css';
import 'swiper/css/navigation';

export type VideoSlide = {
  image: StaticImageData;
  title: string;
  href: string;
};

/**
 * Sama persis pola Swiper-nya dengan PublicationsSlider (ref + slidePrev/
 * Next(), panah di padding pembungkus). Kartunya lebih sederhana -- satu
 * tombol WATCH, bukan dua bersebelahan -- jadi tidak butuh penyesuaian
 * lebar/font seketat kartu publikasi.
 */
export function VideoSlider({
  videos,
  watchLabel,
  previousLabel,
  nextLabel,
}: {
  videos: VideoSlide[];
  watchLabel: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const swiperRef = useRef<SwiperInstance | null>(null);

  return (
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
        {videos.map((video, index) => (
          <SwiperSlide key={index} className="h-auto py-1">
            <article className="flex h-full flex-col overflow-hidden rounded-lg bg-bg shadow-md">
              <div className="relative aspect-[3/4]">
                <Image
                  src={video.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="line-clamp-3 min-h-[3.75rem] text-sm text-muted">{video.title}</p>
                <AppLink
                  href={video.href}
                  target={video.href.startsWith('http') ? '_blank' : undefined}
                  rel={video.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="mt-auto inline-flex w-fit items-center rounded-md border border-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary hover:text-primary-fg"
                >
                  {watchLabel}
                </AppLink>
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
  );
}
