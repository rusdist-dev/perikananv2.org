import { notFound } from 'next/navigation';
import Image from 'next/image';
import ornamentBg1 from '@/assets/banner/ornament3.png';
import ornamentBg2 from '@/assets/banner/ornament3.png';
import fotoAri from '@/assets/foto-tim/foto_ari.png';
import fotoAsadatun from '@/assets/foto-tim/foto_asadatun.png';
import fotoBudy from '@/assets/foto-tim/foto_budy.png';
import fotoHeidi from '@/assets/foto-tim/foto_heidi.jpg';
import fotoIrfan from '@/assets/foto-tim/foto_irfan.jpg';
import fotoNatsir from '@/assets/foto-tim/foto_natsir.png';
import fotoToni from '@/assets/foto-tim/foto_toni.png';
import wave2 from '@/assets/banner/wave2.png';
import waveBg from '@/assets/banner/bg_wave1.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

const TEAM_MEMBERS = [
  { image: fotoIrfan, role: 'Senior Advisor for Ocean Program', name: 'Dr. Irfan Yulianto' },
  { image: fotoHeidi, role: 'Director for Ocean Program', name: 'Dr. Heidi Retnoningtyas' },
  { image: fotoAsadatun, role: 'Peneliti Tamu', name: 'Prof. Dr. rer. nat. Asadatun Abdullah' },
  { image: fotoNatsir, role: 'Peneliti Tamu', name: 'Mohamad Natsir Ph.D.' },
  { image: fotoBudy, role: 'Penasihat Senior', name: 'Prof. Budy Wiryawan' },
  { image: fotoToni, role: 'Penasihat Senior', name: 'Dr. Toni Ruchimat' },
  { image: fotoAri, role: 'Senior Advisor', name: 'Arisetiarso Soemodinoto, Ph.D.' },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/discover/about-us', title: getDictionary(locale).navAboutUs });
}

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <>
    <div className="relative isolate overflow-hidden bg-bg">
      {/* Bungkus wave dengan overflow-hidden tersendiri */}
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
            <Image
            src={wave2}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="pointer-events-none object-cover opacity-10 select-none"
            />
        </div>

      <Container className="page-gutter relative pt-10 pb-28 sm:pb-52 lg:pe-(--spacing-panel-gutter) lg:pb-96">
        <Breadcrumb
          items={[
            { label: t.home, href: '/' },
            { label: t.navAboutUs, href: '/discover/about-us' },
          ]}
        />
        <span className="mt-4 inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
          {t.navDiscover}
        </span>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-16">
          <div className="flex flex-col gap-6 text-justify text-sm leading-relaxed text-[#5b6360] md:text-base">
            <p>
              Established in 2018, REKAM/FRCI is Rekam Nusantara Foundation&apos;s dedicated program
              for fisheries and marine conservation, built on science-based data and close
              collaboration with communities, government, and researchers. Our current work spans
              three key regions, Central Java, Saleh Bay in West Nusa Tenggara, and the Liukang
              Tangaya Marine Protected Area (MPA) in South Sulawesi, where we generate the evidence
              needed for sustainable fisheries and marine management.
            </p>
            <p>
              REKAM/FRCI&apos;s work is organized around five major programs. Our Sustainable
              Fisheries program promotes science-based management of Indonesia&apos;s small-scale
              fisheries by integrating research, technology, and local knowledge, informing policy,
              raising public awareness, and strengthening fisheries governance for the long-term
              resilience of coastal communities. Our Ocean Accounts program advances the integration
              of ecosystem, economic, and social data into national ocean governance, supporting
              Indonesia&apos;s transition toward evidence-based, sustainable ocean management. Our
              Marine Conservation program works with national and local government to strengthen the
              effective, adaptive management of MPAs, from research and cost-benefit analysis to
              capacity building for managers and local communities. Our Species Conservation program
              focuses on protecting Indonesia&apos;s sharks and rays, the world&apos;s largest shark
              and ray catch, through capacity building, CITES compliance support, and nationwide
              research on the shark and ray trade chain. Our Blue Carbon program supports the
              rehabilitation and sustainable management of mangrove and seagrass ecosystems,
              empowering coastal communities through livelihood strategies grounded in local
              potential.
            </p>
            <p>
              Underpinning all five programs is IKAN, our Android-based mobile application for
              fisheries data collection. Publicly accessible and built on citizen-science principles
              aligned with standard scientific protocols, IKAN enables fishers, enumerators, and
              community members across Indonesia to contribute directly to the data that informs
              stock assessments and fisheries management decisions. Since its development, REKAM/FRCI
              has continued to expand and refine IKAN to make marine science more participatory,
              transparent, and community-driven.
            </p>
          </div>

          {/* Satu kata per baris (br disembunyikan di bawah lg) meniru rancangan
              acuan, yang punya kolom sesempit itu karena kolom teks di
              sebelahnya jauh lebih lebar -- di bawah lg keduanya bertumpuk
              penuh lebar, jadi baris manual dilepas dan kata mengalir wajar. */}
          <h1 className="text-4xl leading-[1.05] text-primary sm:text-5xl lg:text-6xl lg:translate-x-20 lg:translate-y-5">
            We <br className="hidden lg:block" />
            speak <br className="hidden lg:block" />
            with <br className="hidden lg:block" />
            evidence
          </h1>
        </div>
      </Container>

      {/* `inset-x-0` (bukan lebar rem tetap yang di-anchor `end-0`) supaya
          gambar merentang SELURUH lebar section -- sisi kiri ikut terisi,
          bukan cuma menempel di kanan dengan separuh kiri kosong. Tinggi
          dibiarkan `h-auto` mengikuti rasio asli gambar (1366x513); tanpa
          `fill` next/image memakai rasio itu apa adanya, jadi tidak ada
          kotak lain yang perlu di-fit atau yang bisa memotongnya. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10">
        <Image
          src={ornamentBg1}
          alt=""
          sizes="100vw"
          className="h-auto w-full select-none scale-[1.3] origin-bottom-right translate-x-[30%] translate-y-[24%]"
        />
      </div>
    </div>

    <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
      <Image
        src={wave2}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="pointer-events-none -z-10 object-cover select-none"
      />

      <Container className="page-gutter py-12 lg:pe-(--spacing-panel-gutter) lg:py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">Mission and approach</h2>

        <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-fg">Our Mission</p>
            <h3 className="mt-2 text-lg font-bold">
              An alternative to fisheries analysis, grounded in science
            </h3>
            <p className="mt-2 text-sm text-primary-fg/85">
              FRCI provides an alternative approach to fisheries analysis and sustainable marine
              management based on scientific data.
            </p>
          </div>

          {/* Garis tipis dipusatkan vertikal, pola yang sama dengan divider di
              ProgramObjectives/IMPACT_STATS -- cuma `w-px` (bukan `w-1`),
              karena rancangan acuan menampilkannya sebagai garis rambut, bukan
              batang tebal. */}
          <div className="relative sm:ps-10">
            <span
              aria-hidden
              className="absolute inset-y-0 start-0 my-auto hidden h-20 w-px bg-primary-fg sm:block"
            />
            <p className="text-xs font-bold uppercase tracking-wider text-primary-fg">Our Approach</p>
            <h3 className="mt-2 text-lg font-bold">Partnership, not just publication</h3>
            <p className="mt-2 text-sm text-primary-fg/85">
              We partner and collaborate with stakeholders and policymakers, and involve
              communities to take part in data collection.
            </p>
          </div>
        </div>
      </Container>
    </div>

    <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">Our Team</p>
      <h2 className="mb-8 text-3xl font-semibold text-primary">The experts behind our work</h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM_MEMBERS.map((member) => (
          <div key={member.name} className="flex flex-col">
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
              <p className="text-xs font-bold uppercase tracking-wide text-primary-fg/70">Advisor</p>
              <p className="text-sm font-bold">{member.name}</p>
              <p className="text-xs text-primary-fg/85">{member.role}</p>
              {/* Belum ada halaman profil individu -- href="#" menyatakan itu
                  apa adanya, sama seperti tombol placeholder lain di beranda,
                  alih-alih menautkan ke rute yang belum dibangun. */}
              <AppLink
                href="#"
                className="mt-auto inline-flex w-fit items-center rounded-md border border-primary-fg px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-fg lg:py-1.5 lg:text-[0.65rem] hover:bg-primary-fg hover:text-primary"
              >
                Profile
              </AppLink>
            </div>
          </div>
        ))}
      </div>
    </Container>

    <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
      {/* Beda dari ornament_bg1: sisi kiri gambar sumbernya berhenti dengan
          tepi tegak lurus yang keras (bukan memudar) -- ditampilkan penuh
          (w-full h-auto) tepi keras itu ikut kelihatan dan terlihat seperti
          salah potong. Kotak persegi + `object-cover` membuang separuh sisi
          kiri itu (termasuk tepi kerasnya) dan menampilkan pusarannya lebih
          besar. Titik pusarannya sendiri ada di ~43% lebar sumber (bukan di
          tepi kanan) -- `object-right` (100%) malah membuang pusarannya dan
          menyisakan riak kosong; 37% dipilih supaya pusaran tetap masuk
          bingkai sambil tepi keras di 0% tetap terbuang. */}
    <div
        aria-hidden
        className="pointer-events-none absolute start-0 top-1/2 -z-10 h-full w-[90%] -translate-x-[25%] -translate-y-1/2"
        >
        <Image
            src={ornamentBg2}
            alt=""
            fill
            sizes="75vw"
            className="object-cover select-none -scale-x-[1.3] scale-y-[1.3] -translate-x-[10%] translate-y-[10%] rotate-[4deg] opacity-60"
        />
    </div>

      <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter) lg:py-20">
        <h2 className="ms-auto max-w-md text-3xl font-semibold leading-tight md:text-4xl lg:max-w-xl lg:text-5xl">
          Measuring what matters, counting what counts, turning data into actions
        </h2>
      </Container>
    </div>
    </>
  );
}
