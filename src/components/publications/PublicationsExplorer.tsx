'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import ornamentBg2 from '@/assets/banner/ornament3.png';
import publication5 from '@/assets/publication/publication5.png';
import yt1 from '@/assets/publication/yt1.png';
import yt2 from '@/assets/publication/yt2.png';
import yt3 from '@/assets/publication/yt3.png';
import yt4 from '@/assets/publication/yt4.png';
import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { PublicationsSlider, type PublicationSlide } from '@/components/publications/PublicationsSlider';
import { VideoSlider } from '@/components/publications/VideoSlider';
import { FeaturedPublicationActions } from '@/components/publications/FeaturedPublicationActions';

/** Tab dokumen ini murni tampilan (disabled), sama seperti sebelumnya --
 *  belum ada field `type` di src/data/publications.ts untuk benar-benar
 *  menyaring 5 publikasi nyata yang ada sekarang. Beda dari search+category
 *  di bawah, taksonomi ini ("Research Reports", dst.) tidak berhubungan sama
 *  sekali dengan `category` yang benar-benar ada pada tiap publikasi, jadi
 *  tidak bisa diaktifkan dengan jujur seperti kotak pencarian. */
const DOCUMENT_TYPES = ['Research Reports', 'Policy Briefs', 'Field Guides', 'Data Sheets'];

/** 8 kode WPP (Wilayah Pengelolaan Perikanan / Fisheries Management Area)
 *  ini yang membuat stat "8 FMAs Covered" di bawah punya arti -- 572, 712,
 *  713, 714 sudah disebut nyata di halaman Achievements (kerja sama Rencana
 *  Pengelolaan Perikanan 2020); 571, 573, 715, 718 melengkapi ke 8 tanpa
 *  mengarang wilayah yang tidak ada. Ini murni angka statistik koleksi, BUKAN
 *  dimensi yang bisa dipakai menyaring publikasi -- tidak ada field FMA per
 *  publikasi di src/data/publications.ts. */
const FMAS = ['715', '718', '572', '712', '713', '714', '571', '573'];

/** Angka-angka ini masih tampilan, pola yang sama dengan
 *  `newsShowingPlaceholder` (sekarang sudah nyata) di /berita: jumlah
 *  publikasi/kategori/unduhan sungguhan jauh lebih kecil dari yang dirender
 *  di grid di bawah (baru 5 aset publikasi nyata), tapi stat card di
 *  rancangan acuan menunjukkan skala penuh koleksi yang dituju, bukan isi
 *  grid saat ini. */
const PUBLICATION_STATS = [
  { value: '23', label: 'Publications Available' },
  { value: '6', label: 'Total Downloads' },
  { value: '8', label: 'Document Categories' },
  { value: String(FMAS.length), label: 'FMAs Covered' },
];

/** Judul & href diambil dari isi sungguhan tiap thumbnail (lihat teks di
 *  atas gambarnya) -- BUKAN dikarang. "Ocean Accounts" reuse ID video yang
 *  sama dengan section Featured Video di beranda. */
const VIDEOS = [
  {
    image: yt1,
    title: 'Apa Itu Neraca Sumber Daya Laut? | Ocean Accounts',
    href: 'https://www.youtube.com/watch?v=GlFSR2ymLWI',
  },
  {
    image: yt4,
    title: 'Pantura Bercerita #02: Berkah Bahari',
    href: 'https://www.youtube.com/watch?v=SK8cBtxNKlg',
  },
  {
    image: yt2,
    title: 'Rekam Nusantara Foundation',
    href: 'https://www.youtube.com/watch?v=i93HHrpfI0M',
  },
  {
    image: yt3,
    title: 'Masa Depan Pari Kikir dan Pari Kekeh',
    href: 'https://www.youtube.com/watch?v=W2EwhDS5StQ',
  },
];

/** Membuang diakritik dan menyeragamkan kapital, sama seperti SearchableSelect/lib/search. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '');
}

type Labels = {
  home: string;
  navDiscover: string;
  navPublications: string;
  download: string;
  galleryPrevious: string;
  galleryNext: string;
};

type Props = {
  publications: PublicationSlide[];
  labels: Labels;
};

export function PublicationsExplorer({ publications, labels }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categoryOptions = useMemo(() => [...new Set(publications.map((p) => p.category))], [publications]);

  const filtered = useMemo(() => {
    const terms = normalize(search).split(/\s+/).filter(Boolean);
    return publications.filter((pub) => {
      if (category !== 'all' && pub.category !== category) return false;
      if (terms.length === 0) return true;
      const haystack = normalize(`${pub.title} ${pub.category}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [publications, search, category]);

  const breadcrumb: BreadcrumbItem[] = [
    { label: labels.home, href: '/' },
    { label: labels.navDiscover, href: '/discover/about-us' },
    { label: labels.navPublications, href: '/discover/publications' },
  ];

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
        <Breadcrumb items={breadcrumb} />

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

          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-col gap-4 rounded-lg bg-surface p-6"
          >
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search…"
                className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
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
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory((current) => (current === option ? 'all' : option))}
                  aria-pressed={category === option}
                  className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-muted hover:border-secondary hover:text-secondary aria-pressed:border-secondary aria-pressed:bg-secondary aria-pressed:text-secondary-fg"
                >
                  {option}
                </button>
              ))}
            </div>
          </form>
        </div>

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
              aria-describedby="publications-document-type-note"
              className="rounded-full border border-secondary px-4 py-1.5 text-sm font-medium text-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {type}
            </button>
          ))}
          <p id="publications-document-type-note" className="sr-only">
            Document type filter is not available yet.
          </p>
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

              <FeaturedPublicationActions
                pdfUrl="/documents/state-of-indonesia.pdf"
                title="State of Indonesia's fisheries management areas — Annual Report 2025"
                downloadFileName="state-of-indonesia-annual-report-2025.pdf"
                unavailableLabel="This PDF is not available yet."
                closeLabel="Close"
              />
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

          {filtered.length === 0 ? (
            <p className="text-muted">No publications match this search.</p>
          ) : (
            <PublicationsSlider
              publications={filtered}
              downloadLabel={labels.download}
              readLabel="Read"
              previousLabel={labels.galleryPrevious}
              nextLabel={labels.galleryNext}
              pdfUnavailableLabel="This PDF is not available yet."
              closeLabel="Close"
            />
          )}
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
            previousLabel={labels.galleryPrevious}
            nextLabel={labels.galleryNext}
            unavailableLabel="This video is not available yet."
            closeLabel="Close"
          />
        </Container>
      </div>
    </div>
  );
}
