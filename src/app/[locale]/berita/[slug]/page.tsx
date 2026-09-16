import { notFound } from 'next/navigation';
import Image from 'next/image';
import newsHeroBg from '@/assets/banner/ornament4.png';
import { Container } from '@/components/layout/Container';
import { ShareAndTags } from '@/components/news/ShareAndTags';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { resolveArticleImage } from '@/data/article-images';
import {
  getArticle,
  getArticleLocaleSlugs,
  getArticleRouteParams,
  getRelatedArticles,
  type ArticleListItem,
} from '@/lib/content';
import { getBodyParagraphs } from '@/lib/article-body';
import { formatArticleDate } from '@/lib/date';
import { stripHtml } from '@/lib/html';
import { estimateReadingMinutes } from '@/lib/reading-time';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { SetArticleLocaleAlternates } from '@/i18n/article-locale-alternates';
import { isLocale, type Locale } from '@/i18n/config';

/**
 * Rute dinamis yang href-nya dibangun dari data -- persis kasus yang
 * typedRoutes tidak bisa periksa (ia menuntut path literal). Yang menjaganya
 * scripts/check-links.mjs, dari sisi HTML hasil build.
 */

type Params = { locale: string; slug: string };

const RELATED_COUNT = 3;

/** Kartu ringkas dipakai HANYA di seksi "More From <kategori>" di bawah --
 *  bentuknya sama seperti kartu grid /berita, tapi diulang lokal di sini
 *  karena hanya satu tempat lagi yang memakainya sekarang. */
function RelatedCard({
  article,
  locale,
  t,
}: {
  article: ArticleListItem;
  locale: Locale;
  t: ReturnType<typeof getDictionary>;
}) {
  const image = resolveArticleImage(article.image);
  const category = article.category;

  return (
    <article className="flex flex-col border border-border">
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
}

/**
 * Artikel terbaru per bahasa saja yang dibangun saat build; sisanya dirender
 * saat pertama dibuka. Angkanya menutup halaman pertama /berita (9 kartu)
 * plus margin, jadi yang paling mungkin diklik lebih dulu sudah jadi.
 *
 * Alasannya bukan kecepatan build semata: mem-prerender 240 artikel x 2
 * bahasa membanjiri CMS sampai ia menjawab HTTP 500 dan build gagal -- lima
 * kali dicoba, dan kegagalan terendah pun masih menggagalkan seluruh build.
 * Lihat komentar getArticleRouteParams di lib/content.
 */
const PRERENDERED_PER_LOCALE = 12;

export async function generateStaticParams() {
  return getArticleRouteParams(PRERENDERED_PER_LOCALE);
}

/**
 * Default Next, ditulis eksplisit karena sekarang menanggung beban: slug yang
 * TIDAK ada di generateStaticParams dirender saat diminta, bukan dijawab 404.
 * Mengubahnya jadi false akan membuat 456 artikel sisanya hilang dari situs.
 */
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(slug, locale);
  if (!article) return {};
  return buildMetadata({
    locale,
    path: `/berita/${slug}`,
    title: article.title,
    description: article.excerpt,
  });
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const article = await getArticle(slug, locale);
  if (!article) notFound();

  const localeSlugs = await getArticleLocaleSlugs(article);

  const t = getDictionary(locale);
  const image = resolveArticleImage(article.image);
  const category = article.category;
  const readingMinutes = estimateReadingMinutes(stripHtml(article.body));
  const bodyParagraphs = getBodyParagraphs(article.body);

  // Diminta ke CMS sebanyak yang ditampilkan saja. Versi sebelumnya menarik
  // seluruh arsip lalu mengulang isinya kalau kurang dari RELATED_COUNT --
  // pengulangan itu peninggalan masa src/data/articles.json yang cuma berisi
  // tiga contoh; dengan 240 artikel sungguhan, daftar yang pendek berarti
  // programnya memang baru punya sedikit berita, dan menampilkan kartu yang
  // sama dua kali lebih buruk daripada menampilkan lebih sedikit kartu.
  const relatedArticles = await getRelatedArticles(article, locale, RELATED_COUNT);

  return (
    // lang di elemen artikel, bukan di <html>: kalau ini versi fallback,
    // isinya memang bahasa lain daripada sisa halaman.
    <article lang={article.lang !== locale ? article.lang : undefined}>
      <SetArticleLocaleAlternates alternates={localeSlugs} />

      {/* Latar biru + ornament4.png, sama seperti hero /berita (NewsHero). */}
      <section className="relative isolate overflow-hidden bg-primary text-primary-fg">
        <Image
          src={newsHeroBg}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover opacity-50 select-none"
        />

        <Container className="page-gutter relative py-10 lg:pe-(--spacing-panel-gutter) lg:py-14">
          <Breadcrumb
            tone="on-dark"
            items={[
              { label: t.home, href: '/' },
              { label: t.navNewsAndActivity, href: '/berita' },
              { label: article.title, href: `/berita/${article.slug}` },
            ]}
          />

          <h1 className="mt-6 max-w-3xl text-3xl font-semibold md:text-4xl">{article.title}</h1>

          <p className="mt-4 text-sm font-bold tracking-wide text-primary-fg/80">
            <time dateTime={article.publishedAt}>
              {formatArticleDate(article.publishedAt, locale)}
            </time>
            {category ? ` · ${category}` : null}
            {' · '}
            {t.minRead.replace('{count}', String(readingMinutes))}
          </p>
        </Container>
      </section>

      {image ? (
        // Tanpa Container: fotonya harus benar-benar tepi ke tepi, termasuk di
        // bawah panel navigasi kiri yang mengambang (position: fixed, z-40) --
        // bukan berhenti di gutter panel seperti konten teks di bawahnya.
        <div className="relative aspect-[16/9] lg:aspect-[21/9]">
          <Image
            src={image}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <Container className="page-gutter relative lg:pe-(--spacing-panel-gutter) py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
          <div className="max-w-content">
            <p className="text-lg text-muted">{article.excerpt}</p>
            {bodyParagraphs.map((paragraph, index) => (
              // body sudah disanitasi di lib/content/source.ts (mode CMS)
              // atau memang teks polos tanpa tag (mode lokal) -- dijamin
              // aman sebelum sampai sini, lihat komentar schema.ts `body`.
              <p
                key={index}
                className="mt-6 leading-relaxed text-fg"
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            ))}

            <p className="mt-12">
              <AppLink href="/berita" className="text-primary underline underline-offset-4">
                {t.news}
              </AppLink>
            </p>
          </div>

          <ShareAndTags
            heading={t.shareAndTags}
            shareLabel={t.share}
            copyLabel={t.copyLink}
            copiedLabel={t.linkCopied}
            sortLabels={{ newest: t.sortNewest, oldest: t.sortOldest, mostRead: t.sortMostRead }}
            tags={article.tags}
          />
        </div>

        {relatedArticles.length > 0 ? (
          <div className="mt-12 border-t-2 border-secondary pt-12">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              {t.relatedStory}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-primary">
              {t.moreFromCategory.replace('{category}', category ?? t.news)}
            </h2>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related, index) => (
                <RelatedCard
                  key={`${related.slug}-${index}`}
                  article={related}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </article>
  );
}
