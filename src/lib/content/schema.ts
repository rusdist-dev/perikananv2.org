import { z } from 'zod';
import { locales } from '@/i18n/config';

/**
 * Batas kepercayaan. Apa pun yang lewat sini boleh dianggap benar oleh sisa
 * aplikasi; apa pun sebelum sini adalah bytes tak dikenal -- JSON lokal hari ini,
 * respons CMS besok. Validasi di sini berarti bidang yang salah nama
 * menghentikan build dengan pesan yang menyebut file dan path-nya, bukan muncul
 * sebagai `undefined` di tengah halaman produksi.
 */

const localeEnum = z.enum(locales);

/** Setiap koleksi wajib punya `lang` -- itu yang membuat konten multi-bahasa
 *  bisa mendarat tanpa mengubah kode kueri. */
const localized = {
  lang: localeEnum,
};

export const articleSchema = z.object({
  ...localized,
  slug: z
    .string()
    .min(1)
    // Slug tanpa titik bukan gaya, tapi syarat: matcher middleware memakai
    // ekstensi untuk membedakan rute dari aset statis.
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug harus kebab-case tanpa titik'),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  publishedAt: z.iso.date(),
  tags: z.array(z.string()).default([]),
});

export type Article = z.output<typeof articleSchema>;

export const articlesSchema = z.array(articleSchema);

/** Daftar koleksi yang dikenal. Kunci di sini menentukan nama file
 *  (src/data/<key>.json), endpoint API, DAN cache tag revalidasi. */
export const collections = {
  articles: articlesSchema,
} as const;

export type CollectionName = keyof typeof collections;
