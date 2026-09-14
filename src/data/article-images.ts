import type { StaticImageData } from 'next/image';
import kegiatan1 from '@/assets/kegiatan1.jpg';
import kegiatan2 from '@/assets/kegiatan2.jpg';
import kegiatan3 from '@/assets/kegiatan3.jpg';

/**
 * Kunci `image` artikel (src/data/articles.json) dipetakan ke sini, bukan
 * dipakai langsung sebagai path -- import statis next/image butuh literal
 * import di kode, dan JSON tidak bisa membawa itu. Kunci yang tidak terdaftar
 * di sini berarti tipo, bukan foto baru: kartu artikel melewati gambarnya
 * (lihat komentar `image` di schema.ts), tidak menebak-nebak nama file.
 */
export const articleImages: Record<string, StaticImageData> = {
  kegiatan1,
  kegiatan2,
  kegiatan3,
};

/**
 * Satu-satunya tempat yang membedakan dua arti `Article.image`.
 *
 * Mode lokal: kunci ke peta di atas. Mode CMS (lib/content/source.ts, saat
 * CONTENT_SOURCE=api): URL absolut ke `cover_url` yang dikembalikan API --
 * next/image menerima StaticImageData maupun string src, jadi cukup
 * dikembalikan apa adanya kalau bukan kunci yang dikenal. `null`/kunci tak
 * dikenal (tipo) sama-sama berarti "lewati gambarnya", bukan merender kotak
 * kosong -- lihat komentar `image` di schema.ts.
 */
export function resolveArticleImage(image: string | null): StaticImageData | string | undefined {
  if (!image) return undefined;
  return articleImages[image] ?? image;
}
