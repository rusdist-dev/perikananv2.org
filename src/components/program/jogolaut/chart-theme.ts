import type { Level } from './data';

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

/** Tiga tingkat ambang. Dipakai kartu kualitas air, indeks panas, dan status
 *  sensor -- selalu BERSAMA teks levelnya, tidak pernah sendirian. */
export const LEVEL_CLASSES: Record<Level, ColorClasses> = {
  good: {
    stroke: 'stroke-level-good',
    fill: 'fill-level-good',
    text: 'text-level-good',
    swatch: 'bg-level-good',
  },
  warn: {
    stroke: 'stroke-level-warn',
    fill: 'fill-level-warn',
    text: 'text-level-warn',
    swatch: 'bg-level-warn',
  },
  alert: {
    stroke: 'stroke-level-alert',
    fill: 'fill-level-alert',
    text: 'text-level-alert',
    swatch: 'bg-level-alert',
  },
};

/** Pembulatan angka untuk ditampilkan. Dipusatkan di sini supaya "31.4" di
 *  kartu ringkasan dan "31,4" di sumbu grafik tidak pernah berbeda gaya.
 *  Locale id-ID: pemisah desimal koma, ribuan titik. */
export function fmt(value: number, digits = 1): string {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
