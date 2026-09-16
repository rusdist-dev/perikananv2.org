import { notFound } from 'next/navigation';
import berita1 from '@/assets/berita/berita1.png';
import { resolveArticleImage } from '@/data/article-images';
import { NewsExplorer } from '@/components/news/NewsExplorer';
import {
  getNewestArticle,
  getNewsCategories,
  getNewsPage,
  getNewsYears,
  getProgramOptions,
  NEWS_PAGE_SIZE,
} from '@/lib/content';
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

/** Satu nilai dari searchParams; array (parameter yang muncul dua kali di
 *  URL) diambil yang pertama, bukan ditolak -- URL yang disunting tangan
 *  tidak boleh menjatuhkan halaman. */
function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

type NewsSearchParams = {
  q?: string | string[];
  year?: string | string[];
  program?: string | string[];
  category?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<NewsSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const sp = await searchParams;
  const filters = {
    search: one(sp.q),
    year: one(sp.year),
    program: one(sp.program),
    category: one(sp.category),
    sort: one(sp.sort) === 'oldest' ? ('oldest' as const) : ('newest' as const),
    page: one(sp.page),
  };

  const t = getDictionary(locale);
  // Opsi filter datang dari taksonomi CMS (/programs, /news-categories),
  // bukan diturunkan dari artikel yang kebetulan sudah ditarik: program atau
  // kategori yang belum punya berita pun tetap muncul, dan daftarnya tidak
  // ikut menyusut saat filter lain dipakai.
  //
  // `featured` sengaja artikel terbaru TANPA filter -- ia bagian dari hero
  // halaman, bukan bagian dari hasil pencarian, dan dulu pun begitu (diambil
  // dari daftar penuh sebelum filter klien bekerja).
  const [newsPage, newest, programOptions, newsCategories, yearOptions] = await Promise.all([
    getNewsPage(locale, filters),
    getNewestArticle(locale),
    getProgramOptions(locale),
    getNewsCategories(locale),
    getNewsYears(locale),
  ]);
  const featured = newest;

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
      /* Hanya satu halaman hasil yang dikirim ke klien -- sembilan kartu,
       * bukan seluruh arsip.
       *
       * Sampai CMS mendukung `search` dan `year`, halaman ini terpaksa
       * membawa 240 artikel (~34 KB gzip terukur) supaya panel filternya bisa
       * bekerja di browser. Sejak kedua parameter itu ada (docs/api-public.md),
       * seluruh filter dilayani server dan yang tersisa di klien hanyalah
       * merender apa yang sudah disaring. */
      articles={newsPage.articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        publishedAt: article.publishedAt,
        image: article.image,
        category: article.category,
      }))}
      filters={filters}
      yearOptions={yearOptions}
      page={{
        total: newsPage.total,
        totalPages: newsPage.totalPages,
        size: NEWS_PAGE_SIZE,
        current: Math.min(
          Math.max(1, Number.parseInt(filters.page || '1', 10) || 1),
          newsPage.totalPages,
        ),
      }}
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
