import { notFound } from 'next/navigation';
import { publications } from '@/data/publications';
import { PublicationsExplorer } from '@/components/publications/PublicationsExplorer';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/discover/publications',
    title: getDictionary(locale).navPublications,
  });
}

export default async function PublicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <PublicationsExplorer
      publications={publications}
      labels={{
        home: t.home,
        navDiscover: t.navDiscover,
        navPublications: t.navPublications,
        download: t.download,
        galleryPrevious: t.galleryPrevious,
        galleryNext: t.galleryNext,
      }}
    />
  );
}
