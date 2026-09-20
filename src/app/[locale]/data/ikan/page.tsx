import { notFound } from 'next/navigation';
import { FisheriesDataDashboard } from '@/components/data/FisheriesDataDashboard';
import { IkanFilterPanel } from '@/components/data/ikan/IkanFilterPanel';
import { IkanFilterProvider } from '@/components/data/ikan/IkanFilterContext';
import { IkanTripCharts } from '@/components/data/ikan/IkanTripCharts';
import { IkanCatchChart } from '@/components/data/ikan/IkanCatchChart';
import { IkanLengthChart } from '@/components/data/ikan/IkanLengthChart';
import {
  getIkanCatchChart,
  getIkanFilterOptions,
  getIkanLengthChart,
  getIkanTripChart,
} from '@/lib/content';
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

  // Opsi kedelapan tingkat TANPA penyaring, diambil di server: formnya sudah
  // terisi di HTML pertama, dan kunci API CMS tidak pernah ikut ke browser.
  // Penyempitannya menyusul lewat Server Action begitu ada yang dipilih (lihat
  // ./actions.ts).
  //
  // Delapan permintaan ke CMS terdengar mahal, tapi halaman ini dirender ulang
  // paling sering sekali per masa berlaku cache (CACHE_TTL_SECONDS di
  // source.ts), bukan sekali per pengunjung.
  //
  // Grafiknya ikut diambil di sini untuk filter BAWAAN (tanpa penyaring,
  // bulanan, seluruh rentang), berbarengan dengan opsinya: kartu grafik sudah
  // berisi angka sungguhan di HTML pertama, bukan kosong sampai ada yang
  // menekan tombol Filter.
  const [filterOptions, initialChart, initialCatchChart, initialLengthChart] = await Promise.all([
    getIkanFilterOptions(),
    getIkanTripChart({ selection: {}, period: 'monthly', dari: null, sampai: null }),
    getIkanCatchChart({ selection: {}, dari: null, sampai: null }),
    getIkanLengthChart({
      selection: {},
      dari: null,
      sampai: null,
      tipePanjang: null,
      selangKelas: 10,
      lm: null,
    }),
  ]);

  return (
    <IkanFilterProvider
      initialOptions={filterOptions}
      initialChart={initialChart}
      initialCatchChart={initialCatchChart}
      initialLengthChart={initialLengthChart}
    >
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
        note={
          <>
            seluruh filter dan grafik di halaman ini sudah tersambung ke data IKAN di CMS.
          </>
        }
        filterPanel={<IkanFilterPanel datasetName="IKAN" />}
        summaryCharts={<IkanTripCharts locale={locale} />}
        catchCharts={<IkanCatchChart locale={locale} />}
        lengthCharts={<IkanLengthChart locale={locale} />}
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
    </IkanFilterProvider>
  );
}
