import type { ColumnMarker } from '@/components/program/jogolaut/BarChart';

/**
 * Data contoh murni untuk pratinjau tata letak -- BUKAN data Shark and Ray
 * sungguhan. Belum ada sumber data/API yang tersambung ke halaman ini.
 * Bentuk histogramnya meniru rancangan acuan (satu puncak di sekitar
 * 90-105 cm, ekor panjang ke kanan), angkanya sendiri karangan untuk
 * keperluan tampilan.
 */

/** Spesies hiu/pari yang benar-benar relevan dengan kerja Species
 *  Conservation FRCI -- daftar tetap NYATA walau selectnya disabled, sama
 *  seperti kode WPP di halaman Publications: opsi yang belum bisa dipilih
 *  tidak berarti opsinya boleh dikarang. */
export const SAMPLE_SPECIES = [
  'Rhynchobatus australiae',
  'Rhincodon typus',
  'Carcharhinus falciformis',
  'Sphyrna lewini',
  'Mobula alfredi',
];

/** Kelas panjang total, 0-315 cm dengan lebar kelas 15 cm. */
export const LENGTH_CLASS_LABELS = [
  '0',
  '15',
  '30',
  '45',
  '60',
  '75',
  '90',
  '105',
  '120',
  '135',
  '150',
  '165',
  '180',
  '195',
  '210',
  '225',
  '240',
  '255',
  '270',
  '285',
  '300',
  '315',
];

export const SAMPLE_LENGTH_FREQUENCY = [
  0, 0, 0, 20, 190, 870, 1520, 1500, 1000, 790, 530, 320, 190, 190, 90, 70, 60, 40, 30, 20, 15, 10,
];

/** Lm (panjang saat matang gonad) dan Linf (panjang asimtotik) -- dua
 *  parameter acuan standar pada grafik frekuensi panjang stok perikanan.
 *  Nilainya diatur mengikuti posisi garis pada rancangan acuan (bukan
 *  dikutip dari literatur spesies tertentu), karena selectnya sendiri masih
 *  contoh statis. */
export const SAMPLE_MARKERS: ColumnMarker[] = [
  { value: 180, label: 'Lm', color: 'series-1' },
  { value: 270, label: 'Linf', color: 'series-3' },
];
