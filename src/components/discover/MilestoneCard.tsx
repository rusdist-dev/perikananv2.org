'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

/** Tinggi maksimum blok teks saat terlipat, dalam px -- ~7 baris teks 14px
 *  (leading-5 = 20px). Angkanya diambil dari pengukuran isi kartu terpendek
 *  (2018/2019 ~106-154px) supaya paragraf pendek lolos utuh tanpa tombol yang
 *  tidak perlu, sementara daftar poin panjang (2021/2023, 360-490px) tetap
 *  terlipat.
 *
 *  Ditulis sebagai style inline, bukan class Tailwind, supaya angka yang
 *  dibandingkan dengan scrollHeight saat mengukur adalah angka yang sama --
 *  kalau nilainya hidup di dua tempat (CSS + JS), keduanya pasti lepas sinkron
 *  begitu ada yang mengubah salah satunya. */
const COLLAPSED_MAX_HEIGHT = 140;

export type MilestoneCardProps = {
  year: string;
  title: string;
  image: StaticImageData;
  description?: string;
  bullets?: string[];
  showMoreLabel: string;
  showLessLabel: string;
};

/**
 * Kartu milestone dengan blok deskripsi bertinggi maksimum. Tombol
 * show/hide HANYA muncul kalau isinya memang lebih tinggi dari batas --
 * milestone 2018/2019 yang cuma satu paragraf pendek tidak ikut kebagian
 * tombol yang tidak melakukan apa-apa.
 *
 * Pengukuran memakai scrollHeight (tinggi konten sebenarnya) dan tetap
 * benar saat sedang terbuka: max-height dilepas, tapi scrollHeight elemen
 * yang mengembang tetap > COLLAPSED_MAX_HEIGHT, jadi tombolnya tidak
 * menghilang sendiri setelah diklik.
 *
 * ResizeObserver dipasang karena tinggi teks berubah saat lebar kartu
 * berubah (breakpoint grid, rotasi ponsel, font baru selesai dimuat), bukan
 * cuma sekali saat mount.
 */
export function MilestoneCard({
  year,
  title,
  image,
  description,
  bullets,
  showMoreLabel,
  showLessLabel,
}: MilestoneCardProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const bodyId = useId();

  useEffect(() => {
    const element = bodyRef.current;
    if (!element) return;

    const measure = () => {
      setIsOverflowing(element.scrollHeight > COLLAPSED_MAX_HEIGHT + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const isClamped = isOverflowing && !isExpanded;

  return (
    <div className="flex flex-col border border-border bg-surface">
      <div className="relative aspect-[3/2]">
        <Image
          src={image}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-secondary">{year}</p>
        <h3 className="text-base font-semibold text-primary">{title}</h3>

        <div
          id={bodyId}
          ref={bodyRef}
          className="relative overflow-hidden"
          style={{ maxHeight: isExpanded ? undefined : COLLAPSED_MAX_HEIGHT }}
        >
          {bullets ? (
            <ul className="list-disc space-y-1 ps-4 text-sm text-muted">
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{description}</p>
          )}

          {/* Gradien penanda "masih ada lanjutannya". pointer-events-none supaya
              teks di belakangnya tetap bisa diseleksi. */}
          {isClamped ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface to-transparent"
            />
          ) : null}
        </div>

        {isOverflowing ? (
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            aria-controls={bodyId}
            className="-mx-1 self-start px-1 py-2 text-xs font-bold uppercase tracking-wide text-secondary underline underline-offset-4 hover:text-primary"
          >
            {isExpanded ? showLessLabel : showMoreLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
