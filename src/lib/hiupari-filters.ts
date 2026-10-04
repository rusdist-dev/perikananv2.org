/**
 * Kosakata filter dataset HIUPARI (hiu dan pari, `/data/shark-and-ray`).
 *
 * Sengaja TANPA dependensi, alasannya sama dengan ikan-filters.ts dan
 * bsc-filters.ts: modul ini dipakai di dua sisi sekaligus -- source.ts (server,
 * menyusun URL ke CMS) dan HiupariFilterPanel (klien, menyusun form).
 *
 * Yang membuatnya JAUH lebih pendek dari dua saudaranya: dataset ini tidak
 * punya hierarki wilayah sama sekali. Satu-satunya endpoint opsi adalah
 * `/opsi/spesies`, jadi tidak ada rantai tingkat, tidak ada
 * ancestorSelection, dan tidak ada pilihan yang perlu dibatalkan saat tingkat
 * di atasnya berubah. Memaksakan kerangka bertingkat ke sini berarti menulis
 * mesin pembatal untuk hierarki yang cuma sedalam satu.
 */

/** Satu pilihan pada dropdown spesies.
 *
 *  `jumlahIndividu`, BUKAN `jumlahTrip` seperti IKAN dan BSC: yang dicacah
 *  dataset ini individu yang diukur, dan memang tidak ada konsep trip di
 *  endpoint-nya. */
export type HiupariOption = {
  value: string;
  jumlahIndividu: number;
};

/** Cara panjang diukur.
 *
 *  Lima besaran yang BERBEDA pada hewan yang sama, bukan lima satuan: panjang
 *  total diukur sampai ujung ekor, fork length sampai cabang ekor, precaudal
 *  length sampai pangkal ekor, predorsal length sampai sirip punggung pertama,
 *  dan panjang headless adalah sisa badan setelah kepala dibuang (bentuk yang
 *  tiba di pendaratan, bukan bentuk hidupnya). Memilih salah satunya karena
 *  itu menentukan APA yang dibaca sumbu datarnya.
 *
 *  Tidak ada "gabungkan semua" di sini, berbeda dari `tipe_panjang` IKAN:
 *  menggabungkan panjang total dengan panjang headless berarti menumpuk dua
 *  besaran yang selisihnya sebesar kepala hewannya. API mewajibkan satu
 *  nilai, dan bawaannya `panjang_total`. */
export const HIUPARI_SIZE_TYPES = [
  'panjang_total',
  'precaudal_length',
  'fork_length',
  'predorsal_length',
  'panjang_headless',
] as const;

export type HiupariSizeType = (typeof HIUPARI_SIZE_TYPES)[number];

export function isHiupariSizeType(value: unknown): value is HiupariSizeType {
  return typeof value === 'string' && (HIUPARI_SIZE_TYPES as readonly string[]).includes(value);
}

/* Label tampilan tiap jenis ukuran ada di kamus (i18n/dictionaries/
   fisheries.ts, `sizeTypes`), per locale -- yang dikirim API snake_case, dan
   "panjang_total" bukan sesuatu yang pantas muncul di dropdown. */

/** Jenis kelamin. Huruf tunggal, mengikuti API -- bukan 'JANTAN'/'BETINA'
 *  seperti BSC.
 *
 *  null (bawaan) = keduanya digabung. Konsekuensinya TIDAK simetris dengan
 *  rajungan, dan ini yang paling mudah salah dibaca: Lm hiu-pari dihitung dari
 *  kematangan KLASPER, organ yang hanya dimiliki jantan. Betina karena itu
 *  selalu tercatat nol, jadi `lm` dan `persen_matang` datang null untuk F
 *  MAUPUN untuk gabungan -- hanya M yang menghasilkan angka. */
export const HIUPARI_SEXES = ['M', 'F'] as const;

export type HiupariSex = (typeof HIUPARI_SEXES)[number];

export function isHiupariSex(value: unknown): value is HiupariSex {
  return typeof value === 'string' && (HIUPARI_SEXES as readonly string[]).includes(value);
}

/** Batas `selang_kelas` yang diterima API. Lebar selang menentukan berapa
 *  banyak batang yang muncul: pada sebaran 34-392 cm hari ini, 1 cm
 *  menghasilkan 359 kelas dan 10 cm menghasilkan 37. */
export const HIUPARI_CLASS_INTERVAL_MIN = 0.1;
export const HIUPARI_CLASS_INTERVAL_MAX = 50;

/** Ambang kematangan klasper yang dihitung sebagai "matang".
 *
 *  Angka 1-3 yang dipakai API dua kali: untuk `persen_matang` dan untuk
 *  menginterpolasi Lm (panjang saat 50% individu mencapai kematangan klasper
 *  >= ambang ini). Menurunkan ambangnya menggeser Lm jauh ke kiri -- pada
 *  ambang 1 ia jatuh di 45 cm, pada ambang 3 di 116 cm untuk spesies yang
 *  sama. Itu keputusan biologis, bukan tampilan, dan karena itu ada di form. */
export const HIUPARI_MATURITY_LEVELS = [1, 2, 3] as const;

export type HiupariMaturity = (typeof HIUPARI_MATURITY_LEVELS)[number];

export function isHiupariMaturity(value: unknown): value is HiupariMaturity {
  return value === 1 || value === 2 || value === 3;
}

/** Satu permintaan grafik frekuensi panjang.
 *
 *  `spesies` null = seluruh spesies digabung. Itu pilihan yang SAH di API, tapi
 *  hasilnya histogram lintas spesies -- Squalus 31 cm dan Alopias 392 cm dalam
 *  satu sebaran. Kartu grafiknya yang menyampaikan konsekuensi itu; lapisan ini
 *  tidak memaksakan pilihan. */
export type HiupariLengthQuery = {
  spesies: string | null;
  jenisKelamin: HiupariSex | null;
  jenisUkuran: HiupariSizeType;
  selangKelas: number;
  kematanganMatang: HiupariMaturity;
};
