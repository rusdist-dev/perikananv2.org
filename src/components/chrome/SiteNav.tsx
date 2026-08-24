'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import logoFrci from '@/assets/logo-frci.png';
import { AppLink } from '@/components/ui/AppLink';
import { Icon } from '@/components/ui/Icon';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MINIMIZED_SECTION_ID } from '@/lib/nav';
import { stripLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/config';

/**
 * Panel navigasi sisi kiri. Ia MENGGANTIKAN header, jadi ia yang memikul
 * landmark `banner` -- dan hanya boleh ada satu di dokumen.
 *
 * Dua bentuk, satu isi:
 *   >= lg : sidebar tetap di kiri, konten digeser lewat padding di SiteShell.
 *   <  lg : bilah tipis di atas + panel yang sama dibuka sebagai Radix Dialog.
 *           Panel selebar 18rem di layar 390px menyisakan 6rem untuk konten,
 *           jadi menempelkannya permanen di ponsel bukan pilihan.
 *
 * Label sudah diselesaikan di server (SiteShell) dan masuk sebagai string
 * biasa; mengirim seluruh kamus ke klien akan membebani bundle dengan teks
 * yang tidak dipakai halaman ini.
 */

export type ResolvedItem = { href: string; label: string };
export type ResolvedSection = { id: string; heading: string; items: ResolvedItem[] };

export type NavLabels = {
  primaryNav: string;
  openMenu: string;
  closeMenu: string;
  minimizeMenu: string;
  expandMenu: string;
  languageSwitcher: string;
  search: string;
  searchUnavailable: string;
};

// Dua wilayah, satu tombol. aria-controls menerima daftar id dipisah spasi;
// menunjuk hanya salah satunya akan berbohong tentang apa yang tombol itu
// sembunyikan.
const EXTRA_NAV_ID = 'site-nav-extra';
const EXTRA_UTILITY_ID = 'site-nav-utility';
const CONTROLS = `${EXTRA_NAV_ID} ${EXTRA_UTILITY_ID}`;

function NavList({
  section,
  current,
  onNavigate,
}: {
  section: ResolvedSection;
  current: string;
  onNavigate?: () => void;
}) {
  return (
    <section aria-labelledby={section.id}>
      <h2
        id={section.id}
        className="text-[8pt] font-semibold uppercase tracking-wide text-secondary"
      >
        {section.heading}
      </h2>
      <ul className="mt-1 flex flex-col ps-2">
        {section.items.map((item) => {
          const isCurrent = current === item.href;
          return (
            <li key={item.href}>
              <AppLink
                href={item.href}
                onClick={onNavigate}
                // aria-current adalah satu-satunya cara halaman aktif sampai ke
                // screen reader; tebal saja hanya terlihat oleh mata.
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'block text-xs text-primary',
                  // Garis bawah = keadaan hover, sesuai desain. focus-visible
                  // ikut disertakan supaya pengguna keyboard mendapat isyarat
                  // yang sama -- kalau hanya hover, seluruh afordansi itu hilang
                  // begitu tikus dilepas.
                  'hover:underline focus-visible:underline underline-offset-2',
                  isCurrent ? 'font-bold underline' : 'font-medium',
                )}
              >
                {item.label}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Isi panel, dipakai apa adanya oleh sidebar desktop maupun dialog mobile. */
function PanelBody({
  sections,
  labels,
  locale,
  current,
  minimized,
  toggle,
  onNavigate,
}: {
  sections: ResolvedSection[];
  labels: NavLabels;
  locale: Locale;
  current: string;
  minimized: boolean;
  /** Di dalam dialog ini tombol Close; di sidebar ia tombol minimize. */
  toggle: ReactNode;
  /** Hanya diisi versi dialog: navigasi client-side memindahkan halaman tanpa
   *  menutup dialog, jadi panel akan tetap menutupi layar setelah link ditekan. */
  onNavigate?: () => void;
}) {
  const [first, ...rest] = sections;

  return (
    // Tanpa h-full: tinggi card mengikuti isinya, jadi ia menyusut sendiri saat
    // diminimalkan. Scroll dan batas tinggi diurus pembungkusnya -- kalau
    // ditaruh di sini, card akan selalu setinggi viewport dan idenya hilang.
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <AppLink href="/" className="shrink-0" onClick={onNavigate}>
          {/* alt = "FRCI" karena logonya memang memuat kata itu. Dibiarkan
              kosong, link ini jadi link tanpa nama sama sekali. */}
          <Image src={logoFrci} alt="FRCI" className="h-14 w-auto" priority />
        </AppLink>
        {toggle}
      </div>

      {/* Satu landmark navigasi untuk seluruh panel. Keempat seksi jadi
          <section> ber-heading di dalamnya, bukan empat <nav> terpisah --
          empat landmark navigasi memaksa pengguna screen reader menebak mana
          yang mereka mau. */}
      <nav aria-label={labels.primaryNav}>
        {first ? <NavList section={first} current={current} onNavigate={onNavigate} /> : null}

        {/* Tetap dirender saat diminimalkan, hanya disembunyikan: `hidden`
            mengeluarkannya dari accessibility tree tanpa membuangnya dari HTML,
            jadi crawler tetap menemukan seluruh peta situs. */}
        <div
          id={EXTRA_NAV_ID}
          className={cn('mt-2 flex flex-col gap-2', minimized && 'hidden')}
        >
          {rest.map((section) => (
            <NavList
              key={section.id}
              section={section}
              current={current}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* Di luar <nav> supaya language switcher -- yang punya <nav> sendiri --
          tidak jadi navigasi bersarang di dalam navigasi. */}
      {/* mt-auto sengaja TIDAK dipakai: ia hanya berefek kalau induknya punya
          tinggi lebih, dan card ini justru dirancang setinggi isinya. */}
      <div id={EXTRA_UTILITY_ID} className={cn('flex flex-col gap-1', minimized && 'hidden')}>
        <LanguageSwitcher locale={locale} label={labels.languageSwitcher} />

        {/* §4j: belum ada rute pencarian, jadi kotaknya menyatakan diri belum
            aktif alih-alih menelan ketikan pengguna tanpa hasil. Hidupkan
            dengan membungkusnya jadi <form action="/cari"> dan membuang
            `disabled` begitu halamannya ada. */}
        <div>
          <label
            htmlFor="site-search"
            className="flex items-center gap-3 rounded-md bg-primary px-4 py-2 text-primary-fg"
          >
            <Icon id="search" />
            <span className="sr-only">{labels.search}</span>
            <input
              id="site-search"
              type="search"
              disabled
              placeholder={`${labels.search}…`}
              aria-describedby="site-search-note"
              className="w-full bg-transparent text-sm text-primary-fg placeholder:text-primary-fg/70 disabled:cursor-not-allowed"
            />
          </label>
          <p id="site-search-note" className="mt-1 text-xs text-muted">
            {labels.searchUnavailable}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SiteNav({
  locale,
  sections,
  labels,
}: {
  locale: Locale;
  sections: ResolvedSection[];
  labels: NavLabels;
}) {
  const current = stripLocale(usePathname());
  // Di /program/* apa pun, sidebar mulai terkecilkan sehingga hanya seksi
  // Program yang tampil -- tapi tombol di bawah tetap membukanya. `rest` tetap
  // dirender (lihat PanelBody), jadi ini murni keadaan awal, bukan menyembunyikan
  // rute dari crawler.
  const isProgramRoute = current === '/program' || current.startsWith('/program/');

  const [minimized, setMinimized] = useState(isProgramRoute);
  const [open, setOpen] = useState(false);

  // useState hanya membaca pathname sekali, saat mount. Navigasi client-side
  // ke/keluar dari /program/* setelahnya tidak memicu re-render lain yang
  // menyentuh initializer itu, jadi keadaan awal harus disinkronkan ulang di
  // sini setiap kali "masuk/keluar seksi program" berubah. Toggle manual
  // pengguna di dalam seksi yang sama tetap dihormati -- efek ini hanya
  // berjalan lagi saat batasnya dilewati, bukan di tiap navigasi.
  const wasProgramRoute = useRef(isProgramRoute);
  useEffect(() => {
    if (wasProgramRoute.current !== isProgramRoute) {
      wasProgramRoute.current = isProgramRoute;
      setMinimized(isProgramRoute);
    }
  }, [isProgramRoute]);

  // Default expanded di luar /program/*, jadi HTML hasil server memuat seluruh
  // menu -- crawler dan pembaca tanpa JavaScript tetap mendapat peta situs
  // yang lengkap.
  const minimizeToggle = (
    <button
      type="button"
      onClick={() => setMinimized((m) => !m)}
      aria-expanded={!minimized}
      aria-controls={CONTROLS}
      className="tap-target inline-flex shrink-0 items-center justify-center rounded-full border border-border text-lg text-primary"
    >
      <Icon id={minimized ? 'menu' : 'close'} />
      <span className="sr-only">{minimized ? labels.expandMenu : labels.minimizeMenu}</span>
    </button>
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Satu-satunya <header> di dokumen, jadi tepat satu landmark `banner`.
          Kedua bentuk di bawah saling eksklusif lewat breakpoint, dan yang
          tersembunyi ber-`display:none` sehingga tidak ikut ke a11y tree. */}
      <header>
        {/* Card mengambang, bukan sidebar penuh dari tepi ke tepi.
            max-h + overflow-y-auto ada di SINI, bukan di dalam card: card boleh
            setinggi isinya sampai batas viewport, lalu isinya yang bergulir.
            Tanpa batas itu, panel yang panjang akan menjulur keluar layar dan
            seksi terbawah jadi tak terjangkau sama sekali. */}
        <div
          id="site-nav-card"
          className="fixed top-panel-inset start-panel-inset z-40 hidden max-h-[calc(100dvh-var(--spacing-panel-inset)*2)] w-56 overflow-y-auto border border-border bg-bg shadow-lg lg:block"
        >
          <PanelBody
            sections={sections}
            labels={labels}
            locale={locale}
            current={current}
            minimized={minimized}
            toggle={minimizeToggle}
          />
        </div>

        <div className="fixed inset-x-0 top-0 z-40 flex h-topbar items-center justify-between border-b border-border bg-bg px-4 lg:hidden">
          {/* Tanpa `priority` di sini: gambar yang sama sudah di-preload oleh
              sidebar desktop, dan dua preload untuk satu file cuma menambah
              peringatan build. */}
          <AppLink href="/">
            <Image src={logoFrci} alt="FRCI" className="h-7 w-auto" />
          </AppLink>
          <Dialog.Trigger className="tap-target inline-flex items-center justify-center rounded-md text-xl text-primary">
            <Icon id="menu" />
            <span className="sr-only">{labels.openMenu}</span>
          </Dialog.Trigger>
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
        {/* Card yang sama bentuknya di mobile, supaya panel terasa satu benda
            di kedua ukuran. max-w-[calc(...)] menjaga card tetap punya jarak
            dari tepi di layar 390px, tempat 18rem hampir memenuhi lebar. */}
        <Dialog.Content
          className="fixed top-panel-inset start-panel-inset z-50 max-h-[calc(100dvh-var(--spacing-panel-inset)*2)] w-panel max-w-[calc(100vw-var(--spacing-panel-inset)*2)] overflow-y-auto rounded-lg border border-border bg-bg shadow-lg lg:hidden"
          aria-label={labels.primaryNav}
        >
          {/* Radix menuntut Title; ia yang menamai dialog di accessibility tree. */}
          <Dialog.Title className="sr-only">{labels.primaryNav}</Dialog.Title>
          <PanelBody
            sections={sections}
            labels={labels}
            locale={locale}
            current={current}
            // Di dalam dialog tidak ada gunanya meminimalkan: pengguna sudah
            // memilih membuka menu, dan menutupnya adalah × yang sama.
            minimized={false}
            onNavigate={() => setOpen(false)}
            toggle={
              <Dialog.Close className="tap-target inline-flex shrink-0 items-center justify-center rounded-full border border-border text-lg text-primary">
                <Icon id="close" />
                <span className="sr-only">{labels.closeMenu}</span>
              </Dialog.Close>
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
