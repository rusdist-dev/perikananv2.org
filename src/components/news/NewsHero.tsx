import Image, { type StaticImageData } from 'next/image';
import newsHeroBg from '@/assets/banner/ornament4.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { Icon } from '@/components/ui/Icon';

export type FeaturedArticle = {
  // string = URL absolut (cover_url dari CMS); StaticImageData = foto lokal
  // yang di-import statis (lihat berita/page.tsx). next/image menerima
  // keduanya sebagai src.
  image: StaticImageData | string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
};

/** Opsi dropdown filter. `value` selalu slug taksonomi CMS -- yang
 *  dicocokkan dengan artikel; `label` yang dibaca pengunjung. Dulu keduanya
 *  satu string yang sama (nama program), yang memaksa pencocokan lewat nama. */
export type FilterOption = { value: string; label: string };

type FilterLabels = {
  title: string;
  searchLabel: string;
  programLabel: string;
  allProgramsLabel: string;
  categoryLabel: string;
  allCategoryLabel: string;
  yearLabel: string;
  allYearLabel: string;
  applyLabel: string;
};

export type FilterValues = {
  search: string;
  program: string;
  category: string;
  year: string;
};

type NewsHeroProps = {
  breadcrumb: BreadcrumbItem[];
  badge: string;
  heading: string;
  featured: FeaturedArticle | null;
  readFullStoryLabel: string;
  filter: FilterLabels;
  filterValues: FilterValues;
  programOptions: FilterOption[];
  categoryOptions: FilterOption[];
  yearOptions: number[];
  /** Tujuan form filter, sudah berprefiks locale. Panel ini kini form GET
   *  biasa: filternya hidup di URL, bukan di state komponen, jadi hasil
   *  saringan bisa ditautkan, di-bookmark, dan tetap bekerja tanpa JavaScript. */
  formAction: string;
  /** Ikut terkirim sebagai field tersembunyi supaya pilihan urutan tidak
   *  hilang begitu pengunjung menerapkan filter. */
  sort: string;
};

/** Hero /berita: latar biru + ornament4.png (ilustrasi kawanan ikan navy/putih)
 *  menaungi breadcrumb, badge, judul, kartu artikel unggulan, dan panel
 *  filter -- yang sekarang benar-benar menyaring grid di bawahnya (lihat
 *  NewsExplorer, pemilik state filter ini). */
export function NewsHero({
  breadcrumb,
  badge,
  heading,
  featured,
  readFullStoryLabel,
  filter,
  filterValues,
  formAction,
  sort,
  programOptions,
  categoryOptions,
  yearOptions,
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

            <form
              method="get"
              action={formAction}
              className="flex flex-col gap-4 rounded-lg bg-white p-6 text-fg"
            >
              <h2 className="text-lg font-bold text-primary">{filter.title}</h2>

              {/* Tanpa ini, menerapkan filter diam-diam mengembalikan urutan
                  ke "terbaru" -- form GET hanya mengirim field yang ada di
                  dalamnya. Halaman sengaja TIDAK ikut dikirim: filter baru
                  selalu wajar dimulai dari halaman satu. */}
              <input type="hidden" name="sort" value={sort} />

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="news-filter-search"
                  className="text-xs font-bold tracking-wide text-muted uppercase"
                >
                  {filter.searchLabel}
                </label>
                <input
                  id="news-filter-search"
                  name="q"
                  type="search"
                  defaultValue={filterValues.search}
                  placeholder={`${filter.searchLabel}…`}
                  className="rounded-md border border-border px-3 py-2 text-sm"
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
                  name="program"
                  defaultValue={filterValues.program}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  <option value="">{filter.allProgramsLabel}</option>
                  {programOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  name="category"
                  defaultValue={filterValues.category}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  <option value="">{filter.allCategoryLabel}</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  name="year"
                  defaultValue={filterValues.year}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  <option value="">{filter.allYearLabel}</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Blok "Popular Tags" sengaja dilepas: isinya diturunkan dari
                  tag artikel, yang sama persis dengan isi dropdown Program dan
                  Kategori di atas -- dua kendali untuk pekerjaan yang sama.
                  Kalau suatu saat dibutuhkan lagi, ambil dari riwayat git. */}

              <button
                type="submit"
                className="mt-2 rounded-md bg-primary px-4 py-2 text-xs font-bold tracking-wide text-primary-fg uppercase hover:opacity-90"
              >
                {filter.applyLabel}
              </button>
            </form>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
