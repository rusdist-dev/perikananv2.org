import { notFound } from 'next/navigation';
import { VesselDataDashboard } from '@/components/data/vessel-data/VesselDataDashboard';
import { VesselExplorer } from '@/components/data/vessel-data/VesselExplorer';
import { getStscArmadaChart, getStscWppOptions } from '@/lib/content';
import { stscYearBounds } from '@/lib/stsc-filters';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/data/vessel-data', title: getDictionary(locale).navVesselData });
}

export default async function VesselDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  // Berurutan, bukan Promise.all: rentang tahun yang dipakai grafik bawaan
  // datang dari daftar WPP-nya, jadi permintaan kedua memang harus menunggu
  // yang pertama.
  const wppOptions = await getStscWppOptions();
  const { min: yearMin, max: yearMax } = stscYearBounds(wppOptions);

  const initialChart = await getStscArmadaChart({
    wpp: null,
    dariTahun: yearMin,
    sampaiTahun: yearMax,
  });

  return (
    <VesselDataDashboard
      locale={locale}
      title={t.navVesselData}
      breadcrumb={[
        { label: t.home, href: '/' },
        { label: t.navData, href: '#' },
        { label: t.navVesselData, href: '/data/vessel-data' },
      ]}
    >
      <VesselExplorer
        title={t.navVesselData}
        wppOptions={wppOptions}
        initialChart={initialChart}
        yearMin={yearMin}
        yearMax={yearMax}
        locale={locale}
      />
    </VesselDataDashboard>
  );
}
