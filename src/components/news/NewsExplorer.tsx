import Image from 'next/image';
import { resolveArticleImage } from '@/data/article-images';
import { AppLink } from '@/components/ui/AppLink';
import { Container } from '@/components/layout/Container';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { NewsHero, type FeaturedArticle, type FilterOption } from './NewsHero';
import { formatArticleDate } from '@/lib/date';
import { cn } from '@/lib/cn';
import { localizedPath } from '@/i18n/routing';
import type { Locale } from '@/i18n/config';

/**
 * Daftar berita: merender, tidak menyaring.
 *
 * Dulu komponen ini menerima SELURUH arsip lalu menyaring, mengurutkan, dan
 * memaginasinya di browser -- satu-satunya cara yang mungkin saat API CMS baru
 * bisa memfilter program dan kategori. Sejak `search`, `year`, dan paginasi
 * dilayani CMS (docs/api-public.md), semuanya pindah ke server dan yang tiba di
 * sini tinggal satu halaman hasil.
 *
 * Yang berubah bukan cuma ukuran payload: keadaan filter kini hidup di URL,
 * jadi hasil saringan bisa ditautkan dan di-bookmark, tombol Kembali bekerja
 * sebagaimana mestinya, dan panelnya tetap berfungsi tanpa JavaScript -- filter
 * adalah form GET biasa, paginasi adalah tautan biasa. Karena itu berkas ini
 * tidak lagi 'use client'.
 */

export type NewsArticleItem = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  image: string | null;
  /** Label kategori siap pakai dari CMS (lihat `category` di
   *  lib/content/schema.ts). Slug kategori/program tidak lagi dikirim ke sini:
   *  pencocokannya sudah selesai di server. */
  category: string | null;
};

/** Keadaan filter sebagaimana adanya di URL. String kosong = tanpa filter. */
export type NewsFilters = {
  search: string;
  year: string;
  program: string;
  category: string;
  sort: 'newest' | 'oldest';
  page: string;
};

type PageInfo = {
  /** Jumlah artikel yang cocok dengan filter, dari `meta.total` CMS. */
  total: number;
  totalPages: number;
  current: number;
  /** Ikut dioper, bukan ditebak dari `articles.length`: halaman terakhir
   *  hampir selalu lebih pendek, dan memakai panjangnya membuat hitungan
   *  "menampilkan X–Y" meleset persis di halaman itu. */
  size: number;
};

type Labels = {
  filterTitle: string;
  search: string;
  navProgram: string;
  filterAllPrograms: string;
  filterCategory: string;
  filterAllCategory: string;
  filterYear: string;
  filterAllYear: string;
  filterApply: string;
  readStory: string;
  navNewsAndActivity: string;
  noArticles: string;
  newsNoFilterResults: string;
  newsShowingCount: string;
  sortNewest: string;
  sortOldest: string;
  paginationNav: string;
  paginationPrevious: string;
  paginationNext: string;
};

type Props = {
  breadcrumb: BreadcrumbItem[];
  badge: string;
  heroHeading: string;
  readFullStoryLabel: string;
  featured: FeaturedArticle | null;
  /** Satu halaman hasil, bukan seluruh arsip. */
  articles: NewsArticleItem[];
  programOptions: FilterOption[];
  categoryOptions: FilterOption[];
  yearOptions: number[];
  filters: NewsFilters;
  page: PageInfo;
  locale: Locale;
  labels: Labels;
};

/** Di bawah ini, semua nomor halaman ditampilkan -- tidak ada yang perlu
 *  dipersingkat kalau daftarnya sendiri sudah pendek. */
const MAX_PAGE_BUTTONS_WITHOUT_ELLIPSIS = 7;

/**
 * Nomor mana yang tampil di navigasi halaman: selalu halaman pertama, halaman
 * terakhir, halaman aktif, dan tetangga langsungnya (±1) -- sisanya diringkas
 * jadi satu penanda "..." per celah. Daftar 18 halaman di halaman 1 jadi
 * "1 2 … 18", bukan 18 tombol berjejer.
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= MAX_PAGE_BUTTONS_WITHOUT_ELLIPSIS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const keep = new Set(
    [1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter(
      (p) => p >= 1 && p <= totalPages,
    ),
  );
  const sorted = [...keep].sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push('ellipsis');
    result.push(p);
    previous = p;
  }
  return result;
}

/**
 * Tautan ke /berita dengan filter saat ini, hanya menimpa yang disebut.
 *
 * Kunci yang nilainya kosong tidak ikut ditulis, jadi keadaan bawaan
 * menghasilkan "/berita" yang bersih, bukan "/berita?q=&year=&sort=newest".
 */
function hrefWithFilters(filters: NewsFilters, overrides: Record<string, string>): string {
  const values: Record<string, string> = {
    q: filters.search,
    year: filters.year,
    program: filters.program,
    category: filters.category,
    // "newest" adalah bawaan server, jadi tidak perlu disebut di URL.
    sort: filters.sort === 'oldest' ? 'oldest' : '',
    page: filters.page,
    ...overrides,
  };

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `/berita?${query}` : '/berita';
}

export function NewsExplorer({
  breadcrumb,
  badge,
  heroHeading,
  readFullStoryLabel,
  featured,
  articles,
  programOptions,
  categoryOptions,
  yearOptions,
  filters,
  page,
  locale,
  labels,
}: Props) {
  const hasFilter = Boolean(
    filters.search || filters.year || filters.program || filters.category,
  );
  const from = articles.length === 0 ? 0 : (page.current - 1) * page.size + 1;
  const to = articles.length === 0 ? 0 : from + articles.length - 1;

  const sortOptions = [
    { key: 'newest' as const, label: labels.sortNewest },
    { key: 'oldest' as const, label: labels.sortOldest },
  ];

  return (
    <>
      <NewsHero
        breadcrumb={breadcrumb}
        badge={badge}
        heading={heroHeading}
        featured={featured}
        readFullStoryLabel={readFullStoryLabel}
        filter={{
          title: labels.filterTitle,
          searchLabel: labels.search,
          programLabel: labels.navProgram,
          allProgramsLabel: labels.filterAllPrograms,
          categoryLabel: labels.filterCategory,
          allCategoryLabel: labels.filterAllCategory,
          yearLabel: labels.filterYear,
          allYearLabel: labels.filterAllYear,
          applyLabel: labels.filterApply,
        }}
        filterValues={{
          search: filters.search,
          program: filters.program,
          category: filters.category,
          year: filters.year,
        }}
        // Form GET menulis path apa adanya, jadi prefiks locale harus sudah
        // menempel di sini -- AppLink tidak ikut campur pada <form>.
        formAction={localizedPath('/berita', locale)}
        sort={filters.sort === 'oldest' ? 'oldest' : ''}
        programOptions={programOptions}
        categoryOptions={categoryOptions}
        yearOptions={yearOptions}
      />

      <Container as="div" className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              {labels.navNewsAndActivity}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-primary">
              {labels.newsShowingCount
                .replace('{from}', String(from))
                .replace('{to}', String(to))
                .replace('{total}', String(page.total))}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <AppLink
                key={option.key}
                // Ganti urutan selalu kembali ke halaman satu: halaman ke-12
                // dari urutan sebaliknya memuat artikel yang sama sekali lain,
                // dan mendarat di sana terasa seperti kehilangan tempat.
                href={hrefWithFilters(filters, {
                  sort: option.key === 'oldest' ? 'oldest' : '',
                  page: '',
                })}
                aria-current={filters.sort === option.key ? 'true' : undefined}
                className={cn(
                  'rounded-full border border-secondary px-5 py-1.5 text-sm font-medium',
                  filters.sort === option.key ? 'bg-secondary text-secondary-fg' : 'text-secondary',
                )}
              >
                {option.label}
              </AppLink>
            ))}
          </div>
        </div>

        {articles.length === 0 ? (
          <p className="mt-8 text-muted">
            {hasFilter ? labels.newsNoFilterResults : labels.noArticles}
          </p>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const image = resolveArticleImage(article.image);
              const category = article.category;

              return (
                <article key={article.slug} className="flex flex-col border border-border">
                  {image ? (
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={image}
                        alt=""
                        aria-hidden
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                      <time dateTime={article.publishedAt}>
                        {formatArticleDate(article.publishedAt, locale)}
                      </time>
                      {category ? ` · ${category.toUpperCase()}` : null}
                    </p>
                    <h3 className="text-lg font-bold text-primary">
                      <AppLink href={`/berita/${article.slug}`}>{article.title}</AppLink>
                    </h3>
                    <p className="text-sm text-muted">{article.excerpt}</p>
                    <AppLink
                      href={`/berita/${article.slug}`}
                      className="mt-auto inline-flex w-fit items-center rounded-md border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary hover:text-primary-fg"
                    >
                      {labels.readStory}
                    </AppLink>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {page.totalPages > 1 ? (
          <nav
            aria-label={labels.paginationNav}
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {/* Tautan, bukan tombol: tiap halaman kini punya alamatnya sendiri,
                bisa dibuka di tab baru dan ditelusuri perayap mesin pencari.
                Ujung daftar merender <span>, bukan tautan mati -- tautan yang
                menuju halaman yang sedang dibuka lebih membingungkan daripada
                tidak ada tautan sama sekali. */}
            {page.current === 1 ? (
              <span className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted opacity-50">
                {labels.paginationPrevious}
              </span>
            ) : (
              <AppLink
                href={hrefWithFilters(filters, {
                  page: page.current - 1 === 1 ? '' : String(page.current - 1),
                })}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted"
              >
                {labels.paginationPrevious}
              </AppLink>
            )}

            {getPageNumbers(page.current, page.totalPages).map((pageNumber, index) =>
              pageNumber === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center text-xs font-bold text-muted"
                >
                  …
                </span>
              ) : (
                <AppLink
                  key={pageNumber}
                  href={hrefWithFilters(filters, {
                    page: pageNumber === 1 ? '' : String(pageNumber),
                  })}
                  aria-current={pageNumber === page.current ? 'page' : undefined}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold',
                    pageNumber === page.current
                      ? 'border-secondary text-secondary'
                      : 'border-border text-muted',
                  )}
                >
                  {pageNumber}
                </AppLink>
              ),
            )}

            {page.current === page.totalPages ? (
              <span className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted opacity-50">
                {labels.paginationNext}
              </span>
            ) : (
              <AppLink
                href={hrefWithFilters(filters, { page: String(page.current + 1) })}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted"
              >
                {labels.paginationNext}
              </AppLink>
            )}
          </nav>
        ) : null}
      </Container>
    </>
  );
}
