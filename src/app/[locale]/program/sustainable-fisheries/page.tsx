import { notFound } from 'next/navigation';
import bgIkan from '@/assets/bg_ikan.png';
import cb1 from '@/assets/ocean-accounts/cb1.jpg';
import cb2 from '@/assets/ocean-accounts/cb2.jpg';
import cb3 from '@/assets/ocean-accounts/cb3.jpg';
import fotoFdtp from '@/assets/ocean-accounts/foto_fdtp.png';
import bgSustainableFisheries from '@/assets/banner/bg_sustainable.png';
import cpSf1 from '@/assets/sustainable-fisheries/cp1_sf.png';
import cpSf2 from '@/assets/sustainable-fisheries/cp2_sf.png';
import cpSf3 from '@/assets/sustainable-fisheries/cp3_sf.png';
import cpSf4 from '@/assets/sustainable-fisheries/cp4_sf.png';
import cpSf5 from '@/assets/sustainable-fisheries/cp5_sf.png';
import sustainableFisheriesIcon from '@/assets/sustainable-fisheries.svg';
import { ProgramCrossCutting } from '@/components/program/ProgramCrossCutting';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramObjectives } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { ProgramSupportCta } from '@/components/program/ProgramSupportCta';
import { getDictionary } from '@/i18n/dictionary';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/sustainable-fisheries')!;

const OBJECTIVES = [
  {
    eyebrow: '01',
    title: 'Strengthen science-based fisheries management',
    description:
      'Improve scientific information and analysis to support effective and sustainable fisheries management.',
  },
  {
    eyebrow: '02',
    title: 'Strengthen fisheries data and monitoring systems',
    description:
      'Improve the availability, quality, and use of fisheries data for evidence-based decision-making.',
  },
  {
    eyebrow: '03',
    title: 'Promote sustainable and ecosystem-based fisheries',
    description:
      'Support fisheries management that maintains resource productivity, ecosystem health, and coastal community livelihoods.',
  },
];

const GALLERY_IMAGES = [
  { src: cpSf1, alt: '' },
  { src: cpSf2, alt: '' },
  { src: cpSf3, alt: '' },
  { src: cpSf4, alt: '' },
];

const KEY_ACTIVITIES_BULLETS = [
  'Conducting fisheries research, stock assessments, and analysis of fisheries dynamics;',
  'Strengthening fisheries data collection, monitoring, validation, and management systems;',
  'Developing and applying fisheries and ecosystem models to support management decisions;',
  'Supporting science-based fisheries management strategies, indicators, and harvest control measures;',
  'Strengthening collaboration and knowledge exchange among fisheries stakeholders to support sustainable management.',
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

export default async function SustainableFisheriesPage({
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
        title="Sustainable fisheries: Advancing sustainable fisheries through science, data, and collaboration"
        lead="A model for fisheries management that not only preserves marine ecosystems."
        image={bgSustainableFisheries}
      />

      <ProgramIntro>
        <p>
          The Sustainable Fisheries Program is an FRCI initiative that aims to advance sustainable fisheries management in Indonesia, particularly in small-scale fisheries. The program connects science, data, technology, local knowledge, and stakeholder collaboration to support evidence-based fisheries policy and management (science–policy nexus), sustain fishery resources and marine ecosystems, and improve coastal livelihoods. 
        </p>
        <p>
          The program was developed in response to key challenges facing the fisheries sector, including overfishing, habitat degradation, and challenges in fisheries governance. FRCI supports adaptive fisheries management through fisheries research and stock assessments, ecosystem-based fisheries management, fisheries monitoring, and fisheries and ecosystem modelling. In Saleh Bay, West Nusa Tenggara, FRCI initiated an Ecosystem-Based Fisheries Management (EBFM) approach to integrate ecosystem considerations into small-scale fisheries management. In collaboration with partners, FRCI also serves as a Scientific Service Provider (SSP) for snapper and grouper stock assessments in support of KOMNAS KAJISKAN.
        </p>
        <p>
          FRCI also conducts landing monitoring and fisheries resource surveys across various locations, including blue swimming crab and mud crab monitoring linked to mangrove ecosystem conditions, reef fish surveys in the Liukang Tangaya MPA, and shark and ray monitoring to support species conservation. These activities are supported by participatory data collection and collaborative approaches to strengthen the quality and relevance of fisheries information. Through these efforts, FRCI aims to generate robust scientific evidence and management recommendations to support effective and sustainable fisheries management.
        </p>
      </ProgramIntro>

      <ProgramObjectives
        icon={sustainableFisheriesIcon}
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
        title="Science, Data & Action"
        bullets={KEY_ACTIVITIES_BULLETS}
        image={fotoFdtp}
      />
      <ProgramFeatureRow
        eyebrow="Current Project"
        title=""
        bullets={[
          'Enhancing Maritime Environmental Governance in Indonesia and the Philippines (EMERGE)',
        ]}
        image={fotoFdtp}
        reverse
      />

      <ProgramCrossCutting
        eyebrow="Cross-cutting Program"
        title="NUSACORE"
        description={NUSACORE_DESCRIPTION}
        activityLabel="Key Activity"
        activities={NUSACORE_ACTIVITIES}
      />

      <ProgramRelatedStories
        eyebrow="Related Stories"
        heading="Where Sustainable Fisheries making a difference"
        stories={RELATED_STORIES}
        readStoryLabel={t.readStory}
      />

      <ProgramSupportCta
        image={bgIkan}
        heading="Healthy Fisheries, Healthy Oceans, Stronger Communities"
        subheading="Connecting science, data, and collaboration to support sustainable fisheries management and better coastal livelihoods."
        ctaLabel="SUPPORT US"
        ctaHref="#"
      />
    </>
  );
}
