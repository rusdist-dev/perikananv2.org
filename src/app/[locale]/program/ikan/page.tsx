import Image from 'next/image';
import { notFound } from 'next/navigation';
import bgIkan from '@/assets/banner/bg_ikan.png';
import ornament4 from '@/assets/banner/ornament4.png';
import borderIkan from '@/assets/ikan/border_ikan.png';
import slider1 from '@/assets/ikan/slider1.png';
import slider2 from '@/assets/ikan/slider2.png';
import slider3 from '@/assets/ikan/slider3.png';
import slider4 from '@/assets/ikan/slider4.png';
import hpIkan from '@/assets/ikan/hp_ikan.png';
import kaIkan from '@/assets/ikan/ka_ikan.png';
import petaIkan from '@/assets/ikan/peta_ikan.jpeg';
import ikanIcon from '@/assets/ikan-application.svg';
import cb1 from '@/assets/ocean-accounts/cb1.jpg';
import cb2 from '@/assets/ocean-accounts/cb2.jpg';
import cb3 from '@/assets/ocean-accounts/cb3.jpg';
import fotoKey from '@/assets/ikan/key_ikan.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramObjectives, type ProgramObjective } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/ikan')!;

function getObjectives(t: Dictionary): ProgramObjective[] {
  return [
    {
      eyebrow: '01',
      title: t.ikanObjective1Title,
      description: t.ikanObjective1Desc,
    },
    {
      eyebrow: '02',
      title: t.ikanObjective2Title,
      description: t.ikanObjective2Desc,
    },
    {
      eyebrow: '03',
      title: t.ikanObjective3Title,
      description: t.ikanObjective3Desc,
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
    t.ikanKeyActivityBullet1,
    t.ikanKeyActivityBullet2,
    t.ikanKeyActivityBullet3,
    t.ikanKeyActivityBullet4,
    t.ikanKeyActivityBullet5,
  ];
}

// Sama seperti Related Stories di program lain -- masih contoh, fotonya
// dipinjam dari Ocean Accounts atas permintaan, sampai foto berita IKAN
// sendiri tersedia.
function getRelatedStories(t: Dictionary): RelatedStory[] {
  return [
    {
      image: cb1,
      date: '28 Jul 2026',
      category: 'Policy',
      title: t.ikanRelatedStory1Title,
      excerpt: t.ikanRelatedStory1Excerpt,
      href: '#',
    },
    {
      image: cb2,
      date: '14 Jul 2026',
      category: 'Ocean Accounts',
      title: t.ikanRelatedStory2Title,
      excerpt: t.ikanRelatedStory2Excerpt,
      href: '#',
    },
    {
      image: cb3,
      date: '10 Jul 2026',
      category: 'Conservation',
      title: t.ikanRelatedStory3Title,
      excerpt: t.ikanRelatedStory3Excerpt,
      href: '#',
    },
  ];
}

export default async function IkanPage({
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
        title={t.ikanHeroTitle}
        lead={t.ikanHeroLead}
        image={bgIkan}
      />

      <ProgramIntro>
        <p>
          IKAN (<em>Inisiatif Kolaborasi Pendataan Perikanan</em>
          {t.ikanIntroP1Suffix}
        </p>
        <p>{t.ikanIntroP2}</p>
        <p>{t.ikanIntroP3}</p>
        <p>{t.ikanIntroP4}</p>
      </ProgramIntro>

      <ProgramObjectives
        icon={ikanIcon}
        eyebrow={t.ikanObjectivesEyebrow}
        heading={t.ikanObjectivesHeading}
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
        eyebrow={t.ikanKeyActivitiesEyebrow}
        title={t.ikanKeyActivitiesTitle}
        bullets={getKeyActivitiesBullets(t)}
        image={fotoKey}
      />

      <div className="relative isolate overflow-hidden bg-primary">
        <Image
          src={ornament4}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="pointer-events-none object-cover select-none"
        />

        <Container className="page-gutter relative py-16 lg:pe-(--spacing-panel-gutter)">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-fg">
            {t.ikanCurrentProjectEyebrow}
          </p>
          <Image
            src={petaIkan}
            alt=""
            aria-hidden
            sizes="(min-width: 1024px) 900px, 100vw"
            className="h-auto w-full rounded-2xl shadow-xl"
          />
        </Container>
      </div>

      <ProgramRelatedStories
        eyebrow={t.ikanRelatedStoriesEyebrow}
        heading={t.ikanRelatedStoriesHeading}
        stories={getRelatedStories(t)}
        readStoryLabel={t.readStory}
      />

      <div className="relative isolate overflow-hidden bg-primary">
        <Image
          src={borderIkan}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="pointer-events-none object-cover mix-blend-screen select-none"
        />

        {/* Desktop: mockup dibiarkan penuh sampai tepi kanan viewport, bukan
            dibatasi Container. */}
        <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
          <Image
            src={hpIkan}
            alt=""
            aria-hidden
            fill
            sizes="60vw"
            className="pointer-events-none object-contain object-right select-none"
          />
        </div>

        <Container className="page-gutter relative py-10 lg:pe-(--spacing-panel-gutter)">
          <div className="flex flex-col gap-4 text-primary-fg lg:max-w-[36%]">
            <h2 className="text-3xl font-bold md:text-4xl">
              {t.ikanSecondCtaHeading}
            </h2>
            <p className="max-w-md text-sm text-primary-fg/90 md:text-base lg:max-w-none">
              {t.ikanSecondCtaBody}
            </p>
            <AppLink
              href="#"
              className="mt-2 inline-flex w-fit items-center rounded-md border border-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-white hover:text-primary"
            >
              {t.ikanDownloadAppCta}
            </AppLink>
          </div>

          {/* Mobile/tablet: tidak ada ruang untuk mockup full-bleed, jadi
              ditumpuk di bawah teks. */}
          <div className="relative mt-8 h-48 sm:h-64 lg:hidden">
            <Image src={hpIkan} alt="" aria-hidden fill sizes="100vw" className="object-contain" />
          </div>
        </Container>
      </div>
    </>
  );
}
