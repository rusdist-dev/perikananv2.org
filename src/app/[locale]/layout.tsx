import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Montserrat } from 'next/font/google';
import '../globals.css';
import { SiteShell } from '@/components/chrome/SiteShell';
import { buildMetadata } from '@/i18n/metadata';
import { locales, htmlLang, isLocale, type Locale } from '@/i18n/config';

/**
 * Ini root layout-nya: <html> dan <body> ada di sini, bukan di app/layout.tsx.
 * Harus begitu, karena `lang` dan `dir` bergantung pada locale, dan locale baru
 * diketahui setelah segmen [locale] ter-resolve.
 *
 * FONT: sementara Montserrat, tujuan akhirnya Proxima Nova.
 *
 * Proxima Nova berlisensi komersial dan tidak ada di Google Fonts, jadi
 * next/font/google tidak bisa mengambilnya. Montserrat dipakai sebagai
 * pengganti karena sama-sama geometric sans -- karakternya paling dekat,
 * meski huruf-hurufnya lebih lebar sehingga baris teks akan sedikit memanjang
 * saat nanti ditukar.
 *
 * Proxima Nova SENGAJA TIDAK dimasukkan ke rantai fallback di @theme. Kalau ia
 * ada di sana, pengunjung yang kebetulan memasangnya secara lokal (perancang,
 * tim internal) melihat situs yang berbeda dari pengunjung lain -- dan justru
 * merekalah yang menilai hasilnya, jadi masalahnya luput terus.
 *
 * Cara menukar setelah file lisensi ada:
 *   1. taruh .woff2 di src/fonts/
 *   2. ganti impor ini dengan next/font/local:
 *        const sans = localFont({
 *          src: [{ path: '../../fonts/ProximaNova-Regular.woff2', weight: '400' }, ...],
 *          variable: '--font-app-sans',
 *          display: 'swap',
 *        })
 *   3. tidak ada lagi yang perlu berubah -- @theme membaca --font-app-sans.
 *
 * next/font mengunduh dan menyajikan font dari domain sendiri saat build, jadi
 * tidak ada permintaan ke Google saat runtime dan tidak perlu preconnect.
 */
const sans = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-app-sans',
});

/** Kedua locale dipranders saat build; tanpa ini keduanya jadi dinamis. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/' });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Middleware hanya mengizinkan locale yang dikenal lewat, tapi rute ini juga
  // bisa dicapai langsung saat build/prerender. Menolak di sini menjaga
  // `locale as Locale` di bawah tetap jujur.
  if (!isLocale(locale)) notFound();
  const typed: Locale = locale;

  return (
    <html lang={htmlLang[typed]} className={sans.variable}>
      <body>
        <SiteShell locale={typed}>{children}</SiteShell>
      </body>
    </html>
  );
}
