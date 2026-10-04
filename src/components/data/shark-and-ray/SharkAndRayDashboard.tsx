import type { ReactNode } from 'react';

import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';

/**
 * Kerangka halaman Shark and Ray: breadcrumb, judul, catatan, lalu satu slot
 * isi.
 *
 * Beda dari FisheriesDataDashboard (IKAN, Data Crab): halaman ini hanya punya
 * SATU bagian, Length Frequency -- tidak ada tab Summary/Catch Composition di
 * rancangan acuannya, dan API-nya pun cuma menyediakan satu endpoint grafik.
 * Memaksakannya ke kerangka tiga tab berarti dua tab yang tidak punya data.
 *
 * TANPA 'use client', tidak seperti sebelumnya: begitu form contoh yang mati
 * digantikan HiupariExplorer yang sungguhan, tidak ada satu pun keadaan yang
 * tinggal di sini. Yang interaktif ada di dalam `children`, dan ia membawa
 * batas kliennya sendiri.
 */
export function SharkAndRayDashboard({
  breadcrumb,
  title,
  locale,
  children,
}: {
  breadcrumb: BreadcrumbItem[];
  /** Judul halaman, dari kamus umum (navSharkAndRay) -- sama dengan label
   *  menu dan breadcrumb-nya. */
  title: string;
  locale: Locale;
  /** Isi halaman -- hari ini HiupariExplorer, yang merender kolom filter dan
   *  kolom grafiknya sendiri. */
  children: ReactNode;
}) {
  const t = getFisheriesDictionary(locale);
  return (
    <div className="bg-surface">
      {/* DUA Container, bukan satu -- pola yang sama dengan
          FisheriesDataDashboard, dan alasannya sama.
          Yang pertama menyisakan gutter kanan selebar panel navigasi supaya
          judul dan deskripsi tidak melebar sampai ke tepi layar. Yang kedua
          sengaja TIDAK: histogram yang dipotong 17rem di kanan membuang ruang
          persis di tempat yang paling dibutuhkannya -- 72 batang pada selang
          5 cm berdesakan di lebar yang tersisa. */}
      <Container className="page-gutter pt-14 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb items={breadcrumb} />

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">
          {t.eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          {t.sharkLead}
        </p>
        <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="font-bold text-primary">{t.noteLabel}</strong> {t.sharkNote}
        </p>
      </Container>

      <Container className="page-gutter pb-14">{children}</Container>
    </div>
  );
}
