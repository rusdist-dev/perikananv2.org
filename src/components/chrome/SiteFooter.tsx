import Image from 'next/image';
import footerBg from '@/assets/banner/bg_footer1.png';
import logoFrci from '@/assets/logo-frci.png';
import { AppLink } from '@/components/ui/AppLink';
import { Container } from '@/components/layout/Container';
import { getDictionary } from '@/i18n/dictionary';
import { panelNav } from '@/lib/nav';
import { site } from '@/lib/site';
import type { Locale } from '@/i18n/config';

/**
 * Tiga kolom navigasi memakai tiga seksi PERTAMA `panelNav` apa adanya --
 * menyalin ulang item ke sini akan membuat dua sumber kebenaran yang bisa
 * menyimpang saat panel berubah. `nav-connect` sengaja dilewati: kolom
 * terakhir footer bukan navigasi, melainkan info kontak + tombol.
 */
const FOOTER_SECTION_IDS = new Set(['nav-program', 'nav-discover', 'nav-data']);

/** Situs induk Rekam Nusantara Foundation. Ditulis di sini, bukan site.ts:
 *  site.ts menyimpan fakta yang dipakai lebih dari satu tempat, dan tautan ini
 *  cuma muncul di footer. */
const PARENT_ORG_URL = 'https://rekam.org';

function FooterNavColumn({
  heading,
  items,
}: {
  heading: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-wide">{heading}</h2>
      <ul className="mt-3 flex list-disc flex-col gap-2 ps-4 marker:text-primary-fg/50">
        {items.map((item) => (
          <li key={item.href}>
            <AppLink href={item.href} className="text-sm text-primary-fg/90 hover:text-primary-fg hover:underline">
              {item.label}
            </AppLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const sections = panelNav
    .filter((section) => FOOTER_SECTION_IDS.has(section.id))
    .map((section) => ({
      id: section.id,
      heading: t[section.headingKey],
      items: section.items.map((item) => ({
        href: item.href,
        label: item.labelKey ? t[item.labelKey] : item.label,
      })),
    }));

  return (
    // isolate menahan opacity+z-index gambar di bawah supaya berhenti di
    // dalam kotak footer ini saja, bukan menembus ke elemen di baliknya.
    <footer className="relative isolate overflow-hidden bg-primary text-primary-fg">
      {/* bg_footer.png ilustrasi berwarna penuh, dipudarkan ke opacity 0,22
          supaya tetap terbaca sebagai TEKSTUR latar di belakang konten
          navigasi (satu blok menyatu, sama seperti rancangannya) alih-alih
          elemen terpisah yang berdiri sendiri. object-cover mengisi persis
          tinggi kotak footer (mengikuti tinggi konten navigasi) -- pada
          opacity serendah ini bagian yang terpotong di tepi tidak lagi jadi
          soal seperti saat opacity-nya masih penuh. */}
      <Image
        src={footerBg}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="pointer-events-none -z-10 object-cover opacity-[0.50] select-none"
      />

      <Container className="page-gutter relative z-10 flex flex-col gap-10 py-12 lg:flex-row lg:justify-between">
        <div className="flex flex-col gap-4 lg:max-w-3xs">
          <AppLink href="/" className="flex w-fit items-center gap-2">
            {/* Logo aslinya biru; brightness-0 invert mengubahnya jadi siluet
                putih tanpa perlu aset kedua khusus latar gelap. */}
            <Image src={logoFrci} alt="FRCI" className="h-14 w-auto brightness-0 invert" />
          </AppLink>
          {/* Nama induknya ditulis "REKAM" dan ditautkan ke rekam.org: satu
              baris pendek yang muat tanpa patahan, jadi kamusnya cukup
              menyimpan kata pengantarnya saja. Nama organisasinya sendiri
              tidak lewat kamus -- ia sama di semua bahasa. */}
          <p className="text-sm text-primary-fg/90">
            {t.footerTaglinePrefix}{' '}
            <AppLink
              href={PARENT_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 hover:opacity-80"
            >
              REKAM
            </AppLink>
          </p>
        </div>

        {sections.map((section) => (
          <FooterNavColumn key={section.id} heading={section.heading} items={section.items} />
        ))}

        <div className="flex flex-col gap-3 lg:max-w-xs">
          <h2 className="text-sm font-bold uppercase tracking-wide">{t.stayUpdated}</h2>

          {/* §4j: kalau alamat belum diisi di site.ts, kolom ini menyatakan
              diri belum dikonfigurasi alih-alih mencetak alamat karangan. */}
          {site.contact.address ? (
            <p className="text-sm text-primary-fg/90">{site.contact.address}</p>
          ) : (
            <p className="text-sm text-primary-fg/70" data-config="missing">
              {t.configMissing}
            </p>
          )}

          <AppLink
            href="/kontak"
            className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-wide text-secondary-fg hover:opacity-90"
          >
            {t.footerContactCta}
          </AppLink>

          {/* Copyright duduk di kolom ini, di bawah tombolnya -- bukan lagi di
              kolom logo. Kolom logo kini cuma setinggi logo + satu baris
              tagline, dan barisnya yang panjang ini akan memaksanya melebar
              jauh melampaui isinya sendiri. Lebar kolom ini (max-w-xs) dipilih
              supaya baris copyright muat tanpa patah. */}
          <p className="mt-2 text-xs text-primary-fg/70 italic">{t.footerCopyright}</p>
        </div>
      </Container>
    </footer>
  );
}
