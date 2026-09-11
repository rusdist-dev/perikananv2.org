import { notFound } from 'next/navigation';
import Image, { type StaticImageData } from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import ornamentBg2 from '@/assets/banner/ornament3.png';
import achievements1 from '@/assets/achievements/achievements1.png';
import achievements2 from '@/assets/achievements/achievements2.png';
import achievements3 from '@/assets/achievements/achievements3.png';
import achievements4 from '@/assets/achievements/achievements4.png';
import fotoPulau2 from '@/assets/marine-conservation/foto_pulau2.png';
import { Container } from '@/components/layout/Container';
import { MilestoneCard } from '@/components/discover/MilestoneCard';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
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

function getMilestones(t: Dictionary): Milestone[] {
  return [
    {
      year: '2018',
      title: t.achievementsMilestone2018Title,
      image: achievements1,
      description: t.achievementsMilestone2018Description,
    },
    {
      year: '2019',
      title: t.achievementsMilestone2019Title,
      image: achievements2,
      description: t.achievementsMilestone2019Description,
    },
    {
      year: '2020',
      title: t.achievementsMilestone2020Title,
      image: achievements3,
      bullets: [t.achievementsMilestone2020Bullet1, t.achievementsMilestone2020Bullet2],
    },
    {
      year: '2021',
      title: t.achievementsMilestone2021Title,
      image: achievements1,
      bullets: [
        t.achievementsMilestone2021Bullet1,
        t.achievementsMilestone2021Bullet2,
        t.achievementsMilestone2021Bullet3,
        t.achievementsMilestone2021Bullet4,
        t.achievementsMilestone2021Bullet5,
        t.achievementsMilestone2021Bullet6,
      ],
    },
    {
      year: '2022',
      title: t.achievementsMilestone2022Title,
      image: achievements1,
      bullets: [
        t.achievementsMilestone2022Bullet1,
        t.achievementsMilestone2022Bullet2,
        t.achievementsMilestone2022Bullet3,
        t.achievementsMilestone2022Bullet4,
      ],
    },
    {
      year: '2023',
      title: t.achievementsMilestone2023Title,
      image: achievements3,
      bullets: [
        t.achievementsMilestone2023Bullet1,
        t.achievementsMilestone2023Bullet2,
        t.achievementsMilestone2023Bullet3,
        t.achievementsMilestone2023Bullet4,
        t.achievementsMilestone2023Bullet5,
        t.achievementsMilestone2023Bullet6,
        t.achievementsMilestone2023Bullet7,
        t.achievementsMilestone2023Bullet8,
        t.achievementsMilestone2023Bullet9,
        t.achievementsMilestone2023Bullet10,
        t.achievementsMilestone2023Bullet11,
      ],
    },
    {
      year: '2024',
      title: t.achievementsMilestone2024Title,
      image: achievements3,
      bullets: [
        t.achievementsMilestone2024Bullet1,
        t.achievementsMilestone2024Bullet2,
        t.achievementsMilestone2024Bullet3,
        t.achievementsMilestone2024Bullet4,
        t.achievementsMilestone2024Bullet5,
        t.achievementsMilestone2024Bullet6,
        t.achievementsMilestone2024Bullet7,
        t.achievementsMilestone2024Bullet8,
        t.achievementsMilestone2024Bullet9,
        t.achievementsMilestone2024Bullet10,
      ],
    },
    {
      year: '2025',
      title: t.achievementsMilestone2025Title,
      image: achievements1,
      bullets: [
        t.achievementsMilestone2025Bullet1,
        t.achievementsMilestone2025Bullet2,
        t.achievementsMilestone2025Bullet3,
        t.achievementsMilestone2025Bullet4,
        t.achievementsMilestone2025Bullet5,
        t.achievementsMilestone2025Bullet6,
        t.achievementsMilestone2025Bullet7,
        t.achievementsMilestone2025Bullet8,
        t.achievementsMilestone2025Bullet9,
        t.achievementsMilestone2025Bullet10,
      ],
    },
    {
      year: '2026',
      title: t.achievementsMilestone2026Title,
      image: achievements1,
      bullets: [
        t.achievementsMilestone2026Bullet1,
        t.achievementsMilestone2026Bullet2,
        t.achievementsMilestone2026Bullet3,
        t.achievementsMilestone2026Bullet4,
        t.achievementsMilestone2026Bullet5,
      ],
    },
  ];
}

/** Dikelompokkan per baris (bukan array datar) supaya tiap baris jadi anak
 *  langsung dari pembungkus `divide-y` -- divide-y Tailwind menaruh border
 *  berdasar urutan DOM, jadi kalau datanya rata (12 item, grid-cols-4) baris
 *  ke-2/3/4 di kolom yang sama akan ikut kebagian border-top yang salah. */
function getAchievementStatsRows(t: Dictionary) {
  return [
    [
      { value: '23', label: t.achievementsStatMarineProtectedArea },
      { value: '6', label: t.achievementsStatAreaBasedManagement },
      { value: '8', label: t.achievementsStatFisheriesManagementAreas },
      { value: '72', label: t.achievementsStatCommunityGroups },
    ],
    [
      { value: '52', label: t.achievementsStatFieldEnumerators },
      { value: '38', label: t.achievementsStatJournalPublications },
      { value: '29', label: t.achievementsStatKnowledgeProduction },
      { value: '3', label: t.achievementsStatBooks },
    ],
    [
      { value: '12', label: t.achievementsStatPolicyPublications },
      { value: '21', label: t.achievementsStatScholarshipAwardees },
      { value: '30', label: t.achievementsStatStudentInternships },
      { value: '195', label: t.achievementsStatVolunteers },
    ],
  ];
}

function getPolicyImpacts(t: Dictionary) {
  return [
    { title: t.achievementsPolicy1Title, description: t.achievementsPolicy1Description },
    { title: t.achievementsPolicy2Title, description: t.achievementsPolicy2Description },
    { title: t.achievementsPolicy3Title, description: t.achievementsPolicy3Description },
  ];
}

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
          {t.achievementsHeroHeading}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          {t.achievementsHeroBody}
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
          {getAchievementStatsRows(t).map((row, rowIndex) => (
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
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">{t.achievementsMilestoneEyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          {t.achievementsMilestoneHeading}
        </h2>
        <p className="mt-2 text-sm text-muted">{t.achievementsMilestoneSubheading}</p>

        {/* items-start mematikan stretch bawaan CSS grid (align-items default-nya
            stretch): tiap kartu setinggi kontennya sendiri, jadi kartu pendek
            tidak lagi ikut merentang mengejar kartu tertinggi di barisnya dan
            menyisakan ruang kosong di bawah. Konsekuensinya tepi bawah kartu
            dalam satu baris tidak rata -- itu memang yang diminta; batas tinggi
            + show/hide di MilestoneCard yang menjaga selisihnya tetap wajar.
            2026 sengaja dibiarkan sendirian di baris terakhir (auto-placement
            grid apa adanya) alih-alih diisi kartu kosong. */}
        <div className="mt-8 grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {getMilestones(t).map((milestone) => (
            <MilestoneCard
              key={milestone.year}
              year={milestone.year}
              title={milestone.title}
              image={milestone.image}
              description={milestone.description}
              bullets={milestone.bullets}
              showMoreLabel={t.showMore}
              showLessLabel={t.showLess}
            />
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
          <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/70">{t.achievementsPolicyEyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold md:text-3xl">{t.achievementsPolicyHeading}</h2>
          <p className="mt-2 text-sm text-primary-fg/85">{t.achievementsPolicySubheading}</p>

          {/* List dan gambar sengaja jadi anak grid langsung yang sejajar
              (BUKAN gambar dianggukkan lewat margin-top perkiraan) supaya
              tepi atas keduanya presisi sejajar apa pun tinggi eyebrow/judul
              di atasnya -- margin perkiraan gampang meleset begitu heading
              berbungkus jadi dua baris di layar sempit. */}
          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_26rem] lg:items-start">
            <div className="divide-y divide-primary-fg/20">
              {getPolicyImpacts(t).map((impact) => (
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
          <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">{t.achievementsCtaHeading}</h2>
          <p className="max-w-xl text-sm text-primary-fg/90 md:text-base">
            {t.achievementsCtaBody}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <AppLink
              href="/discover/publications"
              className="inline-flex w-fit items-center border border-primary-fg px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:bg-primary-fg hover:text-primary"
            >
              {t.achievementsCtaExplorePublications}
            </AppLink>
            {/* Tombol "Download Data" disembunyikan sementara atas permintaan --
                belum ada berkas data yang siap diunduh di baliknya.
            <AppLink
              href="#"
              className="inline-flex w-fit items-center gap-2 bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wide text-secondary-fg hover:opacity-90"
            >
              {t.achievementsCtaDownloadData} &darr;
            </AppLink>
            */}
          </div>
        </div>
      </div>
    </div>
  );
}
