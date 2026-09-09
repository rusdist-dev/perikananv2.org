import { notFound } from 'next/navigation';
import { VesselDataDashboard } from '@/components/data/vessel-data/VesselDataDashboard';
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

  return (
    <VesselDataDashboard
      breadcrumb={[
        { label: t.home, href: '/' },
        { label: t.navData, href: '#' },
        { label: t.navVesselData, href: '/data/vessel-data' },
      ]}
    />
  );
}
