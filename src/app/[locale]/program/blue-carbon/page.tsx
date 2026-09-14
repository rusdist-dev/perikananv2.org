import { notFound } from 'next/navigation';
import blueCarbonIcon from '@/assets/blue-carbon.svg';
import bgBlueCarbon from '@/assets/banner/bg_bluecarbon.png';
import slider1 from '@/assets/blue-carbon/slider1.png';
import slider2 from '@/assets/blue-carbon/slider2.png';
import slider3 from '@/assets/blue-carbon/slider3.png';
import slider4 from '@/assets/blue-carbon/slider4.png';
import kaBlueCarbon from '@/assets/blue-carbon/ka_bluecarbon.png';
import borderBlueCarbon from '@/assets/blue-carbon/border_bluecarbon.png';
import fotoKey from '@/assets/blue-carbon/key_bluecarbon.png';
import fotoCurrent from '@/assets/blue-carbon/current_bluecarbon.png';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramNusacore } from '@/components/program/ProgramNusacore';
import { ProgramObjectives, type ProgramObjective } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { ProgramSupportCta } from '@/components/program/ProgramSupportCta';
import { resolveArticleImage } from '@/data/article-images';
import { getArticlesByProgram, type Article } from '@/lib/content';
import { formatArticleDate } from '@/lib/date';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

const FRONTEND_PROGRAM_SLUG = 'blue-carbon';
const RELATED_STORIES_COUNT = 3;

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/blue-carbon')!;

function getObjectives(t: Dictionary): ProgramObjective[] {
  return [
    {
      eyebrow: '01',
      title: t.blueCarbonObjective1Title,
      description: t.blueCarbonObjective1Desc,
    },
    {
      eyebrow: '02',
      title: t.blueCarbonObjective2Title,
      description: t.blueCarbonObjective2Desc,
    },
    {
      eyebrow: '03',
      title: t.blueCarbonObjective3Title,
      description: t.blueCarbonObjective3Desc,
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
    t.blueCarbonKeyActivityBullet1,
    t.blueCarbonKeyActivityBullet2,
    t.blueCarbonKeyActivityBullet3,
    t.blueCarbonKeyActivityBullet4,
  ];
}

/** Berita sungguhan dari CMS yang ditandai taksonomi program ini
 *  (related_programs) -- lihat getArticlesByProgram (lib/content). */
function toRelatedStories(articles: Article[], locale: Locale, t: Dictionary): RelatedStory[] {
  return articles.slice(0, RELATED_STORIES_COUNT).map((article) => ({
    image: resolveArticleImage(article.image),
    date: formatArticleDate(article.publishedAt, locale),
    category: article.program?.name ?? article.tags[0] ?? t.news,
    title: article.title,
    excerpt: article.excerpt,
    href: `/berita/${article.slug}`,
  }));
}

export default async function BlueCarbonPage({
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
        title={t.blueCarbonHeroTitle}
        lead={t.blueCarbonHeroLead}
        image={bgBlueCarbon}
      />

      <ProgramIntro>
        <p>{t.blueCarbonIntroP1}</p>
        <p>{t.blueCarbonIntroP2}</p>
        <p>{t.blueCarbonIntroP3}</p>
        <p>{t.blueCarbonIntroP4}</p>
      </ProgramIntro>

      <ProgramObjectives
        icon={blueCarbonIcon}
        eyebrow={t.blueCarbonObjectivesEyebrow}
        heading={t.blueCarbonObjectivesHeading}
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
        eyebrow={t.blueCarbonKeyActivityEyebrow}
        title={t.blueCarbonKeyActivityTitle}
        bullets={getKeyActivitiesBullets(t)}
        image={fotoKey}
      />
      <ProgramFeatureRow
        eyebrow={t.blueCarbonCurrentProjectEyebrow}
        title=""
        bullets={[t.blueCarbonCurrentProjectBullet1]}
        image={fotoCurrent}
        reverse
      />

      <ProgramNusacore locale={locale} />

      {relatedStories.length > 0 ? (
        <ProgramRelatedStories
          eyebrow={t.blueCarbonRelatedStoriesEyebrow}
          heading={t.blueCarbonRelatedStoriesHeading}
          stories={relatedStories}
          readStoryLabel={t.readStory}
        />
      ) : null}

      <ProgramSupportCta
        image={borderBlueCarbon}
        heading={t.blueCarbonSupportHeading}
        subheading={t.blueCarbonSupportSubheading}
        ctaLabel={t.blueCarbonSupportCta}
        ctaHref="/kontak"
      />
    </>
  );
}
