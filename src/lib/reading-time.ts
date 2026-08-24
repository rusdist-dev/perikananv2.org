const WORDS_PER_MINUTE = 200;

/** Dihitung dari jumlah kata isi artikel, bukan angka tetap -- supaya artikel
 *  panjang dan pendek menampilkan durasi baca yang berbeda secara wajar. */
export function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
