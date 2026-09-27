/**
 * Kosakata filter dataset STSC (statistik perikanan tangkap per WPP-RI), yang
 * melayani DUA halaman sekaligus: `/data/production-data` dan
 * `/data/vessel-data`.
 *
 * Keduanya berbagi satu dropdown WPP dan satu rentang tahun, dan memang berasal
 * dari sumber yang sama (`/ext/stsc/opsi/wpp` menyebut kedua modulnya di
 * `sumber: ["armada","produksi"]`). Menyalin kosakata ini per halaman berarti
 * dua daftar WPP yang bisa menyimpang tanpa ada yang tahu.
 *
 * Sengaja TANPA dependensi, alasannya sama dengan ikan-filters.ts: modul ini
 * dipakai di sisi server (source.ts) dan sisi klien (form kedua halaman).
 *
 * Tidak ada hierarki di sini. WPP dan komoditas BUKAN dua tingkat yang saling
 * menyempitkan seperti provinsi -> kabupaten: `/opsi/komoditas?wpp=712`
 * mengembalikan kesebelas komoditas yang sama, cuma dengan `jumlah_wpp`-nya
 * yang berubah dari 11 jadi 1. Yang disaring cacahnya, bukan daftarnya --
 * jadi mengganti WPP tidak pernah membatalkan pilihan komoditas.
 */

/** Satu WPP pada dropdown.
 *
 *  `tahunAwal`/`tahunAkhir` ikut dibawa karena itu yang menentukan batas
 *  kolom tahun di form -- API menolak (bukan menjepit) tahun di luar rentang
 *  yang dimilikinya, jadi form yang menawarkan 1980 menawarkan kegagalan.
 *
 *  `sumber` menyebut modul mana yang punya data untuk WPP ini ("armada",
 *  "produksi"). Seluruh WPP hari ini punya keduanya; field-nya tetap dibawa
 *  supaya halaman bisa menyembunyikan WPP yang tidak relevan begitu suatu saat
 *  ada yang cuma punya salah satunya. */
export type StscWppOption = {
  value: string;
  tahunAwal: number;
  tahunAkhir: number;
  sumber: string[];
};

/** Satu komoditas pada dropdown Production Data.
 *
 *  `jumlahWpp` = di berapa WPP komoditas ini tercatat, MENGIKUTI penyaring wpp
 *  yang sedang dikirim. Itu sebabnya angkanya 11 tanpa penyaring dan 1 dengan
 *  `?wpp=712` -- ia bukan properti tetap komoditasnya. */
export type StscKomoditasOption = {
  value: string;
  jumlahWpp: number;
  tahunAwal: number;
  tahunAkhir: number;
};

/** Satu titik deret tahunan. */
export type StscPoint = {
  tahun: number;
  nilai: number;
};

/** Satu deret milik satu WPP. Dipakai bertiga -- armada, GT, dan produksi
 *  per komoditas -- karena bentuknya memang sama persis di ketiganya. */
export type StscSeries = {
  wpp: string;
  titik: StscPoint[];
};

/** Rentang tahun yang dipakai halaman saat pengunjung belum memilih apa pun.
 *
 *  Nilai ini BUKAN sumber kebenaran: batas sesungguhnya datang dari
 *  `/opsi/wpp` (`tahun_awal`/`tahun_akhir`) dan bisa bergeser begitu CMS
 *  menerima data tahun baru. Yang di sini cuma jaring pengaman untuk saat
 *  daftar opsinya gagal diambil -- tanpa itu, form kehilangan batas min/max
 *  dan mulai mengirim tahun yang pasti ditolak. */
export const STSC_FALLBACK_YEAR_MIN = 1990;
export const STSC_FALLBACK_YEAR_MAX = 2021;

/** Batas tahun yang BENAR-BENAR dimiliki data, dihitung dari daftar WPP.
 *
 *  Rentang terluas dari seluruh WPP, bukan irisannya: form menawarkan satu
 *  pasang batas untuk semua pilihan, dan memakai irisan berarti menutup tahun
 *  yang sah untuk WPP yang kebetulan punya arsip lebih panjang.
 *
 *  Daftar kosong (opsinya gagal diambil) jatuh ke STSC_FALLBACK_*. Tanpa itu,
 *  Math.min atas array kosong menghasilkan Infinity, dan form akan mengirim
 *  "Infinity" sebagai tahun -- yang dijawab CMS dengan pengalihan, bukan
 *  dengan data. */
export function stscYearBounds(options: StscWppOption[]): { min: number; max: number } {
  if (options.length === 0) {
    return { min: STSC_FALLBACK_YEAR_MIN, max: STSC_FALLBACK_YEAR_MAX };
  }

  return {
    min: Math.min(...options.map((option) => option.tahunAwal)),
    max: Math.max(...options.map((option) => option.tahunAkhir)),
  };
}

/** Tahun yang masuk akal sebagai tahun kalender pada dataset ini.
 *
 *  Diperiksa di dua tempat (Server Action dan loader) karena nilainya berakhir
 *  sebagai parameter kueri: tahun yang salah bentuk membuat CMS MENGALIHKAN
 *  permintaannya (302 ke halaman depan, bukan 422), dan respons HTML yang tiba
 *  di parser JSON muncul sebagai "grafik gagal dimuat" -- pesan yang
 *  menyalahkan jaringan untuk kesalahan yang ada di kiriman kita. */
export function isStscYear(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1800 &&
    value <= 2200
  );
}

/** Satu permintaan grafik armada (`/data/vessel-data`).
 *
 *  `wpp` null = seluruh WPP, dan API menjawabnya dengan sebelas deret sekaligus
 *  -- itu keadaan BAWAAN halaman ini, bukan kasus pinggiran. */
export type StscArmadaQuery = {
  wpp: string | null;
  dariTahun: number;
  sampaiTahun: number;
};

/** Satu permintaan grafik produksi (`/data/production-data`).
 *
 *  `komoditas` null = seluruh komoditas, dan API mengembalikan SEBELAS
 *  kelompok -- satu per komoditas, masing-masing dengan deretnya sendiri.
 *  Halaman menggambar satu kartu grafik per kelompok. */
export type StscProduksiQuery = {
  wpp: string | null;
  komoditas: string | null;
  dariTahun: number;
  sampaiTahun: number;
};
