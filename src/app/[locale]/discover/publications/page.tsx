import { notFound } from 'next/navigation';
import Image from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import ornamentBg2 from '@/assets/banner/ornament3.png';
import publication5 from '@/assets/publication/publication5.png';
import yt1 from '@/assets/publication/yt1.png';
import yt2 from '@/assets/publication/yt2.png';
import yt3 from '@/assets/publication/yt3.png';
import yt4 from '@/assets/publication/yt4.png';
import { publications } from '@/data/publications';
import { Container } from '@/components/layout/Container';
import { PublicationsSlider } from '@/components/publications/PublicationsSlider';
import { VideoSlider } from '@/components/publications/VideoSlider';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

/** Tab dokumen ini murni tampilan (disabled), sama seperti kontrol filter
 *  di NewsHero -- belum ada field `type` di src/data/publications.ts untuk
 *  benar-benar menyaring 4 publikasi nyata yang ada sekarang. */
const DOCUMENT_TYPES = ['Research Reports', 'Policy Briefs', 'Field Guides', 'Data Sheets'];

/** 8 kode WPP (Wilayah Pengelolaan Perikanan / Fisheries Management Area)
 *  ini yang membuat stat "8 FMAs Covered" di bawah punya arti -- 572, 712,
 *  713, 714 sudah disebut nyata di halaman Achievements (kerja sama Rencana
 *  Pengelolaan Perikanan 2020); 571, 573, 715, 718 melengkapi ke 8 tanpa
 *  mengarang wilayah yang tidak ada. */
const FMAS = ['715', '718', '572', '712', '713', '714', '571', '573'];
const VISIBLE_FMAS = FMAS.slice(0, 2);
const MORE_FMAS_COUNT = FMAS.length - VISIBLE_FMAS.length;

/** Angka-angka ini masih tampilan, pola yang sama dengan
 *  `newsShowingPlaceholder` di /berita: jumlah publikasi/kategori/unduhan
 *  sungguhan jauh lebih kecil dari yang dirender di grid di bawah (baru 4
 *  aset publikasi nyata), tapi stat card di rancangan acuan menunjukkan
 *  skala penuh koleksi yang dituju, bukan isi grid saat ini. */
const PUBLICATION_STATS = [
  { value: '23', label: 'Publications Available' },
  { value: '6', label: 'Total Downloads' },
  { value: '8', label: 'Document Categories' },
  { value: '8', label: 'FMAs Covered' },
];

/** Judul & href diambil dari isi sungguhan tiap thumbnail (lihat teks di
 *  atas gambarnya) -- BUKAN dikarang. Hanya "Ocean Accounts" yang sudah punya
 *  video YouTube nyata, video yang sama dengan section Featured Video di
 *  beranda (reuse ID-nya, bukan menulis judul baru untuk video yang sama).
 *  Tiga video lain href="#" mengikuti §4j: belum ada link YouTube nyata untuk
 *  video-video itu. */
const VIDEOS = [
  {
    image: yt1,
    title: 'Apa Itu Neraca Sumber Daya Laut? | Ocean Accounts',
    href: 'https://www.youtube.com/watch?v=GlFSR2ymLWI',
  },
  { image: yt4, title: 'Pantura Bercerita #02: Berkah Bahari', href: '#' },
  { image: yt2, title: 'Rekam Nusantara Foundation', href: '#' },
  { image: yt3, title: 'Masa Depan Pari Kikir dan Pari Kekeh', href: '#' },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/discover/publications',
    title: getDictionary(locale).navPublications,
  });
}

export default async function PublicationsPage({ params }: { params: Promise<{ locale: string }> }) {
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
            { label: t.navPublications, href: '/discover/publications' },
          ]}
        />

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div>
            <span className="inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
              Open Access Publication
            </span>

            <h1 className="mt-4 max-w-2xl text-4xl leading-tight text-primary sm:text-5xl">
              All our numbers are open access
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
              Explore our technical reports, policy briefs, field guides, and data sheets from
              FRCI&apos;s work across Indonesia&apos;s seas.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-lg bg-surface p-6">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="publications-search"
                className="text-xs font-bold uppercase tracking-wide text-muted"
              >
                Search Publications
              </label>
              <input
                id="publications-search"
                type="search"
                disabled
                placeholder="Search…"
                aria-describedby="publications-filter-note"
                className="rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="publications-category"
                className="text-xs font-bold uppercase tracking-wide text-muted"
              >
                Category
              </label>
              <select
                id="publications-category"
                disabled
                aria-describedby="publications-filter-note"
                className="rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed"
              >
                <option>All Categories</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {VISIBLE_FMAS.map((fma) => (
                <span
                  key={fma}
                  className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-muted"
                >
                  FMA {fma}
                </span>
              ))}
              <span className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-muted">
                {MORE_FMAS_COUNT} more
              </span>
            </div>

            <p id="publications-filter-note" className="text-xs text-muted">
              {t.filterUnavailable}
            </p>
          </div>
        </div>

        {/* Garis aktif "All" dijangkarkan lewat pb-4/border-b yang sama pada
            pembungkus -- absolute -bottom-4 di bawahnya jatuh tepat pada garis
            itu, jadi terlihat seperti satu garis tipis penuh lebar dengan
            segmen biru tebal di bawah tab aktif, bukan dua garis lepas yang
            kebetulan bertumpuk. */}
        <div className="relative mt-10 flex flex-wrap items-center gap-3 border-b border-border pb-4">
          <div className="relative pb-2">
            <span className="text-sm font-bold uppercase tracking-wide text-primary">All</span>
            <span aria-hidden className="absolute inset-x-0 -bottom-4 h-0.5 bg-secondary" />
          </div>
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled
              aria-describedby="publications-filter-note"
              className="rounded-full border border-secondary px-4 py-1.5 text-sm font-medium text-secondary disabled:cursor-not-allowed"
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4">
          {PUBLICATION_STATS.map((stat, index) => (
            <div key={stat.label} className="relative px-4 py-8 text-center">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 my-auto hidden h-16 w-px bg-border lg:block"
                />
              ) : null}
              <p className="text-4xl font-extrabold text-primary sm:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Sama seperti section Policy Impact di Achievements: bg-primary +
          ornament_bg2 penuh lebar, bukan pusaran dipojok -- di sini ornamen
          sengaja lebih terlihat (opacity lebih tinggi) karena section ini
          tidak punya foto lain yang bisa terganggu olehnya. */}
      <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-25">
        <Image
            src={ornamentBg2}
            alt=""
            fill
            sizes="100vw"
            className="object-cover select-none -scale-x-[1.2] scale-y-[1.3] -translate-x-[10%] translate-y-[3%] rotate-[4deg] opacity-30"
        />
        </div>

        <Container className="page-gutter relative py-16 lg:pe-(--spacing-panel-gutter) lg:py-20">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/70">
            Featured Publication
          </p>

          <div className="mt-6 grid gap-10 lg:grid-cols-[28rem_1fr] lg:items-center">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg shadow-xl">
              <Image
                src={publication5}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 28rem, 100vw"
                className="object-cover"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary-fg/70">
                Annual Report · 2025
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
                State of Indonesia&apos;s fisheries management areas — Annual Report 2025
              </h2>
              <p className="mt-3 max-w-xl text-sm text-primary-fg/85 md:text-base">
                The full-year data account across all 8 FMAs — catch trends, ecosystem
                indicators, and community monitoring coverage.
              </p>

              {/* §4j: belum ada berkas PDF sungguhan -- href="#" menyatakan itu
                  apa adanya, sama seperti tombol placeholder lain di halaman ini. */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <AppLink
                  href="#"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-fg/15 px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:bg-primary-fg/25"
                >
                  Download PDF &darr;
                </AppLink>
                <AppLink
                  href="#"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-90"
                >
                  Read Online &#8599;
                </AppLink>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-surface">
        <Container className="page-gutter relative py-16 lg:pe-(--spacing-panel-gutter)">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">
            Our Publication
          </p>
          <h2 className="mb-8 text-3xl font-semibold text-primary">
            The results of our work and collaboration
          </h2>

          <PublicationsSlider
            publications={publications}
            downloadLabel={t.download}
            readLabel="Read"
            previousLabel={t.galleryPrevious}
            nextLabel={t.galleryNext}
            pdfUnavailableLabel="This PDF is not available yet."
            closeLabel="Close"
          />
        </Container>
      </div>

      <div className="bg-surface">
        <Container className="page-gutter relative py-16 lg:pe-(--spacing-panel-gutter)">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">
            Video Publication
          </p>
          <h2 className="mb-8 text-3xl font-semibold text-primary">
            Watch and learn more about our ocean
          </h2>

          <VideoSlider
            videos={VIDEOS}
            watchLabel="Watch"
            previousLabel={t.galleryPrevious}
            nextLabel={t.galleryNext}
          />
        </Container>
      </div>
    </div>
  );
}
