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
        read: t.read,
        watch: t.watch,
        pdfUnavailable: t.pdfUnavailable,
        videoUnavailable: t.videoUnavailable,
        close: t.close,
        galleryPrevious: t.galleryPrevious,
        galleryNext: t.galleryNext,
        badge: t.publicationsBadge,
        heroHeading: t.publicationsHeroHeading,
        heroBody: t.publicationsHeroBody,
        searchLabel: t.publicationsSearchLabel,
        searchPlaceholder: t.publicationsSearchPlaceholder,
        categoryLabel: t.publicationsCategoryLabel,
        allCategoriesOption: t.publicationsAllCategoriesOption,
        allTab: t.publicationsAllTab,
        docTypeResearchReports: t.publicationsDocTypeResearchReports,
        docTypePolicyBriefs: t.publicationsDocTypePolicyBriefs,
        docTypeFieldGuides: t.publicationsDocTypeFieldGuides,
        docTypeDataSheets: t.publicationsDocTypeDataSheets,
        documentTypeNote: t.publicationsDocumentTypeNote,
        statAvailable: t.publicationsStatAvailable,
        statDownloads: t.publicationsStatDownloads,
        statCategories: t.publicationsStatCategories,
        statFmas: t.publicationsStatFmas,
        featuredEyebrow: t.publicationsFeaturedEyebrow,
        featuredBody: t.publicationsFeaturedBody,
        featuredDownloadCta: t.publicationsFeaturedDownloadCta,
        featuredReadCta: t.publicationsFeaturedReadCta,
        ourPublicationEyebrow: t.publicationsOurPublicationEyebrow,
        ourPublicationHeading: t.publicationsOurPublicationHeading,
        noResults: t.publicationsNoResults,
        knowledgeProductEyebrow: t.publicationsKnowledgeProductEyebrow,
        knowledgeProductHeading: t.publicationsKnowledgeProductHeading,
        videoEyebrow: t.publicationsVideoEyebrow,
        videoHeading: t.publicationsVideoHeading,
      }}
    />
  );
}
