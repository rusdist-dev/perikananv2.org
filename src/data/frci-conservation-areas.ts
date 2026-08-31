/**
 * Kawasan konservasi tempat FRCI benar-benar bekerja -- daftar putih untuk peta
 * di halaman Marine Conservation, yang tanpa ini menggambar seluruh 554 kawasan
 * konservasi Indonesia dan karenanya tidak memberi tahu apa pun soal wilayah
 * kerja FRCI.
 *
 * `name` WAJIB persis sama dengan `nama_kk` di data/kk2025_simplified.json
 * (huruf besar semua, ejaan resmi KKP): di situlah pencocokannya terjadi --
 * IndonesiaMap menyaring feature lewat properti `name` yang dipasang build step.
 * Nama sehari-hari TIDAK dipakai di sini. "Karang Jahe, Rembang" tersimpan
 * sebagai "... DI WILAYAH KARANG JAHE PROVINSI JAWA TENGAH", Cilacap cuma
 * "KAWASAN KONSERVASI CILACAP", dan Ujungnegoro-Roban sama sekali tidak memakai
 * pola "DI PERAIRAN DI WILAYAH". Cara aman menambah kawasan: cari namanya di
 * berkas sumber, lalu salin apa adanya.
 *
 * `programs` adalah asal-usul baris ini (program FRCI yang menaunginya), bukan
 * data KKP. Ia belum ditampilkan di peta; ia ada supaya daftar ini bisa
 * ditelusuri balik saat ada yang bertanya kenapa satu kawasan masuk dan kawasan
 * tetangganya tidak.
 *
 * Dua hal yang perlu dicek ulang kalau daftar ini direvisi:
 *  - "KAWASAN KONSERVASI SEGARA ANAKAN" (RNF) masih dalam proses penetapan,
 *    tapi geometrinya SUDAH ada di data sumber, jadi ia tetap tergambar.
 *  - Dua baris Raja Ampat memang dua kawasan berbeda: "KEPULAUAN RAJA AMPAT DAN
 *    LAUT SEKITARNYA" dan "DI PERAIRAN KEPULAUAN RAJA AMPAT". Data sumber
 *    menaruh KEDUANYA di PROVINSI PAPUA BARAT -- satu-satunya yang bertanda
 *    PAPUA BARAT DAYA di sana adalah Misool Utara.
 */
export type FrciConservationArea = {
  /** `nama_kk` persis dari data sumber -- kunci pencocokan, bukan label. */
  name: string;
  /** Program FRCI yang bekerja di kawasan ini. */
  programs: string[];
};

export const FRCI_CONSERVATION_AREAS: FrciConservationArea[] = [
  { name: 'KAWASAN KONSERVASI DI PERAIRAN DI LAUT SULAWESI', programs: ['SEASCAPE 1', 'SEASCAPE 2'] },
  { name: 'KAWASAN KONSERVASI DI PERAIRAN DI WILAYAH LIUKANG TANGAYA PROVINSI SULAWESI SELATAN', programs: ['SEASCAPE 1', 'SEASCAPE 2'] },
  { name: 'KAWASAN KONSERVASI DI PERAIRAN DI WILAYAH KARANG JAHE PROVINSI JAWA TENGAH', programs: ['BCAF', 'COAST'] },
  { name: 'KAWASAN KONSERVASI DI PERAIRAN DI WILAYAH PULAU PANJANG PROVINSI JAWA TENGAH', programs: ['BCAF', 'COAST'] },
  { name: 'KAWASAN KONSERVASI DI PERAIRAN DI WILAYAH BETAHWALANG PROVINSI JAWA TENGAH', programs: ['COAST'] },
  { name: 'KAWASAN KONSERVASI PESISIR DAN PULAU-PULAU KECIL UJUNGNEGORO-ROBAN KABUPATEN BATANG DI PROVINSI JAWA TENGAH', programs: ['BCAF', 'COAST'] },
  { name: 'KAWASAN KONSERVASI DI PERAIRAN DI WILAYAH KARANG JERUK PROVINSI JAWA TENGAH', programs: ['BCAF', 'COAST'] },
  { name: 'KAWASAN KONSERVASI CILACAP', programs: ['COAST'] },
  { name: 'KAWASAN KONSERVASI KEPULAUAN ANAMBAS DAN LAUT SEKITARNYA DI PROVINSI KEPULAUAN RIAU', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI PERAIRAN NASIONAL KEPULAUAN ARU BAGIAN TENGGARA DAN LAUT DI SEKITARNYA DI PROVINSI MALUKU', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI PULAU PIEH DAN LAUT SEKITARNYA DI PROVINSI SUMATERA BARAT', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI PERAIRAN NASIONAL LAUT SAWU DAN SEKITARNYA DI PROVINSI NUSA TENGGARA TIMUR', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI KEPULAUAN WAIGEO SEBELAH BARAT DAN LAUT SEKITARNYA DI PROVINSI PAPUA BARAT', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI PULAU GILI AIR, GILI MENO, DAN GILI TRAWANGAN DI PROVINSI NUSA TENGGARA BARAT', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI KEPULAUAN PADAIDO DAN LAUT SEKITARNYA DI PROVINSI PAPUA', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI KEPULAUAN RAJA AMPAT DAN LAUT SEKITARNYA DI PROVINSI PAPUA BARAT', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI KEPULAUAN KAPOPOSANG DAN LAUT SEKITARNYA DI PROVINSI SULAWESI SELATAN', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI PERAIRAN PULAU LIANG, PULAU NGALI, DAN PERAIRAN SEKITARNYA DI PROVINSI NUSA TENGGARA BARAT', programs: ['OA', 'BCAF'] },
  { name: 'KAWASAN KONSERVASI PULAU LIPAN DAN PULAU RAKIT', programs: ['OA', 'BCAF'] },
  { name: 'KAWASAN KONSERVASI LAUT BANDA DAN SEKITARNYA DI PROVINSI MALUKU', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI DI PERAIRAN KEPULAUAN RAJA AMPAT DI PROVINSI PAPUA BARAT', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI DI PERAIRAN DI WILAYAH MISOOL UTARA KEPULAUAN RAJA AMPAT PROVINSI PAPUA BARAT DAYA', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI PERAIRAN GILI SULAT, GILI LAWANG, DAN PERAIRAN SEKITARNYA DI PROVINSI NUSA TENGGARA BARAT', programs: ['OA'] },
  { name: 'KAWASAN KONSERVASI SEGARA ANAKAN', programs: ['RNF'] },
];

/** Bentuk yang diminta IndonesiaMap. Diturunkan, bukan ditulis dua kali. */
export const FRCI_CONSERVATION_AREA_NAMES: string[] = FRCI_CONSERVATION_AREAS.map(
  (area) => area.name,
);
