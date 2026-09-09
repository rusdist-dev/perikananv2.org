import type { DictionaryKey } from '@/i18n/dictionary';

/**
 * `href` SELALU path tanpa prefiks locale. AppLink yang menambahkannya.
 *
 * Label ditulis dua cara, dan bedanya disengaja:
 *   - `labelKey` untuk frasa yang memang berubah antar bahasa ("Tentang Kami").
 *   - `label` untuk NAMA DIRI -- nama program dan produk data yang sama di
 *     semua bahasa. Memaksanya lewat kamus berarti menduplikasi string
 *     identik di setiap locale, dan setiap duplikat itu bisa menyimpang.
 *
 * Union di bawah membuat keduanya saling meniadakan: satu item tidak bisa
 * punya dua-duanya, dan tidak bisa tidak punya keduanya.
 */
export type NavItem = { href: string } & (
  | { labelKey: DictionaryKey; label?: never }
  | { label: string; labelKey?: never }
);

export type NavSection = {
  /** Dipakai sebagai id elemen untuk aria-labelledby. */
  id: string;
  headingKey: DictionaryKey;
  items: NavItem[];
};

/**
 * Seksi PROGRAM sengaja jadi yang pertama: ia satu-satunya yang tetap terlihat
 * saat panel diminimalkan, jadi urutannya bukan sekadar selera.
 */
export const panelNav: NavSection[] = [
  {
    id: 'nav-program',
    headingKey: 'navProgram',
    items: [
      { href: '/program/ocean-accounts', labelKey: 'navOceanAccounts' },
      { href: '/program/sustainable-fisheries', labelKey: 'navSustainableFisheries' },
      { href: '/program/marine-conservation', labelKey: 'navMarineConservation' },
      { href: '/program/species-conservation', labelKey: 'navSpeciesConservation' },
      { href: '/program/blue-carbon', labelKey: 'navBlueCarbon' },
      { href: '/program/ikan', label: 'IKAN' },
    ],
  },
  {
    id: 'nav-discover',
    headingKey: 'navDiscover',
    items: [
      { href: '/discover/about-us', labelKey: 'navAboutUs' },        
      { href: '/discover/our-team', labelKey: 'navOurTeam' },        
      { href: '/discover/achievements', labelKey: 'navAchievements' }, 
      { href: '/discover/our-impact', labelKey: 'navOurImpact' },    
      { href: '/discover/publications', labelKey: 'navPublications' }, 
      { href: '/discover/jogo-laut', label: 'Jogo Laut' },                    
    ],
  },
  {
    id: 'nav-data',
    headingKey: 'navData',
    items: [
      { href: '/data/ikan', label: 'IKAN' },
      { href: '/data/data-crab', labelKey: 'navDataCrab' },
      { href: '/data/shark-and-ray', labelKey: 'navSharkAndRay' },
      { href: '/data/production-data', labelKey: 'navProductionData' },
      { href: '/data/vessel-data', labelKey: 'navVesselData' },
    ],
  },
  {
    id: 'nav-connect',
    headingKey: 'navConnect',
    items: [
      { href: '/berita', labelKey: 'navNewsAndActivity' },
      { href: '/kontak', labelKey: 'navContact' },
    ],
  },
];

/** Seksi yang bertahan saat panel diminimalkan. */
export const MINIMIZED_SECTION_ID = 'nav-program';

/** Footer sengaja pendek dan hanya memuat rute yang halamannya sudah ada --
 *  ia muncul di setiap halaman, jadi link mati di sini terlihat paling sering. */
export const footerNav: NavItem[] = [{ href: '/berita', labelKey: 'navNewsAndActivity' }];

/** Rute statis untuk sitemap. Rute dinamis (/berita/[slug]) ditambahkan
 *  sitemap.ts dari lib/content, bukan didaftarkan tangan di sini.
 *
 *  Sengaja TIDAK diturunkan dari panelNav: panel memuat rute yang halamannya
 *  belum dibangun, dan sitemap yang mengiklankan URL 404 lebih merugikan
 *  daripada sitemap yang pendek. */
export const staticRoutes: string[] = [
  '/',
  '/berita',
  '/kontak',
  '/cari',
  '/data/ikan',
  '/data/data-crab',
  '/data/shark-and-ray',
  '/data/production-data',
  '/data/vessel-data',
];
