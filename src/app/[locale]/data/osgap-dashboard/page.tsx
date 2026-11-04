import Image from 'next/image';
import { notFound } from 'next/navigation';
import heroImage from '@/assets/osgap/hero.jpg';
import logoAfd from '@/assets/osgap/logo-afd.png';
import logoIrd from '@/assets/osgap/logo-ird.png';
import logoRekam from '@/assets/osgap/logo-rekam.png';
import { Container } from '@/components/layout/Container';
import { OsgapViews } from '@/components/data/osgap/OsgapViews';
import { IndonesiaMap, type MapFocus } from '@/components/program/IndonesiaMap';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getDictionary } from '@/i18n/dictionary';
import { getOsgapDictionary } from '@/i18n/dictionaries/osgap';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

const TITLE = 'OSGAP Dashboard';
const PATH = '/data/osgap-dashboard';

/** Dua kawasan konservasi di Teluk Saleh, persis seperti `nama_kk` di
 *  src/data/frci-conservation-areas.ts -- peta hanya menggambar yang ini. */
const SALEH_BAY_MPAS = [
  'KAWASAN KONSERVASI PERAIRAN PULAU LIANG, PULAU NGALI, DAN PERAIRAN SEKITARNYA DI PROVINSI NUSA TENGGARA BARAT',
  'KAWASAN KONSERVASI PULAU LIPAN DAN PULAU RAKIT',
];

const PARTNERS = [
  { src: logoRekam, alt: 'Rekam Nusantara Foundation' },
  { src: logoIrd, alt: 'IRD, Institut de Recherche pour le Développement' },
  { src: logoAfd, alt: 'AFD, Agence Française de Développement' },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: PATH, title: TITLE });
}

export default async function OsgapDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const o = getOsgapDictionary(locale);
  const salehBay: MapFocus = { lat: -8.55, lng: 117.88, label: o.mapLabel, zoom: 9 };

  const partnerLogos = (height: string) =>
    PARTNERS.map((logo) => (
      <Image key={logo.alt} src={logo.src} alt={logo.alt} className={`${height} w-auto max-w-full object-contain`} />
    ));

  return (
    <div className="bg-surface">
      <Container className="page-gutter pt-14 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb
          items={[
            { label: t.home, href: '/' },
            // Belum ada halaman indeks /data -- pola yang sama dengan halaman
            // Data lainnya.
            { label: t.navData, href: '#' },
            { label: TITLE, href: PATH },
          ]}
        />
      </Container>

      <Container className="page-gutter pb-14">
        {/* Hero: foto + judul laporan, lalu pita putih berisi logo mitra. */}
        <div className="relative mt-6 flex min-h-72 flex-col justify-end overflow-hidden rounded-lg bg-primary md:min-h-[21rem]">
          <Image
            src={heroImage}
            alt={o.heroAlt}
            fill
            priority
            sizes="(min-width: 64rem) 75rem, 100vw"
            className="object-cover object-[center_60%]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/55 to-black/85" />
          <div className="relative px-5 pb-4 pt-6 text-white md:px-7">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">{o.eyebrow}</p>
            <h1 className="mt-1.5 max-w-[20ch] text-2xl font-bold leading-tight md:text-4xl">{o.title}</h1>
            <p className="mt-2 text-base text-white/85">{o.lede}</p>
          </div>
          <div
            aria-label={o.partnersAria}
            className="relative flex flex-wrap items-center gap-x-8 gap-y-3 bg-white px-5 py-3 md:px-7"
          >
            {partnerLogos('h-8 md:h-12')}
          </div>
        </div>

        {/* Pengantar + alur neraca -> indikator -> kebijakan */}
        <section className="grid items-center gap-7 border-b border-border py-8 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="grid gap-3 text-sm leading-relaxed text-fg md:text-base">
            {o.intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <ol aria-label={o.chainAria} className="grid gap-2">
            {o.chain.map((node, i) => (
              <li key={node.title} className="grid gap-2">
                {i > 0 ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="mx-auto text-secondary">
                    <path d="M8 1v12M3 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth={2} />
                  </svg>
                ) : null}
                <div
                  className={`rounded-md border bg-bg px-3.5 py-2.5 ${
                    i === 1 ? 'border-secondary ring-1 ring-inset ring-secondary' : 'border-border'
                  }`}
                >
                  <b className="block text-base text-primary">{node.title}</b>
                  <span className="text-sm text-muted">{node.body}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Lokasi studi */}
        <section className="grid items-center gap-7 border-b border-border py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">{o.siteEyebrow}</p>
            <h2 className="mb-3 mt-1 text-xl font-semibold text-primary md:text-2xl">{o.siteHeading}</h2>
            <div className="grid gap-3 text-sm leading-relaxed text-fg md:text-base">
              {o.site.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <IndonesiaMap
              theme="light"
              locale={locale}
              ariaLabel={o.mapAria}
              focus={salehBay}
              mpaNames={SALEH_BAY_MPAS}
              className="h-[320px] md:h-[380px]"
            />
          </div>
        </section>

        <div className="mt-8">
          <OsgapViews locale={locale} />
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted">
          <span>
            {o.developedBy} <b className="font-semibold text-fg">Rekam Nusantara Foundation</b>
          </span>
          <div
            aria-label={o.partnersAria}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-border bg-white px-4 py-2"
          >
            {partnerLogos('h-8')}
          </div>
        </footer>
      </Container>
    </div>
  );
}
