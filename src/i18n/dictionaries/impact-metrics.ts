import type { Locale } from '../config';

/**
 * Label metrik pendataan pesisir per locale, dicari lewat `key` dari CMS.
 *
 * CMS (`/ext/coast/desa/{kode}` dan `/ext/coast/statistik`) hanya mengirim
 * label bahasa Indonesia, jadi labelnya ditulis manual di sini, bukan diambil
 * dari `VillageMetric.label`. Dua jenis key:
 *
 * 1. INDIKATOR TETAP (snake_case): strukturnya dari skema pendataan dan tidak
 *    bertambah tanpa perubahan formulir.
 * 2. KATEGORI ISIAN (kebab-case): slug dari nama komoditas, produk, atau
 *    spesies yang diketik petugas di formulir -- daftarnya BERTAMBAH tiap ada
 *    isian baru. Yang ada di sini adalah seluruh key yang terlihat di CMS saat
 *    berkas ini ditulis (2026-10-04, 19 desa).
 *
 * Key yang tidak ada di sini jatuh ke label CMS apa adanya (lihat
 * `metricLabel` di lib/metrics.ts), jadi isian baru tetap tampil -- hanya
 * belum diterjemahkan. Nama ilmiah spesies (Rhizophora mucronata, Bruguiera,
 * ...) sengaja TIDAK dicantumkan: namanya sama di semua bahasa, dan label CMS
 * sudah benar. Begitu pula salah ketik di CMS ("Rihzophora") -- yang
 * membetulkannya CMS, bukan kamus ini.
 *
 * `short` = label saat metrik itu tampil sebagai RINCIAN di bawah induknya.
 * CMS sendiri melakukannya: `luas_ekosistem_mangrove` berlabel "Luas Ekosistem
 * Mangrove" di totalan, tapi "Mangrove" saja di bawah "Total Luas Ekosistem"
 * -- mengulang "Luas Ekosistem" di tiap baris rincian cuma menambah bacaan.
 */
export type MetricLabel = { full: string; short?: string };

const id: Record<string, MetricLabel> = {
  /* --- Indikator tetap --- */
  luas_ekosistem_total: { full: 'Total Luas Ekosistem' },
  luas_ekosistem_mangrove: { full: 'Luas Ekosistem Mangrove', short: 'Mangrove' },
  luas_ekosistem_lamun: { full: 'Luas Ekosistem Lamun', short: 'Lamun' },
  luas_ekosistem_terumbu_karang: { full: 'Luas Ekosistem Terumbu Karang', short: 'Terumbu Karang' },
  nilai_ekonomi_total: { full: 'Total Nilai Ekonomi' },
  nilai_valuasi: { full: 'Nilai Valuasi' },
  nilai_pendapatan: { full: 'Nilai Pendapatan' },
  luas_area_konservasi: { full: 'Luas Area Konservasi' },
  luas_area_direhabilitasi: { full: 'Luas Area Direhabilitasi' },
  dampak_ekonomi_produksi: { full: 'Dampak Ekonomi (Produksi)' },
  dampak_ekonomi_unit_terjual: { full: 'Dampak Ekonomi (Unit Terjual)' },
  orang_dilatih_total: { full: 'Total Orang Dilatih' },
  orang_dilatih_pria: { full: 'Pria' },
  orang_dilatih_wanita: { full: 'Wanita' },
  orang_dilatih_remaja: { full: 'Remaja' },
  orang_dilatih_lansia: { full: 'Lansia' },
  orang_dilatih_disabilitas: { full: 'Disabilitas' },
  orang_terlibat_total: { full: 'Total Orang Terlibat' },
  orang_terlibat_pria: { full: 'Pria' },
  orang_terlibat_wanita: { full: 'Wanita' },
  orang_terlibat_remaja: { full: 'Remaja' },
  orang_terlibat_lansia: { full: 'Lansia' },
  orang_terlibat_disabilitas: { full: 'Disabilitas' },
  nilai_stok_karbon: { full: 'Nilai Stok Karbon' },

  /* --- Kategori isian: kelompok kegiatan --- */
  'perikanan-tangkap': { full: 'Perikanan Tangkap' },
  budidaya: { full: 'Budidaya' },
  silvofishery: { full: 'Silvofishery' },
  'penjualan-bibit-mangrove': { full: 'Penjualan Bibit Mangrove' },
  'pengolahan-hasil-perikanan': { full: 'Pengolahan Hasil Perikanan' },
  wisata: { full: 'Wisata' },
  lainnya: { full: 'Lainnya' },

  /* --- Kategori isian: komoditas --- */
  bandeng: { full: 'Bandeng' },
  'bandengudang-windu': { full: 'Bandeng, Udang Windu' },
  belanak: { full: 'Belanak' },
  belut: { full: 'Belut' },
  kakap: { full: 'Kakap' },
  kepiting: { full: 'Kepiting' },
  'kepiting-bakau': { full: 'Kepiting Bakau' },
  'kepitingkakap-dan-belanak': { full: 'Kepiting, Kakap, dan Belanak' },
  kerapu: { full: 'Kerapu' },
  nila: { full: 'Nila' },
  'nila-salin': { full: 'Nila Salin' },
  rajungan: { full: 'Rajungan' },
  'rumput-laut': { full: 'Rumput Laut' },
  udang: { full: 'Udang' },
  'udang-jerebung': { full: 'Udang Jerebung' },
  'udang-putih-kepiting-bakau': { full: 'Udang Putih, Kepiting Bakau' },
  'udang-windu': { full: 'Udang Windu' },
  'udangikan-kiperkepiting-bakau': { full: 'Udang, Ikan Kiper, Kepiting Bakau' },

  /* --- Kategori isian: produk olahan --- */
  'bandeng-presto': { full: 'Bandeng Presto' },
  'kerupuk-cumi': { full: 'Kerupuk Cumi' },
  'kerupuk-ikan': { full: 'Kerupuk Ikan' },
  'kerupuk-rumput-laut': { full: 'Kerupuk Rumput Laut' },
  'rengginang-kepiting': { full: 'Rengginang Kepiting' },
};

const en: Record<string, MetricLabel> = {
  luas_ekosistem_total: { full: 'Total Ecosystem Area' },
  luas_ekosistem_mangrove: { full: 'Mangrove Ecosystem Area', short: 'Mangrove' },
  luas_ekosistem_lamun: { full: 'Seagrass Ecosystem Area', short: 'Seagrass' },
  luas_ekosistem_terumbu_karang: { full: 'Coral Reef Ecosystem Area', short: 'Coral Reef' },
  nilai_ekonomi_total: { full: 'Total Economic Value' },
  nilai_valuasi: { full: 'Valuation' },
  nilai_pendapatan: { full: 'Income' },
  luas_area_konservasi: { full: 'Conservation Area' },
  luas_area_direhabilitasi: { full: 'Rehabilitated Area' },
  dampak_ekonomi_produksi: { full: 'Economic Impact (Production)' },
  dampak_ekonomi_unit_terjual: { full: 'Economic Impact (Units Sold)' },
  orang_dilatih_total: { full: 'Total People Trained' },
  orang_dilatih_pria: { full: 'Men' },
  orang_dilatih_wanita: { full: 'Women' },
  orang_dilatih_remaja: { full: 'Youth' },
  orang_dilatih_lansia: { full: 'Elderly' },
  orang_dilatih_disabilitas: { full: 'People with Disabilities' },
  orang_terlibat_total: { full: 'Total People Engaged' },
  orang_terlibat_pria: { full: 'Men' },
  orang_terlibat_wanita: { full: 'Women' },
  orang_terlibat_remaja: { full: 'Youth' },
  orang_terlibat_lansia: { full: 'Elderly' },
  orang_terlibat_disabilitas: { full: 'People with Disabilities' },
  nilai_stok_karbon: { full: 'Carbon Stock' },

  'perikanan-tangkap': { full: 'Capture Fisheries' },
  budidaya: { full: 'Aquaculture' },
  silvofishery: { full: 'Silvofishery' },
  'penjualan-bibit-mangrove': { full: 'Mangrove Seedling Sales' },
  'pengolahan-hasil-perikanan': { full: 'Fish Product Processing' },
  wisata: { full: 'Tourism' },
  lainnya: { full: 'Others' },

  bandeng: { full: 'Milkfish' },
  'bandengudang-windu': { full: 'Milkfish, Tiger Prawn' },
  belanak: { full: 'Mullet' },
  belut: { full: 'Eel' },
  kakap: { full: 'Snapper' },
  kepiting: { full: 'Crab' },
  'kepiting-bakau': { full: 'Mud Crab' },
  'kepitingkakap-dan-belanak': { full: 'Crab, Snapper, and Mullet' },
  kerapu: { full: 'Grouper' },
  nila: { full: 'Tilapia' },
  'nila-salin': { full: 'Saline Tilapia' },
  rajungan: { full: 'Blue Swimming Crab' },
  'rumput-laut': { full: 'Seaweed' },
  udang: { full: 'Shrimp' },
  'udang-jerebung': { full: 'Banana Prawn' },
  'udang-putih-kepiting-bakau': { full: 'White Shrimp, Mud Crab' },
  'udang-windu': { full: 'Tiger Prawn' },
  'udangikan-kiperkepiting-bakau': { full: 'Shrimp, Spotted Scat, Mud Crab' },

  'bandeng-presto': { full: 'Pressure-Cooked Milkfish' },
  'kerupuk-cumi': { full: 'Squid Crackers' },
  'kerupuk-ikan': { full: 'Fish Crackers' },
  'kerupuk-rumput-laut': { full: 'Seaweed Crackers' },
  'rengginang-kepiting': { full: 'Crab Rice Crackers' },
};

/** Satuan dari CMS -> tampilan per locale. Satuan yang tidak tercantum
 *  (ha, kg, Rp, Mg C) memang sama di kedua bahasa dan dipakai apa adanya. */
const UNITS: Record<Locale, Record<string, string>> = {
  id: {},
  en: { orang: 'people', unit: 'units' },
};

const LABELS: Record<Locale, Record<string, MetricLabel>> = { id, en };

/** Label metrik menurut key, atau null bila key-nya belum ada di kamus. */
export function lookupMetricLabel(key: string, locale: Locale, nested: boolean): string | null {
  const entry = LABELS[locale][key];
  if (!entry) return null;
  return nested ? (entry.short ?? entry.full) : entry.full;
}

export function translateMetricUnit(unit: string, locale: Locale): string {
  return UNITS[locale][unit] ?? unit;
}
