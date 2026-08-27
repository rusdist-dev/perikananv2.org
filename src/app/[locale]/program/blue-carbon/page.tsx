import { notFound } from 'next/navigation';
import blueCarbonIcon from '@/assets/blue-carbon.svg';
import bgBlueCarbon from '@/assets/banner/bg_bluecarbon.png';
import slider1 from '@/assets/blue-carbon/slider1.png';
import slider2 from '@/assets/blue-carbon/slider2.png';
import slider3 from '@/assets/blue-carbon/slider3.png';
import slider4 from '@/assets/blue-carbon/slider4.png';
import kaBlueCarbon from '@/assets/blue-carbon/ka_bluecarbon.png';
import borderBlueCarbon from '@/assets/blue-carbon/border_bluecarbon.png';
import cb1 from '@/assets/ocean-accounts/cb1.jpg';
import cb2 from '@/assets/ocean-accounts/cb2.jpg';
import cb3 from '@/assets/ocean-accounts/cb3.jpg';
import fotoKey from '@/assets/blue-carbon/key_bluecarbon.png';
import fotoCurrent from '@/assets/blue-carbon/current_bluecarbon.png';
import { ProgramCrossCutting } from '@/components/program/ProgramCrossCutting';
import { ProgramFeatureRow } from '@/components/program/ProgramFeatureRow';
import { ProgramGallery } from '@/components/program/ProgramGallery';
import { ProgramHero } from '@/components/program/ProgramHero';
import { ProgramIntro } from '@/components/program/ProgramIntro';
import { ProgramObjectives, type ProgramObjective } from '@/components/program/ProgramObjectives';
import { ProgramRelatedStories, type RelatedStory } from '@/components/program/ProgramRelatedStories';
import { ProgramSupportCta } from '@/components/program/ProgramSupportCta';
import { getDictionary } from '@/i18n/dictionary';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';

// Nama program diambil dari panelNav (lib/nav.ts), satu-satunya sumber
// kebenaran untuk rute dan label -- bukan diketik ulang di sini.
const NAV_ITEM = panelNav
  .find((section) => section.id === 'nav-program')!
  .items.find((item) => item.href === '/program/blue-carbon')!;

const OBJECTIVES: ProgramObjective[] = [
  {
    eyebrow: '01',
    title: 'Build a robust blue carbon data and evidence base',
    description:
      'Develop standardized, measurable, and structured blue carbon data through an ocean accounting approach',
  },
  {
    eyebrow: '02',
    title: 'Empower coastal communities for inclusive blue carbon management',
    description:
      'Strengthen community participation, rights, capacity, and benefits through inclusive and responsible blue carbon management',
  },
  {
    eyebrow: '03',
    title: 'Strengthen blue carbon governance and collaboration',
    description:
      'Strengthen coordination, policy, and institutional frameworks for sustainable and high-integrity blue carbon management in Indonesia.',
  },
];

const GALLERY_IMAGES = [
  { src: slider1, alt: '' },
  { src: slider2, alt: '' },
  { src: slider3, alt: '' },
  { src: slider4, alt: '' },
];

const KEY_ACTIVITIES_BULLETS = [
  'Developing and strengthening standardized blue carbon data through an ocean accounting approaches for high integrity blue carbon;',
  'Strengthening the capacity and meaningful participation of coastal communities and sustainable livelihood opportunities;',
  'Strengthening coordination, policy, and institutional frameworks for blue carbon governance through collaboration;',
  'Supporting  capacity building among government, communities, and other stakeholders to advance sustainable and high-integrity blue carbon management.',
];

const CURRENT_PROJECT_BULLETS = [
  'Ocean Accounts for High-Integrity Blue Carbon Project in Demak and Jepara.',
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

// Sama seperti RELATED_STORIES di Ocean Accounts/Marine Conservation/Species
// Conservation -- masih contoh, tapi fotonya dipinjam dari Ocean Accounts
// atas permintaan, sampai foto berita Blue Carbon sendiri tersedia.
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

export default async function BlueCarbonPage({
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
        title="Blue Carbon : Protecting the ecosystem, powering coastal futures"
        lead="Advancing sustainable blue carbon management that delivers tangible environmental and economic benefits for coastal communities."
        image={bgBlueCarbon}
      />

      <ProgramIntro>
        <p>
            The Blue Carbon Program focuses on the protection, rehabilitation, and restoration of mangrove and seagrass ecosystems, which play a critical role in carbon sequestration and storage. The program promotes sustainable, data-driven, and inclusive blue carbon management to support climate change mitigation while strengthening the resilience of coastal ecosystems and communities, in line with Indonesia’s national greenhouse gas emission reduction strategy and its commitments under the Paris Agreement and Enhanced Nationally Determined Contribution (Enhanced NDC).
        </p>
        <p>
            Indonesia has significant blue carbon potential, with 3.44 million hectares of existing mangrove ecosystems (approximately 23% of the world’s total mangrove area)  through Ministry of Forestry Decree No. 594 of 2025. Meanwhile, the latest national mapping in 2025 estimates approximately 660,156 hectares of seagrass ecosystems. However, both ecosystems face threats from degradation and changing coastal conditions, which can reduce carbon storage capacity, biodiversity, coastal protection, fisheries productivity, and community livelihoods. Blue carbon management therefore needs to address ecological, social, tenure, governance, and economics.
        </p>
        <p>
            REKAM implements pilot projects for mangrove and seagrass management in Demak, Jepara, Cilacap, and Kebumen Districts in Central Java, as well as Saleh Bay in West Nusa Tenggara. Through these projects, REKAM promotes high-integrity blue carbon management using an ocean accounting approach to ensure that data are standardized, measurable, and structured to strengthen project screening, site selection, monitoring, verification, and decision-making. All activities apply GEDSI, Free, Prior and Informed Consent (FPIC), and safeguards to ensure transparent and participatory processes that respect community rights and interests. This approach aims to ensure that blue carbon projects deliver sustainable environmental, social, and economic benefits for coastal communities.
        </p>
        <p>
            At the national level, REKAM partners with the Ministry of Marine Affairs and Fisheries (MMAF) and other relevant stakeholders to strengthen blue carbon data, policies, and implementation in Indonesia.
        </p>
      </ProgramIntro>

      <ProgramObjectives
        icon={blueCarbonIcon}
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
        eyebrow="Key Activity"
        title="From data to blue carbon impact"
        bullets={KEY_ACTIVITIES_BULLETS}
        image={fotoKey}
      />
      <ProgramFeatureRow
        eyebrow="Current Project"
        title=""
        bullets={CURRENT_PROJECT_BULLETS}
        image={fotoCurrent}
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
        eyebrow="Related Story"
        heading="Where Blue Carbon making a difference"
        stories={RELATED_STORIES}
        readStoryLabel={t.readStory}
      />

      <ProgramSupportCta
        image={borderBlueCarbon}
        heading="Conserve the carbon, secure the coast"
        subheading="Protection, rehabilitation, and restoration - based on community"
        ctaLabel="Support Us"
        ctaHref="#"
      />
    </>
  );
}
