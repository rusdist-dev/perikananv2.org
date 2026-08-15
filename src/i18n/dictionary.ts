import type { Locale } from './config';

/**
 * Yang diterjemahkan di sini HANYA chrome: nav, footer, kontrol, label form,
 * pesan sistem. Konten editorial hidup di src/data + lib/content dengan field
 * `lang`-nya sendiri; menaruhnya di sini akan memaksa deploy setiap kali ada
 * artikel baru.
 *
 * Record<Locale, ...> membuat locale baru gagal saat typecheck, bukan diam-diam
 * jatuh ke bahasa Inggris saat runtime.
 */

type Dictionary = {
  skipToContent: string;
  openMenu: string;
  closeMenu: string;
  minimizeMenu: string;
  expandMenu: string;
  primaryNav: string;
  footerNav: string;
  languageSwitcher: string;
  search: string;
  searchUnavailable: string;
  navProgram: string;
  navDiscover: string;
  navData: string;
  navConnect: string;
  navAboutUs: string;
  navOurTeam: string;
  navAchievements: string;
  navOurImpact: string;
  navPublications: string;
  navNewsAndActivity: string;
  navContact: string;
  home: string;
  news: string;
  about: string;
  contact: string;
  allRightsReserved: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
  readMore: string;
  latestArticles: string;
  noArticles: string;
  configMissing: string;
};

const dictionaries: Record<Locale, Dictionary> = {
  id: {
    skipToContent: 'Lompat ke konten utama',
    openMenu: 'Buka menu',
    closeMenu: 'Tutup menu',
    minimizeMenu: 'Perkecil menu',
    expandMenu: 'Perbesar menu',
    primaryNav: 'Navigasi utama',
    footerNav: 'Navigasi footer',
    languageSwitcher: 'Pilih bahasa',
    search: 'Cari',
    searchUnavailable: 'Pencarian belum tersedia',
    navProgram: 'Program',
    navDiscover: 'Jelajahi',
    navData: 'Data',
    navConnect: 'Hubungi',
    navAboutUs: 'Tentang Kami',
    navOurTeam: 'Tim Kami',
    navAchievements: 'Pencapaian',
    navOurImpact: 'Dampak Kami',
    navPublications: 'Publikasi',
    navNewsAndActivity: 'Berita dan Kegiatan',
    navContact: 'Kontak',
    home: 'Beranda',
    news: 'Berita',
    about: 'Tentang',
    contact: 'Kontak',
    allRightsReserved: 'Hak cipta dilindungi.',
    notFoundTitle: 'Halaman tidak ditemukan',
    notFoundBody: 'Alamat yang Anda buka tidak ada atau sudah dipindahkan.',
    backHome: 'Kembali ke beranda',
    readMore: 'Baca selengkapnya',
    latestArticles: 'Artikel terbaru',
    noArticles: 'Belum ada artikel dalam bahasa ini.',
    configMissing: 'Belum dikonfigurasi',
  },
  en: {
    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    minimizeMenu: 'Minimize menu',
    expandMenu: 'Expand menu',
    primaryNav: 'Primary navigation',
    footerNav: 'Footer navigation',
    languageSwitcher: 'Choose language',
    search: 'Search',
    searchUnavailable: 'Search is not available yet',
    navProgram: 'Program',
    navDiscover: 'Discover',
    navData: 'Data',
    navConnect: 'Connect',
    navAboutUs: 'About Us',
    navOurTeam: 'Our Team',
    navAchievements: 'Achievements',
    navOurImpact: 'Our Impact',
    navPublications: 'Publications',
    navNewsAndActivity: 'News and Activity',
    navContact: 'Contact',
    home: 'Home',
    news: 'News',
    about: 'About',
    contact: 'Contact',
    allRightsReserved: 'All rights reserved.',
    notFoundTitle: 'Page not found',
    notFoundBody: 'The address you opened does not exist or has been moved.',
    backHome: 'Back to home',
    readMore: 'Read more',
    latestArticles: 'Latest articles',
    noArticles: 'No articles in this language yet.',
    configMissing: 'Not configured yet',
  },
};

export type DictionaryKey = keyof Dictionary;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
