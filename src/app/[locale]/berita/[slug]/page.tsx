import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { getArticle, getArticleSlugs } from '@/lib/content';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale, locales } from '@/i18n/config';

/**
 * Rute dinamis yang href-nya dibangun dari data -- persis kasus yang
 * typedRoutes tidak bisa periksa (ia menuntut path literal). Yang menjaganya
 * scripts/check-links.mjs, dari sisi HTML hasil build.
 */

type Params = { locale: string; slug: string };

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

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

  const t = getDictionary(locale);

  return (
    <Container as="article" width="content" className="py-16">
      {/* lang di elemen artikel, bukan di <html>: kalau ini versi fallback,
          isinya memang bahasa lain daripada sisa halaman. */}
      <div lang={article.lang !== locale ? article.lang : undefined}>
        <h1 className="text-3xl font-semibold text-fg">{article.title}</h1>
        <time dateTime={article.publishedAt} className="mt-2 block text-sm text-muted">
          {article.publishedAt}
        </time>
        <p className="mt-6 text-lg text-muted">{article.excerpt}</p>
        <p className="mt-6 text-fg">{article.body}</p>
      </div>

      <p className="mt-12">
        <AppLink href="/berita" className="text-primary underline underline-offset-4">
          {t.news}
        </AppLink>
      </p>
    </Container>
  );
}
