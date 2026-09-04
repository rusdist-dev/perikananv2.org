'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { articleImages } from '@/data/article-images';
import { AppLink } from '@/components/ui/AppLink';
import { Container } from '@/components/layout/Container';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { NewsHero, type FeaturedArticle } from './NewsHero';
import { formatArticleDate } from '@/lib/date';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/config';

export type NewsArticleItem = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: string[];
  image: string | null;
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
  filterPopularTags: string;
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
  articles: NewsArticleItem[];
  programOptions: string[];
  locale: Locale;
  labels: Labels;
};

type Filters = { search: string; program: string; category: string; year: string };

const PAGE_SIZE = 9;

/** Membuang diakritik dan menyeragamkan kapital, sama seperti SearchableSelect/lib/search. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '');
}

export function NewsExplorer({
  breadcrumb,
  badge,
  heroHeading,
  readFullStoryLabel,
  featured,
  articles,
  programOptions,
  locale,
  labels,
}: Props) {
  const [filters, setFilters] = useState<Filters>({ search: '', program: 'all', category: 'all', year: 'all' });
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  // Tag "populer" diturunkan dari tag artikel sungguhan yang ada, bukan daftar karangan.
  const categoryOptions = useMemo(() => [...new Set(articles.flatMap((a) => a.tags))], [articles]);
  const popularTags = categoryOptions.slice(0, 5);
  const yearOptions = useMemo(
    () => [...new Set(articles.map((a) => new Date(a.publishedAt).getFullYear()))].sort((a, b) => b - a),
    [articles],
  );

  const updateFilters = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleTagClick = (tag: string) => {
    updateFilters({ category: filters.category === tag ? 'all' : tag });
  };

  const filtered = useMemo(() => {
    const terms = normalize(filters.search).split(/\s+/).filter(Boolean);
    return articles.filter((article) => {
      if (filters.program !== 'all' && !article.tags.includes(filters.program)) return false;
      if (filters.category !== 'all' && !article.tags.includes(filters.category)) return false;
      if (
        filters.year !== 'all' &&
        new Date(article.publishedAt).getFullYear() !== Number(filters.year)
      ) {
        return false;
      }
      if (terms.length > 0) {
        const haystack = normalize(`${article.title} ${article.excerpt} ${article.tags.join(' ')}`);
        if (!terms.every((term) => haystack.includes(term))) return false;
      }
      return true;
    });
  }, [articles, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) =>
      sort === 'newest' ? b.publishedAt.localeCompare(a.publishedAt) : a.publishedAt.localeCompare(b.publishedAt),
    );
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = sorted.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, sorted.length);

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
          popularTagsLabel: labels.filterPopularTags,
          applyLabel: labels.filterApply,
        }}
        filterValues={filters}
        programOptions={programOptions}
        categoryOptions={categoryOptions}
        yearOptions={yearOptions}
        popularTags={popularTags}
        onSearchChange={(value) => updateFilters({ search: value })}
        onProgramChange={(value) => updateFilters({ program: value })}
        onCategoryChange={(value) => updateFilters({ category: value })}
        onYearChange={(value) => updateFilters({ year: value })}
        onTagClick={handleTagClick}
        onApply={(event) => event.preventDefault()}
      />

      <Container as="div" className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        {articles.length === 0 ? (
          <p className="text-muted">{labels.noArticles}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {labels.navNewsAndActivity}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-primary">
                  {labels.newsShowingCount
                    .replace('{from}', String(from))
                    .replace('{to}', String(to))
                    .replace('{total}', String(sorted.length))}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: 'newest' as const, label: labels.sortNewest },
                    { key: 'oldest' as const, label: labels.sortOldest },
                  ]
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSort(option.key)}
                    aria-pressed={sort === option.key}
                    className="rounded-full border border-secondary px-5 py-1.5 text-sm font-medium text-secondary aria-pressed:bg-secondary aria-pressed:text-secondary-fg"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {pageItems.length === 0 ? (
              <p className="mt-8 text-muted">{labels.newsNoFilterResults}</p>
            ) : (
              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((article) => {
                  const image = article.image ? articleImages[article.image] : undefined;
                  const category = article.tags[0];

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

            {totalPages > 1 ? (
              <nav
                aria-label={labels.paginationNav}
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {labels.paginationPrevious}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold',
                      pageNumber === currentPage ? 'border-secondary text-secondary' : 'border-border text-muted',
                    )}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {labels.paginationNext}
                </button>
              </nav>
            ) : null}
          </>
        )}
      </Container>
    </>
  );
}
