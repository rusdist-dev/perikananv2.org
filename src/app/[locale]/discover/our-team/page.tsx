import { notFound } from 'next/navigation';
import Image, { type StaticImageData } from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import ornamentBg2 from '@/assets/banner/ornament3.png';
import fotoEnumerator from '@/assets/about-us/ourteam1.png';
import fotoJoinUs from '@/assets/about-us/border_ourteam.png';
import fotoIrfan from '@/assets/foto-tim/foto_irfan.jpg';
import fotoHeidi from '@/assets/foto-tim/foto_heidi.jpg';
import fotoAsadatun from '@/assets/foto-tim/foto_asadatun.png';
import fotoNatsir from '@/assets/foto-tim/foto_natsir.png';
import fotoBudy from '@/assets/foto-tim/foto_budy.png';
import fotoToni from '@/assets/foto-tim/foto_toni.png';
import fotoAri from '@/assets/foto-tim/foto_ari.png';
import fotoEffin from '@/assets/foto-tim/foto_effin.png';
import fotoAnnisya from '@/assets/foto-tim/foto_annisya.png';
import fotoIntan from '@/assets/foto-tim/foto_intan.png';
import fotoJessica from '@/assets/foto-tim/foto_jessica.png';
import fotoPrayekti from '@/assets/foto-tim/foto_prayekti.png';
import fotoOktavianto from '@/assets/foto-tim/foto_oktavianto.png';
import fotoLilik from '@/assets/foto-tim/foto_lilik.png';
import fotoSoraya from '@/assets/foto-tim/foto_soraya.png';
import fotoLailatul from '@/assets/foto-tim/foto_lailatul.png';
import fotoRizqi from '@/assets/foto-tim/foto_rizqi.png';
import fotoSyauqi from '@/assets/foto-tim/foto_syauqi.png';
import fotoPeni from '@/assets/foto-tim/foto_peni.png';
import fotoWilly from '@/assets/foto-tim/foto_willy.png';
import fotoAyi from '@/assets/foto-tim/foto_ayi.png';
import fotoFiki from '@/assets/foto-tim/foto_fiki.png';
import fotoRahman from '@/assets/foto-tim/foto_rahman.png';
import fotoNabila from '@/assets/foto-tim/foto_nabila.png';
import fotoAisyah from '@/assets/foto-tim/foto_aisyah.png';
import fotoNurul from '@/assets/foto-tim/foto_nurul.png';
import fotoFilipo from '@/assets/foto-tim/foto_filipo.png';
import fotoIbnu from '@/assets/foto-tim/foto_ibnu.png';
import fotoRegi from '@/assets/foto-tim/foto_regi.png';
import fotoWahyu from '@/assets/foto-tim/foto_wahyu.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Icon } from '@/components/ui/Icon';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

type TeamMember = { image: StaticImageData; name: string; role: string };

const HERO_STATS = [
  { value: '48', label: 'Team members' },
  { value: '7', label: 'Field officers' },
  { value: '15', label: 'Years of fieldwork' },
];

// Sama persis dengan TEAM_MEMBERS di halaman About Us -- satu-satunya foto tim
// yang sudah ada sebelum foto manager diunggah.
const ADVISORS: TeamMember[] = [
  { image: fotoIrfan, name: 'Dr. Irfan Yulianto', role: 'Senior Advisor for Ocean Program' },
  { image: fotoHeidi, name: 'Dr. Heidi Retnoningtyas', role: 'Director for Ocean Program' },
  {
    image: fotoAsadatun,
    name: 'Prof. Dr. rer. nat. Asadatun Abdullah',
    role: 'Adjunct Researcher',
  },
  { image: fotoNatsir, name: 'Mohamad Natsir Ph.D.', role: 'Adjunct Researcher' },
  { image: fotoBudy, name: 'Prof. Budy Wiryawan', role: 'Senior Advisor' },
  { image: fotoToni, name: 'Dr. Toni Ruchimat', role: 'Senior Advisor' },
  { image: fotoAri, name: 'Arisetiarso Soemodinoto, Ph.D.', role: 'Senior Advisor' },
];

const MANAGERS: TeamMember[] = [
  { image: fotoEffin, name: 'Efin Muttaqin', role: 'Mgr. for Species Conservation' },
  { image: fotoAnnisya, name: 'Annisya Rosdiana', role: 'Mgr. for Ocean Accounts' },
  {
    image: fotoIntan,
    name: 'Intan Destianis Hartati',
    role: 'Mgr. for Sustainable Fisheries and IKAN',
  },
  { image: fotoJessica, name: 'Jessica Pingkan', role: 'Mgr. for Blue Carbon' },
  { image: fotoPrayekti, name: 'Prayekti Ningtias', role: 'Mgr. for Marine Conservation' },
  {
    image: fotoOktavianto,
    name: 'Oktavianto Prastyo Darmono',
    role: 'Mgr. for Central Java Program',
  },
  {
    image: fotoLilik,
    name: 'Dr. Lilik Teguh Pambudi',
    role: 'Private Sector, Business and Partnership Specialist',
  },
  { image: fotoSoraya, name: 'Dr. Soraya Gigentika', role: 'West Nusa Tenggara Program Coordinator' },
];

const OFFICERS: TeamMember[] = [
  {
    image: fotoLailatul,
    name: 'Lailatul Rokhmah',
    role: 'National Coordinator of Ocean for Development Program',
  },
  { image: fotoRizqi, name: 'Rizqi Aimmatul Maulidiyah', role: 'Marine Policy Coordinator' },
  { image: fotoSyauqi, name: 'Ahmad Syauqi Jafani', role: 'Pelagic Fisheries Assessment Coordinator' },
  { image: fotoPeni, name: 'W. Peni Lestari', role: 'Social Safeguard and Gender Specialist' },
  { image: fotoWilly, name: 'Willy Puspa Irawan', role: 'FRCI Program Officer' },
  { image: fotoAyi, name: 'Ayi Warmia', role: 'FRCI Program Officer' },
  { image: fotoFiki, name: 'Fiki Hidayati', role: 'FRCI Program Officer' },
  { image: fotoRahman, name: 'Rahman Firdaus', role: 'Community Officer' },
  { image: fotoNabila, name: 'Nabila Nur Septiani', role: 'FRCI Program Officer' },
  { image: fotoAisyah, name: 'Siti Zanuba Aisyah', role: 'FRCI Program Officer' },
  { image: fotoNurul, name: 'Nurul WQ Manik', role: 'FRCI Program Officer' },
  { image: fotoFilipo, name: 'Fillipo Aiman Inzaghi', role: 'FRCI Program Officer' },
  { image: fotoIbnu, name: 'Ibnu Rusdi', role: 'FRCI IT Officer' },
  { image: fotoRegi, name: 'Regi Darmawan', role: 'FRCI Fisheries Specialist' },
  { image: fotoWahyu, name: 'Wahyu Putri Fajar Rahmalinda', role: 'FRCI Program Officer' },
];

const ENUMERATOR_STATS = ['180+ enumerators', '100+ landing sites', '11 fisheries areas', 'Quarterly training'];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/discover/our-team', title: getDictionary(locale).navOurTeam });
}

/** Kartu foto + label jabatan, dipakai baik untuk seksi Advisor maupun
 *  Manager -- bedanya cuma teks tag kecil di kartu ("Advisor"/"Leadership"),
 *  jadi satu markup dipakai bersama daripada digandakan. */
function TeamCard({ member, tag }: { member: TeamMember; tag: string }) {
  return (
    <div className="flex flex-col">
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
      <div className="flex flex-1 flex-col gap-1 bg-primary p-4 text-primary-fg">
        <p className="text-xs font-bold uppercase tracking-wide text-primary-fg/70">{tag}</p>
        <p className="text-sm font-bold">{member.name}</p>
        <p className="text-xs text-primary-fg/85">{member.role}</p>
        {/* Belum ada halaman profil individu -- href="#" menyatakan itu apa
            adanya, sama seperti tombol placeholder lain di beranda, alih-alih
            menautkan ke rute yang belum dibangun. */}
        <AppLink
          href="#"
          className="mt-auto inline-flex w-fit items-center rounded-sm border border-primary-fg px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-fg lg:py-1.5 lg:text-[0.65rem] hover:bg-primary-fg hover:text-primary"
        >
          Profile
        </AppLink>
      </div>
    </div>
  );
}

/** Kartu untuk seksi Officer: kartu putih di atas latar abu-abu (bukan bar
 *  navy seperti TeamCard) -- lapisan tim yang jauh lebih banyak orangnya,
 *  jadi kartu dibuat lebih ringan/rata supaya grid delapan-belasnya tidak
 *  terasa seberat grid Advisor/Manager yang berlatar navy. */
function OfficerCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md bg-bg shadow-sm">
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
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-sm font-bold text-secondary">{member.name}</p>
        <p className="text-xs text-muted">{member.role}</p>
        <AppLink
          href="#"
          className="mt-auto inline-flex w-fit items-center rounded-sm border border-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-secondary lg:py-1.5 lg:text-[0.65rem] hover:bg-secondary hover:text-secondary-fg"
        >
          Profile
        </AppLink>
      </div>
    </div>
  );
}

export default async function OurTeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

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
              comprises marine conservation fisheries researchers and activists with over two
              decades of experience working with communities, governments, and private sector,
              through data management, knowledge and capacity building, and policy advocacy in
              the marine and fisheries subject.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-md bg-primary p-6 text-primary-fg lg:mt-1">
            {HERO_STATS.map((stat, index) => (
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
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">Advisor</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          The experts behind our work
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Senior researchers and sector experts who set FRCI&apos;s scientific standards and open
          doors with institutional partners.
        </p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ADVISORS.map((member) => (
            <TeamCard key={member.name} member={member} tag="Advisor" />
          ))}
        </div>
      </Container>

      <Container className="page-gutter relative lg:pe-(--spacing-panel-gutter)">
        <div aria-hidden className="h-0.5 bg-secondary" />
      </Container>

      <Container className="page-gutter relative pt-10 pb-16 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">Manager</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          The leaders of our programs
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Responsible for FRCI&apos;s program delivery and institutional partnerships.
        </p>

        <div className="mt-8 grid gap-8 grid-cols-2 lg:grid-cols-4">
          {MANAGERS.map((member) => (
            <TeamCard key={member.name} member={member} tag="Leadership" />
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
          Measuring what matters, counting what counts, turning data into actions
        </h2>
      </Container>
    </div>

    {/* bg-surface (bukan bg-bg putih polos) supaya latarnya abu-abu tanpa
        jadi gelap -- token yang sama dipakai untuk seksi statistik di
        beranda. */}
    <div className="bg-surface">
      <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">Officer</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          The people who make it happen
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Coordinators, specialists, and officers behind every program.
        </p>

        <div className="mt-8 grid gap-6 grid-cols-2 lg:grid-cols-4">
          {OFFICERS.map((member) => (
            <OfficerCard key={member.name} member={member} />
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
          Field Volunteers &amp; Enumerators
        </p>
        <h2 className="text-2xl font-semibold text-primary md:text-3xl">
          The people behind every data point
        </h2>
        <p className="text-sm text-muted">
          Beyond the core team, more than 180 trained community enumerators and volunteers
          record catch data at landing sites across Indonesia. The data stays open-access and
          credited to the people who recorded it, with contributors retaining full access to the
          data they collect.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {ENUMERATOR_STATS.map((label) => (
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

    <div className="relative isolate overflow-hidden bg-primary">
      <Image
        src={fotoJoinUs}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="pointer-events-none object-cover select-none"
      />
      <div className="absolute inset-0 bg-primary/50" />

      {/* Padding horizontal simetris polos (px-4), BUKAN Container -- Container
          selalu memakai `lg:ps-panel-gutter` (cuma sisi kiri) untuk menyisakan
          ruang bagi panel navigasi mengambang, dan itu menggeser teks
          `text-center` di dalamnya ke kanan dari titik tengah gambar yang
          sebenarnya. Pita CTA ini penuh lebar tanpa konten lain yang perlu
          sejajar dengan panel, jadi padding-nya boleh simetris. */}
      <div className="relative flex flex-col items-center gap-3 px-4 py-12 text-center text-primary-fg sm:py-14">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/80">Join Us</p>
        <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">
          We work with people who want their efforts matter
        </h2>
        <p className="max-w-xl text-sm text-primary-fg/90">
          Find out more about available opportunities and the research fellowship program here.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {/* Belum ada halaman lowongan/fellowship -- href="#" menyatakan itu
              apa adanya, sama seperti tombol placeholder lain di halaman ini.
              border pada tombol pertama supaya tetap kelihatan sebagai tombol
              di bagian foto mana pun di belakangnya -- bg-primary polos
              nyaris tak terlihat begitu tone foto+overlay di baliknya senada
              dengan navy tombol ini. */}
          <AppLink
            href="#"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-primary-fg bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90"
          >
            See Open Roles
            <Icon id="arrow-right" />
          </AppLink>
          <AppLink
            href="#"
            className="inline-flex w-fit items-center rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-90"
          >
            Fellowship Program
          </AppLink>
        </div>
      </div>
    </div>
    </>
  );
}
