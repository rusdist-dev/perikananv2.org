import type { Locale } from '@/i18n/config';

/**
 * CMS Rekam menandai berita dengan slug taksonomi program-nya sendiri
 * (`related_programs`, contoh: "konservasi-spesies") -- bukan slug rute
 * frontend (`/program/species-conservation`) dan bukan pula nama yang sudah
 * diterjemahkan. Tabel ini satu-satunya tempat yang tahu pemetaan tiga arah
 * itu, sinkron dengan `panelNav` (lib/nav.ts) untuk rute dan `programMeta`
 * (data/programs.ts) untuk ikon/deskripsi.
 */
export const PROGRAM_TAXONOMY = [
  {
    frontendSlug: 'ocean-accounts',
    cmsSlug: 'neraca-sumber-daya-laut',
    name: { id: 'Neraca Sumber Daya Laut', en: 'Ocean Accounts' },
  },
  {
    frontendSlug: 'sustainable-fisheries',
    cmsSlug: 'perikanan-berkelanjutan',
    name: { id: 'Perikanan Berkelanjutan', en: 'Sustainable Fisheries' },
  },
  {
    frontendSlug: 'marine-conservation',
    cmsSlug: 'kawasan-konservasi',
    name: { id: 'Kawasan Konservasi', en: 'Marine Conservation' },
  },
  {
    frontendSlug: 'species-conservation',
    cmsSlug: 'konservasi-spesies',
    name: { id: 'Konservasi Spesies', en: 'Species Conservation' },
  },
  {
    frontendSlug: 'blue-carbon',
    cmsSlug: 'karbon-biru',
    name: { id: 'Karbon Biru', en: 'Blue Carbon' },
  },
  {
    frontendSlug: 'ikan',
    cmsSlug: 'ikan',
    name: { id: 'IKAN', en: 'IKAN' },
  },
] as const satisfies {
  frontendSlug: string;
  cmsSlug: string;
  name: Record<Locale, string>;
}[];

/** Nama program yang dilokalkan, dari slug taksonomi CMS (`related_programs`). */
export function getProgramNameByCmsSlug(cmsSlug: string, locale: Locale): string | null {
  return PROGRAM_TAXONOMY.find((p) => p.cmsSlug === cmsSlug)?.name[locale] ?? null;
}

/** Label program siap tampil untuk baris metadata kartu berita (`TANGGAL ·
 *  KATEGORI · PROGRAM`) -- semua `programs` (`related_programs` mentah)
 *  dilokalkan lalu digabung koma, karena satu berita boleh ditandai lebih
 *  dari satu program sekaligus. Slug yang tidak dikenal taksonomi (belum
 *  didaftarkan di atas) dibuang diam-diam alih-alih menampilkan slug mentah.
 *  null kalau tidak ada satu pun program yang dikenali -- pemanggil melewati
 *  separatornya, bukan menampilkan " · " kosong. */
export function getProgramsLabel(programs: string[], locale: Locale): string | null {
  const names = programs
    .map((slug) => getProgramNameByCmsSlug(slug, locale))
    .filter((name): name is string => name !== null);
  return names.length > 0 ? names.join(', ') : null;
}

/** Slug taksonomi CMS yang dipakai untuk memfilter berita per halaman
 *  /program/<frontendSlug>. */
export function getCmsSlugByFrontendSlug(frontendSlug: string): string | null {
  return PROGRAM_TAXONOMY.find((p) => p.frontendSlug === frontendSlug)?.cmsSlug ?? null;
}
