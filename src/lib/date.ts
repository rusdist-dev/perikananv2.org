import type { Locale } from '@/i18n/config';

/** "2026-03-01" -> "01 MAR 2026". Nama bulan dilokalkan lewat Intl (bukan
 *  tabel tulisan tangan yang harus disinkronkan manual tiap locale baru),
 *  tapi urutan hari-bulan-tahun dirakit manual: Intl dengan tiga field
 *  sekaligus mengurutkan menurut kebiasaan locale (en-US jadi "Mar 01, 2026"),
 *  dan itu menyimpang dari desainnya. timeZone: 'UTC' menahan tanggalnya agar
 *  tidak mundur sehari di runtime yang zona waktunya di belakang UTC --
 *  publishedAt disimpan sebagai tanggal kalender polos, bukan instan waktu. */
export function formatArticleDate(publishedAt: string, locale: Locale): string {
  const date = new Date(`${publishedAt}T00:00:00Z`);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(date);

  return `${part({ day: '2-digit' })} ${part({ month: 'short' })} ${part({ year: 'numeric' })}`.toUpperCase();
}
