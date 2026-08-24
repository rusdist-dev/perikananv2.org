import { notFound } from 'next/navigation';
import speciesConservationIcon from '@/assets/species-conservation.svg';
import bgSpeciesConservation from '@/assets/banner/bg_species.png';
import cps1 from '@/assets/species-conservation/cps1.png';
import speciesBorder from '@/assets/species-conservation/species_border.png';
import cb1 from '@/assets/ocean-accounts/cb1.jpg';
import cb2 from '@/assets/ocean-accounts/cb2.jpg';
import cb3 from '@/assets/ocean-accounts/cb3.jpg';
import cpOa1 from '@/assets/ocean-accounts/cp_oa1.jpg';
import cpOa2 from '@/assets/ocean-accounts/cp_oa2.jpg';
import cpOa3 from '@/assets/ocean-accounts/cp_oa3.jpg';
import cpOa4 from '@/assets/ocean-accounts/cp_oa4.png';
import cpOa5 from '@/assets/ocean-accounts/cp_oa5.png';
import fotoFdtp from '@/assets/ocean-accounts/foto_fdtp.png';
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
  .items.find((item) => item.href === '/program/species-conservation')!;

const OBJECTIVES: ProgramObjective[] = [
  {
    eyebrow: '01',
    title: 'Strengthen governance and enforcement',
    description:
      'Equip government agencies with the training, tools, and policy frameworks, including CITES and RFMOs implementation — needed to detect, regulate, and legally manage the shark and ray trade.',
  },
  {
    eyebrow: '02',
    title: 'Build the scientific evidence base',
    description:
      'Generate reliable data on threatened shark and ray species (species identification methods, trade monitoring, stock information) to inform sound fisheries management and policy decisions.',
  },
  {
    eyebrow: '03',
    title: 'Engage fishing communities and industry in sustainable practices',
    description:
      'Work directly with shark fishing communities, processors, traders, and companies to build buy-in and support the adoption of sustainable, compliant practices across the supply chain.',
  },
];

// Foto dokumentasi belum ada untuk Species Conservation -- dipinjam dari
// Ocean Accounts atas permintaan, sampai foto program ini sendiri tersedia.
const GALLERY_IMAGES = [
  { src: cpOa1, alt: '' },
  { src: cpOa2, alt: '' },
  { src: cpOa3, alt: '' },
  { src: cpOa4, alt: '' },
  { src: cpOa5, alt: '' },
];

const KEY_ACTIVITIES_BULLETS = [
  'National Sharks ID Training Program',
  'CITES and RFMOs implementation and identification guide',
  'Engage in policy dialogue and inter-agency coordination with the Ministry of Marine Affairs and Fisheries on shark/ray management measures',
  'DNA-based species identification innovation',
  'Engage with shark fishing communities and companies to support conservation and sustainability',
];

const CURRENT_PROJECT_BULLETS = [
  'Illegal Wildlife Trade – Challenge Fund (IWTEX005) — "Strengthening Indonesia\'s capacity to reduce illegal shark fisheries and trade"',
];

// Sama seperti RELATED_STORIES di Ocean Accounts/Marine Conservation --
// masih contoh, tapi fotonya dipinjam dari Ocean Accounts atas permintaan,
// sampai foto berita Species Conservation sendiri tersedia.
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
        title="Species conservation: Protecting sharks and rays, sustaining oceans resources"
        lead="Strengthening capacity and governance for the sustainable use of sharks and rays in Indonesia."
        image={bgSpeciesConservation}
      />

      <ProgramIntro>
        <p>
          Sharks are among the oldest groups of vertebrate animals on Earth, having existed for more than 400 million years. They belong to the class Chondrichthyes, which includes sharks, rays, skates, and chimaeras. More than 400 shark species have been described globally, ranging from small deep-sea species to the world's largest fish, the whale shark (Rhincodon typus). As apex and mesopredators, sharks and rays play a crucial role in maintaining the balance and health of marine ecosystems — regulating prey populations, sustaining food webs, transporting nutrients across ecosystems, and influencing the behavior of other species. In doing so, they help sustain biodiversity, ecosystem resilience, and productive fisheries.
        </p>
        <p>
          Unlike many bony fish, sharks generally grow slowly, mature late, and produce relatively few offspring. These biological characteristics make shark populations particularly vulnerable to overfishing and slow to recover once depleted. As a result, overfishing has halved shark and ray populations over the past 50 years and driven an estimated 37% of species toward extinction, making chondrichthyans among the most threatened vertebrate lineages (Dulvy et al., 2021). As the highest elasmobranch landings in the world, with annual catches exceeding 100,000 tonnes and one of the largest exporters of shark and ray products globally, Indonesia faces significant challenges to improve its fisheries management and trades.
        </p>
        <p>
          Rekam Nusantara Foundation has actively promoted shark and ray conservation and sustainable practices in fisheries and trade in Indonesia since 2013 —through awareness and research on threatened shark species. Since 2018, Rekam Nusantara Foundation, through its Fisheries Resources Center of Indonesia (FRCI) unit, has been partnering with the Indonesian Ministry of Marine Affairs and Fisheries (MMAF) in strengthen capacity and governance for the sustainability of shark and ray fisheries in Indonesia.
        </p>
      </ProgramIntro>

      <ProgramObjectives
        icon={speciesConservationIcon}
        eyebrow="Objectives"
        heading="How this program drives change"
        objectives={OBJECTIVES}
      >
        <ProgramGallery
          images={GALLERY_IMAGES}
          previousLabel={t.galleryPrevious}
          nextLabel={t.galleryNext}
        />
      </ProgramObjectives>

      <ProgramFeatureRow
        eyebrow="Key Activities"
        title="From the Landing Site to the Ledger"
        bullets={KEY_ACTIVITIES_BULLETS}
        image={cps1}
      />
      <ProgramFeatureRow
        eyebrow="Current Project"
        title=""
        bullets={CURRENT_PROJECT_BULLETS}
        image={fotoFdtp}
        reverse
      />

      <ProgramRelatedStories
        eyebrow="Related Stories"
        heading="Where Species Conservation making a difference"
        stories={RELATED_STORIES}
        readStoryLabel={t.readStory}
      />

      <ProgramSupportCta
        image={speciesBorder}
        heading="Sharks and Rays Keep The Ocean Healthy"
        subheading="Protecting them safeguards the fisheries, food security, and coastal livelihood"
        ctaLabel="SUPPORT US"
        ctaHref="#"
      />
    </>
  );
}
