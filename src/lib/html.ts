/**
 * Entitas bernama yang benar-benar muncul di konten CMS, plus segelintir yang
 * lazim ditulis editor lewat rich text. Sengaja pendek, bukan tabel HTML5
 * lengkap: entitas yang tidak dikenal dibiarkan apa adanya (lihat
 * decodeEntities), jadi daftar yang kurang panjang cuma berarti satu kata
 * tampil sebagaimana aslinya -- bukan teks yang rusak.
 */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d',
  middot: '·',
  times: '×',
  deg: '°',
};

/** Rentang surrogate tidak pernah sah sebagai code point tunggal --
 *  String.fromCodePoint melempar untuk nilai di dalamnya. */
function isValidCodePoint(value: number): boolean {
  return (
    Number.isInteger(value) && value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff)
  );
}

/**
 * Satu kali pindai, bukan rangkaian replace berurutan.
 *
 * Itu penting untuk `&amp;`: mengganti `&amp;` lebih dulu lalu menjalankan
 * penggantian lain di atas hasilnya akan menerjemahkan `&amp;lt;` (teks yang
 * memang ingin menampilkan "&lt;") menjadi `<`. Sekali pindai membuat tiap
 * entitas hanya diproses satu kali.
 */
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi, (match, body: string) => {
    if (body.startsWith('#')) {
      const value = body[1] === 'x' || body[1] === 'X'
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
      return isValidCodePoint(value) ? String.fromCodePoint(value) : match;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/**
 * Mengubah HTML jadi teks polos: tag dibuang, entitas diterjemahkan.
 *
 * Dipakai untuk yang butuh teks murni dari field CMS yang isinya HTML:
 * menurunkan ringkasan ketika CMS tidak mengisi excerpt-nya sendiri, dan
 * menghitung estimasi waktu baca (kata di dalam tag ikut terhitung kalau tidak
 * dibuang dulu).
 *
 * Menerjemahkan entitas BUKAN kerapian: hasil fungsi ini dirender sebagai teks
 * biasa (bukan dangerouslySetInnerHTML), jadi `&nbsp;` yang lolos akan tampil
 * kepada pembaca sebagai enam huruf "&nbsp;" di tengah kalimat -- persis yang
 * terjadi di kartu berita sebelum ini. Aman karena React meng-escape ulang
 * hasilnya saat merender; `&lt;` yang jadi "<" tidak bisa berubah jadi tag.
 *
 * Urutannya disengaja: buang tag -> terjemahkan entitas -> rapatkan spasi.
 * Merapatkan di akhir yang membuat `&nbsp;` (U+00A0, termasuk \s) menyatu jadi
 * spasi biasa alih-alih meninggalkan spasi tak-putus di tengah ringkasan.
 */
export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}
