import { notFound } from 'next/navigation';
import Image from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import ornamentBg2 from '@/assets/banner/ornament3.png';
import fotoEnumerator from '@/assets/about-us/ourteam1.png';
import fotoJoinUs from '@/assets/about-us/border_ourteam.png';
import { Container } from '@/components/layout/Container';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { TeamProfileButton } from '@/components/discover/TeamProfileButton';
import { getTeam, type TeamMember } from '@/lib/content';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

/** "Team Members" dihitung dari jumlah anggota yang benar-benar tampil di
 *  halaman ini (`team.length` -- Advisor + Manager + Officer dari CMS),
 *  bukan angka tetap yang bisa menyimpang dari isi grid di bawahnya.
 *  "Field Officers" dan "Years of Fieldwork" masih angka tetap -- belum ada
 *  sumber data untuk keduanya (diminta dibiarkan dulu). */
function getHeroStats(t: Dictionary, memberCount: number) {
  return [
    { value: String(memberCount), label: t.ourTeamHeroStatMembers },
    { value: '7', label: t.ourTeamHeroStatFieldOfficers },
    { value: '15', label: t.ourTeamHeroStatYearsFieldwork },
  ];
}

function getEnumeratorStats(t: Dictionary) {
  return [
    t.ourTeamEnumeratorStat1,
    t.ourTeamEnumeratorStat2,
    t.ourTeamEnumeratorStat3,
    t.ourTeamEnumeratorStat4,
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/discover/our-team', title: getDictionary(locale).navOurTeam });
}

/** Kartu foto + label jabatan, dipakai baik untuk seksi Advisor maupun
 *  Manager -- bedanya cuma teks tag kecil di kartu ("Advisor"/"Leadership"),
 *  jadi satu markup dipakai bersama daripada digandakan. */
function TeamCard({
  member,
  tag,
  profileLabel,
  closeLabel,
}: {
  member: TeamMember;
  tag: string;
  profileLabel: string;
  closeLabel: string;
}) {
  return (
    <div className="flex flex-col">
      {member.image ? (
        <div className="relative aspect-[3/4]">
          <Image
            src={member.image}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 bg-primary p-4 text-primary-fg">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-fg/70">{tag}</p>
        <p className="text-sm font-bold">{member.name}</p>
        <p className="text-xs text-primary-fg/85">{member.position}</p>
        <TeamProfileButton
          member={{ ...member, description: member.bio }}
          label={profileLabel}
          closeLabel={closeLabel}
          className="mt-auto inline-flex w-fit items-center rounded-sm border border-primary-fg px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-fg lg:py-1.5 lg:text-[0.65rem] hover:bg-primary-fg hover:text-primary"
        />
      </div>
    </div>
  );
}

/** Kartu untuk seksi Officer: kartu putih di atas latar abu-abu (bukan bar
 *  navy seperti TeamCard) -- lapisan tim yang jauh lebih banyak orangnya,
 *  jadi kartu dibuat lebih ringan/rata supaya grid delapan-belasnya tidak
 *  terasa seberat grid Advisor/Manager yang berlatar navy. */
function OfficerCard({
  member,
  profileLabel,
  closeLabel,
}: {
  member: TeamMember;
  profileLabel: string;
  closeLabel: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md bg-bg shadow-sm">
      {member.image ? (
        <div className="relative aspect-square">
          <Image
            src={member.image}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-sm font-bold text-secondary">{member.name}</p>
        <p className="text-xs text-muted">{member.position}</p>
        <TeamProfileButton
          member={{ ...member, description: member.bio }}
          label={profileLabel}
          closeLabel={closeLabel}
          className="mt-auto inline-flex w-fit items-center rounded-sm border border-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-secondary lg:py-1.5 lg:text-[0.65rem] hover:bg-secondary hover:text-secondary-fg"
        />
      </div>
    </div>
  );
}

export default async function OurTeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  // Halaman ini menampilkan SEMUA jenjang -- beda dari /discover/about-us
  // yang cuma menampilkan Dewan Penasihat (lihat getAdvisors di lib/content).
  const team = await getTeam(locale);
  const advisors = team.filter((member) => member.level === 'penasihat');
  const managers = team.filter((member) => member.level === 'manajer');
  const officers = team.filter((member) => member.level === 'staff');

  return (
    <>
    {/* Wave dibentangkan sebagai latar SATU div yang membungkus hero, Advisor,
        dan Manager sekaligus -- bukan cuma hero -- supaya polanya kelihatan
        menerus sampai ke bawah section Manager, sesuai permintaan. */}
    <div className="relative isolate overflow-hidden bg-bg">
      {/* Bungkus wave dengan overflow-hidden tersendiri, sama seperti hero
          About Us. */}
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
            // Belum ada halaman indeks /discover -- "#" menyatakan itu apa
            // adanya, sama seperti breadcrumb tengah di halaman /program/*.
            { label: t.navDiscover, href: '#' },
            { label: t.navOurTeam, href: '/discover/our-team' },
          ]}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-12">
          <div>
            <span className="inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
              {t.navDiscover}
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-primary md:text-4xl">
              {t.navOurTeam}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
              {t.ourTeamHeroBody}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-md bg-primary p-6 text-primary-fg lg:mt-1">
            {getHeroStats(t, team.length).map((stat, index) => (
              <div key={stat.label} className="relative text-center">
                {index > 0 ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 -start-2 my-auto hidden h-10 w-px bg-primary-fg/30 sm:block"
                  />
                ) : null}
                <p className="text-3xl font-bold text-[#f2a93b]">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-primary-fg/80 lg:text-[0.65rem]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container className="page-gutter relative lg:pe-(--spacing-panel-gutter)">
        <div aria-hidden className="h-0.5 bg-secondary" />
      </Container>

      <Container className="page-gutter relative pt-10 pb-16 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">{t.ourTeamAdvisorLabel}</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          {t.ourTeamAdvisorHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {t.ourTeamAdvisorSubheading}
        </p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {advisors.map((member) => (
            <TeamCard key={member.slug} member={member} tag={t.ourTeamAdvisorLabel} profileLabel={t.ourTeamProfileCta} closeLabel={t.close} />
          ))}
        </div>
      </Container>

      <Container className="page-gutter relative lg:pe-(--spacing-panel-gutter)">
        <div aria-hidden className="h-0.5 bg-secondary" />
      </Container>

      <Container className="page-gutter relative pt-10 pb-16 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">{t.ourTeamManagerEyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          {t.ourTeamManagerHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {t.ourTeamManagerSubheading}
        </p>

        <div className="mt-8 grid gap-8 grid-cols-2 lg:grid-cols-4">
          {managers.map((member) => (
            <TeamCard key={member.slug} member={member} tag={t.ourTeamLeadershipTag} profileLabel={t.ourTeamProfileCta} closeLabel={t.close} />
          ))}
        </div>
      </Container>
    </div>

    <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
      {/* Sama seperti section penutup About Us, tapi dicerminkan: gambar
          dibalik horizontal (-scale-x-100) dan ditempatkan di `end-0` (kanan)
          alih-alih `start-0`, supaya pusarannya "menghadap" ke arah yang
          berlawanan sementara judulnya pindah ke kiri. */}
      <div
        aria-hidden
        className="pointer-events-none absolute end-0 top-1/2 -z-10 h-full w-[90%] translate-x-[25%] -translate-y-1/2"
      >
        <Image
          src={ornamentBg2}
          alt=""
          fill
          sizes="75vw"
          className="object-cover select-none scale-[1.3] origin-bottom-right translate-x-[20%] translate-y-[24%] rotate-[-1deg] opacity-60"
        />
      </div>

      <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter) lg:py-20">
        <h2 className="max-w-md text-3xl font-semibold leading-tight md:text-4xl lg:max-w-xl lg:text-5xl">
          {t.homeHeroHeading}
        </h2>
      </Container>
    </div>

    {/* bg-surface (bukan bg-bg putih polos) supaya latarnya abu-abu tanpa
        jadi gelap -- token yang sama dipakai untuk seksi statistik di
        beranda. */}
    <div className="bg-surface">
      <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">{t.ourTeamOfficerEyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          {t.ourTeamOfficerHeading}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {t.ourTeamOfficerSubheading}
        </p>

        <div className="mt-8 grid gap-6 grid-cols-2 lg:grid-cols-4">
          {officers.map((member) => (
            <OfficerCard key={member.slug} member={member} profileLabel={t.ourTeamProfileCta} closeLabel={t.close} />
          ))}
        </div>
      </Container>
    </div>

    {/* Baris zigzag teks + foto penuh lebar, sama seperti pola
        ProgramFeatureRow di halaman /program/* -- tidak dipakai langsung
        karena komponen itu mengasumsikan daftar poin bernomor, sedangkan di
        sini butuh paragraf + pil statistik. */}
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-4 px-(--spacing-gutter) py-16 lg:ps-panel-gutter lg:pe-16">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
          {t.ourTeamEnumeratorEyebrow}
        </p>
        <h2 className="text-2xl font-semibold text-primary md:text-3xl">
          {t.ourTeamEnumeratorHeading}
        </h2>
        <p className="text-sm text-muted">
          {t.ourTeamEnumeratorBody}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {getEnumeratorStats(t).map((label) => (
            <span
              key={label}
              className="rounded-full border border-border px-4 py-1.5 text-xs text-muted"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative min-h-64 lg:min-h-0">
        <Image
          src={fotoEnumerator}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>

    {/* Tinggi kontainer mengikuti rasio asli gambar (bukan tinggi kecil
        bawaan sisa padding teks) -- sekarang tanpa teks/tombol di atasnya,
        gambar harus tampil penuh/utuh, bukan terpotong pendek. */}
    <div
      className="relative isolate overflow-hidden bg-primary"
      style={{ aspectRatio: `${fotoJoinUs.width} / ${fotoJoinUs.height}` }}
    >
      <Image
        src={fotoJoinUs}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="pointer-events-none object-cover select-none"
      />
      <div className="absolute inset-0 bg-primary/50" />

      {/* Teks + tombol disembunyikan sementara atas permintaan -- section ini
          untuk saat ini menyisakan gambar saja. Markup aslinya dibiarkan di
          sini (di dalam komentar) supaya gampang dikembalikan nanti:

      <div className="relative flex flex-col items-center gap-3 px-4 py-12 text-center text-primary-fg sm:py-14">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/80">{t.ourTeamJoinUsEyebrow}</p>
        <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">
          {t.ourTeamJoinUsHeading}
        </h2>
        <p className="max-w-xl text-sm text-primary-fg/90">
          {t.ourTeamJoinUsBody}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <AppLink
            href="#"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-primary-fg bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90"
          >
            {t.ourTeamJoinUsSeeRoles}
            <Icon id="arrow-right" />
          </AppLink>
          <AppLink
            href="#"
            className="inline-flex w-fit items-center rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-90"
          >
            {t.ourTeamJoinUsFellowship}
          </AppLink>
        </div>
      </div>
      */}
    </div>
    </>
  );
}
