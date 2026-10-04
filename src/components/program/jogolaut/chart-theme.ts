import type { Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/number';

/* =========================================================================
   PEMETAAN WARNA GRAFIK

   Kenapa tabel kelas, bukan `` `stroke-${color}` ``: Tailwind v4 memindai
   berkas sumber sebagai TEKS. Kelas yang cuma ada sebagai potongan template
   literal tidak pernah terlihat olehnya, jadi CSS-nya tidak pernah terbit dan
   garisnya kehilangan warna tanpa satu pun error -- persis kegagalan diam
   yang sudah dijaga globals.css dengan `--color-*: initial`.

   Semua nilai di bawah nama kelas utuh yang bisa dipindai, dan semuanya
   turunan token --color-series-* / --color-level-*. Warna baru berarti token
   baru di globals.css, bukan hex di sini.
   ========================================================================= */

export type SeriesColor = 'series-1' | 'series-2' | 'series-3' | 'series-4' | 'series-5' | 'series-6';

type ColorClasses = {
  /** Garis pada SVG. */
  stroke: string;
  /** Area di bawah garis, batang, dan sektor mawar angin. */
  fill: string;
  /** Label seri, angka sumbu, dan nilai besar di kartu. */
  text: string;
  /** Kotak kecil di legenda. */
  swatch: string;
};

export const SERIES_CLASSES: Record<SeriesColor, ColorClasses> = {
  'series-1': {
    stroke: 'stroke-series-1',
    fill: 'fill-series-1',
    text: 'text-series-1',
    swatch: 'bg-series-1',
  },
  'series-2': {
    stroke: 'stroke-series-2',
    fill: 'fill-series-2',
    text: 'text-series-2',
    swatch: 'bg-series-2',
  },
  'series-3': {
    stroke: 'stroke-series-3',
    fill: 'fill-series-3',
    text: 'text-series-3',
    swatch: 'bg-series-3',
  },
  'series-4': {
    stroke: 'stroke-series-4',
    fill: 'fill-series-4',
    text: 'text-series-4',
    swatch: 'bg-series-4',
  },
  'series-5': {
    stroke: 'stroke-series-5',
    fill: 'fill-series-5',
    text: 'text-series-5',
    swatch: 'bg-series-5',
  },
  'series-6': {
    stroke: 'stroke-series-6',
    fill: 'fill-series-6',
    text: 'text-series-6',
    swatch: 'bg-series-6',
  },
};

/** Nama warna status yang dikirim API Jogo Laut (`gauges[].color`,
 *  `ecosystem.color`) -> token seri. API memakai nama warna generik, bukan
 *  token kita; nama yang belum dikenal jatuh ke biru netral, bukan ke merah
 *  atau hijau -- warna yang menyiratkan penilaian tidak boleh muncul dari
 *  tebakan. Warna di sini selalu dipasang BERSAMA teks tingkatnya. */
const API_COLORS: Record<string, SeriesColor> = {
  teal: 'series-1',
  cyan: 'series-1',
  blue: 'series-2',
  violet: 'series-3',
  purple: 'series-3',
  amber: 'series-4',
  orange: 'series-4',
  yellow: 'series-4',
  green: 'series-5',
  // "coral" = tingkat siaga indeks panas, satu di atas "amber" (waspada).
  // Tidak ada token di antara oker dan merah bata, jadi ia ikut merah bata;
  // teks tingkatnya yang membedakan siaga dari bahaya.
  coral: 'series-6',
  red: 'series-6',
  // Status tanpa penilaian (mis. ekosistem "slate"): biru netral, sama dengan
  // fallback, tapi ditulis eksplisit supaya tidak terbaca sebagai nama yang
  // terlewat.
  slate: 'series-2',
  gray: 'series-2',
};

export function apiColor(name: string): SeriesColor {
  return API_COLORS[name.toLowerCase()] ?? 'series-2';
}

/** Pembulatan angka untuk ditampilkan. Dipusatkan di sini supaya "31.4" di
 *  kartu ringkasan dan "31,4" di sumbu grafik tidak pernah berbeda gaya
 *  dalam satu halaman.
 *
 *  `locale` default 'id' karena komponen bersama (ChartFrame, ColumnChart)
 *  juga dipakai halaman data IKAN/BSC/STSC yang belum mengirim locale --
 *  bawaan itu mempertahankan tampilan mereka seperti sebelumnya. */
export function fmt(value: number, digits = 1, locale: Locale = 'id'): string {
  // Aturan pemisahnya (id 1.234,5 / en 1,234.5) tinggal di lib/number.ts.
  return formatNumber(value, locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
