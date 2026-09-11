import { notFound } from 'next/navigation';
import speciesConservationIcon from '@/assets/species-conservation.svg';
import bgSpeciesConservation from '@/assets/banner/bg_species.png';
import bgSupport from '@/assets/species-conservation/bg_support.png';
import cb1 from '@/assets/ocean-accounts/cb1.jpg';
import cb2 from '@/assets/ocean-accounts/cb2.jpg';
import cb3 from '@/assets/ocean-accounts/cb3.jpg';
import slider1 from '@/assets/species-conservation/slider1.png';
import slider2 from '@/assets/species-conservation/slider2.png';
import slider3 from '@/assets/species-conservation/slider3.png';
import slider4 from '@/assets/species-conservation/slider4.png';
import fotoKey from '@/assets/species-conservation/key_species.png';
import fotoCurrent from '@/assets/species-conservation/current_species.png';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramObjectives, type ProgramObjective } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { ProgramSupportCta } from '@/components/program/ProgramSupportCta';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/species-conservation')!;

function getObjectives(t: Dictionary): ProgramObjective[] {
  return [
    {
      eyebrow: '01',
      title: t.speciesConservationObjective1Title,
      description: t.speciesConservationObjective1Desc,
    },
    {
      eyebrow: '02',
      title: t.speciesConservationObjective2Title,
      description: t.speciesConservationObjective2Desc,
    },
    {
      eyebrow: '03',
      title: t.speciesConservationObjective3Title,
      description: t.speciesConservationObjective3Desc,
    },
  ];
}

// Foto dokumentasi belum ada untuk Species Conservation -- dipinjam dari
// Ocean Accounts atas permintaan, sampai foto program ini sendiri tersedia.
const GALLERY_IMAGES = [
  { src: slider1, alt: '' },
  { src: slider2, alt: '' },
  { src: slider3, alt: '' },
  { src: slider4, alt: '' },
];

function getKeyActivitiesBullets(t: Dictionary) {
  return [
    t.speciesConservationKeyActivityBullet1,
    t.speciesConservationKeyActivityBullet2,
    t.speciesConservationKeyActivityBullet3,
    t.speciesConservationKeyActivityBullet4,
    t.speciesConservationKeyActivityBullet5,
  ];
}

// Sama seperti RELATED_STORIES di Ocean Accounts/Marine Conservation --
// masih contoh, tapi fotonya dipinjam dari Ocean Accounts atas permintaan,
// sampai foto berita Species Conservation sendiri tersedia.
function getRelatedStories(t: Dictionary): RelatedStory[] {
  return [
    {
      image: cb1,
      date: '28 Jul 2026',
      category: 'Policy',
      title: t.speciesConservationRelatedStory1Title,
      excerpt: t.speciesConservationRelatedStory1Excerpt,
      href: '#',
    },
    {
      image: cb2,
      date: '14 Jul 2026',
      category: 'Ocean Accounts',
      title: t.speciesConservationRelatedStory2Title,
      excerpt: t.speciesConservationRelatedStory2Excerpt,
      href: '#',
    },
    {
      image: cb3,
      date: '10 Jul 2026',
      category: 'Conservation',
      title: t.speciesConservationRelatedStory3Title,
      excerpt: t.speciesConservationRelatedStory3Excerpt,
      href: '#',
    },
  ];
}

export default async function SpeciesConservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const programLabel = NAV_ITEM.labelKey ? t[NAV_ITEM.labelKey] : NAV_ITEM.label;

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
        title={t.speciesConservationHeroTitle}
        lead={t.speciesConservationHeroLead}
        image={bgSpeciesConservation}
      />

      <ProgramIntro>
        <p>{t.speciesConservationIntroP1}</p>
        <p>{t.speciesConservationIntroP2}</p>
        <p>{t.speciesConservationIntroP3}</p>
      </ProgramIntro>

      <ProgramObjectives
        icon={speciesConservationIcon}
        eyebrow={t.speciesConservationObjectivesEyebrow}
        heading={t.speciesConservationObjectivesHeading}
        objectives={getObjectives(t)}
      >
        <ProgramGallery
          images={GALLERY_IMAGES}
          previousLabel={t.galleryPrevious}
          nextLabel={t.galleryNext}
          aspectClassName="aspect-square"
          fit="cover"
        />
      </ProgramObjectives>

      <ProgramFeatureRow
        eyebrow={t.speciesConservationKeyActivitiesEyebrow}
        title={t.speciesConservationKeyActivitiesTitle}
        bullets={getKeyActivitiesBullets(t)}
        image={fotoKey}
      />
      <ProgramFeatureRow
        eyebrow={t.speciesConservationCurrentProjectEyebrow}
        title=""
        bullets={[t.speciesConservationCurrentProjectBullet1]}
        image={fotoCurrent}
        reverse
      />

      <ProgramRelatedStories
        eyebrow={t.speciesConservationRelatedStoriesEyebrow}
        heading={t.speciesConservationRelatedStoriesHeading}
        stories={getRelatedStories(t)}
        readStoryLabel={t.readStory}
      />

      <ProgramSupportCta
        image={bgSupport}
        heading={t.speciesConservationSupportHeading}
        subheading={t.speciesConservationSupportSubheading}
        ctaLabel={t.speciesConservationSupportCta}
        ctaHref="/kontak"
      />
    </>
  );
}
