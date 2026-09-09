import type { Locale } from '../config';

/**
 * Kosakata lintas halaman: chrome (nav/menu/footer), beranda, dan halaman
 * pencarian (/cari) -- semuanya dipakai di lebih dari satu kategori menu
 * (PROGRAM/DISCOVER/DATA/CONNECT), jadi tidak masuk salah satu file kategori.
 */
export type CommonDictionary = {
  skipToContent: string;
  openMenu: string;
  closeMenu: string;
  minimizeMenu: string;
  expandMenu: string;
  primaryNav: string;
  footerNav: string;
  languageSwitcher: string;
  search: string;
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
  read: string;
  pdfUnavailable: string;
  close: string;
  download: string;
  galleryPrevious: string;
  galleryNext: string;
  homeHeroEyebrow: string;
  homeHeroHeading: string;
  homeHeroBody: string;
  homeImpactHeading: string;
  homeImpactBody: string;
  homeImpactCta: string;
  impactStatMarineProtectedAreas: string;
  impactStatAreaBasedManagement: string;
  impactStatFisheriesManagementAreas: string;
  impactStatCommunityGroups: string;
  impactStatFieldEnumerators: string;
  impactStatStudentInternships: string;
  homePublicationsEyebrow: string;
  homePublicationsHeading: string;
  homeFeaturedVideo: string;
  latestEyebrow: string;
  latestHeading: string;
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

export const commonDictionary: Record<Locale, CommonDictionary> = {
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
    read: 'Baca',
    pdfUnavailable: 'PDF ini belum tersedia.',
    close: 'Tutup',
    download: 'Unduh',
    galleryPrevious: 'Gambar sebelumnya',
    galleryNext: 'Gambar berikutnya',
    homeHeroEyebrow: 'Tempat Data Laut Bertemu Aksi Lokal',
    homeHeroHeading: 'Mengukur yang penting, menghitung yang berarti, mengubah data menjadi aksi',
    homeHeroBody:
      "REKAM/FRCI (Fisheries Resource Center of Indonesia) adalah program Kelautan dari Rekam Nusantara Foundation, yang menawarkan pendekatan alternatif untuk analisis perikanan dan pengelolaan kelautan berkelanjutan berbasis data ilmiah. Kami menerapkan sains dan teknologi inovatif untuk melindungi spesies penting, mendorong perikanan berkelanjutan, dan memperkuat pengelolaan kawasan konservasi laut, sekaligus merintis integrasi neraca sumber daya laut dan jasa ekosistem ke dalam cara Indonesia mengelola lautnya. Dalam menjalankan programnya, REKAM/FRCI bermitra dengan para pemangku kepentingan dan pembuat kebijakan, serta melibatkan masyarakat secara langsung dalam pengumpulan data. Berpedoman pada visi keberlanjutan dan keadilan bagi perikanan Indonesia, kami bertujuan memimpin perubahan menuju tata kelola laut yang berbasis bukti dan inklusif, demi lingkungan laut yang lestari untuk generasi mendatang.",
    homeImpactHeading: 'Bukti aksi kami yang menjangkau seluruh perairan Indonesia',
    homeImpactBody:
      'Kerangka Neraca Sumber Daya Laut FRCI kini aktif di seluruh 8 Wilayah Pengelolaan Perikanan Indonesia, menerjemahkan data tangkapan dan ekosistem dari lapangan menjadi kebijakan yang bisa ditindaklanjuti masyarakat.',
    homeImpactCta: 'Lihat Peta Lengkap',
    impactStatMarineProtectedAreas: 'Kawasan Konservasi Perairan',
    impactStatAreaBasedManagement: 'Pengelolaan Berbasis Kawasan',
    impactStatFisheriesManagementAreas: 'Wilayah Pengelolaan Perikanan',
    impactStatCommunityGroups: 'Kelompok Masyarakat',
    impactStatFieldEnumerators: 'Enumerator Lapangan',
    impactStatStudentInternships: 'Magang Mahasiswa',
    homePublicationsEyebrow: 'Publikasi Kami',
    homePublicationsHeading: 'Hasil kerja dan kolaborasi kami',
    homeFeaturedVideo: 'Video Pilihan',
    latestEyebrow: 'Terbaru',
    latestHeading: 'Apa yang Terjadi di Setiap Program Kami',
    searchPagePlaceholder: 'Cari kata kunci...',
    searchPromptHeading: 'Cari',
    searchPromptBody: 'Ketik kata kunci untuk mencari di seluruh program, berita, dan publikasi kami.',
    searchHeadingWithQuery: 'Hasil untuk "{query}"',
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
    searchEmptyNoResults: 'Tidak ada hasil untuk "{query}"',
    searchEmptySuggestion:
      'Mungkin maksud Anda "{suggestion}"? Anda juga bisa menjelajah berdasarkan program, atau mencari langsung di pustaka publikasi.',
    searchEmptyGeneric:
      'Anda bisa menjelajah berdasarkan program, atau mencari langsung di pustaka publikasi.',
    searchEmptySearchSuggestion: 'Cari "{suggestion}"',
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
    read: 'Read',
    pdfUnavailable: 'This PDF is not available yet.',
    close: 'Close',
    download: 'Download',
    galleryPrevious: 'Previous image',
    galleryNext: 'Next image',
    homeHeroEyebrow: 'Where Ocean Data Meets Local Action',
    homeHeroHeading: 'Measuring what matters, counting what counts, turning data into actions',
    homeHeroBody:
      "REKAM/FRCI (Fisheries Resource Center of Indonesia) is Rekam Nusantara Foundation's Ocean program, offering an alternative approach to fisheries analysis and sustainable marine management grounded in scientific data. We apply innovative science and technology to protect critical species, promote sustainable fishing, and strengthen the management of marine conservation areas, while pioneering the integration of ocean accounting and ecosystem services into how Indonesia manages its seas. In carrying out our programs, REKAM/FRCI partners with stakeholders and policymakers, and involves communities directly in data collection. Guided by our vision of sustainability and justice for Indonesian fisheries, we aim to lead the shift toward evidence-based, inclusive ocean governance, ensuring a thriving marine environment for generations to come.",
    homeImpactHeading: "Evidence of our action that reaches across Indonesia's seas",
    homeImpactBody:
      "FRCI's Ocean Accounts framework is now active in all 8 of Indonesia's Fisheries Management Areas, translating field-level catch and ecosystem data into policy that communities can act on.",
    homeImpactCta: 'View the Full Map',
    impactStatMarineProtectedAreas: 'Marine Protected Areas',
    impactStatAreaBasedManagement: 'Area-Based Management',
    impactStatFisheriesManagementAreas: 'Fisheries Management Areas',
    impactStatCommunityGroups: 'Community Groups',
    impactStatFieldEnumerators: 'Field Enumerators',
    impactStatStudentInternships: 'Student Internships',
    homePublicationsEyebrow: 'Our Publication',
    homePublicationsHeading: 'The results of our work and collaboration',
    homeFeaturedVideo: 'Featured Video',
    latestEyebrow: 'our Latest ACTIVITY',
    latestHeading: 'See our actions for a more sustainable ocean',
    searchPagePlaceholder: 'Search keyword...',
    searchPromptHeading: 'Search',
    searchPromptBody: 'Type a keyword to search across our programs, news, and publications.',
    searchHeadingWithQuery: 'Results for "{query}"',
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
    searchEmptyNoResults: 'No results for "{query}"',
    searchEmptySuggestion:
      'Did you mean "{suggestion}"? You can also browse by program, or search the publication library directly.',
    searchEmptyGeneric: 'You can also browse by program, or search the publication library directly.',
    searchEmptySearchSuggestion: 'Search "{suggestion}"',
    searchEmptyBrowsePrograms: 'Browse Programs',
    searchEmptyPublicationLibrary: 'Publication Library',
  },
};
