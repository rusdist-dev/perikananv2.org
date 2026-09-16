/**
 * Fakta tentang situs yang dipakai lebih dari satu tempat.
 *
 * Aturan §4j berlaku di file ini: konfigurasi yang belum ada bernilai `null`
 * eksplisit dengan alasannya, bukan string karangan. UI membaca `null` itu dan
 * menampilkan ketiadaannya. Halaman yang mencetak nomor rekening palsu lebih
 * berbahaya daripada halaman yang tidak mencetak apa-apa.
 */

/**
 * Anotasi tipe eksplisit, bukan `satisfies` di dalam blok `as const`.
 *
 * `as const` menyempitkan setiap nilai ke literalnya, jadi objek yang seluruh
 * isinya null akan bertipe Record<string, null> -- dan mengisi salah satunya
 * dengan string kemudian jadi type error, persis kebalikan dari yang diinginkan.
 */
type OptionalString = Record<string, string | null>;

/** null = belum ada akun. Footer menyembunyikan barisnya, bukan menautkan ke profil kosong. */
const social: OptionalString = {
  instagram: null,
  youtube: null,
  x: null,
};

/** null = belum ada. Jangan isi contoh; footer menampilkan status "belum dikonfigurasi". */
const contact: OptionalString = {
  email: 'hello@frci.rekam.org',
  phone: '+62 21 555 0182',
  address: 'Jl. Sempur No.35, RT.03/RW.01, Sempur, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16129',
};

/** null = belum dipasang. Layout melewati <Script> analytics sepenuhnya saat null. */
const analytics: { id: string | null } = {
  id: null,
};

export const site = {
  name: 'Perikanan',
  shortName: 'Perikanan',

  /** Preview branch mengoper URL-nya sendiri supaya canonical tidak menunjuk produksi. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://perikanan.org',

  /**
   * Masuk ke <meta name="description">, og:description, dan kartu Twitter di
   * SETIAP halaman yang tidak mengoper deskripsinya sendiri -- termasuk yang
   * dibaca mesin pencari. Sebelumnya berisi penanda "belum diisi" -- dan
   * penanda itu benar-benar tersaji di produksi.
   *
   * Isinya bukan karangan: ini kalimat pembuka `homeHeroBody`
   * (i18n/dictionaries/common.ts) -- teks resmi organisasi yang sudah ada di
   * halaman depan -- dipadatkan ke ~140 karakter supaya tidak terpotong di
   * hasil pencarian. Kalau teks depannya berubah, samakan juga yang di sini.
   *
   * CMS sebenarnya punya tempatnya (`/settings` -> `meta_description`,
   * docs/api-public.md), tapi untuk tenant ini seluruh isi /settings masih
   * kosong (`name: ""`, semua field null) -- jadi belum ada yang bisa ditarik.
   * Begitu diisi di dashboard, di sinilah tempat menyambungkannya.
   */
  description: {
    id: 'REKAM/FRCI adalah program Kelautan Rekam Nusantara Foundation: analisis perikanan dan pengelolaan kelautan berkelanjutan berbasis data ilmiah.',
    en: "REKAM/FRCI is Rekam Nusantara Foundation's Ocean program: fisheries analysis and sustainable marine management grounded in scientific data.",
  },

  social,
  contact,
  analytics,
} as const;

export type Site = typeof site;
