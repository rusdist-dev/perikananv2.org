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
  .items.find((item) => item.href === '/program/ocean-accounts')!;

const OBJECTIVES = [
  {
    eyebrow: '01',
    title: 'Measure and value',
    description:
      "Assess Indonesia's marine assets and ecosystem services across ecological, economic, and social dimensions, producing credible, systematic, and standardized data.",
  },
  {
    eyebrow: '02',
    title: 'Inform policy',
    description:
      'Integrate Ocean Accounts into national and sub-national ocean policy to strengthen marine spatial planning, fisheries and protected area management, and sustainable blue economy investment.',
  },
  {
    eyebrow: '03',
    title: 'Build capacity',
    description:
      'Strengthen the people and institutions needed to implement Ocean Accounts across Indonesia.',
  },
];

const GALLERY_IMAGES = [
  { src: slider1, alt: '' },
  { src: slider2, alt: '' },
  { src: slider3, alt: '' },
  { src: slider4, alt: '' },
];

// Dipakai KEY ACTIVITIES saja -- CURRENT PROJECT di bawah punya judul dan
// poinnya sendiri (Ocean for Development Programme & Fellowship).
const DATA_TO_POLICY_BULLETS = [
  'Compiling national-scale and thematic Ocean Accounts data',
  'Developing guidelines, methodologies, and national standards',
  'Building data dashboards and Ocean Satellite Accounts (OSA)',
  'Integrating Ocean Accounts into policy and regulatory frameworks',
  'Strengthening capacity through training, scholarships, and peer learning',
  'Mainstreaming Gender Equality, Disability, and Social Inclusion (GEDSI) in ocean governance',
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
        title="Ocean accounts: Measuring what sustains our lives"
        lead="A standardized accounting framework that lets communities, scientists, and government track the health of Indonesia's ocean the same way, everywhere."
        image={bgOceanAccounts}
      />

      <ProgramIntro>
        <p>
          Indonesia’s marine data is scattered across multiple systems and sectors, limiting its use in policymaking. Ocean Accounts (OA), known in Indonesia as Neraca Sumber Daya Laut (NSDL), provides a standardized framework to bridge this gap by linking ecosystem assets, economic flows, environmental pressures, and governance in one integrated picture. This strengthens marine spatial planning, fisheries and conservation management, and ocean economy policy.
        </p>
        <p>
          Since 2021, REKAM has pioneered OA in Indonesia, an initiative led by the Ministry of Marine Affairs and Fisheries, with REKAM as a key partner and member of the Global Ocean Accounts Partnership (GOAP). Starting with the first pilot in Gili Matra, the program has since developed national ecosystem extent accounts, 11 pilot sites, national standards, training modules, and an interactive dashboard connected to the national system, while also supporting the integration of OA into the RPJMN 2025–2029. Together with GOAP, REKAM manages the OA Fellowship for 10 graduate students at IPB University. REKAM also manages the Indonesia–Norway Ocean for Development program to support OA implementation across institutions. To further support OA implementation, REKAM is currently undertaking a research project to connect OA to decision-making using Ocean Sustainability Gaps (OSGAP) ecosystem health indices.
        </p>
      </ProgramIntro>

      <ProgramObjectives
        icon={oceanAccountIcon}
        eyebrow="Objectives"
        heading="What this program is built to change"
        objectives={OBJECTIVES}
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
        eyebrow="Key Activities"
        title="From data to policy"
        bullets={DATA_TO_POLICY_BULLETS}
        image={fotokey}
      />
      <ProgramFeatureRow
        eyebrow="Current Project"
        title="Ocean for Development (OfD) Programme"
        bullets={[
          'Supported by the Norwegian Agency for Development Cooperation (Norad).',
          'The programme advances Ocean Accounts through three components: ecosystem services accounts, ocean satellite accounts and maritime GDP, and the ocean statistical information system.',
        ]}
        extraSections={[
          {
            title: 'Ocean Accounts Fellowship',
            bullets: [
              "Managed together with GOAP, the fellowship supports 5 master's and 5 PhD students at IPB University, building the next generation of ocean accounting experts.",
            ],
          },
          {
            title: 'Ocean Sustainability Gaps (OSGAP) Research Project',
            bullets: [
              'Supported by the Agence Française de Développement (AFD).',
              'Develops a policy communication layer for linking OA to policy using natural capital-based strong sustainability indices.',
            ],
          },
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
        heading="Where Ocean Accounts making a difference"
        stories={RELATED_STORIES}
        readStoryLabel={t.readStory}
      />

      <ProgramSupportCta
        image={bgSupport}
        heading="What we measure today shapes how we protect tomorrow"
        subheading="Because protecting the ocean starts with understanding its true worth"
        ctaLabel="SUPPORT US"
        ctaHref="#"
      />
    </>
  );
}
