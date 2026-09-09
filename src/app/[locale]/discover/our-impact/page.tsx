import { notFound } from 'next/navigation';
import Image from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import { Container } from '@/components/layout/Container';
import { ImpactVillageMap } from '@/components/program/ImpactVillageMap';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/discover/our-impact',
    title: getDictionary(locale).navOurImpact,
  });
}

export default async function OurImpactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
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
      </div>

      <Container className="page-gutter relative pt-10 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb
          items={[
            { label: t.home, href: '/' },
            { label: t.navDiscover, href: '/discover/about-us' },
            { label: t.navOurImpact, href: '/discover/our-impact' },
          ]}
        />

        <span className="mt-4 inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
          {t.navDiscover}
        </span>

        <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-primary sm:text-5xl">
          {t.ourImpactHeading}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          {t.ourImpactBody}
        </p>

        <div className="mt-6 h-1 w-full max-w-5xl bg-secondary" />
      </Container>

      {/* Di LUAR Container: pemilih desanya membawa Container sendiri supaya
          sejajar dengan teks di atas, sedangkan petanya full-bleed selebar
          viewport. */}
      <div className="relative mt-10 w-full ">
        <ImpactVillageMap />
      </div>
    </div>
  );
}
