import { notFound } from 'next/navigation';
import Image, { type StaticImageData } from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import ornamentBg2 from '@/assets/banner/ornament3.png';
import achievements1 from '@/assets/achievements/achievements1.png';
import achievements2 from '@/assets/achievements/achievements2.png';
import achievements3 from '@/assets/achievements/achievements3.png';
import achievements4 from '@/assets/achievements/achievements4.png';
import achievements5 from '@/assets/achievements/achievements5.png';
import fotoPulau2 from '@/assets/marine-conservation/foto_pulau2.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

/** Baru ada 3 foto dokumentasi nyata (lihat src/assets/achievements) --
 *  dipakai bergantian di 9 milestone alih-alih mengarang 9 foto placeholder
 *  baru. Union description/bullets meniru pola yang sama dengan
 *  ProgramObjectives: sebagian milestone (2018, 2019) cukup satu paragraf,
 *  sisanya daftar poin. */
type Milestone = {
  year: string;
  title: string;
  image: StaticImageData;
} & (
  | { description: string; bullets?: never }
  | { bullets: string[]; description?: never }
);

const MILESTONES: Milestone[] = [
  {
    year: '2018',
    title: 'Establishment of FRCI Program',
    image: achievements1,
    description:
      "FRCI was formally established under Rekam Nusantara Foundation, launching its work in fisheries conservation with a focus on protecting sharks and rays.",
  },
  {
    year: '2019',
    title: 'Launched first shark and ray conservation program in Central Java.',
    image: achievements2,
    description:
      'FRCI ran its first Shark and Ray Conservation program, launched in Central Java to monitor and protect their habitats.',
  },
  {
    year: '2020',
    title: 'New academic and government partnerships',
    image: achievements3,
    bullets: [
      'Agreements with IPB University, Diponegoro University, and DKP Jawa Tengah',
      'Co-develop Fisheries Management Plan for Fisheries Management Area (FMA) 572, 712, 713, and 714',
    ],
  },
  {
    year: '2021',
    title: 'Broadened impact through new research, book launch, policy initiatives, and collaboration',
    image: achievements1,
    bullets: [
      'Book launch: Grouper in Indonesia',
      'The first Ocean Accounts pilot and national workshop',
      'Launch of the first generation of IKAN',
      'Launch of the first Sustainable Fisheries Internship Program',
      'Launch of the Strategic Communication for MPA Management in Indonesia report',
      'Agreement with the Directorate of Marine Conservation and Biodiversity, MMAF',
    ],
  },
  {
    year: '2022',
    title: 'Gained global recognition while expanding ocean accounting and fisheries management programs',
    image: achievements1,
    bullets: [
      'Became a member of the Global Ocean Accounts Partnership (GOAP)',
      'Co-hosted the Third Global Dialogue on Ocean Accounting',
      'Implementation of the Liukang Tangaya MPA program',
      'Launch of the Snapper–Grouper Fishery Improvement Project',
    ],
  },
  {
    year: '2023',
    title: 'Launched the first blue carbon program, global research, and new AI-based technology',
    image: achievements3,
    bullets: [
      'The first Blue Carbon program in Central Java and West Nusa Tenggara',
      'Dissemination of the Snapper-grouper stock indicators paper at the FAO Regional Workshop',
      'Support for international Ocean Accounts development',
      'Co-organized a workshop on ocean accounting for blue carbon ecosystem management',
      'Co-hosted the 64th Asian Fisheries Society (AFS) Council Meeting',
      'Launch of the first Ecosystem-Based Fisheries Management study: Ecopath with Ecosim',
      'Launch of AI-based independent fisheries data through the Crowd Data Crawling (CDC) platform',
      'Traced the supply chains of sharks and rays in Central Java, Aceh, and Lombok',
      'Co-development of the Indonesian strategy document for the MPA 30x45 target',
      'Capacity building on eradicating money laundering in the marine and fisheries sector',
      'Agreement with DJPSDKP, MMAF',
    ],
  },
  {
    year: '2024',
    title: 'International recognition met continued growth in training, technology, and partnerships',
    image: achievements3,
    bullets: [
      'Recipient of the EUTECH SDG 14 Award',
      'Agreement with the University of Mataram',
      'Launch of the Ocean Accounts Indonesia Dashboard',
      'Co-hosted the Fifth Global Dialogue on Sustainable Ocean Development',
      'Invited presenter at the 9th World Fisheries Congress in the United States',
      'Co-organized an International technical workshop on high-integrity blue carbon markets',
      'Co-organized digital forensics training on combating marine and fisheries crimes',
      'Co-organized MPA 101 training',
      'Facilitated the development of zonation, management plans, and SOPs for the Liukang Tangaya MPA',
      'Agreements with DJPT, MMAF and DKP Sulawesi Selatan',
    ],
  },
  {
    year: '2025',
    title: 'Impact on global stage through new fellowships, tools, and partnerships.',
    image: achievements1,
    bullets: [
      'Launch of the Ocean Accounts Fellowship',
      'Launch of NUSACORE',
      'Agreements with Brawijaya University, the BRIN Research Center for Ecology, and the BRIN Research Center for Fisheries',
      'Pledge for 2030 Ocean Accounts development at the 3rd UNOC and the Our Ocean Conference 2025',
      "Launch of the film Ocean's Tale of Nusantara: Collective Efforts Against the Climate Crisis",
      'Co-hosted a side event on Integrating Habitat Quality at CITES CoP-20',
      'Launch of the Offshore MPA and Cost-Benefit Analysis guidelines',
      'Launch of the Biodiversity Beyond National Jurisdiction (BBNJ) Indonesia initiative',
      'Book launch: Snapper in Indonesia',
      'Spokesperson at the Maritime Illegal Wildlife Trade Conference 2025',
    ],
  },
  {
    year: '2026',
    title: 'Strengthened evidence-based science with a new research station, expanded dashboards, and global research presentations',
    image: achievements1,
    bullets: [
      'Strengthening evidence-based management in the Liukang Tangaya MPA',
      'Launch of the Our Impacts Dashboard',
      'Launch of the JOGO LAUT Integrated Research Station',
      'Implementation of ocean accounts for high-integrity blue carbon',
      'Group presentation at Sharks International 2026 and International Coral Reef Symposium 2026',
    ],
  },
];

/** Dikelompokkan per baris (bukan array datar) supaya tiap baris jadi anak
 *  langsung dari pembungkus `divide-y` -- divide-y Tailwind menaruh border
 *  berdasar urutan DOM, jadi kalau datanya rata (12 item, grid-cols-4) baris
 *  ke-2/3/4 di kolom yang sama akan ikut kebagian border-top yang salah. */
const ACHIEVEMENT_STATS_ROWS = [
  [
    { value: '23', label: 'Marine Protected Area' },
    { value: '6', label: 'Area-Based Management' },
    { value: '8', label: 'Fisheries Management Areas (FMAs)' },
    { value: '72', label: 'Community Groups (Central Java & South Sulawesi)' },
  ],
  [
    { value: '52', label: 'Field Enumerators' },
    { value: '38', label: 'Journal Publications' },
    { value: '29', label: 'Knowledge Production' },
    { value: '3', label: 'Books' },
  ],
  [
    { value: '12', label: 'Policy Publications' },
    { value: '21', label: 'Scholarship Awardees' },
    { value: '30', label: 'Student Internships (5 universities, 1 school)' },
    { value: '195', label: 'Volunteers' },
  ],
];

const POLICY_IMPACTS = [
  {
    title: 'National Ocean Accounting Framework',
    description:
      "FRCI's pilot accounts became the structural template for the national framework, including the classification of small-scale catch that had previously been recorded only in aggregate.",
  },
  {
    title: 'CITES Animals Committee submissions',
    description:
      "Species-level landing data supported Indonesia's technical position on shark and ray listings at AC33 and AC34.",
  },
  {
    title: 'Provincial harvest strategies',
    description:
      'Four provinces now set seasonal reference points using landing-site series that FRCI maintains jointly with local fisheries agencies.',
  },
];

/** 4 foto dokumentasi nyata (achievements1/2/3/5) diputar dua kali untuk 8
 *  kartu -- bukan dipasangkan satu foto per penghargaan, karena memang belum
 *  ada foto dokumentasi khusus per acara penghargaan. */
const RECOGNITION_PHOTOS = [achievements1, achievements2, achievements3, achievements5];

const RECOGNITIONS = [
  { title: 'Ocean Data Innovation Award', org: 'Indonesia Marine Science Society', year: '2025' },
  { title: 'Technical Advisor, Ocean Accounts', org: 'Ministry of Marine Affairs and Fisheries', year: '2024' },
  { title: 'Best Community Science program', org: 'SEAFDEC Regional Forum', year: '2023' },
  { title: 'Technical Advisor, Ocean Accounts', org: 'Ministry of Marine Affairs and Fisheries', year: '2024' },
  { title: 'Open Data Commendation', org: 'Global Ocean Accounts Partnership', year: '2022' },
  { title: 'Fisheries Research Grant', org: 'Blue Ventures Foundation', year: '2021' },
  { title: 'Marine Conservation Fellowship', org: 'Pew Charitable Trusts', year: '2019' },
  { title: 'Marine Conservation Fellowship', org: 'Pew Charitable Trusts', year: '2019' },
].map((item, index) => ({ ...item, image: RECOGNITION_PHOTOS[index % RECOGNITION_PHOTOS.length] }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/discover/achievements',
    title: getDictionary(locale).navAchievements,
  });
}

export default async function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <div className="relative isolate overflow-hidden bg-bg">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src={waveBg}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover opacity-5 select-none"
        />
      </div>

      <Container className="page-gutter relative pt-10 pb-10 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb
          items={[
            { label: t.home, href: '/' },
            { label: t.navDiscover, href: '/discover/about-us' },
            { label: t.navAchievements, href: '/discover/achievements' },
          ]}
        />

        <span className="mt-4 inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
          {t.navDiscover}
        </span>

        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-primary sm:text-5xl">
          Eight years of evidence that changed decisions
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          These are the moments where FRCI turned data into action, influencing stakeholders and
          policymakers to shape evidence-based, science-driven policy for Indonesia&apos;s seas.
        </p>

        <span className="mt-10 inline-block border-2 border-secondary px-6 py-2 text-base font-bold text-primary">
          2022 - 2026
        </span>

        {/* Garis vertikal dipusatkan lewat inset-y-0 + my-auto + tinggi tetap
            (h-16) -- BUKAN inset-y-0 penuh -- supaya ia melayang di tengah
            sel dan tidak menyentuh garis horizontal (border-y/divide-y) di
            atas maupun bawahnya. Menyentuh membuat keduanya terlihat menyatu
            jadi satu kotak/tabel, padahal keduanya dua elemen desain yang
            terpisah. */}
        <div className="mt-6 divide-y-[3px] divide-secondary border-y-[3px] border-secondary">
          {ACHIEVEMENT_STATS_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4 lg:gap-y-0">
              {row.map((stat, index) => (
                <div key={stat.label} className="relative px-4 text-center sm:px-6">
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 start-0 my-auto hidden h-16 w-[3px] bg-secondary lg:block"
                    />
                  ) : null}
                  <p className="text-4xl font-extrabold text-primary sm:text-5xl">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Container>

      <Container className="page-gutter relative pt-4 pb-16 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">Milestone</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          From the roots to global recognition
        </h2>
        <p className="mt-2 text-sm text-muted">Our journey from the beginning until now</p>

        {/* h-full pada tiap kartu memakai stretch bawaan CSS grid (align-items
            default-nya stretch): tinggi baris mengikuti kartu tertinggi
            (mis. 2021/2023 dengan poin terpanjang), lalu kartu lain di baris
            yang sama ikut merentang -- bukan tinggi masing-masing mengikuti
            kontennya sendiri, yang akan membuat baris jadi tidak rata. 2026
            sengaja dibiarkan sendirian di baris terakhir (auto-placement grid
            apa adanya) alih-alih diisi kartu kosong. */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((milestone) => (
            <div key={milestone.year} className="flex h-full flex-col border border-border bg-surface">
              <div className="relative aspect-[3/2]">
                <Image
                  src={milestone.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">{milestone.year}</p>
                <h3 className="text-base font-semibold text-primary">{milestone.title}</h3>
                {milestone.bullets ? (
                  <ul className="list-disc space-y-1 ps-4 text-sm text-muted">
                    {milestone.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">{milestone.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* Ukuran & posisi ornament_bg2 disalin persis dari
          src/app/[locale]/discover/about-us/page.tsx: pusaran gambar ada di
          ~43% lebar sumbernya, bukan di tepi kanan, jadi object-[50%_50%] +
          w-[90%] + -translate-x-[25%] itulah yang membuat pusarannya pas
          masuk bingkai tanpa memotong bagian yang salah. */}
      <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
        <div
          aria-hidden
          className="pointer-events-none absolute start-0 top-1/2 -z-10 h-full w-[100%] -translate-x-[15%] -translate-y-1/3 opacity-20"
        >
          <Image
            src={ornamentBg2}
            alt=""
            fill
            sizes="75vw"
            className="object-cover select-none -scale-x-[1.1] opacity-30 translate-x-[10%] -translate-y-[16%]"
          />
        </div>

        <Container className="page-gutter relative py-16 lg:pe-(--spacing-panel-gutter) lg:py-20">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/70">Policy Impact</p>
          <h2 className="mt-1 text-2xl font-semibold md:text-3xl">Where the evidence shape the future</h2>
          <p className="mt-2 text-sm text-primary-fg/85">See where FRCI&apos;s data has made an impact</p>

          {/* List dan gambar sengaja jadi anak grid langsung yang sejajar
              (BUKAN gambar dianggukkan lewat margin-top perkiraan) supaya
              tepi atas keduanya presisi sejajar apa pun tinggi eyebrow/judul
              di atasnya -- margin perkiraan gampang meleset begitu heading
              berbungkus jadi dua baris di layar sempit. */}
          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_26rem] lg:items-start">
            <div className="divide-y divide-primary-fg/20">
              {POLICY_IMPACTS.map((impact) => (
                <div key={impact.title} className="border-s-[6px] border-[#2f9e6d] py-5 ps-4 first:pt-0">
                  <h3 className="text-base font-semibold">{impact.title}</h3>
                  <p className="mt-1 text-sm text-primary-fg/85">{impact.description}</p>
                </div>
              ))}
            </div>

            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-bg shadow-xl">
              <div className="relative aspect-[6/5]">
                <Image
                  src={achievements4}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 26rem, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-surface">
        <Container className="page-gutter relative py-16 lg:pe-(--spacing-panel-gutter)">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">Recognition</p>
          <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
            Where our work has been recognized
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {RECOGNITIONS.map((recognition, index) => (
              <div key={`${recognition.title}-${index}`} className="flex flex-col bg-bg">
                <div className="relative aspect-[3/2]">
                  <Image
                    src={recognition.image}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <h3 className="text-sm font-semibold text-primary">{recognition.title}</h3>
                  <p className="text-xs text-muted">
                    {recognition.org} &middot; {recognition.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Pola yang sama dengan ProgramSupportCta (foto penuh lebar + overlay
          biru + teks putih di tengah), tapi ditulis manual di sini alih-alih
          memakai komponennya karena butuh DUA tombol CTA, sementara
          komponennya cuma menerima satu. */}
      <div className="relative isolate overflow-hidden bg-primary">
        <Image
          src={fotoPulau2}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="pointer-events-none object-cover select-none"
        />
        <div className="absolute inset-0 bg-primary/50" />

        <div className="relative flex flex-col items-center gap-4 px-4 py-20 text-center text-primary-fg sm:py-24">
          <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">All our numbers are open access</h2>
          <p className="max-w-xl text-sm text-primary-fg/90 md:text-base">
            We believe impact should be visible, measurable, and accessible to everyone. Download our
            publications and data below.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <AppLink
              href="/discover/publications"
              className="inline-flex w-fit items-center border border-primary-fg px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:bg-primary-fg hover:text-primary"
            >
              Explore Our Publication
            </AppLink>
            <AppLink
              href="#"
              className="inline-flex w-fit items-center gap-2 bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wide text-secondary-fg hover:opacity-90"
            >
              Download Data &darr;
            </AppLink>
          </div>
        </div>
      </div>
    </div>
  );
}
