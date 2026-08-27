import { notFound } from 'next/navigation';
import Image from 'next/image';
import contohPeta from '@/assets/our_impact1.png';
import ornamentBg from '@/assets/banner/ornament1.png';
import ornamentBoat from '@/assets/banner/ornament2.png';
import waveBg from '@/assets/banner/bg_wave1.png';
import wave2 from '@/assets/banner/wave2.png';
import { ProgramSlider } from '@/components/home/ProgramSlider';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Icon } from '@/components/ui/Icon';
import { getArticles } from '@/lib/content';
import { formatArticleDate } from '@/lib/date';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';
import { panelNav } from '@/lib/nav';
import { programMeta } from '@/data/programs';
import { articleImages } from '@/data/article-images';
import { publications } from '@/data/publications';
import { site } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/' });
}

/** "06" ditulis apa adanya (string, bukan number) supaya nol di depannya
 *  tidak hilang -- persis seperti pada rancangannya. */
const IMPACT_STATS = [
  { value: '23', label: 'Marine Protected Areas' },
  { value: '6', label: 'Area-Based Management' },
  { value: '8', label: 'Fisheries Management Areas' },
  { value: '72', label: 'Community Groups' },
  { value: '52', label: 'Field Enumerators' },
  { value: '30', label: 'Student Internships' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const articles = (await getArticles(locale)).slice(0, 3);

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
      <Container as="div" className="relative isolate pt-16 pb-0 min-h-screen">
        {/* Bungkus terpisah dari <Image fill> supaya jarak ke tepi kanan bisa
            diatur: `fill` menulis inset:0 lewat inline style, yang tidak bisa
            dikalahkan className manapun. Div ini yang diberi jarak (end-20)
            lewat posisinya sendiri, lalu Image mengisi persis kotak yang
            sudah menyempit itu. */}
        <div className="pointer-events-none absolute inset-y-0 start-0 end-0 -z-10 hidden lg:block">
          <Image
            src={ornamentBg}
            alt=""
            aria-hidden
            fill
            priority
            sizes="70vw"
            className="object-contain object-right select-none -translate-x-32"
          />
        </div>
        <div className="max-w-content py-12">
          <h1 className="text-[12em]/40 font-extrabold text-primary">FRCI</h1>
          <p className="mt-4 text-[3.3em]/14 text-primary tracking-tighter">
            OCEAN PROGRAM <br /> By Rekam{' '}
          </p>
        </div>
        <div className="max-w-fit bg-primary text-white flex divide-x divide-white uppercase mt-10">
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Ocean Accounts
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Fisheries
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Ecosystem
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Species
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Blue Carbon
          </AppLink>
        </div>
      </Container>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* relative + isolate: sama seperti ornamen di atas, keduanya yang
              mengunci latar ini pada kotak Container ini saja -- bukan pada
              grid induknya. */}
          <Container as="div" width="content" className="relative isolate pt-8">
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

  <div className="pb-8 text-justify pe-5">
    <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-4">
      Where Ocean Data Meets Local Action
    </p>
    <h2 className="text-3xl font-semibold text-primary mb-6">
      Measuring what matters, counting what counts, turning data into actions
    </h2>
    <p className="mt-4 text-sm font-medium text-primary">
      REKAM/FRCI (Fisheries Resource Center of Indonesia) is Rekam Nusantara Foundation's Ocean program, offering an alternative approach to fisheries analysis and sustainable marine management grounded in scientific data. We apply innovative science and technology to protect critical species, promote sustainable fishing, and strengthen the management of marine conservation areas, while pioneering the integration of ocean accounting and ecosystem services into how Indonesia manages its seas. In carrying out our programs, REKAM/FRCI partners with stakeholders and policymakers, and involves communities directly in data collection. Guided by our vision of sustainability and justice for Indonesian fisheries, we aim to lead the shift toward evidence-based, inclusive ocean governance, ensuring a thriving marine environment for generations to come.
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
      <Container as="div" className="py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">{t.latestEyebrow}</p>
        <h2 className="mb-8 text-3xl font-semibold text-primary">{t.latestHeading}</h2>

        {articles.length === 0 ? (
          <p className="text-muted" data-config="missing">
            {t.noArticles}
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const image = article.image ? articleImages[article.image] : undefined;
              const category = article.tags[0];

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

        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:pe-(--spacing-panel-gutter)">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary-fg/80">Our Impact</p>
            <h2 className="mb-4 text-3xl font-semibold">Evidence of our action that reaches across Indonesia's seas</h2>
            <p className="mb-6 text-primary-fg/90">
              FRCI&apos;s Ocean Accounts framework is now active in all 8 of Indonesia&apos;s Fisheries Management Areas, translating field-level catch and ecosystem data into policy that communities can act on.
            </p>
            <AppLink
              href="#"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-90"
            >
              View the Full Map
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
        <Container className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:pe-(--spacing-panel-gutter)">
          {IMPACT_STATS.map((stat, index) => (
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

      <Container className="py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">OUR PUBLICATION</p>
        <h2 className="mb-8 text-3xl font-semibold text-primary">The results of our work and collaboration</h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Beranda cuma menonjolkan 4 -- daftar lengkapnya (termasuk yang
              tidak tampil di sini) ada di /discover/publications. */}
          {publications.slice(0, 4).map((publication, index) => (
            <article key={index} className="flex flex-col border border-border">
              <div className="relative aspect-[3/4]">
                <Image
                  src={publication.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">{publication.category}</p>
                <h3 className="text-base font-semibold text-primary">{publication.title}</h3>
                {/* §4j: belum ada berkas untuk diunduh -- href="#" menyatakan
                    itu apa adanya, sama seperti tombol placeholder lain di
                    hero, bukan menautkan ke berkas yang belum ada. */}
                <AppLink
                  href="#"
                  className="mt-auto inline-flex w-fit items-center rounded-md border border-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary hover:text-primary-fg"
                >
                  {t.download}
                </AppLink>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <Container className="py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="mb-6 text-xs font-bold uppercase tracking-wider text-secondary">Featured Video</p>

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
