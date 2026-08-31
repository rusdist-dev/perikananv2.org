import Image from 'next/image';
import { notFound } from 'next/navigation';
import fotoKey from '@/assets/marine-conservation/key_marine.png';
import fotoCurrent from '@/assets/marine-conservation/current_marine.png';
import fotoPulau2 from '@/assets/marine-conservation/foto_pulau2.png';
import bgMarineConservation from '@/assets/banner/bg_marine.png';
import marineConservationIcon from '@/assets/marine-conservation.svg';
import fotoFdtp from '@/assets/ocean-accounts/foto_fdtp.png';
import cpSf1 from '@/assets/sustainable-fisheries/cp1_sf.png';
import cpSf2 from '@/assets/sustainable-fisheries/cp2_sf.png';
import cpSf3 from '@/assets/sustainable-fisheries/cp3_sf.png';
import cpSf4 from '@/assets/sustainable-fisheries/cp4_sf.png';
import slider1 from '@/assets/marine-conservation/slider1.png';
import slider2 from '@/assets/marine-conservation/slider2.png';
import slider3 from '@/assets/marine-conservation/slider3.png';
import slider4 from '@/assets/marine-conservation/slider4.png';
import { Container } from '@/components/layout/Container';
import { IndonesiaMap } from '@/components/program/IndonesiaMap';
import { FRCI_CONSERVATION_AREA_NAMES } from '@/data/frci-conservation-areas';
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
  .items.find((item) => item.href === '/program/marine-conservation')!;

const OBJECTIVES = [
  {
    eyebrow: '01',
    title: 'Advancing policy and strategic alignment at regional, national, and provincial level.',
    description: '',
  },
  {
    eyebrow: '02',
    title:
      'Strengthening effective, adaptive, and sustainable management of the MPAs or other area-based measures.',
    description: '',
  },
  {
    eyebrow: '03',
    title: 'Engaging stakeholders and empowering nearby communities.',
    description: '',
  },
  {
    eyebrow: '04',
    title: 'Measuring systematic, evidence-based, and inclusive conservation impact.',
    description: '',
  },
];

// Foto dokumentasi belum ada untuk Marine Conservation -- dipinjam dari
// Sustainable Fisheries atas permintaan, sampai foto program ini sendiri
// tersedia.
const GALLERY_IMAGES = [
  { src: slider1, alt: '' },
  { src: slider2, alt: '' },
  { src: slider3, alt: '' },
  { src: slider4, alt: '' },
];

const KEY_ACTIVITIES_BULLETS = [
  'Developing and aligning policy, regulatory frameworks, and strategic planning at the national and provincial level;',
  "Supporting effective management of Indonesia's first national offshore MPA in the Sulawesi Sea;",
  'Assisting establishment and effective governance of MPAs and other area-based measure across the four target provinces;',
  'Improving knowledge and capacity of the MPA, area managers, and national stakeholders;',
  'Collecting time series data to measure conservation impact; and',
  'Raising awareness and empowering local and nearby communities.',
  'Supporting the early implementation of BBNJ Agreement through capacity building, analytical inputs, and documents',
];

// Sama seperti RELATED_STORIES di Ocean Accounts/Sustainable Fisheries --
// masih contoh, tapi fotonya dipinjam dari Sustainable Fisheries atas
// permintaan, sampai foto berita Marine Conservation sendiri tersedia.
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
    image: cpSf1,
    date: '28 Jul 2026',
    category: 'Policy',
    title: 'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    href: '#',
  },
  {
    image: cpSf2,
    date: '14 Jul 2026',
    category: 'Ocean Accounts',
    title: "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    href: '#',
  },
  {
    image: cpSf3,
    date: '10 Jul 2026',
    category: 'Conservation',
    title: "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    href: '#',
  },
];

export default async function MarineConservationPage({
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
        title="Marine conservation: Protecting the oceans that protects us"
        lead="Protection of marine areas to prevent biodiversity loss, sustain fisheries resources, reserve blue carbon area, reduce the risk of ecosystem collapse and mitigate climate change, ensuring marine resources remain available for future generations in Indonesia."
        image={bgMarineConservation}
      />

      <ProgramIntro>
        <p>
          As the largest archipelago country, Indonesia sits together with other 16 megadiverse countries and is nested at the very heart of Coral Triangle – an epicenter of marine biodiversity. It hosts 76% of the world's coral species, provides home for 37% of the world's reef fish species, and ranks as the world's second-largest fisheries producer. Those highlight the importance of marine ecosystem conservation in Indonesia for ocean health, food security, and livelihoods, both at local and global scale. REKAM through its Fisheries Resource Center of Indonesia (FRCI) unit works with governments, conservation managers, civil society, and local communities to strengthen the policies, capacity, and participation needed for marine conservation areas to be effectively and sustainably managed.
        </p>
        <p>
          In response to the global target to effectively conserve and manage at least 30% of the coastal and marine areas, FRCI collaborates with Government of Indonesia (GoI) and other stakeholders on refining the strategic plan and national roadmap for expanding and effectively manage Marine Protected Areas (MPAs). The work also includes integrating Other Effective Area-based Conservation Measures (OECMs) recognition as part of MPA&OECM Vision 2045, also known as 30x45 agenda. The agenda focuses on providing policy and regulatory framework, as well as guidelines for implementation of MPAs, and integration of OECMs or other area-based measures on the ground.
        </p>
        <p>
          At the national level, FRCI streams the effort on (a) strengthening policy and regulatory through (b) robust science backing up, and (c) developing pathways for effective conservation actions on-site. The efforts include developing and aligning policy and regulatory frameworks, strategic planning, and supporting the effective management of Indonesia's first national offshore MPA in the Sulawesi Sea. At the provincial level, FRCI fully supports local governments in establishing and strengthening the effective, adaptive, and sustainable management of area-based conservation across four provinces: Central Java, South Sulawesi, West Nusa Tenggara, and Maluku. Supporting activities include the establishment of provincial MPAs, the development of required regulations and protocols, training and certification for MPA and area managers, technical assistance for on-site implementation, time series data collection to measure the impact of area management, and efforts to raise awareness and empower local communities within these areas.
        </p>
        <p>
          Beyond the national level, FRCI also supports the GoI in implementing the UN Biodiversity Beyond National Jurisdiction (BBNJ) Treaty, with key focus on engagement in High Seas MPA establishment processes—as part of the effort towards 30x30.
        </p>
      </ProgramIntro>

      <ProgramObjectives
        icon={marineConservationIcon}
        eyebrow="Objective"
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
        title=""
        bullets={KEY_ACTIVITIES_BULLETS}
        image={fotoKey}
      />
      <ProgramFeatureRow
        eyebrow="Current Project & Initiative"
        title="Scaling Effective Area-based Conservation for People & Ecosystems (SEASCAPE)"
        bullets={[
          'Support the Government of Indonesia in fulfilling its global conservation commitments under the "30 by 45 Vision" policy framework.',
          'Strengthening implementation, accelerating uptake, and generating more streamlined and measurable conservation, livelihood, and climate impacts.',
        ]}
        extraSections={[
          {
            title: 'BBNJ Agreement Implementation in Indonesia',
            bullets: [
              'Supported by the High Seas Alliance.',
              'Support agenda development for national consultations',
              'Increases local stakeholder capacity and engagement for BBNJ Agreement implementation.',
            ],
          },
        ]}
        image={fotoCurrent}
        reverse
      />

      <div className="bg-primary text-primary-fg">
        <Container className="page-gutter pt-10 lg:pe-(--spacing-panel-gutter)">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/70">
            Work Area
          </p>
          <h2 className="mt-1 text-2xl font-semibold md:text-3xl mb-7">Marine Protected Area (MPA)</h2>
        </Container>
        {/* Hanya kawasan tempat FRCI bekerja. Tanpa daftar putih ini peta
            menggambar seluruh 554 kawasan konservasi Indonesia -- benar sebagai
            data nasional, tapi section ini judulnya "Work Area". */}
        <IndonesiaMap
          theme="brand"
          ariaLabel="Peta interaktif kawasan konservasi laut tempat FRCI bekerja"
          mpaNames={FRCI_CONSERVATION_AREA_NAMES}
        />
      </div>

      <ProgramCrossCutting
        eyebrow="Cross-cutting Program"
        title="NUSACORE"
        description={NUSACORE_DESCRIPTION}
        activityLabel="Key Activity"
        activities={NUSACORE_ACTIVITIES}
        variant="white"
      />

      <ProgramRelatedStories
        eyebrow="Related Stories"
        heading="Where Marine Conservation making a difference"
        stories={RELATED_STORIES}
        readStoryLabel={t.readStory}
      />

      <ProgramSupportCta
        image={fotoPulau2}
        heading="Protect 97.5 million hectares of Indonesia's marine areas by 2045"
        subheading="Beyond establishing protected areas, it is about making conservation work."
        ctaLabel="SUPPORT US"
        ctaHref="#"
      />
    </>
  );
}
