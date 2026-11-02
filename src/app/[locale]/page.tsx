import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import contohPeta from '@/assets/our_impact1.png';
import ornamentBg from '@/assets/banner/ornament1.png';
import ornamentBoat from '@/assets/banner/ornament2.png';
import waveBg from '@/assets/banner/bg_wave1.png';
import wave2 from '@/assets/banner/wave2.png';
import { ProgramSlider } from '@/components/home/ProgramSlider';
import { HomePublicationsGrid } from '@/components/home/HomePublicationsGrid';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Icon } from '@/components/ui/Icon';
import { getLatestArticles, getPublications } from '@/lib/content';
import { getProgramsLabel } from '@/lib/content/program-taxonomy';
import { formatArticleDate } from '@/lib/date';
import { getDictionary, type Dictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';
import { programMeta } from '@/data/programs';
import { resolveArticleImage } from '@/data/article-images';
import { site } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/' });
}

/** "06" ditulis apa adanya (string, bukan number) supaya nol di depannya
 *  tidak hilang -- persis seperti pada rancangannya. */
function getImpactStats(t: Dictionary) {
  return [
    { value: '23', label: t.impactStatMarineProtectedAreas },
    { value: '6', label: t.impactStatAreaBasedManagement },
    { value: '8', label: t.impactStatFisheriesManagementAreas },
    { value: '72', label: t.impactStatCommunityGroups },
    { value: '52', label: t.impactStatFieldEnumerators },
    { value: '30', label: t.impactStatStudentInternships },
  ];
}

/** Tiga kartu berita di beranda. Dipakai langsung sebagai `per_page` ke CMS,
 *  bukan memotong daftar panjang setelah ditarik. */
const HOME_ARTICLE_COUNT = 3;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const articles = await getLatestArticles(locale, HOME_ARTICLE_COUNT);
  const publications = (await getPublications()).slice(0, 3);

  // Urutan & label slide ikut panelNav (lib/nav.ts) apa adanya -- programMeta
  // cuma menambahkan ikon dan deskripsi yang tidak dimiliki data navigasi.
  const programSlides = panelNav
    .find((section) => section.id === 'nav-program')!
    .items.map((item) => ({
      href: item.href,
      title: item.labelKey ? t[item.labelKey] : item.label,
      ...programMeta[item.href],
    }));

  return (
    // `isolate` membuat stacking context sendiri, jadi ornamen ber-z-negatif
    // berhenti di belakang seksi ini -- tanpa itu ia tenggelam ke belakang
    // latar halaman dan hilang sama sekali.
    <div className="relative isolate">
      {/* Ornamen dekoratif: alt kosong DAN aria-hidden, supaya screen reader
          tidak mengumumkan gambar yang tidak menyampaikan informasi apa pun.

          next/image, bukan CSS background-image: sumbernya PNG 683 KB, dan
          hanya lewat next/image ia dikonversi ke AVIF/WebP dan diperkecil
          sesuai lebar layar. `background-image` menyajikan PNG itu apa adanya.

          object-contain + object-right adalah padanan bg-contain + bg-right.

          `hidden lg:block` BUKAN selera. Di 390px kolom teks selebar 350px dari
          total 390px, jadi ornamen yang diposisikan kanan pasti berada tepat di
          bawah glyph. Diukur pada halaman jadi: teks #224275 di atas piksel
          tergelapnya menghasilkan 1,56:1 untuk h1 dan 1,16:1 untuk paragraf --
          jauh di bawah ambang AA 4,5:1, praktis tak terbaca.

          Di >= lg kolom teks berhenti di 46rem sementara ornamen menempel di
          kanan, dan pengukuran yang sama memberi 9,98:1: tidak ada satu piksel
          ornamen pun di bawah teks. Ambang lg-lah batas nyata itu.

          Kalau ornamen harus tetap tampil di ponsel, dua jalan yang sudah
          terukur: turunkan opasitasnya ke <= 0,35 (di situ piksel tergelapnya
          baru lolos 4,5:1), atau pindahkan ke bawah teks dengan object-bottom
          plus padding-bottom yang cukup. */}

      {/* `relative` DI SINI yang membatasi ornamen.
          <Image fill> mengukur dirinya dari ancestor ber-position terdekat --
          tanpa `relative` di Container, ia melompat ke <div relative isolate>
          terluar dan membentang sampai ke seksi kedua di bawah.
          `isolate` menahan z-index negatifnya agar berhenti di dalam kotak ini. */}
      {/* min-h-screen hanya dari lg ke atas. Di ponsel ornamen hero disembunyikan
          (lihat komentar panjang di atas), jadi satu layar penuh berisi tiga
          baris teks dan sisanya kosong -- pengunjung harus menggulir melewati
          ~440px ruang hampa sebelum isi halaman dimulai. */}
      {/* Empat angka hero diturunkan dari SATU sumber, bukan ditulis sendiri-
          sendiri. Sebelumnya lebar ornamen dan ukuran judul sama-sama memakai
          vw tapi tidak saling tahu, jadi di lebar tertentu keduanya mendarat di
          titik yang sama: "OCEAN" menimpa ilustrasi dan strip program menabrak
          garis ombaknya.

          Sekarang --hero-col (ruang yang TERSISA untuk teks setelah panel nav,
          ornamen, dan jaraknya) yang jadi penentu, dan ukuran judul dibatasi
          olehnya. Pembagi 3.6 adalah lebar "OCEAN" relatif terhadap font-size-
          nya pada Montserrat ExtraBold (terukur 3.575, dibulatkan ke atas
          sebagai margin aman) -- kata ini ditulis langsung di markup, jadi
          angkanya tetap selama katanya tetap.

          60vw-24rem untuk lebar ornamen, bukan 44vw: ornamen harus menyusut
          lebih cepat daripada layarnya supaya di laptop 1024-1280px masih ada
          kolom yang layak buat judul, sementara di layar lebar ia tetap tumbuh. */}
      <Container
        as="div"
        className="page-gutter relative isolate pt-16 pb-0 min-h-[60vh] lg:min-h-screen"
        style={{
          '--hero-art-gap': 'clamp(0.75rem, 4vw, 7rem)',
          '--hero-art-w': 'clamp(20rem, 60vw - 24rem, 62rem)',
          '--hero-col':
            'calc(100vw - var(--hero-art-gap) - var(--hero-art-w) - var(--spacing-panel-gutter) - 2rem)',
          '--hero-title': 'min(11vw, 17.5rem, calc(var(--hero-col) / 3.6))',
        } as CSSProperties}
      >
        {/* Lebarnya --hero-art-w, tingginya SELALU setinggi hero (inset-y-0)
            dengan object-cover. Versi contain sebelumnya mengunci lebar tampil
            ke tinggi jendela x 0,696 -- 626px entah layarnya 1440px atau
            2560px -- sehingga ornamen tidak bisa diberi lebar sendiri tanpa
            meninggalkan pita putih di atas atau di bawahnya. Dengan cover,
            lebar kotak ini yang menentukan, dan gambarnya tetap memenuhi hero
            dari tepi atas sampai tepi bawah di rasio jendela manapun. */}
        <div className="pointer-events-none absolute inset-y-0 end-[var(--hero-art-gap)] -z-10 hidden w-[var(--hero-art-w)] overflow-hidden lg:block">
          <Image
            src={ornamentBg}
            alt=""
            aria-hidden
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 0px"
            className="object-cover object-center select-none"
          />
        </div>
        {/* Ukuran teks hero WAJIB ikut lebar layar, bukan tetap: 12em = 192px,
            dan "FRCI" pada ukuran itu selebar 430px -- 40px lebih lebar dari
            layar 390px. Akibatnya bukan cuma judul terpotong, tapi SELURUH
            halaman ikut bisa digeser ke samping 163px, termasuk setiap section
            di bawahnya.

            clamp() dipakai alih-alih menumpuk breakpoint karena yang harus
            dijaga adalah hubungannya dengan lebar viewport (20vw), bukan
            nilainya di tiga titik tertentu; batas atasnya tetap 12em supaya
            tampilan desktop sama persis seperti sebelumnya. */}
        {/* max-w-content (46rem) diganti --hero-col di lg: yang membatasi teks
            di desktop bukan lagi angka tetap, tapi sisa ruang di sebelah kiri
            ornamen. Subjudul ikut judul (0,33 x, rasio 52,8/160 yang lama)
            supaya keduanya mengecil dan membesar bersamaan. */}
        <div className="max-w-content py-8 lg:max-w-[var(--hero-col)] lg:py-12">
          <h1 className="text-[clamp(4rem,20vw,12em)]/[0.85] font-extrabold text-primary lg:text-[length:var(--hero-title)] lg:leading-[1]">
            OCEAN
          </h1>
          <p className="mt-4 text-[clamp(1.75rem,9vw,3.3em)]/[1.15] tracking-tighter text-primary lg:text-[length:calc(var(--hero-title)*0.33)] lg:leading-[1.06]">
            PROGRAM of REKAM{' '}
          </p>
        </div>
        {/* flex-wrap + garis per item, bukan `divide-x` pada induk: lima tautan
            sejajar butuh 553px, jadi di ponsel barisan ini harus patah. divide-x
            hanya memasang garis kiri pada saudara ke-2 dst -- begitu barisnya
            patah, garisnya mendarat di awal baris kedua alih-alih di antara dua
            item yang bersebelahan. */}
        {/* +2rem: strip ini memakai balik jarak napas yang sudah disisihkan
            --hero-col, supaya pada 1440px kelima tautannya tetap muat satu
            baris seperti rancangan aslinya. Di laptop yang lebih sempit
            kolomnya memang tidak cukup, dan flex-wrap di sini yang menangani
            -- itu sebabnya setiap item membawa garisnya sendiri (lihat
            komentar di bawah), bukan divide-x di induknya. */}
        {/* lg:w-fit: max-w- di bawah ini cuma BATAS, bukan lebar. Di lg nilainya
            ikut --hero-col yang hampir selalu lebih lebar dari kelima
            tautannya, dan karena item-itemnya sm:grow-0, sisa ruang itu
            tampil sebagai blok biru kosong di kanan "Blue Carbon" -- jarak
            kanannya jadi jauh lebih besar dari kiri "Ocean Accounts".
            w-fit membuat strip ini selebar isinya, sementara max-w tetap
            memaksa barisnya patah kalau kolomnya tidak cukup. */}
        <div className="mt-10 flex flex-wrap bg-primary uppercase text-white sm:max-w-fit lg:w-fit lg:max-w-[calc(var(--hero-col)+2rem)]">
          <AppLink href={'/program/ocean-accounts'} className="grow border-e border-b border-white/70 px-4 py-3 text-center text-sm last:border-e-0 lg:text-[clamp(0.875rem,0.97vw,1.15rem)] hover:underline hover:underline-offset-4 hover:[text-decoration-color:#52c0e1] sm:grow-0 sm:border-b-0 sm:py-2 hover:decoration-2">
            Ocean Accounts
          </AppLink>
          <AppLink href={'/program/sustainable-fisheries'} className="grow border-e border-b border-white/70 px-4 py-3 text-center text-sm last:border-e-0 lg:text-[clamp(0.875rem,0.97vw,1.15rem)] hover:underline hover:underline-offset-4 hover:[text-decoration-color:#52c0e1] sm:grow-0 sm:border-b-0 sm:py-2 hover:decoration-2">
            Fisheries
          </AppLink>
          <AppLink href={'/program/marine-conservation'} className="grow border-e border-b border-white/70 px-4 py-3 text-center text-sm last:border-e-0 lg:text-[clamp(0.875rem,0.97vw,1.15rem)] hover:underline hover:underline-offset-4 hover:[text-decoration-color:#52c0e1] sm:grow-0 sm:border-b-0 sm:py-2 hover:decoration-2">
            Ecosystem
          </AppLink>
          <AppLink href={'/program/species-conservation'} className="grow border-e border-b border-white/70 px-4 py-3 text-center text-sm last:border-e-0 lg:text-[clamp(0.875rem,0.97vw,1.15rem)] hover:underline hover:underline-offset-4 hover:[text-decoration-color:#52c0e1] sm:grow-0 sm:border-b-0 sm:py-2 hover:decoration-2">
            Species
          </AppLink>
          <AppLink href={'/program/blue-carbon'} className="grow border-e border-b border-white/70 px-4 py-3 text-center text-sm last:border-e-0 lg:text-[clamp(0.875rem,0.97vw,1.15rem)] hover:underline hover:underline-offset-4 hover:[text-decoration-color:#52c0e1] sm:grow-0 sm:border-b-0 sm:py-2 hover:decoration-2">
            Blue Carbon
          </AppLink>
        </div>
      </Container>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* relative + isolate: sama seperti ornamen di atas, keduanya yang
              mengunci latar ini pada kotak Container ini saja -- bukan pada
              grid induknya. */}
          <Container as="div" className="page-gutter relative isolate pt-8">
            <Image
              src={waveBg}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="pointer-events-none -z-10 object-cover opacity-5 select-none"
            />

            <div className="absolute start-0 top-0 bottom-0 -z-10 hidden w-[20rem] overflow-hidden lg:-ms-[5rem] lg:block">
              <Image
                src={ornamentBoat}
                alt=""
                aria-hidden
                fill
                sizes="20rem"
                className="object-cover object-right object-bottom"
              />
            </div>

            {/* Rata kanan-kiri baru masuk akal kalau satu baris memuat cukup kata: di
                390px baris ini cuma 5-7 kata, dan justify meregangkan spasinya sampai
                membentuk "sungai" putih yang menyulitkan mata melacak baris. Rata kiri
                di ponsel, justify baru dari lg. */}
            <div className="pb-8 pe-5 text-left lg:text-justify">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-4">
                {t.homeHeroEyebrow}
              </p>
              <h2 className="text-3xl font-semibold text-primary mb-6">
                {t.homeHeroHeading}
              </h2>
              <p className="mt-4 text-sm font-medium text-primary">
                {t.homeHeroBody}
              </p>
            </div>
          </Container>
          <ProgramSlider
            slides={programSlides}
            learnMoreLabel={t.learnMore}
            previousLabel={t.previousSlide}
            nextLabel={t.nextSlide}
          />
        </div>
      </div>

      {/* Container bawaan cuma menyisihkan `ps-panel-gutter` di KIRI (untuk
          panel navigasi) -- kanan dibiarkan w-full sampai tepi. Section ini
          bukan ornamen yang sengaja dibiarkan bleed seperti hero, jadi
          `pe` yang sama persis nilainya menyeimbangkan kanan supaya sama
          dengan kiri, bukan menempel ke tepi layar. */}
      <Container as="div" className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">{t.latestEyebrow}</p>
        <h2 className="mb-8 text-3xl font-semibold text-primary">{t.latestHeading}</h2>

        {articles.length === 0 ? (
          <p className="text-muted" data-config="missing">
            {t.noArticles}
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const image = resolveArticleImage(article.image);
              const category = article.category;
              const programsLabel = getProgramsLabel(article.programs, locale);

              return (
                <article key={article.slug} className="flex flex-col border border-border">
                  {/* §4j: image null/tidak dikenal -> lewati blok gambar,
                      bukan merender kotak next/image kosong. */}
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
                      <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, locale)}</time>
                      {category ? ` · ${category.toUpperCase()}` : null}
                      {programsLabel ? ` · ${programsLabel.toUpperCase()}` : null}
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
            })}
          </div>
        )}
      </Container>

      <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
        <Image
          src={wave2}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="pointer-events-none -z-10 object-cover select-none"
        />

        <Container className="page-gutter grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:pe-(--spacing-panel-gutter)">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-fg/80">{t.navOurImpact}</p>
            <h2 className="mb-4 text-3xl font-semibold">{t.homeImpactHeading}</h2>
            <p className="mb-6 text-primary-fg/90">{t.homeImpactBody}</p>
            <AppLink
              href="/discover/our-impact"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-90"
            >
              {t.homeImpactCta}
              <Icon id="arrow-right" />
            </AppLink>
          </div>

          {/* contoh_peta.png: dokumentasi sumbernya cuma 463x269 -- diberi
              nama "contoh" karena memang placeholder, bukan tangkapan layar
              peta interaktif sungguhan. Diregangkan lewat CSS (bukan intrinsik)
              supaya kartunya tetap proporsional dengan kolom teks. */}
          <div className="overflow-hidden rounded-lg shadow-xl">
            <Image
              src={contohPeta}
              alt=""
              aria-hidden
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        </Container>
      </div>

      <div className="bg-surface">
        <Container className="page-gutter grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:pe-(--spacing-panel-gutter)">
          {getImpactStats(t).map((stat, index) => (
            <div key={stat.label} className="relative px-4 py-8 text-center">
              {/* Garis pendek yang dipusatkan lewat inset-y-0 + my-auto + tinggi
                  tetap (h-16) -- BUKAN divide-x/y bawaan Tailwind, yang menaruh
                  border pada sel grid itu sendiri dan ikut memanjang sepenuh
                  tinggi baris (baris ini melar mengikuti label terpanjang, 3
                  baris). Cuma tampil di >= lg: di bawah itu grid membungkus ke
                  beberapa baris, dan garis di depan item pertama tiap baris
                  baru akan terlihat menggantung tanpa pasangan. */}
              {index > 0 ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 my-auto hidden h-16 w-px bg-border lg:block"
                />
              ) : null}
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-2 text-sm text-primary">{stat.label}</p>
            </div>
          ))}
        </Container>
      </div>

      <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">{t.homePublicationsEyebrow}</p>
        <h2 className="mb-8 text-3xl font-semibold text-primary">{t.homePublicationsHeading}</h2>

        {/* Beranda cuma menonjolkan 3 -- daftar lengkapnya (termasuk yang
            tidak tampil di sini) ada di /discover/publications. */}
        <HomePublicationsGrid
          publications={publications}
          downloadLabel={t.download}
          closeLabel={t.close}
          downloadGateDescription={t.downloadGateDescription}
          downloadGateNameLabel={t.downloadGateNameLabel}
          downloadGateEmailLabel={t.downloadGateEmailLabel}
        />
      </Container>

      <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="mb-6 text-xs font-bold uppercase tracking-wider text-secondary">{t.homeFeaturedVideo}</p>

        <div className="border border-border">
          {/* youtube-nocookie.com: mode privasi-tinggi YouTube -- cookie
              pelacakan cuma dipasang setelah pengguna benar-benar memutar
              videonya, bukan begitu iframe ini dimuat. */}
          <div className="relative aspect-video">
            <iframe
              src="https://www.youtube-nocookie.com/embed/GlFSR2ymLWI"
              title="Apa Itu neraca sumber daya laut? | Ocean Accounts"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-primary">Apa Itu neraca sumber daya laut? | Ocean Accounts</h3>
            <p className="mt-2 text-muted">
              Ocean Accounts (OA) serve as a multidimensional measurement tool that covers environmental, economic and social aspects.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
