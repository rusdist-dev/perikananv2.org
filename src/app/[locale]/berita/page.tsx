import { notFound } from 'next/navigation';
import Image from 'next/image';
import berita1 from '@/assets/berita/berita1.png';
import { Container } from '@/components/layout/Container';
import { NewsHero } from '@/components/news/NewsHero';
import { AppLink } from '@/components/ui/AppLink';
import { articleImages } from '@/data/article-images';
import { getArticles } from '@/lib/content';
import { formatArticleDate } from '@/lib/date';
import { cn } from '@/lib/cn';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

/**
 * Konsumen nyata seam konten. Ia mengimpor dari '@/lib/content' saja -- tidak
 * pernah dari src/data/*.json maupun lib/content/source. Aturan itu yang
 * membuat pindah ke CMS jadi perubahan satu file.
 */

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({ locale, path: '/berita', title: t.news });
}

// Grid 3x3 sesuai rancangan, dipakai untuk mengisi kartu di bawah.
const GRID_SIZE = 9;

const ELLIPSIS = '…';
const PAGE_BUTTONS: (number | typeof ELLIPSIS)[] = [1, 2, 3, 4, 5, 6, 7, 8, ELLIPSIS];

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const articles = await getArticles(locale);
  const [featured] = articles;

  // Tag "populer" diturunkan dari tag artikel sungguhan (bukan daftar
  // karangan) -- lihat schema.ts, satu-satunya sumber tag yang ada saat ini.
  const uniqueTags = [...new Set(articles.flatMap((article) => article.tags))];
  const visibleTags = uniqueTags.slice(0, 4);
  const moreTagsCount = uniqueTags.length - visibleTags.length;

  // Baru 3 artikel contoh yang ada (src/data/articles.json) -- diulang untuk
  // mengisi grid 3x3 seperti rancangan, bukan berarti ada 9 artikel berbeda.
  const gridArticles =
    articles.length > 0
      ? Array.from({ length: GRID_SIZE }, (_, i) => articles[i % articles.length])
      : [];

  const sortOptions = [
    { key: 'newest', label: t.sortNewest },
    { key: 'oldest', label: t.sortOldest },
    { key: 'mostRead', label: t.sortMostRead },
  ];

  return (
    <>
      <NewsHero
        breadcrumb={[
          { label: t.home, href: '/' },
          // Belum ada halaman indeks /connect -- "#" menyatakan itu apa
          // adanya, sama seperti breadcrumb program yang belum punya indeks.
          { label: t.navConnect, href: '#' },
          { label: t.navNewsAndActivity, href: '/berita' },
        ]}
        badge={t.navNewsAndActivity}
        heading={t.newsHeroHeading}
        readFullStoryLabel={t.readFullStory}
        featured={
          featured
            ? {
                // berita1.png dipasang langsung sebagai foto kartu unggulan --
                // bukan lewat ARTICLE_IMAGES, karena itu jembatan khusus foto
                // yang datang dari JSON, bukan foto hero yang ditata di sini.
                image: berita1,
                date: featured.publishedAt,
                category: featured.tags[0] ?? t.news,
                title: featured.title,
                excerpt: featured.excerpt,
                href: `/berita/${featured.slug}`,
              }
            : null
        }
        filter={{
          title: t.filterTitle,
          searchLabel: t.search,
          programLabel: t.navProgram,
          allProgramsLabel: t.filterAllPrograms,
          categoryLabel: t.filterCategory,
          allCategoryLabel: t.filterAllCategory,
          yearLabel: t.filterYear,
          allYearLabel: t.filterAllYear,
          popularTagsLabel: t.filterPopularTags,
          tags: visibleTags,
          moreTagsLabel: moreTagsCount > 0 ? t.filterMoreTags.replace('{count}', String(moreTagsCount)) : null,
          applyLabel: t.filterApply,
          unavailableNote: t.filterUnavailable,
        }}
      />

      <Container as="div" className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        {gridArticles.length === 0 ? (
          <p className="text-muted">{t.noArticles}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t.navNewsAndActivity}
                </p>
                {/* Angka di sini masih tampilan saja, sama seperti kontrol
                    nonaktif lain di NewsHero (pencarian, filter) -- belum ada
                    backend paginasi maupun artikel sungguhan sebanyak itu,
                    jadi tombol di bawah dinonaktifkan alih-alih berpura-pura
                    bisa mengganti halaman. */}
                <h2 className="mt-1 text-2xl font-semibold text-primary">
                  {t.newsShowingPlaceholder}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    disabled
                    className="rounded-full border border-secondary px-5 py-1.5 text-sm font-medium text-secondary disabled:cursor-not-allowed"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridArticles.map((article, index) => {
                const image = article.image ? articleImages[article.image] : undefined;
                const category = article.tags[0];

                return (
                  <article
                    key={`${article.slug}-${index}`}
                    className="flex flex-col border border-border"
                  >
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
                        {t.readStory}
                      </AppLink>
                    </div>
                  </article>
                );
              })}
            </div>

            <nav
              aria-label={t.paginationNav}
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                disabled
                className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted disabled:cursor-not-allowed"
              >
                {t.paginationPrevious}
              </button>
              {PAGE_BUTTONS.map((page, index) =>
                page === ELLIPSIS ? (
                  <span key={`ellipsis-${index}`} aria-hidden className="px-1 text-sm text-muted">
                    {ELLIPSIS}
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    disabled
                    aria-current={page === 1 ? 'page' : undefined}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold disabled:cursor-not-allowed',
                      page === 1 ? 'border-secondary text-secondary' : 'border-border text-muted',
                    )}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled
                className="rounded-full border border-border px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted disabled:cursor-not-allowed"
              >
                {t.paginationNext}
              </button>
            </nav>
          </>
        )}
      </Container>
    </>
  );
}
