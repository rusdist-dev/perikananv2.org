import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { getArticles } from '@/lib/content';
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
  const articles = await getArticles(locale);

  return (
    <Container as="div" width="content" className="py-16">
      <h1 className="text-3xl font-semibold text-fg">{t.news}</h1>

      {articles.length === 0 ? (
        <p className="mt-6 text-muted">{t.noArticles}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-8">
          {articles.map((article) => (
            <li key={article.slug}>
              <article>
                <h2 className="text-xl font-medium text-fg">
                  <AppLink href={`/berita/${article.slug}`}>{article.title}</AppLink>
                </h2>
                <time dateTime={article.publishedAt} className="mt-1 block text-sm text-muted">
                  {article.publishedAt}
                </time>
                <p className="mt-2 text-muted">{article.excerpt}</p>
                {/* Artikel yang belum diterjemahkan tetap tampil (fallback di
                    lib/content), tapi bahasanya ditandai supaya screen reader
                    berganti suara dan tidak membaca Indonesia dengan fonetik
                    Inggris. */}
                {article.lang !== locale ? (
                  <p lang={article.lang} className="mt-2 text-xs text-muted">
                    {article.lang}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
