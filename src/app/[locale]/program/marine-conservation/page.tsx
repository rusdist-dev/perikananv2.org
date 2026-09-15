import Image from 'next/image';
import { notFound } from 'next/navigation';
import fotoKey from '@/assets/marine-conservation/key_marine.png';
import fotoCurrent from '@/assets/marine-conservation/current_marine.png';
import fotoPulau2 from '@/assets/marine-conservation/foto_pulau2.png';
import bgMarineConservation from '@/assets/banner/bg_marine.png';
import marineConservationIcon from '@/assets/marine-conservation.svg';
import fotoFdtp from '@/assets/ocean-accounts/foto_fdtp.png';
import slider1 from '@/assets/marine-conservation/slider1.png';
import slider2 from '@/assets/marine-conservation/slider2.png';
import slider3 from '@/assets/marine-conservation/slider3.png';
import slider4 from '@/assets/marine-conservation/slider4.png';
import { Container } from '@/components/layout/Container';
import { IndonesiaMap } from '@/components/program/IndonesiaMap';
import { FRCI_CONSERVATION_AREA_NAMES } from '@/data/frci-conservation-areas';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramNusacore } from '@/components/program/ProgramNusacore';
import { ProgramObjectives } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { ProgramSupportCta } from '@/components/program/ProgramSupportCta';
import { resolveArticleImage } from '@/data/article-images';
import { getArticlesByProgram, type Article } from '@/lib/content';
import { formatArticleDate } from '@/lib/date';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

const FRONTEND_PROGRAM_SLUG = 'marine-conservation';
const RELATED_STORIES_COUNT = 3;

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/marine-conservation')!;

function getObjectives(t: Dictionary) {
  return [
    {
      eyebrow: '01',
      title: t.marineConservationObjective1Title,
      description: '',
    },
    {
      eyebrow: '02',
      title: t.marineConservationObjective2Title,
      description: '',
    },
    {
      eyebrow: '03',
      title: t.marineConservationObjective3Title,
      description: '',
    },
    {
      eyebrow: '04',
      title: t.marineConservationObjective4Title,
      description: '',
    },
  ];
}

// Foto dokumentasi belum ada untuk Marine Conservation -- dipinjam dari
// Sustainable Fisheries atas permintaan, sampai foto program ini sendiri
// tersedia.
const GALLERY_IMAGES = [
  { src: slider1, alt: '' },
  { src: slider2, alt: '' },
  { src: slider3, alt: '' },
  { src: slider4, alt: '' },
];

function getKeyActivitiesBullets(t: Dictionary) {
  return [
    t.marineConservationKeyActivityBullet1,
    t.marineConservationKeyActivityBullet2,
    t.marineConservationKeyActivityBullet3,
    t.marineConservationKeyActivityBullet4,
    t.marineConservationKeyActivityBullet5,
    t.marineConservationKeyActivityBullet6,
    t.marineConservationKeyActivityBullet7,
  ];
}

/** Berita sungguhan dari CMS yang ditandai taksonomi program ini
 *  (related_programs) -- lihat getArticlesByProgram (lib/content). */
function toRelatedStories(articles: Article[], locale: Locale, t: Dictionary): RelatedStory[] {
  return articles.slice(0, RELATED_STORIES_COUNT).map((article) => ({
    image: resolveArticleImage(article.image),
    date: formatArticleDate(article.publishedAt, locale),
    category: article.category ?? t.news,
    title: article.title,
    excerpt: article.excerpt,
    href: `/berita/${article.slug}`,
  }));
}

export default async function MarineConservationPage({
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
        title={t.marineConservationHeroTitle}
        lead={t.marineConservationHeroLead}
        image={bgMarineConservation}
      />

      <ProgramIntro>
        <p>{t.marineConservationIntroP1}</p>
        <p>{t.marineConservationIntroP2}</p>
        <p>{t.marineConservationIntroP3}</p>
        <p>{t.marineConservationIntroP4}</p>
      </ProgramIntro>

      <ProgramObjectives
        icon={marineConservationIcon}
        eyebrow={t.marineConservationObjectiveEyebrow}
        heading={t.marineConservationObjectivesHeading}
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
        eyebrow={t.marineConservationKeyActivityEyebrow}
        title=""
        bullets={getKeyActivitiesBullets(t)}
        image={fotoKey}
      />
      <ProgramFeatureRow
        eyebrow={t.marineConservationCurrentProjectEyebrow}
        title={t.marineConservationCurrentProjectTitle}
        bullets={[
          t.marineConservationCurrentProjectBullet1,
          t.marineConservationCurrentProjectBullet2,
        ]}
        extraSections={[
          {
            title: t.marineConservationBbnjTitle,
            bullets: [
              t.marineConservationBbnjBullet1,
              t.marineConservationBbnjBullet2,
              t.marineConservationBbnjBullet3,
            ],
          },
        ]}
        image={fotoCurrent}
        reverse
      />

      <div className="bg-primary text-primary-fg">
        <Container className="page-gutter pt-10 lg:pe-(--spacing-panel-gutter)">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/70">
            {t.marineConservationWorkAreaEyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-semibold md:text-3xl mb-7">
            {t.marineConservationWorkAreaHeading}
          </h2>
        </Container>
        {/* Hanya kawasan tempat FRCI bekerja. Tanpa daftar putih ini peta
            menggambar seluruh 554 kawasan konservasi Indonesia -- benar sebagai
            data nasional, tapi section ini judulnya "Work Area". */}
        <IndonesiaMap
          theme="brand"
          ariaLabel={t.marineConservationMapAriaLabel}
          mpaNames={FRCI_CONSERVATION_AREA_NAMES}
        />
      </div>

      <ProgramNusacore locale={locale} />

      {relatedStories.length > 0 ? (
        <ProgramRelatedStories
          eyebrow={t.marineConservationRelatedStoriesEyebrow}
          heading={t.marineConservationRelatedStoriesHeading}
          stories={relatedStories}
          readStoryLabel={t.readStory}
        />
      ) : null}

      <ProgramSupportCta
        image={fotoPulau2}
        heading={t.marineConservationSupportHeading}
        subheading={t.marineConservationSupportSubheading}
        ctaLabel={t.marineConservationSupportCta}
        ctaHref="/kontak"
      />
    </>
  );
}
