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

/**
 * Artikel sebagaimana muncul di DAFTAR: kartu, hasil pencarian, sitemap.
 *
 * Sengaja TANPA `body`. Yang menampilkan daftar tidak pernah membacanya, dan
 * menyertakannya berarti setiap pemuatan daftar menjalankan DOMPurify atas
 * body tiap artikel -- ~2 ms per artikel yang terbuang seluruhnya. Artikel
 * lengkapnya ada di `articleSchema` di bawah, dan hanya jalur satu-record
 * (`/news/{slug}`) yang menghasilkannya.
 *
 * Pemisahan ini tipe, bukan sekadar konvensi: memanggil `.body` pada entri
 * daftar gagal saat typecheck, bukan diam-diam memberi string kosong.
 */
export const articleListItemSchema = z.object({
  ...localized,
  slug: z
    .string()
    .min(1)
    // Slug tanpa titik bukan gaya, tapi syarat: matcher middleware memakai
    // ekstensi untuk membedakan rute dari aset statis.
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug harus kebab-case tanpa titik'),
  title: z.string().min(1),
  excerpt: z.string().min(1),
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
  /** Nama kategori CMS (`category.name`) apa adanya -- SATU-SATUNYA sumber
   *  label kategori di seluruh kartu berita, di halaman mana pun.
   *
   *  Dulu tiap kartu menurunkan labelnya sendiri (`program?.name ?? tags[0]`),
   *  jadi artikel yang sama bisa berlabel "Ocean Accounts" di satu halaman dan
   *  sesuatu yang lain di halaman berikutnya -- tergantung program mana yang
   *  kebetulan disebut pertama oleh CMS. Satu field, satu jawaban.
   *
   *  null kalau CMS belum mengategorikan artikelnya; pemanggil jatuh balik ke
   *  label "News" miliknya sendiri, bukan menebak dari field lain. */
  category: z.string().nullable().default(null),
  /** Slug kategori CMS (`category.slug`) -- yang DICOCOKKAN saat memfilter,
   *  bukan `category` di atas. Nama kategori ikut bahasa artikelnya, jadi
   *  artikel yang tampil sebagai fallback bahasa lain akan meleset dari opsi
   *  filter kalau dicocokkan lewat nama; slug tidak diterjemahkan. */
  categorySlug: z.string().nullable().default(null),
  /** Program PERTAMA saja, sudah dilokalkan. Dipakai kalau suatu saat sebuah
   *  tampilan butuh menyebut satu program -- BUKAN label kategori kartu, yang
   *  sekarang selalu `category` di atas. null kalau artikelnya belum ditandai
   *  program apa pun.
   *
   *  BUKAN untuk memfilter: satu berita boleh ditandai banyak program
   *  sekaligus, dan menyaring lewat field ini membuat artikel cuma muncul di
   *  halaman program yang kebetulan disebut pertama oleh CMS. `programs` di
   *  bawah yang menyimpan himpunan lengkapnya. */
  program: z
    .object({
      name: z.string(),
      slug: z.string(),
    })
    .nullable()
    .default(null),
  /** SELURUH `related_programs` CMS sebagai slug taksonomi mentah (contoh:
   *  ["konservasi-spesies", "karbon-biru"]) -- bentuk jamaknya memang jamak,
   *  dan menyimpan cuma satu di `program` dulu membuat berita lintas-program
   *  hilang dari semua halaman program kecuali satu.
   *
   *  Mentah, bukan dilokalkan, karena inilah yang dicocokkan dengan
   *  `?program=<slug>` CMS (docs/api-public.md) dan dengan
   *  getCmsSlugByFrontendSlug() -- nama terjemahan tidak bisa dipakai untuk
   *  keduanya. */
  programs: z.array(z.string()).default([]),
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

export type ArticleListItem = z.output<typeof articleListItemSchema>;

export const articlesSchema = z.array(articleListItemSchema);

/** Artikel LENGKAP, dengan isinya. Hanya dihasilkan `/news/{slug}` (lihat
 *  loadArticleBySlug) dan hanya dibutuhkan halaman detail. */
export const articleSchema = articleListItemSchema.extend({
  /** HTML tersanitasi (DOMPurify di lib/content/source.ts), jadi halaman boleh
   *  merendernya lewat dangerouslySetInnerHTML tanpa sanitasi ulang. Lihat
   *  lib/article-body.ts untuk cara ia dipecah jadi paragraf. */
  body: z.string().min(1),
});

export type Article = z.output<typeof articleSchema>;

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

/** Opsi filter program di /berita, dari `/programs` CMS (docs/api-public.md).
 *  Datang dari CMS, bukan diturunkan dari artikel yang kebetulan sudah
 *  ditarik: program yang belum punya berita pun tetap muncul di dropdown,
 *  dan daftarnya tidak berubah-ubah mengikuti halaman yang sedang dibuka.
 *
 *  `value` adalah slug taksonomi yang sama persis dengan isi
 *  `Article.programs` -- itu yang dicocokkan saat memfilter. `label` cuma
 *  untuk ditampilkan dan memang berbeda per bahasa (CMS menerjemahkannya
 *  lewat `?lang=`), karena itu koleksi ini per-locale. */
export const programOptionSchema = z.object({
  ...localized,
  value: z.string().min(1),
  label: z.string().min(1),
});

export type ProgramOption = z.output<typeof programOptionSchema>;

export const programOptionsSchema = z.array(programOptionSchema);

/** Opsi filter kategori di /berita, dari `/news-categories` CMS.
 *
 *  Ditarik per-locale (`?lang=`) meski hari ini CMS mengembalikan nama yang
 *  sama persis untuk id maupun en: `name` ADALAH field yang bisa
 *  diterjemahkan, jadi begitu editor mengisi terjemahannya, dropdown ikut
 *  berubah tanpa perlu menyentuh kode. Memilih jalur non-locale sekarang
 *  berarti bug diam-diam nanti -- dropdown yang tetap berbahasa Indonesia di
 *  /en tanpa ada yang tahu kenapa. Penggabungan varian bahasanya lewat
 *  `slug`, yang tidak diterjemahkan. */
export const newsCategorySchema = z.object({
  ...localized,
  /** Yang dicocokkan dengan `Article.categorySlug`. */
  slug: z.string().min(1),
  name: z.string().min(1),
});

export type NewsCategory = z.output<typeof newsCategorySchema>;

export const newsCategoriesSchema = z.array(newsCategorySchema);

/** Satu desa pesisir yang punya pendataan terverifikasi, dari
 *  `/ext/coast/desa` -- daftar yang mengisi dropdown DAN penanda peta
 *  /discover/our-impact.
 *
 *  Tanpa `lang` seperti publicationSchema, dan karena alasan yang lebih kuat:
 *  isinya nama tempat administratif ("Purworejo", "Kabupaten Demak"), yang
 *  tidak diterjemahkan -- endpoint-nya memang tidak menerima `?lang=` sama
 *  sekali.
 *
 *  Menggantikan src/data/impact-villages.ts, yang koordinatnya perkiraan dan
 *  sepuluh desanya dipilih tangan; komentar di berkas itu sudah menyebut
 *  koleksi seperti ini sebagai penggantinya. */
export const impactVillageSchema = z.object({
  /** `desa_kode` BPS ("33.21.12.2011"). Identitas desa di seluruh jalur ini:
   *  nilai state pilihan, id penanda peta, dan argumen endpoint detail.
   *  Bukan nama desa -- ada lebih dari satu "Purworejo" di daftar wilayah
   *  Indonesia, dan kodenya yang membedakan. */
  kode: z.string().min(1),
  desa: z.string().min(1),
  /** TANPA awalan "Kecamatan" (API memang mengirimnya begitu): panel detail
   *  mencetak awalannya sendiri sebagai label baris. */
  kecamatan: z.string().min(1),
  /** `kabupaten_kota`, SUDAH termasuk awalan "Kabupaten"/"Kota" -- keduanya
   *  muncul di daftar ini dan tidak bisa disingkat jadi satu awalan. */
  kabupaten: z.string().min(1),
  provinsi: z.string().min(1),
  /** null berdua kalau desa itu belum punya baris boundary di CMS. Sengaja
   *  null, BUKAN 0,0 -- penanda di lepas pantai Afrika terlihat seperti data
   *  (alasan yang sama disebut dokumentasi endpoint-nya). Desanya tetap masuk
   *  daftar dan tetap bisa dipilih; yang tidak ada cuma penandanya. */
  lat: z.number().nullable().default(null),
  lng: z.number().nullable().default(null),
  /** Berapa formulir pendataan terverifikasi yang jadi dasar angka desa ini. */
  jumlahForm: z.number().default(0),
  /** Tanggal pendataan terakhir (ISO). null kalau CMS tidak mengirimnya. */
  pendataanTerakhir: z.iso.date().nullable().default(null),
});

export type ImpactVillage = z.output<typeof impactVillageSchema>;

export const impactVillagesSchema = z.array(impactVillageSchema);

/** Satu angka pada tab Statistik, apa adanya dari CMS.
 *
 *  `label`, `unit`, dan `decimals` ikut datang dari API dan TIDAK ditiru di
 *  sini sebagai tabel padanan di kode: daftar metriknya ditentukan formulir
 *  pendataan di CMS (9 metrik puncak hari ini, sebagian beranak), jadi metrik
 *  baru muncul sendiri di panel tanpa deploy. Tabel padanan di frontend akan
 *  berarti metrik baru tampil tanpa label -- atau tidak tampil sama sekali.
 *
 *  BERSARANG sejak API mengirim `children`: "Dampak Ekonomi (Produksi)"
 *  membawa "Perikanan Tangkap" yang membawa "Lainnya" -- tiga tingkat pada
 *  data hari ini. Sarangnya dipertahankan apa adanya, tidak diratakan, karena
 *  itulah yang dipakai tab Statistik untuk memutuskan baris mana yang bisa
 *  dibuka-tutup.
 *
 *  Angkanya NUMBER, bukan string yang sudah diformat (beda dari VillageStat
 *  lama di src/data/village-detail.ts): pemformatan ribuan dan desimal
 *  bergantung locale pembaca, dan angka yang sudah jadi string tidak bisa
 *  disejajarkan sebagai kolom `lama` vs `baru`. */
export type VillageMetric = {
  key: string;
  label: string;
  unit: string | null;
  decimals: number;
  baru: number | null;
  lama: number | null;
  childrenSumToTotal: boolean | null;
  children: VillageMetric[];
};

/** Tipe hasilnya ditulis tangan di atas, tidak disimpulkan dengan
 *  `z.output<typeof ...>` seperti skema lain di berkas ini: TypeScript tidak
 *  bisa menyimpulkan tipe yang menunjuk dirinya sendiri lewat getter
 *  (TS7023/TS2615), jadi salah satu ujungnya harus dinyatakan. Anotasi
 *  `z.ZodType<VillageMetric>` di bawah yang mengikat keduanya -- field yang
 *  ditambah di skema tanpa ditambah di tipe akan gagal typecheck di sini. */
export const villageMetricSchema: z.ZodType<VillageMetric> = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  /** "ha", "Rp", "orang", "kg", "unit" -- atau null (nilai_stok_karbon memang
   *  dikirim tanpa satuan). */
  unit: z.string().nullable().default(null),
  /** Berapa desimal yang BERMAKNA untuk metrik ini menurut CMS: 2 untuk luas
   *  dan rupiah, 0 untuk cacah orang. Dipakai apa adanya saat memformat --
   *  "29,00 orang" salah dengan cara yang halus. */
  decimals: z.number().int().min(0).max(6).default(0),
  /** Nilai tahun `tahunBaru` dan `tahunLama`. null = metrik itu tidak punya
   *  nilai untuk tahun itu, yang TIDAK sama dengan nol. */
  baru: z.number().nullable().default(null),
  lama: z.number().nullable().default(null),
  /** Apakah `children` benar-benar menjumlah ke angka induknya.
   *
   *  false untuk rincian yang TUMPANG TINDIH: "Total Orang Terlibat" 29 orang
   *  dengan rincian 19 pria + 10 wanita + 4 remaja + 1 lansia -- seorang
   *  remaja juga terhitung pria. Panel memakainya untuk menjelaskan kenapa
   *  rinciannya tidak menjumlah, bukan untuk menyembunyikan angkanya.
   *
   *  null = metrik tanpa anak (CMS tidak mengirim field ini untuk daun). */
  childrenSumToTotal: z.boolean().nullable().default(null),
  /** Rincian satu tingkat di bawah. Array kosong = baris tunggal.
   *
   *  Rekursif lewat getter, cara Zod 4 menuliskan skema yang menunjuk dirinya
   *  sendiri: `villageMetricSchema` belum ada saat objeknya dibangun, dan
   *  getter menunda pembacaannya sampai validasi pertama. */
  get children() {
    return z.array(villageMetricSchema).default([]);
  },
});

/** Satu kawasan konservasi tempat program pendataan pesisir benar-benar
 *  bekerja, dari `/ext/coast/kawasan-konservasi`.
 *
 *  BUKAN daftar kawasan konservasi Indonesia -- yang itu ada 554 dan hidup di
 *  public/geo/conservation-areas.json, digambar peta apa adanya. Koleksi ini
 *  yang menentukan mana di antaranya yang diwarnai berbeda sebagai kawasan
 *  intervensi.
 *
 *  Tidak ada geometri di sini: bentuk poligonnya tetap datang dari berkas geo,
 *  dan `idMpa` yang menjodohkan keduanya. */
export const conservationAreaSchema = z.object({
  /** Id baris di CMS. Dipakai sebagai kunci React, bukan untuk mencocokkan
   *  apa pun -- yang menjodohkan ke peta adalah `idMpa`. */
  id: z.number(),
  nama: z.string().min(1),
  /** Pengenal kawasan versi KKP ("T244"), kunci pencocokan ke properti `idMpa`
   *  di public/geo/conservation-areas.json.
   *
   *  WAJIB ada: baris tanpa `id_mpa` tidak bisa ditemukan poligonnya, jadi ia
   *  dibuang dengan berisik oleh validate() alih-alih diam-diam tidak pernah
   *  berwarna di peta. */
  idMpa: z.string().min(1),
  /** Luas yang dikonservasi menurut pendataan (ha) -- angka CMS, BUKAN luas
   *  resmi kawasan di berkas geo (`ha`). Keduanya memang bisa berbeda: yang
   *  satu wilayah kerja, yang satu batas SK. */
  luas: z.number().nullable().default(null),
  pelaksana: z.string().nullable().default(null),
});

export type ConservationArea = z.output<typeof conservationAreaSchema>;

export const conservationAreasSchema = z.array(conservationAreaSchema);

/** Statistik pendataan pesisir SE-PROGRAM, dari `/ext/coast/statistik`.
 *
 *  Metriknya memakai villageMetricSchema yang sama dengan panel per-desa --
 *  bentuk satu entrinya memang identik (key/label/unit/decimals/baru/lama).
 *  Bedanya endpoint ini mengirimnya RATA: 12 metrik tanpa `children`, karena
 *  totalan lintas desa tidak punya rincian per komoditas. `children` karena itu
 *  selalu jatuh ke default array kosong di sini, dan kartu totalannya tidak
 *  punya baris yang bisa dibuka. */
export const coastStatsSchema = z.object({
  jumlahForm: z.number().default(0),
  jumlahDesa: z.number().default(0),
  pendataanTerakhir: z.iso.date().nullable().default(null),
  tahunBaru: z.number().nullable().default(null),
  tahunLama: z.number().nullable().default(null),
  metrik: z.array(villageMetricSchema).default([]),
});

export type CoastStats = z.output<typeof coastStatsSchema>;

/** Satu kegiatan rehabilitasi. Semua field selain tanggal boleh kosong --
 *  formulir CMS tidak mewajibkan semuanya, dan baris yang separuh terisi
 *  tetap lebih berguna daripada dibuang. */
export const villageRehabilitationSchema = z.object({
  tanggal: z.iso.date().nullable().default(null),
  ekosistem: z.string().nullable().default(null),
  statusLahan: z.string().nullable().default(null),
  luas: z.number().nullable().default(null),
  pelaksana: z.string().nullable().default(null),
  kolaborator: z.string().nullable().default(null),
  jumlahBibit: z.number().nullable().default(null),
  /** Persen (0-100), bukan pecahan 0-1. */
  survivalRate: z.number().nullable().default(null),
});

export type VillageRehabilitation = z.output<typeof villageRehabilitationSchema>;

/** Satu pelatihan beserta rincian pesertanya. Rincian gender/usia/disabilitas
 *  dipertahankan terpisah, bukan dijumlah jadi satu angka: justru pemilahan
 *  itu yang jadi indikator program. */
export const villageTrainingSchema = z.object({
  tanggal: z.iso.date().nullable().default(null),
  nama: z.string().nullable().default(null),
  peserta: z.number().nullable().default(null),
  pria: z.number().nullable().default(null),
  wanita: z.number().nullable().default(null),
  remaja: z.number().nullable().default(null),
  lansia: z.number().nullable().default(null),
  disabilitas: z.number().nullable().default(null),
});

export type VillageTraining = z.output<typeof villageTrainingSchema>;

/** Satu titik batas wilayah: [lat, lng], urutan yang sama dengan yang dipakai
 *  Leaflet -- bukan [lng, lat] ala GeoJSON. Ditulis sebagai tuple, bukan
 *  `z.array(z.number())`, supaya `[lat, lng]` bisa diserahkan langsung ke
 *  L.polygon tanpa cast di komponen. */
const koordinatSchema = z.tuple([z.number(), z.number()]);

/**
 * Isi panel detail satu desa, dari `/ext/coast/desa/{desa_kode}`.
 *
 * BUKAN anggota `collections` di bawah: ia diambil satu record sekali klik
 * (lihat loadVillageDetail di source.ts), persis seperti articleSchema yang
 * juga di luar daftar koleksi. Menarik 19 detail sekaligus saat halaman
 * dibuka berarti 19 permintaan untuk satu panel yang menampilkan satu.
 */
export const villageDetailSchema = z.object({
  kode: z.string().min(1),
  desa: z.string().min(1),
  kecamatan: z.string().min(1),
  kabupaten: z.string().min(1),
  provinsi: z.string().min(1),
  lat: z.number().nullable().default(null),
  lng: z.number().nullable().default(null),
  jumlahForm: z.number().default(0),
  pendataanTerakhir: z.iso.date().nullable().default(null),
  /** Tahun pembanding statistik. Keduanya dari CMS, bukan dihitung dari
   *  tanggal hari ini: yang menentukan "tahun berjalan" adalah data pendataan
   *  yang masuk, bukan kalender. */
  tahunBaru: z.number().nullable().default(null),
  tahunLama: z.number().nullable().default(null),
  metrik: z.array(villageMetricSchema).default([]),
  /** Foto desa beserta keterangannya. `keterangan` bukan caption pendek --
   *  isinya paragraf profil desa, dan itulah yang mengisi tab Deskripsi. */
  gambar: z
    .array(
      z.object({
        url: z.string().min(1),
        keterangan: z.string().nullable().default(null),
      }),
    )
    .default([]),
  rehabilitasi: z.array(villageRehabilitationSchema).default([]),
  pelatihan: z.array(villageTrainingSchema).default([]),
  /** Batas wilayah desa (`peta.path`), SUDAH dinormalkan jadi satu bentuk:
   *  daftar poligon -> daftar cincin -> daftar titik.
   *
   *  Tiga tingkat, bukan dua, karena satu desa bisa terdiri dari beberapa
   *  bidang terpisah: Ujungalang 13 dan Kapoposang Bali 7 (pulau-pulau di
   *  estuari dan kepulauan). Kalau semuanya diratakan jadi satu daftar cincin,
   *  Leaflet akan membaca cincin ke-2 dan seterusnya sebagai LUBANG pada
   *  cincin pertama -- pulau-pulaunya berubah jadi lubang menganga.
   *
   *  API sendiri mengirim dua bentuk berbeda untuk field yang sama; yang
   *  menyeragamkannya mapVillageBoundary() di source.ts.
   *
   *  Array kosong = desa itu belum punya batas wilayah di CMS. Peta menggambar
   *  penandanya saja, tanpa poligon. */
  batas: z.array(z.array(koordinatSchema).min(3)).array().default([]),
});

export type VillageDetail = z.output<typeof villageDetailSchema>;

/** Satu pilihan pada dropdown filter dataset IKAN, dari
 *  `/ext/ikan/opsi/{tingkat}`.
 *
 *  Bentuk responsnya sama untuk kedelapan tingkat (WPPNRI sampai spesies), jadi
 *  satu skema melayani semuanya -- yang berbeda cuma endpoint dan parameter
 *  penyaringnya, dan keduanya tinggal di src/lib/ikan-filters.ts.
 *
 *  `jumlah_trip` ikut divalidasi walau dropdown-nya tidak mencetaknya: ia
 *  bagian dari respons, dan membuangnya di lapisan ini berarti tampilan
 *  berikutnya yang membutuhkannya harus membongkar skema, bukan sekadar
 *  membacanya. */
export const ikanOptionSchema = z.object({
  value: z.string().min(1),
  jumlahTrip: z.number().default(0),
});

export type IkanOptionItem = z.output<typeof ikanOptionSchema>;

export const ikanOptionsSchema = z.array(ikanOptionSchema);

/** Isi grafik tab Summary `/data/ikan`, dari `/ext/ikan/grafik/trip`.
 *
 *  SATU respons memberi DUA grafik: `perPeriode` (jumlah trip per bulan/tahun)
 *  dan `perLokasi` (jumlah trip per lokasi pendaratan). Keduanya tidak
 *  dipisah jadi dua permintaan karena API memang mengirimnya sekaligus --
 *  dan keduanya menjawab pertanyaan yang sama dari dua sisi, jadi menampilkan
 *  yang satu lebih baru dari yang lain justru salah.
 *
 *  `periode` dibiarkan STRING apa adanya ("2026-01" untuk monthly, "2026"
 *  untuk yearly): ia label sumbu-x, bukan tanggal yang dihitung. Mengubahnya
 *  jadi Date berarti memilih zona waktu untuk sesuatu yang tidak punya jam. */
export const ikanTripChartSchema = z.object({
  /** Gema filter dari API -- dipakai untuk memastikan grafik yang tampil
   *  benar-benar menjawab filter yang diminta, bukan sisa permintaan
   *  sebelumnya. */
  tipeTanggal: z.enum(['monthly', 'yearly']).default('monthly'),
  dari: z.iso.date().nullable().default(null),
  sampai: z.iso.date().nullable().default(null),
  totalTrip: z.number().default(0),
  perPeriode: z
    .array(z.object({ periode: z.string().min(1), jumlahTrip: z.number().default(0) }))
    .default([]),
  perLokasi: z
    .array(z.object({ lokasi: z.string().min(1), jumlahTrip: z.number().default(0) }))
    .default([]),
});

export type IkanTripChart = z.output<typeof ikanTripChartSchema>;

/** Isi grafik tab Catch Composition `/data/ikan`, dari
 *  `/ext/ikan/grafik/tangkapan`.
 *
 *  SATU daftar saja -- berat tangkapan per spesies -- beda dari endpoint trip
 *  yang memberi dua grafik sekaligus. Tidak ada deret waktu di sini: yang
 *  ditanyakan komposisi, bukan perkembangan.
 *
 *  `unit` datang dari API ("kg"), tidak ditulis tetap di frontend: satuannya
 *  properti datanya, dan menuliskannya di kode berarti label yang diam-diam
 *  salah kalau CMS suatu saat mengirim ton. */
export const ikanCatchChartSchema = z.object({
  dari: z.iso.date().nullable().default(null),
  sampai: z.iso.date().nullable().default(null),
  unit: z.string().min(1).default('kg'),
  totalCatch: z.number().default(0),
  perSpesies: z
    .array(z.object({ spesies: z.string().min(1), totalCatch: z.number().default(0) }))
    .default([]),
});

export type IkanCatchChart = z.output<typeof ikanCatchChartSchema>;

/** Isi tab Length Frequency `/data/ikan`, dari
 *  `/ext/ikan/grafik/frekuensi-panjang`.
 *
 *  Bukan cuma histogram: responsnya membawa ringkasan sebaran, komposisi cara
 *  ukur, dan dua indikator perikanan (Lc dan Lm). Ketiganya ikut divalidasi
 *  karena histogram tanpa angka pendampingnya adalah bentuk tanpa kesimpulan --
 *  "berapa ikan yang tertangkap sebelum sempat memijah" justru pertanyaan yang
 *  membuat grafik ini dibuat. */
export const ikanLengthChartSchema = z.object({
  /** Satuan panjang dari API ("cm"). */
  unit: z.string().min(1).default('cm'),
  /** Lebar selang kelas yang BENAR-BENAR dipakai server -- bukan yang diminta.
   *  Keduanya bisa berbeda kalau server membulatkan. */
  selangKelas: z.number().default(1),
  tipePanjang: z.enum(['TL', 'FL']).nullable().default(null),
  /** `ringkasan` dan `indikator` di bawah sengaja TANPA .default(): mapper di
   *  source.ts selalu menyusun kedua objek itu, jadi salah satunya yang hilang
   *  berarti bentuk responsnya berubah -- dan itu memang harus gagal validasi,
   *  bukan diam-diam jadi nol. */
  ringkasan: z.object({
    jumlahIkan: z.number().default(0),
    panjangMin: z.number().nullable().default(null),
    panjangMaks: z.number().nullable().default(null),
    rataRata: z.number().nullable().default(null),
    median: z.number().nullable().default(null),
    modus: z.number().nullable().default(null),
  }),
  /** Cacah pengukuran per cara ukur. `tipe` null = catatan yang tidak menyebut
   *  caranya (311 dari 76.007 hari ini) -- ikut ditampilkan, bukan dibuang:
   *  pembaca berhak tahu bagian mana dari histogram yang asal ukurnya tidak
   *  diketahui. */
  komposisiTipePanjang: z
    .array(z.object({ tipe: z.string().nullable().default(null), jumlah: z.number().default(0) }))
    .default([]),
  indikator: z.object({
    /** Panjang pertama kali tertangkap. */
    lc: z.number().nullable().default(null),
    /** Kalimat metode dari API, ditampilkan apa adanya: cara Lc dihitung bagian
     *  dari artinya, dan menuliskannya ulang di frontend berarti dua versi yang
     *  bisa berbeda. */
    lcMetode: z.string().nullable().default(null),
    /** Panjang matang gonad -- gema dari parameter `lm`, bukan hitungan API. */
    lm: z.number().nullable().default(null),
    persenDiBawahLm: z.number().nullable().default(null),
  }),
  kelas: z
    .array(
      z.object({
        batasBawah: z.number(),
        batasAtas: z.number(),
        nilaiTengah: z.number(),
        jumlah: z.number().default(0),
        persen: z.number().default(0),
        kumulatifPersen: z.number().default(0),
      }),
    )
    .default([]),
});

export type IkanLengthChart = z.output<typeof ikanLengthChartSchema>;

/** Satu pilihan pada dropdown filter dataset BSC, dari
 *  `/ext/bsc/opsi/{tingkat}`.
 *
 *  Bentuknya sama persis dengan padanan IKAN-nya, tapi skemanya berdiri
 *  sendiri: keduanya memvalidasi respons dua endpoint yang BERBEDA, dan
 *  memakai ulang satu skema berarti perubahan bentuk di salah satu API
 *  memaksa yang lain ikut berubah. */
export const bscOptionSchema = z.object({
  value: z.string().min(1),
  jumlahTrip: z.number().default(0),
});

export type BscOptionItem = z.output<typeof bscOptionSchema>;

export const bscOptionsSchema = z.array(bscOptionSchema);

/** Isi grafik tab Summary `/data/data-crab`, dari `/ext/bsc/grafik/trip`.
 *
 *  SATU respons memberi DUA grafik -- jumlah trip per periode dan per lokasi
 *  pendaratan -- persis seperti endpoint trip IKAN.
 *
 *  `periode` dibiarkan STRING apa adanya ("2026-01" untuk monthly, "2026"
 *  untuk yearly): ia label sumbu-x, bukan tanggal yang dihitung. */
export const bscTripChartSchema = z.object({
  tipeTanggal: z.enum(['monthly', 'yearly']).default('monthly'),
  dari: z.iso.date().nullable().default(null),
  sampai: z.iso.date().nullable().default(null),
  totalTrip: z.number().default(0),
  perPeriode: z
    .array(z.object({ periode: z.string().min(1), jumlahTrip: z.number().default(0) }))
    .default([]),
  perLokasi: z
    .array(z.object({ lokasi: z.string().min(1), jumlahTrip: z.number().default(0) }))
    .default([]),
});

export type BscTripChart = z.output<typeof bscTripChartSchema>;

/** Isi tab Catch Composition `/data/data-crab`, dari
 *  `/ext/bsc/grafik/tangkapan`.
 *
 *  `unit` datang dari API dan bawaannya "gram" -- BUKAN "kg" seperti IKAN.
 *  Bedanya nyata: total hari ini 6.632.100,65 gram, angka yang dicetak sebagai
 *  kilogram akan salah seribu kali lipat. Itu sebabnya satuannya dibaca dari
 *  respons alih-alih ditulis tetap di komponen. */
export const bscCatchChartSchema = z.object({
  dari: z.iso.date().nullable().default(null),
  sampai: z.iso.date().nullable().default(null),
  unit: z.string().min(1).default('gram'),
  totalBobot: z.number().default(0),
  perSpesies: z
    .array(z.object({ spesies: z.string().min(1), totalBobot: z.number().default(0) }))
    .default([]),
});

export type BscCatchChart = z.output<typeof bscCatchChartSchema>;

/** Isi tab Length Frequency `/data/data-crab`, dari
 *  `/ext/bsc/grafik/frekuensi-lebar`.
 *
 *  Yang diukur LEBAR KARAPAS, bukan panjang, dan bedanya bukan istilah belaka:
 *  responsnya membawa hitungan kematangan gonad yang tidak ada padanannya di
 *  dataset ikan (`jumlahMatang`/`persenMatang` per kelas, `tanpaTkg` di
 *  ringkasan). Karena itu skemanya terpisah dari ikanLengthChartSchema, bukan
 *  dipakai bersama dengan beberapa field opsional.
 *
 *  Perbedaan terpenting: di sini Lm DIHITUNG API (interpolasi lebar saat 50%
 *  individu mencapai TKG ambang), sementara pada IKAN ia angka yang diketik
 *  pembaca. `lmMetode` ikut dibawa supaya cara hitungnya bisa dicetak apa
 *  adanya alih-alih ditulis ulang di frontend. */
export const bscWidthChartSchema = z.object({
  /** Satuan lebar dari API ("cm"). */
  unit: z.string().min(1).default('cm'),
  /** Lebar selang kelas yang BENAR-BENAR dipakai server -- bukan yang diminta.
   *  Keduanya bisa berbeda kalau server membulatkan. */
  selangKelas: z.number().default(1),
  /** Ambang TKG yang dipakai server, gema dari parameter `tkg_matang`. */
  tkgMatang: z.number().default(2),
  jenisKelamin: z.enum(['JANTAN', 'BETINA']).nullable().default(null),
  ringkasan: z.object({
    jumlahIndividu: z.number().default(0),
    lebarMin: z.number().nullable().default(null),
    lebarMaks: z.number().nullable().default(null),
    rataRata: z.number().nullable().default(null),
    median: z.number().nullable().default(null),
    modus: z.number().nullable().default(null),
    /** Individu yang terukur lebarnya tapi TKG-nya tidak dicatat. Ikut
     *  ditampilkan, tidak dibuang: mereka masuk histogram tapi tidak bisa
     *  masuk hitungan persen matang, dan selisih itu harus terbaca. */
    tanpaTkg: z.number().default(0),
  }),
  /** Cacah individu per jenis kelamin. `jenisKelamin` null = catatan yang tidak
   *  menyebutkannya (3 dari 46.093 hari ini). */
  komposisiJenisKelamin: z
    .array(
      z.object({
        jenisKelamin: z.string().nullable().default(null),
        jumlah: z.number().default(0),
      }),
    )
    .default([]),
  indikator: z.object({
    /** Lebar pertama kali tertangkap. */
    lc: z.number().nullable().default(null),
    /** Kalimat metode dari API, ditampilkan apa adanya: cara Lc dihitung bagian
     *  dari artinya. */
    lcMetode: z.string().nullable().default(null),
    /** Lebar matang gonad, HITUNGAN API. null = datanya tidak cukup untuk
     *  interpolasinya (terjadi saat penyaringnya menyisakan sedikit kelas). */
    lm: z.number().nullable().default(null),
    lmMetode: z.string().nullable().default(null),
    persenMatang: z.number().nullable().default(null),
  }),
  kelas: z
    .array(
      z.object({
        batasBawah: z.number(),
        batasAtas: z.number(),
        nilaiTengah: z.number(),
        jumlah: z.number().default(0),
        jumlahMatang: z.number().default(0),
        persen: z.number().default(0),
        kumulatifPersen: z.number().default(0),
        /** null -- BUKAN nol -- untuk kelas yang kosong: API mengirimnya null
         *  justru pada kelas ber-`jumlah: 0` (63 dari 83 kelas pada selang 1
         *  cm hari ini), dan "0% matang" di kelas tanpa satu pun individu
         *  adalah angka yang tidak pernah dihitung siapa pun. */
        persenMatang: z.number().nullable().default(null),
      }),
    )
    .default([]),
});

export type BscWidthChart = z.output<typeof bscWidthChartSchema>;

/** Satu pilihan pada dropdown spesies HIUPARI, dari
 *  `/ext/hiupari/opsi/spesies`.
 *
 *  Field cacahnya `jumlah_individu`, BUKAN `jumlah_trip` seperti dua dataset
 *  lain -- itu sebabnya skemanya berdiri sendiri alih-alih memakai ulang
 *  ikanOptionSchema. */
export const hiupariOptionSchema = z.object({
  value: z.string().min(1),
  jumlahIndividu: z.number().default(0),
});

export type HiupariOptionItem = z.output<typeof hiupariOptionSchema>;

export const hiupariOptionsSchema = z.array(hiupariOptionSchema);

/** Isi `/data/shark-and-ray`, dari `/ext/hiupari/grafik/frekuensi-panjang`.
 *
 *  SATU-SATUNYA endpoint grafik dataset ini: tidak ada trip, tidak ada
 *  komposisi tangkapan. Halaman ini memang cuma punya satu bagian.
 *
 *  Yang membedakannya dari dua skema frekuensi lain:
 *
 *  - `indikator.linf` ADA di sini dan tidak ada di IKAN maupun BSC. Ia
 *    dihitung empiris (Lmax / 0,95, Froese & Binohlan 2000), jadi nilainya
 *    hampir selalu di LUAR rentang histogramnya -- panjang asimtotik memang
 *    bukan panjang yang pernah terukur.
 *  - `lm` dan seluruh turunannya (`persen_matang`, `jumlahMatang` dan
 *    `persenMatang` per kelas) bisa null SEKALIGUS, dan itu keadaan yang
 *    normal: kematangan dihitung dari klasper, organ jantan, jadi betina dan
 *    gabungan kedua jenis kelamin tidak punya angkanya. Nullable di sini
 *    bukan pertahanan terhadap data rusak melainkan bentuk yang sah.
 *  - `ketersediaanUkuran` memberi cacah individu per jenis ukuran, yang
 *    menjelaskan kenapa mengganti jenis ukuran bisa memangkas sampelnya dari
 *    18.637 jadi 268. */
export const hiupariLengthChartSchema = z.object({
  /** Gema jenis ukuran yang BENAR-BENAR dipakai server. */
  jenisUkuran: z
    .enum(['panjang_total', 'precaudal_length', 'fork_length', 'predorsal_length', 'panjang_headless'])
    .default('panjang_total'),
  jenisKelamin: z.enum(['M', 'F']).nullable().default(null),
  spesies: z.string().nullable().default(null),
  /** Satuan panjang dari API ("cm"). */
  unit: z.string().min(1).default('cm'),
  /** Lebar selang kelas yang BENAR-BENAR dipakai server -- bukan yang diminta.
   *  Keduanya bisa berbeda kalau server membulatkan. */
  selangKelas: z.number().default(1),
  /** Ambang kematangan klasper yang dipakai server, gema dari parameter
   *  `kematangan_matang`. */
  kematanganMatang: z.number().default(3),
  ringkasan: z.object({
    jumlahIndividu: z.number().default(0),
    /** Individu yang tercatat tapi TIDAK punya ukuran jenis ini. Ikut
     *  ditampilkan, tidak dibuang: mereka ada di dataset tapi tidak ada di
     *  histogram, dan selisih itu harus terbaca. */
    jumlahTanpaUkuran: z.number().default(0),
    panjangMin: z.number().nullable().default(null),
    panjangMaks: z.number().nullable().default(null),
    rataRata: z.number().nullable().default(null),
    median: z.number().nullable().default(null),
    modus: z.number().nullable().default(null),
  }),
  /** Berapa individu yang punya ukuran untuk TIAP jenis ukuran, termasuk yang
   *  sedang tidak dipilih -- itu gunanya: ia menjawab "kalau saya pindah ke
   *  fork length, sampelnya tinggal berapa" sebelum pembaca menekan tombolnya. */
  ketersediaanUkuran: z
    .array(z.object({ jenisUkuran: z.string().min(1), jumlahIndividu: z.number().default(0) }))
    .default([]),
  indikator: z.object({
    /** Panjang asimtotik. Satu-satunya dataset yang mengirimkannya. */
    linf: z.number().nullable().default(null),
    /** Kalimat metode dari API, ditampilkan apa adanya: cara Linf dihitung
     *  bagian dari artinya, dan menuliskannya ulang di frontend berarti dua
     *  versi yang bisa berbeda. */
    linfMetode: z.string().nullable().default(null),
    /** Panjang matang. null = jenis kelaminnya bukan M -- lihat catatan di
     *  kepala skema ini. */
    lm: z.number().nullable().default(null),
    lmMetode: z.string().nullable().default(null),
    persenMatang: z.number().nullable().default(null),
  }),
  kelas: z
    .array(
      z.object({
        batasBawah: z.number(),
        batasAtas: z.number(),
        nilaiTengah: z.number(),
        jumlah: z.number().default(0),
        /** null -- BUKAN nol: tanpa jenis kelamin M, kematangan tidak
         *  terdefinisi, dan nol akan terbaca sebagai "tidak ada yang matang". */
        jumlahMatang: z.number().nullable().default(null),
        persen: z.number().default(0),
        kumulatifPersen: z.number().default(0),
        persenMatang: z.number().nullable().default(null),
      }),
    )
    .default([]),
});

export type HiupariLengthChart = z.output<typeof hiupariLengthChartSchema>;

/** Satu WPP pada dropdown `/data/production-data` dan `/data/vessel-data`,
 *  dari `/ext/stsc/opsi/wpp`.
 *
 *  `tahunAwal`/`tahunAkhir` divalidasi karena keduanya jadi batas min/max
 *  kolom tahun di form: API MENOLAK tahun di luar rentang yang dimilikinya
 *  (dengan pengalihan, bukan 422), jadi batas yang salah berarti form yang
 *  menawarkan kegagalan. */
export const stscWppOptionSchema = z.object({
  value: z.string().min(1),
  tahunAwal: z.number().int(),
  tahunAkhir: z.number().int(),
  sumber: z.array(z.string().min(1)).default([]),
});

export type StscWppOptionItem = z.output<typeof stscWppOptionSchema>;

export const stscWppOptionsSchema = z.array(stscWppOptionSchema);

/** Satu komoditas pada dropdown `/data/production-data`, dari
 *  `/ext/stsc/opsi/komoditas`. */
export const stscKomoditasOptionSchema = z.object({
  value: z.string().min(1),
  jumlahWpp: z.number().default(0),
  tahunAwal: z.number().int(),
  tahunAkhir: z.number().int(),
});

export type StscKomoditasOptionItem = z.output<typeof stscKomoditasOptionSchema>;

export const stscKomoditasOptionsSchema = z.array(stscKomoditasOptionSchema);

/** Satu deret tahunan milik satu WPP. Dipakai BERTIGA -- armada, GT, dan
 *  produksi per komoditas -- karena API memang mengirim ketiganya dalam bentuk
 *  yang sama persis. Satu skema, bukan tiga salinan. */
const stscSeriesSchema = z.object({
  wpp: z.string().min(1),
  titik: z
    .array(z.object({ tahun: z.number().int(), nilai: z.number() }))
    .default([]),
});

/** Isi `/data/vessel-data`, dari `/ext/stsc/grafik/armada`.
 *
 *  DUA besaran dalam satu respons: jumlah armada (unit) dan total tonase (GT).
 *  Keduanya per WPP dan per tahun, dan keduanya TIDAK bisa ditumpuk di satu
 *  sumbu -- 60.000 unit dan 230.000 GT punya satuan yang berbeda arti. Halaman
 *  menggambar dua kartu, bukan satu kartu dua sumbu: dengan sebelas WPP,
 *  satu kartu berarti 22 garis. */
export const stscArmadaChartSchema = z.object({
  wpp: z.string().nullable().default(null),
  dariTahun: z.number().int().nullable().default(null),
  sampaiTahun: z.number().int().nullable().default(null),
  /** Satuan kedua besaran, dari API ("unit" dan "GT"). */
  unitArmada: z.string().min(1).default('unit'),
  unitGt: z.string().min(1).default('GT'),
  /** Sumbu-x bersama kedua besaran -- dikirim API sekali, bukan diturunkan
   *  dari titik-titiknya: tahun yang tidak punya catatan pun ikut di sini,
   *  dan itulah yang membuat garis kedua deret sejajar. */
  tahun: z.array(z.number().int()).default([]),
  armada: z.array(stscSeriesSchema).default([]),
  gt: z.array(stscSeriesSchema).default([]),
});

export type StscArmadaChart = z.output<typeof stscArmadaChartSchema>;

/** Isi `/data/production-data`, dari `/ext/stsc/grafik/produksi`.
 *
 *  `komoditas` adalah DAFTAR kelompok, satu per komoditas, masing-masing
 *  dengan deret per WPP-nya sendiri. Tanpa penyaring komoditas, API mengirim
 *  kesebelas kelompok sekaligus -- dan halaman menggambar satu kartu grafik
 *  untuk tiap kelompok, bukan menumpuk 121 garis (11 komoditas x 11 WPP) di
 *  satu bingkai. */
export const stscProduksiChartSchema = z.object({
  wpp: z.string().nullable().default(null),
  komoditasFilter: z.string().nullable().default(null),
  dariTahun: z.number().int().nullable().default(null),
  sampaiTahun: z.number().int().nullable().default(null),
  /** Satuan dari API ("ton"), tidak ditulis tetap di frontend. */
  unit: z.string().min(1).default('ton'),
  tahun: z.array(z.number().int()).default([]),
  totalProduksi: z.number().default(0),
  komoditas: z
    .array(
      z.object({
        komoditas: z.string().min(1),
        totalProduksi: z.number().default(0),
        seri: z.array(stscSeriesSchema).default([]),
      }),
    )
    .default([]),
});

export type StscProduksiChart = z.output<typeof stscProduksiChartSchema>;

/** Daftar koleksi yang dikenal. Kunci di sini menentukan nama file
 *  (src/data/<key>.json) dan cache tag revalidasi. Nama resource CMS yang
 *  sesungguhnya (kalau berbeda, seperti "articles" -> "news") dipetakan
 *  terpisah lewat `apiCollections` di source.ts. */
/** Skema SATU entri per koleksi.
 *
 *  Inilah bentuk yang benar-benar dipakai saat memuat: validasi berjalan
 *  per entri (lihat validate() di source.ts), supaya satu baris rusak dari
 *  CMS membuang dirinya sendiri alih-alih menjatuhkan seluruh koleksi --
 *  dan bersamanya /berita, beranda, enam halaman program, dan /cari.
 *  `collections` di bawah tinggal pembungkus array-nya, dipakai untuk tipe
 *  hasil dan pesan galat. */
export const collectionItems = {
  articles: articleListItemSchema,
  publications: publicationSchema,
  team: teamMemberSchema,
  milestones: milestoneSchema,
  programOptions: programOptionSchema,
  newsCategories: newsCategorySchema,
  impactVillages: impactVillageSchema,
  conservationAreas: conservationAreaSchema,
} as const;

export type CollectionName = keyof typeof collectionItems;

/** `satisfies Record<CollectionName, ...>` bukan hiasan: ia yang membuat
 *  koleksi baru yang lupa didaftarkan di salah satu dari dua tabel ini gagal
 *  saat typecheck, bukan saat halaman dibuka. */
export const collections = {
  articles: articlesSchema,
  publications: publicationsSchema,
  team: teamMembersSchema,
  milestones: milestonesSchema,
  programOptions: programOptionsSchema,
  newsCategories: newsCategoriesSchema,
  impactVillages: impactVillagesSchema,
  conservationAreas: conservationAreasSchema,
} as const satisfies Record<CollectionName, z.ZodType>;
