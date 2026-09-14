/**
 * Menghapus tag HTML, menyisakan teks polos.
 *
 * Dipakai untuk dua hal yang butuh teks murni dari `body` artikel yang, saat
 * datang dari CMS, adalah HTML: menurunkan ringkasan ketika CMS tidak mengisi
 * excerpt-nya sendiri, dan menghitung estimasi waktu baca (kata di dalam tag
 * ikut terhitung kalau tidak dibuang dulu).
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
