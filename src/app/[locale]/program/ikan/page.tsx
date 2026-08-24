import Image from 'next/image';
import { notFound } from 'next/navigation';
import bgIkan from '@/assets/banner/bg_ikan.png';
import ornament4 from '@/assets/banner/ornament4.png';
import borderIkan from '@/assets/ikan/border_ikan.png';
import fotoIkan1 from '@/assets/ikan/foto_ikan1.png';
import fotoIkan2 from '@/assets/ikan/foto_ikan2.png';
import fotoIkan3 from '@/assets/ikan/foto_ikan3.png';
import fotoIkan4 from '@/assets/ikan/foto_ikan4.jpg';
import hpIkan from '@/assets/ikan/hp_ikan.png';
import kaIkan from '@/assets/ikan/ka_ikan.png';
import petaIkan from '@/assets/ikan/peta_ikan.png';
import ikanIcon from '@/assets/ikan-application.svg';
import cb1 from '@/assets/ocean-accounts/cb1.jpg';
import cb2 from '@/assets/ocean-accounts/cb2.jpg';
import cb3 from '@/assets/ocean-accounts/cb3.jpg';
import fotoFdtp from '@/assets/ocean-accounts/foto_fdtp.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { ProgramCrossCutting } from '@/components/program/ProgramCrossCutting';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramObjectives, type ProgramObjective } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { getDictionary } from '@/i18n/dictionary';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/ikan')!;

const OBJECTIVES: ProgramObjective[] = [
  {
    eyebrow: '01',
    title: 'Strengthen fisheries data systems',
    description: 'Improve the quality, coverage, consistency, and accessibility of fisheries data',
  },
  {
    eyebrow: '02',
    title: 'Enable collaborative data collection',
    description:
      'Engage fisheries stakeholders in generating reliable and management-relevant information',
  },
  {
    eyebrow: '03',
    title: 'Turn data into evidence',
    description:
      'Improve the use of fisheries data to reduce uncertainty and support science-based management decisions.',
  },
];

const GALLERY_IMAGES = [
  { src: fotoIkan1, alt: '' },
  { src: fotoIkan2, alt: '' },
  { src: fotoIkan3, alt: '' },
  { src: fotoIkan4, alt: '' },
];

const KEY_ACTIVITIES_BULLETS = [
  'Developing and implementing collaborative fisheries data collection protocols and systems;',
  'Strengthening digital platforms for fisheries data collection, validation, integration, and monitoring;',
  'Improving fisheries data quality, coverage, traceability, and accessibility;',
  'Applying innovative technologies, including AI, for fisheries data collection and species identification;',
  'Facilitating data sharing and collaboration among fishers, researchers, government, and fisheries stakeholders.',
];

const NUSACORE_DESCRIPTION =
  'formally "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — is a 3-year initiative (2025–2028) led by REKAM and funded through the UK FCDO\'s COAST Facility, responding to worsening coastal erosion, climate change impacts, and mangrove loss along Central Java\'s northern coast that past restoration efforts failed to resolve due to weak execution and reliance on external funding. The programme builds community-led, self-financing Nature-based Solutions that restore mangrove ecosystems while reducing poverty, pairing habitat rehabilitation with sustainable aquaculture — mangrove crabs, milkfish, green mussels, and shrimp — through a silvofishery model that lets conservation and livelihoods reinforce each other. Anchored by GEDSI and FPIC principles and capacity-building at the institutional level, NUSACORE\'s project site covers 17 sites in 11 districts and reaches 25 community groups across Central Java.';

const NUSACORE_ACTIVITIES = [
  'Mangrove ecosystem rehabilitation and restoration to rebuild natural coastal defenses and reverse erosion',
  'Development of silvofishery pilots that pair mangrove conservation with sustainable aquaculture of mangrove crabs, milkfish, mussels, and shrimp',
  'Training, mentoring, and value-added fisheries processing to build self-financing, poverty-reducing livelihoods less dependent on external funding',
  'Application of GEDSI and FPIC principles to ensure equitable participation of women, youth, persons with disabilities, and other vulnerable groups',
  'Institutional strengthening — coastal management standards, stakeholder capacity building, and climate-responsive planning policy across 25 community groups in 17 locations at 11 districts in Central Java',
];

// Sama seperti Related Stories di program lain -- masih contoh, fotonya
// dipinjam dari Ocean Accounts atas permintaan, sampai foto berita IKAN
// sendiri tersedia.
const RELATED_STORIES: RelatedStory[] = [
  {
    image: cb1,
    date: '28 Jul 2026',
    category: 'Policy',
    title: 'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    href: '#',
  },
  {
    image: cb2,
    date: '14 Jul 2026',
    category: 'Ocean Accounts',
    title: "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    href: '#',
  },
  {
    image: cb3,
    date: '10 Jul 2026',
    category: 'Conservation',
    title: "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    href: '#',
  },
];

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
        title="IKAN: Collaboration for better fisheries data"
        lead="An Android-based, open-access application designed for collaborative fisheries data collection."
        image={bgIkan}
      />

      <ProgramIntro>
        <p>
          IKAN (Initiative on Collaborative Fisheries Data Collection) is an FRCI initiative that aims to strengthen fisheries data collection through a collaborative, technology-enabled, and evidence-based approach. The initiative brings together fishers, data collectors, researchers, government institutions, and other fisheries stakeholders to generate reliable and timely information that can support better fisheries management.
        </p>
        <p>
          IKAN responds to persistent challenges in fisheries data collection, including limited coverage, inconsistent data quality, fragmented information systems, and difficulties in translating field observations into management-relevant information. By combining participatory data collection with digital technologies, IKAN seeks to improve the quality, consistency, traceability, and accessibility of fisheries data.
        </p>
        <p>
          The initiative applies a range of tools and approaches, including Android-based data collection applications, integrated online databases, digital monitoring platforms, standardized data protocols, and artificial intelligence (AI) for fish identification. These systems enable fisheries information to be collected closer to the source, validated systematically, and made available for analysis and decision-making.
        </p>
        <p>
          Through collaboration with fisheries stakeholders, IKAN supports the development of more comprehensive and responsive fisheries information systems, from landing sites and fishing communities to research and management institutions. The initiative ultimately aims to reduce data gaps and uncertainty, strengthen evidence for fisheries management, and contribute to more sustainable fisheries and healthier marine ecosystems.
        </p>
      </ProgramIntro>

      <ProgramObjectives
        icon={ikanIcon}
        eyebrow="Objectives"
        heading="How this program drives change"
        objectives={OBJECTIVES}
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
        eyebrow="Key Activities"
        title="From data collection to better decisions"
        bullets={KEY_ACTIVITIES_BULLETS}
        image={fotoFdtp}
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
            Current Project
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

      <ProgramCrossCutting
        eyebrow="Cross-cutting Program"
        title="NUSACORE"
        description={NUSACORE_DESCRIPTION}
        activityLabel="Key Activity"
        activities={NUSACORE_ACTIVITIES}
      />

      <ProgramRelatedStories
        eyebrow="Related Stories"
        heading="Where IKAN making a difference"
        stories={RELATED_STORIES}
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
              Better data, better fisheries decisions
            </h2>
            <p className="max-w-md text-sm text-primary-fg/90 md:text-base lg:max-w-none">
              Connecting fishers, researchers, government, and technology to turn field data into
              reliable evidence for sustainable fisheries.
            </p>
            <AppLink
              href="#"
              className="mt-2 inline-flex w-fit items-center rounded-md border border-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-white hover:text-primary"
            >
              Download App
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
