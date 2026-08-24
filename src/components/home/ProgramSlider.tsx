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

export type ProgramSlideData = {
  href: string;
  title: string;
  description: string;
  icon: StaticImageData;
};

/**
 * Panah sengaja dikendalikan lewat ref + `swiper.slidePrev/Next()`, bukan
 * prop `navigation: { prevEl, nextEl }` berbasis selector string -- selector
 * butuh elemennya sudah ada di DOM saat Swiper diinisialisasi, dan React
 * merender keduanya di render yang sama sehingga urutannya tidak terjamin.
 */
export function ProgramSlider({
  slides,
  learnMoreLabel,
  previousLabel,
  nextLabel,
}: {
  slides: ProgramSlideData[];
  learnMoreLabel: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const swiperRef = useRef<SwiperInstance | null>(null);

  return (
    <div className="relative flex h-full flex-col bg-primary text-primary-fg">
      <Swiper
        modules={[Navigation]}
        loop
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.href}>
            <div className="flex h-full flex-col items-start gap-4 p-8 lg:p-16">
              <Image src={slide.icon} alt="" aria-hidden className="h-20 w-20" />
              <h2 className="text-3xl font-bold">{slide.title}</h2>
              <p className="text-primary-fg/90">{slide.description}</p>
              <AppLink
                href={slide.href}
                className="mt-2 inline-flex w-fit items-center rounded-md bg-secondary px-6 py-2 text-xs font-bold uppercase tracking-wide text-secondary-fg hover:opacity-90"
              >
                {learnMoreLabel}
              </AppLink>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        className="tap-target absolute start-2 top-1/2 z-10 -translate-y-1/2 text-2xl hover:opacity-75"
      >
        <Icon id="left-arrow" />
        <span className="sr-only">{previousLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        className="tap-target absolute end-2 top-1/2 z-10 -translate-y-1/2 text-2xl hover:opacity-75"
      >
        <Icon id="right-arrow" />
        <span className="sr-only">{nextLabel}</span>
      </button>
    </div>
  );
}
