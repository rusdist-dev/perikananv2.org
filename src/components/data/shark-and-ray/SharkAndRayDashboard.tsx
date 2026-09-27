import type { ReactNode } from 'react';

import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';

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
  children,
}: {
  breadcrumb: BreadcrumbItem[];
  /** Isi halaman -- hari ini HiupariExplorer, yang merender kolom filter dan
   *  kolom grafiknya sendiri. */
  children: ReactNode;
}) {
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

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">Data</p>
        <h1 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">Shark and Ray</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          Sebaran frekuensi panjang hiu dan pari per spesies dari data yang dikumpulkan di lapangan.
        </p>
        <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="font-bold text-primary">Catatan:</strong> filter dan grafik di halaman
          ini sudah tersambung ke data hiu dan pari di CMS. Dataset ini tidak dikelompokkan per
          wilayah maupun per tanggal, jadi penyaringnya hanya spesies, jenis kelamin, dan cara
          ukurnya.
        </p>
      </Container>

      <Container className="page-gutter pb-14">{children}</Container>
    </div>
  );
}
