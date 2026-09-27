import { notFound } from 'next/navigation';
import { ProductionDataDashboard } from '@/components/data/production-data/ProductionDataDashboard';
import { ProductionExplorer } from '@/components/data/production-data/ProductionExplorer';
import { getStscKomoditasOptions, getStscProduksiChart, getStscWppOptions } from '@/lib/content';
import { stscYearBounds } from '@/lib/stsc-filters';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/data/production-data', title: getDictionary(locale).navProductionData });
}

export default async function ProductionDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  // Daftar WPP diambil LEBIH DULU, sendirian: rentang tahun yang dimilikinya
  // menentukan filter bawaan grafiknya, jadi ketiga permintaan tidak bisa
  // berangkat bersamaan. Dua sisanya baru paralel setelah batas tahunnya
  // diketahui.
  const wppOptions = await getStscWppOptions();
  const { min: yearMin, max: yearMax } = stscYearBounds(wppOptions);

  const [komoditasOptions, initialChart] = await Promise.all([
    getStscKomoditasOptions(null),
    getStscProduksiChart({
      wpp: null,
      komoditas: null,
      dariTahun: yearMin,
      sampaiTahun: yearMax,
    }),
  ]);

  return (
    <ProductionDataDashboard
      breadcrumb={[
        { label: t.home, href: '/' },
        // Belum ada halaman indeks /data -- "#" menyatakan itu apa adanya,
        // pola yang sama dengan breadcrumb Program/Connect yang juga belum
        // punya indeks.
        { label: t.navData, href: '#' },
        { label: t.navProductionData, href: '/data/production-data' },
      ]}
    >
      <ProductionExplorer
        wppOptions={wppOptions}
        initialKomoditasOptions={komoditasOptions}
        initialChart={initialChart}
        yearMin={yearMin}
        yearMax={yearMax}
        locale={locale}
      />
    </ProductionDataDashboard>
  );
}
