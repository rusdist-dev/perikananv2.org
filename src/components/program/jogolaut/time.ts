import type { Locale } from '@/i18n/config';

/* =========================================================================
   WAKTU STASIUN

   API mengirim waktu sebagai "YYYY-MM-DD HH:mm:ss" pada zona stasiun
   (+07:00). Di sini string itu dibaca per komponen, TIDAK lewat `new Date(s)`
   + toLocaleString: halaman dirender di server yang zonanya belum tentu WIB,
   dan konversi zona apa pun akan menggeser jam pembacaan sensor. Angka
   milidetik dari `stamp()` karena itu bukan waktu absolut -- ia cuma dipakai
   untuk mengukur JARAK antar-pembacaan di sumbu-x.
   ========================================================================= */

const MONTHS: Record<Locale, string[]> = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

type Parts = { y: number; mo: number; d: number; h: number; mi: number };

function parts(value: string): Parts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] };
}

/** Milidetik "naif" (komponen dibaca sebagai UTC). Hanya untuk selisih. */
export function stamp(value: string): number {
  const p = parts(value);
  return p ? Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi) : NaN;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "27 Sep" */
export function dayLabel(value: string, locale: Locale): string {
  const p = parts(value);
  return p ? `${pad(p.d)} ${MONTHS[locale][p.mo - 1]}` : value;
}

/** "27 Sep 23:40" */
export function dateTimeLabel(value: string, locale: Locale): string {
  const p = parts(value);
  return p ? `${dayLabel(value, locale)} ${pad(p.h)}:${pad(p.mi)}` : value;
}

/** "23:40" */
export function clockLabel(value: string): string {
  const p = parts(value);
  return p ? `${pad(p.h)}:${pad(p.mi)}` : value;
}

/** Label dari angka milidetik naif hasil `stamp()` -- untuk tick sumbu yang
 *  jatuh di antara dua pembacaan. */
export function dayLabelFromStamp(ms: number, locale: Locale): string {
  const d = new Date(ms);
  return `${pad(d.getUTCDate())} ${MONTHS[locale][d.getUTCMonth()]}`;
}

/** "06:00" dari angka milidetik naif hasil `stamp()`. */
export function clockLabelFromStamp(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** "27 Sep - 03 Okt 2026" */
export function rangeLabel(from: string | null, to: string | null, locale: Locale): string | null {
  if (!from || !to) return null;
  const year = parts(to)?.y;
  return `${dayLabel(from, locale)} - ${dayLabel(to, locale)}${year ? ` ${year}` : ''}`;
}
