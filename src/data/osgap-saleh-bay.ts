/**
 * Angka kartu rapor OSGAP Teluk Saleh (laporan 28 Okt 2026), dipakai
 * /data/osgap-dashboard. Konten statis: tidak ada endpoint CMS untuknya.
 *
 * Hanya bagian yang SAMA di semua bahasa yang ada di sini -- skor, tahun,
 * institusi, sumber. Teksnya (nama, deskripsi, rujukan, tren) ada di
 * i18n/dictionaries/osgap.ts dengan kunci yang sama persis, jadi angka tidak
 * pernah tersalin dua kali dan tidak bisa menyimpang antar locale.
 */

export type OsgapInstitution = 'dkp' | 'social' | 'law' | 'village' | 'blud' | 'dlhk' | 'moe';

export type OsgapIndicatorId =
  | 'grouper'
  | 'snapper'
  | 'gva'
  | 'sra1'
  | 'sra2'
  | 'sra3'
  | 'coral'
  | 'seagrass'
  | 'mgcan'
  | 'mgden'
  | 'ph'
  | 'sst'
  | 'tss'
  | 'evika'
  | 'liang'
  | 'rakit'
  | 'bomb'
  | 'comp'
  | 'plastic';

export type OsgapIndicator = {
  /** Tahun data terakhir. */
  year: number;
  /** Skor SESI 0-100. */
  sesi: number;
  /** Skor SESPI 0-100; null = belum bisa dihitung (observasi terlalu sedikit). */
  sespi: number | null;
  /** Tahun target rujukan. */
  targetYear: number;
  institutions: OsgapInstitution[];
  source: string;
};

const FIP = 'FIP2B NTB / WCS';
const OA_MMAF = 'Saleh Bay OA (MMAF, 2023)';
const REKAM = 'Rekam Nusantara Foundation';
const SRA = 'SRA final report (Salience, WCS, Rekam, 2022)';
const SIDAKO = 'MMAF SIDAKO database';
const OA_SURVEY = 'OA field survey';

export const OSGAP_INDICATORS: Record<OsgapIndicatorId, OsgapIndicator> = {
  grouper: { year: 2024, sesi: 60, sespi: 20.8, targetYear: 2031, institutions: ['dkp'], source: FIP },
  snapper: { year: 2024, sesi: 70, sespi: 30.6, targetYear: 2031, institutions: ['dkp'], source: FIP },
  gva: { year: 2025, sesi: 0, sespi: null, targetYear: 2029, institutions: ['dkp'], source: OA_SURVEY },
  sra1: { year: 2022, sesi: 67.5, sespi: null, targetYear: 2031, institutions: ['dkp', 'social'], source: SRA },
  sra2: { year: 2022, sesi: 83.75, sespi: null, targetYear: 2031, institutions: ['dkp', 'social'], source: SRA },
  sra3: { year: 2022, sesi: 78.75, sespi: null, targetYear: 2031, institutions: ['dkp', 'social'], source: SRA },
  coral: { year: 2024, sesi: 100, sespi: 5.5, targetYear: 2031, institutions: ['blud', 'dlhk'], source: 'DKP NTB / WCS reef monitoring' },
  seagrass: { year: 2023, sesi: 50.7, sespi: 82.8, targetYear: 2031, institutions: ['blud', 'dlhk'], source: REKAM },
  mgcan: { year: 2025, sesi: 40.9, sespi: 0, targetYear: 2031, institutions: ['blud', 'dlhk'], source: REKAM },
  mgden: { year: 2025, sesi: 100, sespi: 100, targetYear: 2031, institutions: ['blud', 'dlhk'], source: REKAM },
  ph: { year: 2022, sesi: 100, sespi: 100, targetYear: 2031, institutions: ['moe', 'dlhk'], source: OA_MMAF },
  sst: { year: 2022, sesi: 93, sespi: 0, targetYear: 2031, institutions: ['moe', 'dlhk'], source: OA_MMAF },
  tss: { year: 2022, sesi: 100, sespi: 100, targetYear: 2031, institutions: ['moe', 'dlhk'], source: OA_MMAF },
  evika: { year: 2025, sesi: 78.3, sespi: 100, targetYear: 2040, institutions: ['blud'], source: SIDAKO },
  liang: { year: 2025, sesi: 79.8, sespi: 100, targetYear: 2040, institutions: ['blud'], source: SIDAKO },
  rakit: { year: 2025, sesi: 76.8, sespi: 100, targetYear: 2040, institutions: ['blud'], source: SIDAKO },
  bomb: { year: 2024, sesi: 0, sespi: 0, targetYear: 2031, institutions: ['dkp', 'law', 'village'], source: FIP },
  comp: { year: 2024, sesi: 1.5, sespi: 50.4, targetYear: 2031, institutions: ['dkp', 'law', 'village'], source: FIP },
  plastic: { year: 2025, sesi: 9.3, sespi: 80.7, targetYear: 2031, institutions: ['village', 'dlhk'], source: OA_SURVEY },
};

/** Indikator yang dihitung di ringkasan SESPI. Tiga skor KKP dihitung SEKALI
 *  lewat rata-rata teluk (`evika`), bukan tiga kali. */
export const OSGAP_TALLY_IDS: OsgapIndicatorId[] = [
  'grouper', 'snapper', 'gva', 'sra1', 'sra2', 'sra3', 'coral', 'seagrass', 'mgcan',
  'mgden', 'ph', 'sst', 'tss', 'evika', 'bomb', 'comp', 'plastic',
];

/** Arah perubahan 2024 -> 2025 di tampilan risiko ekonomi. `kup` = naik tapi
 *  bukan kabar baik (ketergantungan pendapatan yang bertambah). */
export type OsgapTrend = 'gup' | 'right' | 'down' | 'kup';

export type OsgapEconId =
  | 'coral'
  | 'seagrass'
  | 'mangrove'
  | 'sst'
  | 'comp'
  | 'bomb'
  | 'plastic'
  | 'evika'
  | 'grouper'
  | 'snapper'
  | 'land'
  | 'sharefish'
  | 'shareall'
  | 'income'
  | 'dep'
  | 'gva'
  | 'coll'
  | 'trade'
  | 'food';

/** `sesi` null = tidak punya rujukan, digambar dengan latar netral. */
export const OSGAP_ECON: Record<OsgapEconId, { sesi: number | null; trend: OsgapTrend; projected: boolean }> = {
  coral: { sesi: 96.1, trend: 'down', projected: true },
  seagrass: { sesi: 58.8, trend: 'gup', projected: true },
  mangrove: { sesi: 40.9, trend: 'down', projected: true },
  sst: { sesi: 35.6, trend: 'down', projected: true },
  comp: { sesi: 3.1, trend: 'right', projected: true },
  bomb: { sesi: 0, trend: 'down', projected: true },
  plastic: { sesi: 9.3, trend: 'gup', projected: false },
  evika: { sesi: 78.3, trend: 'gup', projected: false },
  grouper: { sesi: 50.6, trend: 'down', projected: true },
  snapper: { sesi: 83, trend: 'gup', projected: true },
  land: { sesi: null, trend: 'down', projected: false },
  sharefish: { sesi: null, trend: 'right', projected: false },
  shareall: { sesi: null, trend: 'right', projected: false },
  income: { sesi: null, trend: 'right', projected: false },
  dep: { sesi: null, trend: 'kup', projected: false },
  gva: { sesi: 0, trend: 'down', projected: false },
  coll: { sesi: null, trend: 'down', projected: false },
  trade: { sesi: null, trend: 'down', projected: false },
  food: { sesi: null, trend: 'gup', projected: false },
};

/** Dasar skenario risiko (nilai 2025, rupiah). */
export const OSGAP_STRESS = {
  fishersIncome: 65914564117.0196,
  fishersCostRatio: 0.19296255055276065,
  collectorsIncome: 33266830000,
  collectorsCostRatio: 0.6400862497131677,
  valueChainGva: 179787692134.89267,
};
