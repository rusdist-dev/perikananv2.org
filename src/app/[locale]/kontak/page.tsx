import { notFound } from 'next/navigation';
import Image from 'next/image';
import wave2 from '@/assets/banner/wave2.png';
import waveBg from '@/assets/banner/bg_wave1.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';
import { site } from '@/lib/site';

/** Koordinat & tautan lokasi kantor Rekam Nusantara Foundation di Google Maps. */
const MAPS_COORDS = '-6.5888352,106.7982128';
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=Rekam+Nusantara+Foundation,${MAPS_COORDS}&z=17&output=embed`;
const MAPS_PLACE_URL =
  'https://www.google.com/maps/place/Rekam+Nusantara+Foundation/@-6.5888725,106.7983362,788m/data=!3m1!1e3!4m6!3m5!1s0x2e69c434632d79f3:0xf8dd2ce7fc4091b!8m2!3d-6.5888352!4d106.7982128!16s%2Fg%2F11d_trs6vh!5m1!1e1';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/kontak', title: getDictionary(locale).navContact });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

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
            { label: t.navContact, href: '/kontak' },
          ]}
        />

        <span className="mt-4 inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
          {t.navConnect}
        </span>

        <h1 className="mt-6 max-w-2xl text-4xl leading-tight text-primary sm:text-5xl">
          {t.contactHeroHeading}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          {t.contactHeroBody}
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-start">
          <ContactForm
            email={site.contact.email}
            labels={{
              heading: t.contactFormHeading,
              name: t.contactFormName,
              namePlaceholder: t.contactFormNamePlaceholder,
              email: t.contactFormEmail,
              emailPlaceholder: t.contactFormEmailPlaceholder,
              subject: t.contactFormSubject,
              subjectPlaceholder: t.contactFormSubjectPlaceholder,
              message: t.contactFormMessage,
              messagePlaceholder: t.contactFormMessagePlaceholder,
              submit: t.contactFormSubmit,
            }}
          />

          <div className="lg:ps-28">
            <ContactInfo
              heading={t.contactInfoHeading}
              address={site.contact.address}
              email={site.contact.email}
              phone={site.contact.phone}
              configMissingLabel={t.configMissing}
            />
          </div>
        </div>
      </Container>
    </div>

    <div className="border-t border-border bg-bg">
      <Container className="page-gutter py-16 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
          {t.contactMapEyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary md:text-3xl">
          {t.contactMapHeading}
        </h2>

        <div className="mt-6 overflow-hidden rounded-md border border-border">
          <iframe
            src={MAPS_EMBED_SRC}
            title={t.contactMapHeading}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[420px] w-full border-0"
          />
        </div>

        <AppLink
          href={MAPS_PLACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-fit items-center text-sm font-bold text-secondary hover:underline"
        >
          {t.contactMapOpenLink}
        </AppLink>
      </Container>
    </div>
    </>
  );
}
