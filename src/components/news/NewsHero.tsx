import Image, { type StaticImageData } from 'next/image';
import newsHeroBg from '@/assets/banner/ornament4.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { Icon } from '@/components/ui/Icon';

export type FeaturedArticle = {
  image: StaticImageData;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
};

type FilterLabels = {
  title: string;
  searchLabel: string;
  programLabel: string;
  allProgramsLabel: string;
  categoryLabel: string;
  allCategoryLabel: string;
  yearLabel: string;
  allYearLabel: string;
  popularTagsLabel: string;
  tags: string[];
  moreTagsLabel: string | null;
  applyLabel: string;
  unavailableNote: string;
};

type NewsHeroProps = {
  breadcrumb: BreadcrumbItem[];
  badge: string;
  heading: string;
  featured: FeaturedArticle | null;
  readFullStoryLabel: string;
  filter: FilterLabels;
};

/** Hero /berita: latar biru + ornament4.png (ilustrasi kawanan ikan navy/putih)
 *  menaungi breadcrumb, badge, judul, kartu artikel unggulan, dan panel
 *  filter. Panel filter sengaja non-fungsional (disabled + catatan) --
 *  belum ada dimensi program/kategori/tahun di schema artikel, jadi kontrol
 *  yang terlihat aktif tapi tidak benar-benar menyaring lebih menyesatkan
 *  daripada kontrol yang menyatakan diri belum tersedia (§4j). */
export function NewsHero({
  breadcrumb,
  badge,
  heading,
  featured,
  readFullStoryLabel,
  filter,
}: NewsHeroProps) {
  return (
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
        <Breadcrumb items={breadcrumb} tone="on-dark" />

        <span className="mt-6 inline-block rounded-full border border-primary-fg/70 px-5 py-1.5 text-xs font-bold tracking-wider text-primary-fg uppercase">
          {badge}
        </span>

        <h1 className="mt-6 max-w-2xl text-3xl font-semibold md:text-4xl">{heading}</h1>

        {featured ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
            <article className="overflow-hidden rounded-lg bg-white text-fg">
              <div className="relative aspect-[16/9]">
                <Image
                  src={featured.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 p-6">
                <p className="text-xs font-bold tracking-wide text-secondary uppercase">
                  {featured.date} · {featured.category}
                </p>
                <h2 className="text-xl font-semibold text-primary md:text-2xl">
                  {featured.title}
                </h2>
                <p className="text-sm text-muted">{featured.excerpt}</p>
                <AppLink
                  href={featured.href}
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-6 py-3 text-xs font-bold tracking-wide text-primary-fg uppercase hover:opacity-90"
                >
                  {readFullStoryLabel}
                  <Icon id="arrow-right" />
                </AppLink>
              </div>
            </article>

            <div className="flex flex-col gap-4 rounded-lg bg-white p-6 text-fg">
              <h2 className="text-lg font-bold text-primary">{filter.title}</h2>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="news-filter-search"
                  className="text-xs font-bold tracking-wide text-muted uppercase"
                >
                  {filter.searchLabel}
                </label>
                <input
                  id="news-filter-search"
                  type="search"
                  disabled
                  placeholder={`${filter.searchLabel}…`}
                  aria-describedby="news-filter-note"
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="news-filter-program"
                  className="text-xs font-bold tracking-wide text-muted uppercase"
                >
                  {filter.programLabel}
                </label>
                <select
                  id="news-filter-program"
                  disabled
                  aria-describedby="news-filter-note"
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface"
                >
                  <option>{filter.allProgramsLabel}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="news-filter-category"
                  className="text-xs font-bold tracking-wide text-muted uppercase"
                >
                  {filter.categoryLabel}
                </label>
                <select
                  id="news-filter-category"
                  disabled
                  aria-describedby="news-filter-note"
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface"
                >
                  <option>{filter.allCategoryLabel}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="news-filter-year"
                  className="text-xs font-bold tracking-wide text-muted uppercase"
                >
                  {filter.yearLabel}
                </label>
                <select
                  id="news-filter-year"
                  disabled
                  aria-describedby="news-filter-note"
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface"
                >
                  <option>{filter.allYearLabel}</option>
                </select>
              </div>

              {filter.tags.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold tracking-wide text-muted uppercase">
                    {filter.popularTagsLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filter.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                    {filter.moreTagsLabel ? (
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                        {filter.moreTagsLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                disabled
                aria-describedby="news-filter-note"
                className="mt-2 rounded-md bg-primary px-4 py-2 text-xs font-bold tracking-wide text-primary-fg uppercase disabled:cursor-not-allowed disabled:opacity-60"
              >
                {filter.applyLabel}
              </button>
              <p id="news-filter-note" className="text-xs text-muted">
                {filter.unavailableNote}
              </p>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
