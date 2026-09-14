/**
 * Memecah `body` artikel jadi array paragraf untuk dirender satu `<p>` per
 * elemen.
 *
 * `body` datang dalam dua bentuk tergantung sumber (lihat lib/content/schema.ts):
 * teks polos (JSON lokal contoh, batas paragrafnya baris kosong ganda) atau
 * HTML tersanitasi dari CMS (batas paragrafnya tag `<p>`). Kalau ada tag `<p>`,
 * itu yang dipakai; kalau tidak ada satu pun, baru jatuh balik ke pemisah
 * baris-kosong-ganda -- supaya perilaku lama (JSON lokal) tidak berubah.
 */
export function getBodyParagraphs(body: string): string[] {
  const trimmed = body.trim();
  const htmlParagraphs = [...trimmed.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);

  if (htmlParagraphs.length > 0) return htmlParagraphs;

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
