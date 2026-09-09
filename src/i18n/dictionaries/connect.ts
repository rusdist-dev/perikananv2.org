import type { Locale } from '../config';

/** Kosakata untuk seksi menu CONNECT: label nav plus semua UI di halaman
 *  Berita (/berita, /berita/[slug]) dan Kontak (/kontak) -- dua-duanya
 *  satu-satunya isi seksi ini di panelNav (lib/nav.ts). */
export type ConnectDictionary = {
  navConnect: string;
  navNewsAndActivity: string;
  navContact: string;
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
};

export const connectDictionary: Record<Locale, ConnectDictionary> = {
  id: {
    navConnect: 'Hubungi',
    navNewsAndActivity: 'Berita dan Kegiatan',
    navContact: 'Kontak',
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
  },
  en: {
    navConnect: 'Connect',
    navNewsAndActivity: 'News and Activity',
    navContact: 'Contact',
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
  },
};
