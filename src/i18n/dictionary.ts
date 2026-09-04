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
  filterApply: string;
  newsShowingCount: string;
  newsNoFilterResults: string;
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
  contactHeroHeading: string;
  contactHeroBody: string;
  contactFormHeading: string;
  contactFormName: string;
  contactFormNamePlaceholder: string;
  contactFormEmail: string;
  contactFormEmailPlaceholder: string;
  contactFormSubject: string;
  contactFormSubjectPlaceholder: string;
  contactFormMessage: string;
  contactFormMessagePlaceholder: string;
  contactFormSubmit: string;
  contactInfoHeading: string;
  contactMapEyebrow: string;
  contactMapHeading: string;
  contactMapOpenLink: string;
  searchPagePlaceholder: string;
  searchPromptHeading: string;
  searchPromptBody: string;
  searchHeadingWithQuery: string;
  searchSummary: string;
  tabAll: string;
  typeProgram: string;
  typePublication: string;
  filterContentType: string;
  filterAllTypes: string;
  filterRelatedSearches: string;
  resultOpen: string;
  searchEmptyEyebrow: string;
  searchEmptyHeading: string;
  searchEmptyNoResults: string;
  searchEmptySuggestion: string;
  searchEmptyGeneric: string;
  searchEmptySearchSuggestion: string;
  searchEmptyBrowsePrograms: string;
  searchEmptyPublicationLibrary: string;
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
    footerTagline: 'Program kelautan oleh\nRekam Nusantara Foundation',
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
    filterApply: 'Terapkan Filter',
    newsShowingCount: 'Menampilkan {from}–{to} dari {total}',
    newsNoFilterResults: 'Tidak ada berita yang cocok dengan filter ini.',
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
    contactHeroHeading: 'Hubungi tim kami',
    contactHeroBody: 'Ada pertanyaan tentang program, kemitraan, atau cara berkolaborasi dengan kami?',
    contactFormHeading: 'Kirim pesan kepada kami',
    contactFormName: 'Nama Lengkap',
    contactFormNamePlaceholder: 'Nama Anda',
    contactFormEmail: 'Email',
    contactFormEmailPlaceholder: 'nama@email.com',
    contactFormSubject: 'Subjek',
    contactFormSubjectPlaceholder: 'Bagaimana kami bisa membantu?',
    contactFormMessage: 'Pesan',
    contactFormMessagePlaceholder: 'Tulis pesan Anda...',
    contactFormSubmit: 'Kirim Pesan',
    contactInfoHeading: 'Kontak & Alamat',
    contactMapEyebrow: 'Lokasi',
    contactMapHeading: 'Temukan Kami',
    contactMapOpenLink: 'Buka di Google Maps',
    searchPagePlaceholder: 'Cari kata kunci...',
    searchPromptHeading: 'Cari',
    searchPromptBody: 'Ketik kata kunci untuk mencari di seluruh program, berita, dan publikasi kami.',
    searchHeadingWithQuery: 'Hasil untuk “{query}”',
    searchSummary: '{count} hasil dari publikasi, berita, dan program.',
    tabAll: 'Semua',
    typeProgram: 'Program',
    typePublication: 'Publikasi',
    filterContentType: 'Jenis Konten',
    filterAllTypes: 'Semua Jenis',
    filterRelatedSearches: 'Pencarian Terkait',
    resultOpen: 'Buka',
    searchEmptyEyebrow: 'Cari',
    searchEmptyHeading: 'Saat tidak ada yang cocok',
    searchEmptyNoResults: 'Tidak ada hasil untuk “{query}”',
    searchEmptySuggestion:
      'Mungkin maksud Anda “{suggestion}”? Anda juga bisa menjelajah berdasarkan program, atau mencari langsung di pustaka publikasi.',
    searchEmptyGeneric:
      'Anda bisa menjelajah berdasarkan program, atau mencari langsung di pustaka publikasi.',
    searchEmptySearchSuggestion: 'Cari “{suggestion}”',
    searchEmptyBrowsePrograms: 'Jelajahi Program',
    searchEmptyPublicationLibrary: 'Pustaka Publikasi',
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
    footerTagline: 'Ocean program by\nRekam Nusantara Foundation',
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
    filterApply: 'Apply Filters',
    newsShowingCount: 'Showing {from}–{to} of {total}',
    newsNoFilterResults: 'No news matches these filters.',
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
    contactHeroHeading: 'Get in touch with our team',
    contactHeroBody: 'Have any questions about our programs, partnerships, or ways to collaborate?',
    contactFormHeading: 'Send us a message',
    contactFormName: 'Full Name',
    contactFormNamePlaceholder: 'Your name',
    contactFormEmail: 'Email',
    contactFormEmailPlaceholder: 'you@email.com',
    contactFormSubject: 'Subject',
    contactFormSubjectPlaceholder: 'How can we help?',
    contactFormMessage: 'Message',
    contactFormMessagePlaceholder: 'Write your message...',
    contactFormSubmit: 'Send Message',
    contactInfoHeading: 'Contact & Address',
    contactMapEyebrow: 'Location',
    contactMapHeading: 'Find Us',
    contactMapOpenLink: 'Open in Google Maps',
    searchPagePlaceholder: 'Search keyword...',
    searchPromptHeading: 'Search',
    searchPromptBody: 'Type a keyword to search across our programs, news, and publications.',
    searchHeadingWithQuery: 'Results for “{query}”',
    searchSummary: '{count} results across publications, news, and programs.',
    tabAll: 'All',
    typeProgram: 'Programs',
    typePublication: 'Publications',
    filterContentType: 'Content Type',
    filterAllTypes: 'All Types',
    filterRelatedSearches: 'Related Searches',
    resultOpen: 'Open',
    searchEmptyEyebrow: 'Search',
    searchEmptyHeading: 'When nothing matches',
    searchEmptyNoResults: 'No results for “{query}”',
    searchEmptySuggestion:
      'Did you mean “{suggestion}”? You can also browse by program, or search the publication library directly.',
    searchEmptyGeneric: 'You can also browse by program, or search the publication library directly.',
    searchEmptySearchSuggestion: 'Search “{suggestion}”',
    searchEmptyBrowsePrograms: 'Browse Programs',
    searchEmptyPublicationLibrary: 'Publication Library',
  },
};

export type DictionaryKey = keyof Dictionary;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
