import { notFound } from 'next/navigation';
import bgSupport from '@/assets/ocean-accounts/bg_support.png';
import bgOceanAccounts from '@/assets/banner/bg_ocean.png';
import cb1 from '@/assets/ocean-accounts/cb1.jpg';
import cb2 from '@/assets/ocean-accounts/cb2.jpg';
import cb3 from '@/assets/ocean-accounts/cb3.jpg';
import fotoFdtp from '@/assets/ocean-accounts/foto_fdtp.png';
import fotokey from '@/assets/ocean-accounts/key_ocean.png';
import slider1 from '@/assets/ocean-accounts/slider1.png';
import slider2 from '@/assets/ocean-accounts/slider2.png';
import slider3 from '@/assets/ocean-accounts/slider3.png';
import slider4 from '@/assets/ocean-accounts/slider4.png';
import oceanAccountIcon from '@/assets/ocean-account.svg';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramNusacore } from '@/components/program/ProgramNusacore';
import { ProgramObjectives } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { ProgramSupportCta } from '@/components/program/ProgramSupportCta';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/ocean-accounts')!;

function getObjectives(t: Dictionary) {
  return [
    {
      eyebrow: '01',
      title: t.oceanAccountsObjective1Title,
      description: t.oceanAccountsObjective1Desc,
    },
    {
      eyebrow: '02',
      title: t.oceanAccountsObjective2Title,
      description: t.oceanAccountsObjective2Desc,
    },
    {
      eyebrow: '03',
      title: t.oceanAccountsObjective3Title,
      description: t.oceanAccountsObjective3Desc,
    },
  ];
}

const GALLERY_IMAGES = [
  { src: slider1, alt: '' },
  { src: slider2, alt: '' },
  { src: slider3, alt: '' },
  { src: slider4, alt: '' },
];

// Dipakai KEY ACTIVITIES saja -- CURRENT PROJECT di bawah punya judul dan
// poinnya sendiri (Ocean for Development Programme & Fellowship).
function getDataToPolicyBullets(t: Dictionary) {
  return [
    t.oceanAccountsKeyActivityBullet1,
    t.oceanAccountsKeyActivityBullet2,
    t.oceanAccountsKeyActivityBullet3,
    t.oceanAccountsKeyActivityBullet4,
    t.oceanAccountsKeyActivityBullet5,
    t.oceanAccountsKeyActivityBullet6,
  ];
}

function getRelatedStories(t: Dictionary): RelatedStory[] {
  return [
    {
      image: cb1,
      date: '28 Jul 2026',
      category: 'Policy',
      title: t.oceanAccountsRelatedStory1Title,
      excerpt: t.oceanAccountsRelatedStory1Excerpt,
      href: '#',
    },
    {
      image: cb2,
      date: '14 Jul 2026',
      category: 'Ocean Accounts',
      title: t.oceanAccountsRelatedStory2Title,
      excerpt: t.oceanAccountsRelatedStory2Excerpt,
      href: '#',
    },
    {
      image: cb3,
      date: '10 Jul 2026',
      category: 'Conservation',
      title: t.oceanAccountsRelatedStory3Title,
      excerpt: t.oceanAccountsRelatedStory3Excerpt,
      href: '#',
    },
  ];
}

export default async function OceanAccountsPage({
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
        title={t.oceanAccountsHeroTitle}
        lead={t.oceanAccountsHeroLead}
        image={bgOceanAccounts}
      />

      <ProgramIntro>
        <p>{t.oceanAccountsIntroP1}</p>
        <p>{t.oceanAccountsIntroP2}</p>
      </ProgramIntro>

      <ProgramObjectives
        icon={oceanAccountIcon}
        eyebrow={t.oceanAccountsObjectivesEyebrow}
        heading={t.oceanAccountsObjectivesHeading}
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
        eyebrow={t.oceanAccountsKeyActivitiesEyebrow}
        title={t.oceanAccountsKeyActivitiesTitle}
        bullets={getDataToPolicyBullets(t)}
        image={fotokey}
      />
      <ProgramFeatureRow
        eyebrow={t.oceanAccountsCurrentProjectEyebrow}
        title={t.oceanAccountsCurrentProjectTitle}
        bullets={[t.oceanAccountsCurrentProjectBullet1, t.oceanAccountsCurrentProjectBullet2]}
        extraSections={[
          {
            title: t.oceanAccountsFellowshipTitle,
            bullets: [t.oceanAccountsFellowshipBullet1],
          },
          {
            title: t.oceanAccountsOsgapTitle,
            bullets: [t.oceanAccountsOsgapBullet1, t.oceanAccountsOsgapBullet2],
          },
        ]}
        image={fotoFdtp}
        reverse
      />

      <ProgramNusacore />

      <ProgramRelatedStories
        eyebrow={t.oceanAccountsRelatedStoriesEyebrow}
        heading={t.oceanAccountsRelatedStoriesHeading}
        stories={getRelatedStories(t)}
        readStoryLabel={t.readStory}
      />

      <ProgramSupportCta
        image={bgSupport}
        heading={t.oceanAccountsSupportHeading}
        subheading={t.oceanAccountsSupportSubheading}
        ctaLabel={t.oceanAccountsSupportCta}
        ctaHref="#"
      />
    </>
  );
}
