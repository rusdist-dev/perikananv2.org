'use client';

import { useMemo, useState } from 'react';
import { AppLink } from '@/components/ui/AppLink';
import type { SearchResult, SearchResultType } from '@/lib/search';

type TabValue = 'all' | SearchResultType;

type Labels = {
  tabAll: string;
  typeProgram: string;
  typePublication: string;
  typeNews: string;
  filterTitle: string;
  filterContentType: string;
  filterAllTypes: string;
  navProgram: string;
  filterAllPrograms: string;
  filterYear: string;
  filterAllYear: string;
  filterRelatedSearches: string;
  resultOpen: string;
};

type Props = {
  results: SearchResult[];
  programOptions: string[];
  labels: Labels;
  dateLocale: string;
  siteHost: string;
  localePrefix: string;
};

const TYPE_ORDER: SearchResultType[] = ['program', 'publication', 'news'];

function TypeIcon({ type }: { type: SearchResultType }) {
  if (type === 'program') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
        <path d="M12 3c4 3 6 6 6 10a6 6 0 0 1-12 0c0-4 2-7 6-10Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'publication') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
        <path
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 17.5v-12Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
      <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function typeLabel(type: SearchResultType, labels: Labels): string {
  if (type === 'program') return labels.typeProgram;
  if (type === 'publication') return labels.typePublication;
  return labels.typeNews;
}

export function SearchResults({ results, programOptions, labels, dateLocale, siteHost, localePrefix }: Props) {
  const [activeType, setActiveType] = useState<TabValue>('all');
  const [program, setProgram] = useState<string>('all');
  const [year, setYear] = useState<string>('all');

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const r of results) if (r.year !== null) set.add(r.year);
    return [...set].sort((a, b) => b - a);
  }, [results]);

  const matchesProgram = (r: SearchResult) =>
    program === 'all' ||
    r.tags.some((tag) => tag.toLowerCase().includes(program.toLowerCase())) ||
    `${r.title} ${r.description}`.toLowerCase().includes(program.toLowerCase());

  const matchesYear = (r: SearchResult) => year === 'all' || r.year === Number(year);

  const afterFilters = useMemo(
    () => results.filter((r) => matchesProgram(r) && matchesYear(r)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [results, program, year],
  );

  const counts = useMemo(() => {
    const base: Record<TabValue, number> = { all: afterFilters.length, program: 0, publication: 0, news: 0 };
    for (const r of afterFilters) base[r.type] += 1;
    return base;
  }, [afterFilters]);

  const visible = activeType === 'all' ? afterFilters : afterFilters.filter((r) => r.type === activeType);

  const relatedSearches = useMemo(() => {
    const terms = new Set<string>();
    for (const r of afterFilters) {
      for (const tag of r.tags) terms.add(tag);
    }
    return [...terms].slice(0, 6);
  }, [afterFilters]);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem] lg:items-start">
      <div>
        <div className="relative flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-border pb-4">
          {(['all', ...TYPE_ORDER] as TabValue[]).map((tab) => {
            const isActive = activeType === tab;
            const count = counts[tab];
            const label = tab === 'all' ? labels.tabAll : typeLabel(tab, labels);
            if (isActive) {
              return (
                <div key={tab} className="relative pb-2">
                  <button type="button" className="text-sm font-bold uppercase tracking-wide text-primary">
                    {label} ({count})
                  </button>
                  <span aria-hidden className="absolute inset-x-0 -bottom-4 h-0.5 bg-secondary" />
                </div>
              );
            }
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveType(tab)}
                className="rounded-full border border-secondary px-4 py-1.5 text-sm font-medium text-secondary hover:bg-secondary hover:text-secondary-fg"
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <ul className="mt-8 flex flex-col">
          {visible.map((result, index) => (
            <li key={`${result.type}-${result.href}-${index}`} className="border-b border-border py-6 first:pt-0">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary/10 text-secondary">
                  <TypeIcon type={result.type} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-secondary">
                    {typeLabel(result.type, labels)}
                    {result.meta ? ` · ${result.meta}` : ''}
                  </p>
                  <AppLink
                    href={result.href}
                    className="mt-1 block text-lg font-bold text-primary hover:underline"
                  >
                    {result.title}
                  </AppLink>
                  <p className="mt-1 text-sm text-muted">{result.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    {result.publishedAt
                      ? `${new Date(result.publishedAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' })} · `
                      : ''}
                    {siteHost}
                    {localePrefix}
                    {result.href}
                  </p>
                </div>

                <AppLink
                  href={result.href}
                  className="shrink-0 rounded-md border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary hover:text-primary-fg"
                >
                  {labels.resultOpen}
                </AppLink>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-5 rounded-lg bg-surface p-6">
        <h2 className="text-lg font-bold text-primary">{labels.filterTitle}</h2>

        <div>
          <label htmlFor="filter-type" className="block text-xs font-bold uppercase tracking-wide text-muted">
            {labels.filterContentType}
          </label>
          <select
            id="filter-type"
            value={activeType}
            onChange={(event) => setActiveType(event.target.value as TabValue)}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg"
          >
            <option value="all">{labels.filterAllTypes}</option>
            <option value="program">{labels.typeProgram}</option>
            <option value="publication">{labels.typePublication}</option>
            <option value="news">{labels.typeNews}</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-program" className="block text-xs font-bold uppercase tracking-wide text-muted">
            {labels.navProgram}
          </label>
          <select
            id="filter-program"
            value={program}
            onChange={(event) => setProgram(event.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg"
          >
            <option value="all">{labels.filterAllPrograms}</option>
            {programOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-year" className="block text-xs font-bold uppercase tracking-wide text-muted">
            {labels.filterYear}
          </label>
          <select
            id="filter-year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg"
          >
            <option value="all">{labels.filterAllYear}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {relatedSearches.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{labels.filterRelatedSearches}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {relatedSearches.map((term) => (
                <AppLink
                  key={term}
                  href={`/cari?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-bold uppercase tracking-wide text-secondary hover:bg-secondary hover:text-secondary-fg"
                >
                  {term}
                </AppLink>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
