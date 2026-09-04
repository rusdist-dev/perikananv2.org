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

  /** TODO: ganti dengan deskripsi asli sebelum rilis -- ini masuk ke <meta name="description">. */
  description: {
    id: 'TODO: satu kalimat yang menjelaskan situs ini kepada pembaca Indonesia.',
    en: 'TODO: one sentence explaining this site to an English reader.',
  },

  social,
  contact,
  analytics,
} as const;

export type Site = typeof site;
