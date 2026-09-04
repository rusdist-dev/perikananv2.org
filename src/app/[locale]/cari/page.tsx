import { notFound } from 'next/navigation';
import Image from 'next/image';
import wave2 from '@/assets/banner/wave2.png';
import waveBg from '@/assets/banner/bg_wave1.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Icon } from '@/components/ui/Icon';
import { SearchResults } from '@/components/search/SearchResults';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { defaultLocale, isLocale } from '@/i18n/config';
import { localizedPath } from '@/i18n/routing';
import { panelNav } from '@/lib/nav';
import { site } from '@/lib/site';
import { searchContent, suggestCorrection } from '@/lib/search';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

function readQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? '').trim();
}

function programOptions(): string[] {
  const section = panelNav.find((s) => s.id === 'nav-program');
  if (!section) return [];
  return section.items
    .map((item) => item.label)
    .filter((label): label is string => typeof label === 'string');
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const query = readQuery((await searchParams).q);
  const title = query ? t.searchHeadingWithQuery.replace('{query}', query) : t.searchPromptHeading;
  return buildMetadata({ locale, path: '/cari', title });
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const query = readQuery((await searchParams).q);
  const results = query ? await searchContent(locale, query) : [];
  const suggestion = query && results.length === 0 ? suggestCorrection(query) : null;

  const dateLocale = locale === 'id' ? 'id-ID' : 'en-US';
  const siteHost = site.url.replace(/^https?:\/\//, '');
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`;

  return (
    <>
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
          <Image
            src={wave2}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="pointer-events-none object-cover opacity-10 select-none"
          />
        </div>

        <Container className="page-gutter relative pt-10 pb-16 lg:pe-(--spacing-panel-gutter) lg:pb-24">
          <Breadcrumb
            items={[
              { label: t.home, href: '/' },
              { label: t.search, href: '/cari' },
            ]}
          />

          <span className="mt-4 inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
            {t.search}
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl leading-tight text-primary sm:text-5xl">
            {query ? t.searchHeadingWithQuery.replace('{query}', query) : t.searchPromptHeading}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            {query && results.length > 0
              ? t.searchSummary.replace('{count}', String(results.length))
              : t.searchPromptBody}
          </p>

          <form
            action={localizedPath('/cari', locale)}
            role="search"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="search-q" className="sr-only">
              {t.search}
            </label>
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder={t.searchPagePlaceholder}
              className="w-full rounded-md border border-border bg-bg px-4 py-3 text-sm text-fg placeholder:text-muted sm:flex-1"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-primary px-8 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90"
            >
              {t.search}
            </button>
          </form>

          {query && results.length > 0 ? (
            <SearchResults
              results={results}
              programOptions={programOptions()}
              dateLocale={dateLocale}
              siteHost={siteHost}
              localePrefix={localePrefix}
              labels={{
                tabAll: t.tabAll,
                typeProgram: t.typeProgram,
                typePublication: t.typePublication,
                typeNews: t.news,
                filterTitle: t.filterTitle,
                filterContentType: t.filterContentType,
                filterAllTypes: t.filterAllTypes,
                navProgram: t.navProgram,
                filterAllPrograms: t.filterAllPrograms,
                filterYear: t.filterYear,
                filterAllYear: t.filterAllYear,
                filterRelatedSearches: t.filterRelatedSearches,
                resultOpen: t.resultOpen,
              }}
            />
          ) : null}
        </Container>
      </div>

      {query && results.length === 0 ? (
        <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
          <Image
            src={wave2}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="pointer-events-none -z-10 object-cover select-none"
          />

          <Container className="page-gutter relative py-16 lg:pe-(--spacing-panel-gutter) lg:py-24">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-fg/80">
              {t.searchEmptyEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{t.searchEmptyHeading}</h2>

            <div className="mt-8 rounded-2xl bg-bg p-8 text-center sm:p-12">
              <p className="text-lg font-bold text-primary">
                {t.searchEmptyNoResults.replace('{query}', query)}
              </p>

              <span className="mx-auto mt-4 grid size-14 place-items-center rounded-full bg-secondary/10 text-secondary">
                <Icon id="search" className="text-2xl" />
              </span>

              <p className="mx-auto mt-4 max-w-md text-sm text-muted">
                {suggestion ? t.searchEmptySuggestion.replace('{suggestion}', suggestion) : t.searchEmptyGeneric}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {suggestion ? (
                  <AppLink
                    href={`/cari?q=${encodeURIComponent(suggestion)}`}
                    className="rounded-md bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90"
                  >
                    {t.searchEmptySearchSuggestion.replace('{suggestion}', suggestion)}
                  </AppLink>
                ) : null}
                <AppLink
                  href="/"
                  className="rounded-md border border-border px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary hover:bg-surface"
                >
                  {t.searchEmptyBrowsePrograms}
                </AppLink>
                <AppLink
                  href="/discover/publications"
                  className="rounded-md border border-border px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary hover:bg-surface"
                >
                  {t.searchEmptyPublicationLibrary}
                </AppLink>
              </div>
            </div>
          </Container>
        </div>
      ) : null}
    </>
  );
}
