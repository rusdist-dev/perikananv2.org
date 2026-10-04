import type { ReactNode } from 'react';

import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { WppLegend } from '@/components/data/stsc/WppLegend';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';

/**
 * Kerangka halaman Production Data: breadcrumb, judul, catatan, satu slot isi,
 * lalu legenda WPP.
 *
 * Kerangkanya disamakan dengan VesselDataDashboard -- keduanya menampilkan
 * dataset yang sama (STSC) dari dua sisi, jadi tata letaknya tidak boleh
 * terasa seperti dua halaman yang berbeda keluarga.
 *
 * TANPA 'use client': begitu form contoh yang mati digantikan
 * ProductionExplorer yang sungguhan, tidak ada satu pun keadaan yang tinggal
 * di sini. Yang interaktif ada di dalam `children`, dan ia membawa batas
 * kliennya sendiri.
 */
export function ProductionDataDashboard({
  breadcrumb,
  title,
  locale,
  children,
}: {
  breadcrumb: BreadcrumbItem[];
  /** Judul halaman, dari kamus umum (navProductionData) -- sama dengan label
   *  menu dan breadcrumb-nya. */
  title: string;
  locale: Locale;
  children: ReactNode;
}) {
  const t = getFisheriesDictionary(locale);
  return (
    <div className="bg-surface">
      {/* DUA Container, bukan satu -- pola yang sama dengan
          FisheriesDataDashboard dan SharkAndRayDashboard.
          Yang pertama menyisakan gutter kanan selebar panel navigasi supaya
          judul dan deskripsi tidak melebar sampai ke tepi layar. Yang kedua
          sengaja TIDAK: grafik yang dipotong 17rem di kanan membuang ruang
          persis di tempat yang paling dibutuhkannya -- 32 tahun x sebelas
          garis butuh setiap piksel mendatar yang ada. */}
      <Container className="page-gutter pt-14 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb items={breadcrumb} />

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">
          {t.eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">{title}</h1>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          {t.productionLead}
        </p>
        <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="font-bold text-primary">{t.noteLabel}</strong> {t.productionNote}
        </p>
      </Container>

      <Container className="page-gutter pb-14">
        {children}
        <WppLegend locale={locale} />
      </Container>
    </div>
  );
}
