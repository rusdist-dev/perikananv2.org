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
  /** Field relasional `related_programs` CMS (taksonomi program), dipetakan
   *  ke nama yang sudah dilokalkan lewat lib/content/program-taxonomy.ts.
   *  null kalau artikelnya belum ditandai program apa pun -- kartu/detail
   *  berita jatuh balik ke `tags[0]` (nama kategori CMS), bukan menebak. */
  program: z
    .object({
      name: z.string(),
      slug: z.string(),
    })
    .nullable()
    .default(null),
  /** ID numerik mentah dari CMS Rekam (`id`), dipakai HANYA untuk
   *  menggabungkan varian id/en dari artikel yang sama di lib/content/index.ts
   *  (pickForLocale) -- bukan `slug`, karena CMS menerbitkan slug HASIL
   *  GENERATE dari judul per bahasa: dua varian bahasa artikel yang sama bisa
   *  punya slug yang benar-benar berbeda begitu judulnya diterjemahkan.
   *  Menggabungkan lewat slug (asumsi lama) membuat kedua varian dianggap
   *  dua artikel terpisah dan tampil dobel di /berita. null di mode lokal
   *  (JSON tidak punya ID CMS) -- pickForLocale jatuh balik ke slug di sana,
   *  yang aman karena data lokal memang satu slug per artikel. */
  cmsId: z.union([z.string(), z.number()]).nullable().default(null),
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

/** Tiga jenjang yang ada di CMS Rekam saat ini. Nilainya dipakai untuk
 *  memfilter section (Advisor/Manager/Officer di /discover/our-team, hanya
 *  Advisor di /discover/about-us) -- label tampilan tetap datang dari kamus
 *  i18n (t.ourTeamAdvisorLabel dst.), bukan dari CMS, sama seperti pola
 *  publicationSchema.category. */
const teamLevelEnum = z.enum(['penasihat', 'manajer', 'staff']);

export const teamMemberSchema = z.object({
  ...localized,
  level: teamLevelEnum,
  /** Nama orang tidak diterjemahkan per bahasa seperti judul artikel, jadi
   *  slug anggota tim SAMA di id maupun en (sudah diverifikasi langsung ke
   *  CMS) -- beda dari Article, di sini slug aman dipakai sebagai kunci
   *  gabung locale (pickTeamForLocale di index.ts), tidak butuh akal-akalan
   *  cmsId seperti Article. */
  slug: z.string().min(1),
  name: z.string().min(1),
  position: z.string().min(1),
  /** HTML tersanitasi dari CMS (DOMPurify, lib/content/source.ts) -- sama
   *  seperti Article.body, dipecah jadi paragraf lewat lib/article-body.ts
   *  saat dirender di TeamProfileModal. */
  bio: z.string().min(1),
  /** URL absolut (`photo_url`). Koleksi ini cuma datang dari CMS -- tidak
   *  ada lagi foto tim statis di src/assets/foto-tim/ yang dipetakan dari
   *  sini, jadi tidak butuh kunci ARTICLE_IMAGES-style seperti Article.image. */
  image: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  socials: z
    .object({
      linkedin: z.string().nullable().default(null),
      instagram: z.string().nullable().default(null),
    })
    .default({ linkedin: null, instagram: null }),
});

export type TeamMember = z.output<typeof teamMemberSchema>;

export const teamMembersSchema = z.array(teamMemberSchema);

/** Satu milestone /discover/achievements per tahun. `year` (bukan slug --
 *  CMS Rekam tidak menerbitkan satu untuk koleksi ini) dipetakan sebagai
 *  kunci gabung locale di index.ts: nilainya angka, tidak diterjemahkan,
 *  jadi aman dipakai sebagai identitas lintas bahasa sama seperti `slug`
 *  di teamMemberSchema. */
export const milestoneSchema = z.object({
  ...localized,
  year: z.number(),
  title: z.string().min(1),
  /** CMS Rekam mengirim isi milestone sebagai SATU field teks (`body`),
   *  bukan dua field terpisah -- source.ts yang memutuskan ini deskripsi
   *  satu paragraf atau daftar poin (lihat mapMilestoneItem): body dengan
   *  satu baris jadi `description`, lebih dari satu baris jadi `bullets`.
   *  Keduanya saling eksklusif -- persis seperti union Milestone di
   *  achievements/page.tsx sebelum koleksi ini ada. */
  description: z.string().nullable().default(null),
  bullets: z.array(z.string()).default([]),
  /** URL absolut (`cover_url`). null = belum ada foto -- MilestoneCard
   *  melewati blok gambarnya (§4j), bukan menampilkan kotak kosong. */
  image: z.string().nullable().default(null),
});

export type Milestone = z.output<typeof milestoneSchema>;

export const milestonesSchema = z.array(milestoneSchema);

/** Daftar koleksi yang dikenal. Kunci di sini menentukan nama file
 *  (src/data/<key>.json) dan cache tag revalidasi. Nama resource CMS yang
 *  sesungguhnya (kalau berbeda, seperti "articles" -> "news") dipetakan
 *  terpisah lewat `apiCollections` di source.ts. */
export const collections = {
  articles: articlesSchema,
  publications: publicationsSchema,
  team: teamMembersSchema,
  milestones: milestonesSchema,
} as const;

export type CollectionName = keyof typeof collections;
