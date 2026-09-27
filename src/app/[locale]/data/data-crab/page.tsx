import { notFound } from 'next/navigation';
import { FisheriesDataDashboard } from '@/components/data/FisheriesDataDashboard';
import { BscFilterPanel } from '@/components/data/data-crab/BscFilterPanel';
import { BscFilterProvider } from '@/components/data/data-crab/BscFilterContext';
import { BscTripCharts } from '@/components/data/data-crab/BscTripCharts';
import { BscCatchChart } from '@/components/data/data-crab/BscCatchChart';
import { BscWidthChart } from '@/components/data/data-crab/BscWidthChart';
import {
  getBscCatchChart,
  getBscFilterOptions,
  getBscTripChart,
  getBscWidthChart,
} from '@/lib/content';
import {
  monthlyLabels,
  sampleTripCounts,
  SAMPLE_CATCH_COMPOSITION,
  SAMPLE_LENGTH_FREQUENCY,
} from '@/components/data/data-crab/sample-data';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/data/data-crab', title: getDictionary(locale).navDataCrab });
}

export default async function DataCrabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  // Opsi ketujuh tingkat TANPA penyaring, diambil di server: formnya sudah
  // terisi di HTML pertama, dan kunci API CMS tidak pernah ikut ke browser.
  // Penyempitannya menyusul lewat Server Action begitu ada yang dipilih (lihat
  // ./actions.ts).
  //
  // Tujuh permintaan ke CMS terdengar mahal, tapi halaman ini dirender ulang
  // paling sering sekali per masa berlaku cache (CACHE_TTL_SECONDS di
  // source.ts), bukan sekali per pengunjung.
  //
  // Grafiknya ikut diambil di sini untuk filter BAWAAN (tanpa penyaring,
  // bulanan, seluruh rentang, TKG >= 2), berbarengan dengan opsinya: kartu
  // grafik sudah berisi angka sungguhan di HTML pertama, bukan kosong sampai
  // ada yang menekan tombol Filter.
  const [filterOptions, initialChart, initialCatchChart, initialWidthChart] = await Promise.all([
    getBscFilterOptions(),
    getBscTripChart({ selection: {}, period: 'monthly', dari: null, sampai: null }),
    getBscCatchChart({ selection: {}, dari: null, sampai: null }),
    getBscWidthChart({
      selection: {},
      dari: null,
      sampai: null,
      jenisKelamin: null,
      selangKelas: 1,
      tkgMatang: 2,
    }),
  ]);

  return (
    <BscFilterProvider
      initialOptions={filterOptions}
      initialChart={initialChart}
      initialCatchChart={initialCatchChart}
      initialWidthChart={initialWidthChart}
    >
      <FisheriesDataDashboard
        breadcrumb={[
          { label: t.home, href: '/' },
          // Belum ada halaman indeks /data -- "#" menyatakan itu apa adanya,
          // pola yang sama dengan breadcrumb Program/Connect yang juga belum
          // punya indeks.
          { label: t.navData, href: '#' },
          { label: t.navDataCrab, href: '/data/data-crab' },
        ]}
        datasetName={t.navDataCrab}
        description={t.dataCrabDescription}
        note={
          <>
            seluruh filter dan grafik di halaman ini sudah tersambung ke data rajungan dan kepiting
            di CMS. Dataset ini tidak dikelompokkan per WPPNRI, jadi filter wilayah dimulai dari
            provinsi.
          </>
        }
        filterPanel={<BscFilterPanel datasetName={t.navDataCrab} />}
        summaryCharts={<BscTripCharts locale={locale} />}
        catchCharts={<BscCatchChart locale={locale} />}
        lengthCharts={<BscWidthChart locale={locale} />}
        trips={{
          labels: monthlyLabels(),
          values: sampleTripCounts(),
          unit: t.dataCrabTripsUnit,
          seriesLabel: t.dataCrabTripsSeriesLabel,
          color: 'series-2',
          labelEvery: 7,
        }}
        catchComposition={{
          labels: SAMPLE_CATCH_COMPOSITION.labels,
          values: SAMPLE_CATCH_COMPOSITION.values,
          unit: t.dataCrabCatchUnit,
          seriesLabel: t.dataCrabCatchSeriesLabel,
          color: 'series-1',
        }}
        lengthFrequency={{
          labels: SAMPLE_LENGTH_FREQUENCY.labels,
          values: SAMPLE_LENGTH_FREQUENCY.values,
          unit: t.dataCrabLengthUnit,
          seriesLabel: t.dataCrabLengthSeriesLabel,
          color: 'series-3',
        }}
      />
    </BscFilterProvider>
  );
}
