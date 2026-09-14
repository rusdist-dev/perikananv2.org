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
  /** Teks polos (JSON lokal) atau HTML (mode CMS) -- kalau HTML, source.ts
   *  sudah men-sanitasinya (DOMPurify) sebelum sampai sini, jadi halaman
   *  boleh merendernya lewat dangerouslySetInnerHTML tanpa sanitasi ulang.
   *  Lihat lib/article-body.ts untuk cara keduanya dipecah jadi paragraf. */
  body: z.string().min(1),
  publishedAt: z.iso.date(),
  tags: z.array(z.string()).default([]),
  /** Dua kemungkinan bentuk tergantung sumber (lib/content/source.ts):
   *  kunci ke ARTICLE_IMAGES (src/data/article-images.ts) saat mode lokal --
   *  foto lokal masuk lewat import statis next/image, dan JSON tidak bisa
   *  membawa hasil import, jadi kunci string ini yang menjembatani keduanya --
   *  atau URL absolut (`cover_url`) saat mode CMS, yang next/image bisa pakai
   *  langsung sebagai src. resolveArticleImage() di article-images.ts satu-
   *  satunya tempat yang membedakan keduanya. null = belum ada foto; kartu
   *  artikel melewati gambarnya, bukan menampilkan kotak kosong. */
  image: z.string().nullable().default(null),
});

export type Article = z.output<typeof articleSchema>;

export const articlesSchema = z.array(articleSchema);

/** Publikasi (dokumen/PDF) tidak diterjemahkan per locale -- judulnya nama
 *  diri dokumen aslinya, sama seperti alasan yang sama di src/data/publications.ts
 *  (sekarang dihapus, digantikan koleksi ini). Karena itu tidak ada `lang`
 *  di sini seperti articleSchema. */
export const publicationSchema = z.object({
  title: z.string().min(1),
  /** null/"umum" dua-duanya berarti belum dikategorikan di CMS -- ditampilkan
   *  apa adanya oleh filter kategori, bukan diberi taksonomi karangan. */
  category: z.string().nullable().default(null),
  /** URL absolut ke berkas PDF (CMS Rekam `file_url`). Satu-satunya sumber
   *  untuk koleksi ini adalah CMS -- tidak ada lagi berkas PDF statis di
   *  public/documents/ yang dipetakan dari sini. */
  pdfUrl: z.string().min(1),
  /** Sama seperti Article.image mode CMS: URL absolut (`cover_url`). */
  image: z.string().nullable().default(null),
  isFeatured: z.boolean().default(false),
});

export type Publication = z.output<typeof publicationSchema>;

export const publicationsSchema = z.array(publicationSchema);

/** Daftar koleksi yang dikenal. Kunci di sini menentukan nama file
 *  (src/data/<key>.json) dan cache tag revalidasi. Nama resource CMS yang
 *  sesungguhnya (kalau berbeda, seperti "articles" -> "news") dipetakan
 *  terpisah lewat `apiCollections` di source.ts. */
export const collections = {
  articles: articlesSchema,
  publications: publicationsSchema,
} as const;

export type CollectionName = keyof typeof collections;
