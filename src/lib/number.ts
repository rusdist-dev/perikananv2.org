import type { Locale } from '@/i18n/config';

/**
 * Format angka situs, satu-satunya tempat aturan pemisahnya ditulis:
 *
 *   id -> 1.234.567,89  (ribuan titik, desimal koma)
 *   en -> 1,234,567.89  (ribuan koma, desimal titik)
 *
 * Tag BCP 47 lengkap (id-ID, en-US), bukan kode locale situs apa adanya: 'en'
 * polos menyerahkan pilihan wilayah ke data ICU runtime, dan aturan di atas
 * harus berlaku sama di server Node maupun di browser pengunjung -- markup
 * server dan hasil hidrasi yang berbeda format adalah hydration mismatch.
 */
const NUMBER_LOCALE: Record<Locale, string> = { id: 'id-ID', en: 'en-US' };

export function numberLocale(locale: Locale): string {
  return NUMBER_LOCALE[locale];
}

/** Angka -> teks menurut aturan pemisah locale. Opsi Intl lainnya (jumlah
 *  desimal, notasi ringkas) diteruskan apa adanya. */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], options).format(value);
}
