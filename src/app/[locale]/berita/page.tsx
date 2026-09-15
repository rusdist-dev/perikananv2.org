import { notFound } from 'next/navigation';
import berita1 from '@/assets/berita/berita1.png';
import { resolveArticleImage } from '@/data/article-images';
import { NewsExplorer } from '@/components/news/NewsExplorer';
import { getArticles, getNewsCategories, getProgramOptions } from '@/lib/content';
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

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  // Opsi filter datang dari taksonomi CMS (/programs, /news-categories),
  // bukan diturunkan dari artikel yang kebetulan sudah ditarik: program atau
  // kategori yang belum punya berita pun tetap muncul, dan daftarnya tidak
  // ikut menyusut saat filter lain dipakai.
  const [articles, programOptions, newsCategories] = await Promise.all([
    getArticles(locale),
    getProgramOptions(locale),
    getNewsCategories(locale),
  ]);
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
              // Foto asli artikel (cover_url dari CMS) kalau ada; berita1.png
              // cuma jatuh balik untuk artikel yang belum punya cover, bukan
              // lagi dipasang tetap seperti saat kontennya masih contoh JSON.
              image: resolveArticleImage(featured.image) ?? berita1,
              date: featured.publishedAt,
              category: featured.category ?? t.news,
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
        category: article.category,
        // Slug, bukan nama: itu yang dicocokkan dengan nilai dropdown --
        // lihat komentar `categorySlug`/`programs` di lib/content/schema.ts.
        categorySlug: article.categorySlug,
        programs: article.programs,
      }))}
      programOptions={programOptions.map((option) => ({ value: option.value, label: option.label }))}
      categoryOptions={newsCategories.map((category) => ({
        value: category.slug,
        label: category.name,
      }))}
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
