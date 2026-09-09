import { notFound } from 'next/navigation';
import { FisheriesDataDashboard } from '@/components/data/FisheriesDataDashboard';
import { monthlyLabels, sampleTripCounts, SAMPLE_CATCH_COMPOSITION, SAMPLE_LENGTH_FREQUENCY } from '@/components/data/ikan/sample-data';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/data/ikan', title: 'IKAN' });
}

export default async function IkanDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <FisheriesDataDashboard
      breadcrumb={[
        { label: t.home, href: '/' },
        // Belum ada halaman indeks /data -- "#" menyatakan itu apa adanya,
        // pola yang sama dengan breadcrumb Program/Connect yang juga belum
        // punya indeks.
        { label: t.navData, href: '#' },
        { label: 'IKAN', href: '/data/ikan' },
      ]}
      datasetName="IKAN"
      description={t.dataIkanDescription}
      trips={{
        labels: monthlyLabels(),
        values: sampleTripCounts(),
        unit: t.dataIkanTripsUnit,
        seriesLabel: t.dataIkanTripsSeriesLabel,
        color: 'series-2',
        labelEvery: 7,
      }}
      catchComposition={{
        labels: SAMPLE_CATCH_COMPOSITION.labels,
        values: SAMPLE_CATCH_COMPOSITION.values,
        unit: t.dataIkanCatchUnit,
        seriesLabel: t.dataIkanCatchSeriesLabel,
        color: 'series-1',
      }}
      lengthFrequency={{
        labels: SAMPLE_LENGTH_FREQUENCY.labels,
        values: SAMPLE_LENGTH_FREQUENCY.values,
        unit: t.dataIkanLengthUnit,
        seriesLabel: t.dataIkanLengthSeriesLabel,
        color: 'series-3',
      }}
    />
  );
}
