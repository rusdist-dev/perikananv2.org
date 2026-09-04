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
        <div className="flex flex-col gap-4 lg:max-w-sm">
          <AppLink href="/" className="flex w-fit items-center gap-2">
            {/* Logo aslinya biru; brightness-0 invert mengubahnya jadi siluet
                putih tanpa perlu aset kedua khusus latar gelap. */}
            <Image src={logoFrci} alt="FRCI" className="h-14 w-auto brightness-0 invert" />
          </AppLink>
          {/* whitespace-pre-line menghormati '\n' yang sudah ditulis di
              kamus (dictionary.ts) -- baris patah persis di titik yang
              dirancang ("...oleh" / "Rekam Nusantara Foundation."), bukan
              menunggu lebar kolom kebetulan memutusnya di situ. Lebar kolom
              sendiri sekarang ditentukan oleh baris copyright, jadi patahan
              berbasis lebar tidak lagi bisa diandalkan untuk baris ini. */}
          <p className="text-sm whitespace-pre-line text-primary-fg/90">{t.footerTagline}</p>
          {/* whitespace-nowrap sengaja dipasang, dan kolom ini diperlebar dari
              3xs ke sm supaya baris ini benar-benar MUAT dalam satu baris --
              bukan cuma dibiarkan meluber keluar kotaknya, yang akan
              menindih kolom "Program" di sebelahnya. */}
          <p className="text-xs whitespace-nowrap text-primary-fg/70 italic">{t.footerCopyright}</p>
        </div>

        {sections.map((section) => (
          <FooterNavColumn key={section.id} heading={section.heading} items={section.items} />
        ))}

        <div className="flex flex-col gap-3 lg:max-w-3xs">
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
            className="mt-1 inline-flex w-fit items-center rounded-md bg-secondary px-6 py-2 text-xs font-bold uppercase tracking-wide text-secondary-fg hover:opacity-90"
          >
            {t.contact}
          </AppLink>
        </div>
      </Container>
    </footer>
  );
}
