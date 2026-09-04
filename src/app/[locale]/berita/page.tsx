import { notFound } from 'next/navigation';
import berita1 from '@/assets/berita/berita1.png';
import { NewsExplorer } from '@/components/news/NewsExplorer';
import { getArticles } from '@/lib/content';
import { panelNav } from '@/lib/nav';
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

function programOptions(): string[] {
  const section = panelNav.find((s) => s.id === 'nav-program');
  if (!section) return [];
  return section.items
    .map((item) => item.label)
    .filter((label): label is string => typeof label === 'string');
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const articles = await getArticles(locale);
  const [featured] = articles;

  return (
    <NewsExplorer
      breadcrumb={[
        { label: t.home, href: '/' },
        // Belum ada halaman indeks /connect -- "#" menyatakan itu apa
        // adanya, sama seperti breadcrumb program yang belum punya indeks.
        { label: t.navConnect, href: '#' },
        { label: t.navNewsAndActivity, href: '/berita' },
      ]}
      badge={t.navNewsAndActivity}
      heroHeading={t.newsHeroHeading}
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
      articles={articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        publishedAt: article.publishedAt,
        tags: article.tags,
        image: article.image,
      }))}
      programOptions={programOptions()}
      locale={locale}
      labels={{
        filterTitle: t.filterTitle,
        search: t.search,
        navProgram: t.navProgram,
        filterAllPrograms: t.filterAllPrograms,
        filterCategory: t.filterCategory,
        filterAllCategory: t.filterAllCategory,
        filterYear: t.filterYear,
        filterAllYear: t.filterAllYear,
        filterPopularTags: t.filterPopularTags,
        filterApply: t.filterApply,
        readStory: t.readStory,
        navNewsAndActivity: t.navNewsAndActivity,
        noArticles: t.noArticles,
        newsNoFilterResults: t.newsNoFilterResults,
        newsShowingCount: t.newsShowingCount,
        sortNewest: t.sortNewest,
        sortOldest: t.sortOldest,
        paginationNav: t.paginationNav,
        paginationPrevious: t.paginationPrevious,
        paginationNext: t.paginationNext,
      }}
    />
  );
}
