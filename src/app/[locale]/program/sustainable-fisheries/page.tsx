import { notFound } from 'next/navigation';
import bgSupport from '@/assets/sustainable-fisheries/bg_support.png';
import fotoKey from '@/assets/sustainable-fisheries/key_fisheries.png';
import fotoCurrent from '@/assets/sustainable-fisheries/current_fisheries.png';
import bgSustainableFisheries from '@/assets/banner/bg_sustainable.png';
import slider1 from '@/assets/sustainable-fisheries/slider1.png';
import slider2 from '@/assets/sustainable-fisheries/slider2.png';
import slider3 from '@/assets/sustainable-fisheries/slider3.png';
import slider4 from '@/assets/sustainable-fisheries/slider4.png';
import sustainableFisheriesIcon from '@/assets/sustainable-fisheries.svg';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramNusacore } from '@/components/program/ProgramNusacore';
import { ProgramObjectives } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { ProgramSupportCta } from '@/components/program/ProgramSupportCta';
import { resolveArticleImage } from '@/data/article-images';
import { getArticlesByProgram, type ArticleListItem } from '@/lib/content';
import { formatArticleDate } from '@/lib/date';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

const FRONTEND_PROGRAM_SLUG = 'sustainable-fisheries';
const RELATED_STORIES_COUNT = 3;

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/sustainable-fisheries')!;

function getObjectives(t: Dictionary) {
  return [
    {
      eyebrow: '01',
      title: t.sustainableFisheriesObjective1Title,
      description: t.sustainableFisheriesObjective1Desc,
    },
    {
      eyebrow: '02',
      title: t.sustainableFisheriesObjective2Title,
      description: t.sustainableFisheriesObjective2Desc,
    },
    {
      eyebrow: '03',
      title: t.sustainableFisheriesObjective3Title,
      description: t.sustainableFisheriesObjective3Desc,
    },
  ];
}

const GALLERY_IMAGES = [
  { src: slider1, alt: '' },
  { src: slider2, alt: '' },
  { src: slider3, alt: '' },
  { src: slider4, alt: '' },
];

function getKeyActivitiesBullets(t: Dictionary) {
  return [
    t.sustainableFisheriesKeyActivityBullet1,
    t.sustainableFisheriesKeyActivityBullet2,
    t.sustainableFisheriesKeyActivityBullet3,
    t.sustainableFisheriesKeyActivityBullet4,
    t.sustainableFisheriesKeyActivityBullet5,
  ];
}

/** Berita sungguhan dari CMS yang ditandai taksonomi program ini
 *  (related_programs) -- lihat getArticlesByProgram (lib/content). */
function toRelatedStories(articles: ArticleListItem[], locale: Locale, t: Dictionary): RelatedStory[] {
  return articles.slice(0, RELATED_STORIES_COUNT).map((article) => ({
    image: resolveArticleImage(article.image),
    date: formatArticleDate(article.publishedAt, locale),
    category: article.category ?? t.news,
    title: article.title,
    excerpt: article.excerpt,
    href: `/berita/${article.slug}`,
  }));
}

export default async function SustainableFisheriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const programLabel = NAV_ITEM.labelKey ? t[NAV_ITEM.labelKey] : NAV_ITEM.label;
  const programArticles = await getArticlesByProgram(locale, FRONTEND_PROGRAM_SLUG);
  const relatedStories = toRelatedStories(programArticles, locale, t);

  return (
    <>
      <ProgramHero
        breadcrumb={[
          { label: t.home, href: '/' },
          // Belum ada halaman indeks /program -- "#" menyatakan itu apa
          // adanya, sama seperti tombol placeholder lain di beranda, alih-alih
          // menautkan ke rute yang belum dibangun.
          { label: t.navProgram, href: '#' },
          { label: programLabel, href: NAV_ITEM.href },
        ]}
        title={t.sustainableFisheriesHeroTitle}
        lead={t.sustainableFisheriesHeroLead}
        image={bgSustainableFisheries}
      />

      <ProgramIntro>
        <p>{t.sustainableFisheriesIntroP1}</p>
        <p>{t.sustainableFisheriesIntroP2}</p>
        <p>{t.sustainableFisheriesIntroP3}</p>
      </ProgramIntro>

      <ProgramObjectives
        icon={sustainableFisheriesIcon}
        eyebrow={t.sustainableFisheriesObjectivesEyebrow}
        heading={t.sustainableFisheriesObjectivesHeading}
        objectives={getObjectives(t)}
      >
        <ProgramGallery
          images={GALLERY_IMAGES}
          aspectClassName="aspect-square"
          fit="cover"
          previousLabel={t.galleryPrevious}
          nextLabel={t.galleryNext}
        />
      </ProgramObjectives>

      <ProgramFeatureRow
        eyebrow={t.sustainableFisheriesKeyActivitiesEyebrow}
        title={t.sustainableFisheriesKeyActivitiesTitle}
        bullets={getKeyActivitiesBullets(t)}
        image={fotoKey}
      />
      <ProgramFeatureRow
        eyebrow={t.sustainableFisheriesCurrentProjectEyebrow}
        title=""
        bullets={[t.sustainableFisheriesCurrentProjectBullet1]}
        image={fotoCurrent}
        reverse
      />

      <ProgramNusacore locale={locale} />

      {relatedStories.length > 0 ? (
        <ProgramRelatedStories
          eyebrow={t.sustainableFisheriesRelatedStoriesEyebrow}
          heading={t.sustainableFisheriesRelatedStoriesHeading}
          stories={relatedStories}
          readStoryLabel={t.readStory}
        />
      ) : null}

      <ProgramSupportCta
        image={bgSupport}
        heading={t.sustainableFisheriesSupportHeading}
        subheading={t.sustainableFisheriesSupportSubheading}
        ctaLabel={t.sustainableFisheriesSupportCta}
        ctaHref="/kontak"
      />
    </>
  );
}
