import { notFound } from 'next/navigation';
import { getPublications } from '@/lib/content';
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
  const allPublications = await getPublications();
  // "produk-pengetahuan" adalah kategori CMS untuk Knowledge Product, dan
  // "pusat-pengetahuan-bbnj" untuk BBNJ Knowledge Hub -- keduanya dipisah
  // dari daftar "Publikasi Kami" di atasnya (yang sudah punya filter
  // kategori/pencarian sendiri) supaya tidak tampil dobel di dua seksi
  // sekaligus.
  const knowledgeProducts = allPublications.filter((p) => p.category === 'produk-pengetahuan');
  const bbnjPublications = allPublications.filter((p) => p.category === 'pusat-pengetahuan-bbnj');
  const publications = allPublications.filter(
    (p) => p.category !== 'produk-pengetahuan' && p.category !== 'pusat-pengetahuan-bbnj',
  );

  return (
    <PublicationsExplorer
      publications={publications}
      knowledgeProducts={knowledgeProducts}
      bbnjPublications={bbnjPublications}
      labels={{
        home: t.home,
        navDiscover: t.navDiscover,
        navPublications: t.navPublications,
        download: t.download,
        downloadGateDescription: t.downloadGateDescription,
        downloadGateNameLabel: t.downloadGateNameLabel,
        downloadGateEmailLabel: t.downloadGateEmailLabel,
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
        knowledgeProductEmpty: t.publicationsKnowledgeProductEmpty,
        bbnjEyebrow: t.publicationsBbnjEyebrow,
        bbnjHeading: t.publicationsBbnjHeading,
        bbnjEmpty: t.publicationsBbnjEmpty,
        videoEyebrow: t.publicationsVideoEyebrow,
        videoHeading: t.publicationsVideoHeading,
      }}
    />
  );
}
