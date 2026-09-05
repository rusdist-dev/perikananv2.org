import { notFound } from 'next/navigation';
import { ProductionDataDashboard } from '@/components/data/production-data/ProductionDataDashboard';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/data/production-data', title: 'Production Data' });
}

export default async function ProductionDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <ProductionDataDashboard
      breadcrumb={[
        { label: t.home, href: '/' },
        // Belum ada halaman indeks /data -- "#" menyatakan itu apa adanya,
        // pola yang sama dengan breadcrumb Program/Connect yang juga belum
        // punya indeks.
        { label: t.navData, href: '#' },
        { label: 'Production Data', href: '/data/production-data' },
      ]}
    />
  );
}
