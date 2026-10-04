import type { ReactNode } from 'react';

import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { WppLegend } from '@/components/data/stsc/WppLegend';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';

/**
 * Kerangka disamakan persis dengan Production Data -- keduanya menampilkan
 * dataset STSC yang sama dari dua sisi. Lihat catatan di
 * ProductionDataDashboard.tsx untuk alasan dua Container-nya.
 */
export function VesselDataDashboard({
  breadcrumb,
  title,
  locale,
  children,
}: {
  breadcrumb: BreadcrumbItem[];
  /** Judul halaman, dari kamus umum (navVesselData). */
  title: string;
  locale: Locale;
  children: ReactNode;
}) {
  // Paragraf pembuka dan catatannya SAMA dengan Production Data -- keduanya
  // halaman dataset STSC yang sama, dan teksnya memang menyebut produksi,
  // jumlah kapal, dan tonase sekaligus.
  const t = getFisheriesDictionary(locale);
  return (
    <div className="bg-surface">
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
