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
  noArticles: string;
  configMissing: string;
  footerTagline: string;
  footerCopyright: string;
  stayUpdated: string;
  learnMore: string;
  previousSlide: string;
  nextSlide: string;
  latestEyebrow: string;
  latestHeading: string;
  readStory: string;
  download: string;
  galleryPrevious: string;
  galleryNext: string;
  newsHeroHeading: string;
  readFullStory: string;
  filterTitle: string;
  filterAllPrograms: string;
  filterCategory: string;
  filterAllCategory: string;
  filterYear: string;
  filterAllYear: string;
  filterPopularTags: string;
  filterMoreTags: string;
  filterApply: string;
  filterUnavailable: string;
  newsShowingPlaceholder: string;
  sortNewest: string;
  sortOldest: string;
  sortMostRead: string;
  paginationNav: string;
  paginationPrevious: string;
  paginationNext: string;
  minRead: string;
  shareAndTags: string;
  share: string;
  copyLink: string;
  linkCopied: string;
  relatedStory: string;
  moreFromCategory: string;
  showMore: string;
  showLess: string;
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
    noArticles: 'Belum ada artikel dalam bahasa ini.',
    configMissing: 'Belum dikonfigurasi',
    footerTagline: 'Program kelautan oleh\nRekam Nusantara Foundation.',
    footerCopyright: 'Hak Cipta © Rekam Nusantara Foundation | Unit FRCI',
    stayUpdated: 'Tetap Terhubung',
    learnMore: 'Pelajari Lebih Lanjut',
    previousSlide: 'Program sebelumnya',
    nextSlide: 'Program berikutnya',
    latestEyebrow: 'Terbaru',
    latestHeading: 'Apa yang Terjadi di Setiap Program Kami',
    readStory: 'Baca Kisahnya',
    download: 'Unduh',
    galleryPrevious: 'Gambar sebelumnya',
    galleryNext: 'Gambar berikutnya',
    newsHeroHeading: 'Jelajahi kisah kami dari lapangan',
    readFullStory: 'Baca Kisah Lengkap',
    filterTitle: 'Filter',
    filterAllPrograms: 'Semua Program',
    filterCategory: 'Kategori',
    filterAllCategory: 'Semua Kategori',
    filterYear: 'Tahun',
    filterAllYear: 'Semua Tahun',
    filterPopularTags: 'Tag Populer',
    filterMoreTags: '{count} lainnya',
    filterApply: 'Terapkan Filter',
    filterUnavailable: 'Filter belum tersedia.',
    newsShowingPlaceholder: 'Menampilkan 1–9 dari 128',
    sortNewest: 'Terbaru',
    sortOldest: 'Terlama',
    sortMostRead: 'Terpopuler',
    paginationNav: 'Navigasi halaman',
    paginationPrevious: 'Sebelumnya',
    paginationNext: 'Berikutnya',
    minRead: '{count} menit baca',
    shareAndTags: 'Bagikan dan Tag',
    share: 'Bagikan',
    copyLink: 'Salin Tautan',
    linkCopied: 'Tautan Tersalin',
    relatedStory: 'Kisah Terkait',
    moreFromCategory: 'Selengkapnya dari {category}',
    showMore: 'Selengkapnya',
    showLess: 'Tutup',
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
    noArticles: 'No articles in this language yet.',
    configMissing: 'Not configured yet',
    footerTagline: 'Ocean program by\nRekam Nusantara Foundation.',
    footerCopyright: 'Copyright © Rekam Nusantara Foundation | Unit FRCI',
    stayUpdated: 'Stay Updated',
    learnMore: 'Learn More',
    previousSlide: 'Previous program',
    nextSlide: 'Next program',
    latestEyebrow: 'our Latest ACTIVITY',
    latestHeading: "See our actions for a more sustainable ocean",
    readStory: 'Read Story',
    download: 'Download',
    galleryPrevious: 'Previous image',
    galleryNext: 'Next image',
    newsHeroHeading: 'Explore our stories from the field',
    readFullStory: 'Read the Full Story',
    filterTitle: 'Filter',
    filterAllPrograms: 'All Programs',
    filterCategory: 'Category',
    filterAllCategory: 'All Category',
    filterYear: 'Year',
    filterAllYear: 'All Year',
    filterPopularTags: 'Popular Tags',
    filterMoreTags: '{count} more',
    filterApply: 'Apply Filters',
    filterUnavailable: 'Filter is not available yet.',
    newsShowingPlaceholder: 'Showing 1–9 of 128',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortMostRead: 'Most Read',
    paginationNav: 'Pagination',
    paginationPrevious: 'Previous',
    paginationNext: 'Next',
    minRead: '{count} min read',
    shareAndTags: 'Share and Tags',
    share: 'Share',
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied',
    relatedStory: 'Related Story',
    moreFromCategory: 'More From {category}',
    showMore: 'Show more',
    showLess: 'Show less',
  },
};

export type DictionaryKey = keyof Dictionary;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
