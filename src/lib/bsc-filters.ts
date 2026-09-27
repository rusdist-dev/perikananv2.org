/**
 * Kosakata filter dataset BSC (rajungan/kepiting, `/data/data-crab`): nama
 * tingkat, endpoint opsinya, dan nama parameter kuerinya.
 *
 * Sengaja TANPA dependensi, alasannya sama dengan ikan-filters.ts: modul ini
 * dipakai di dua sisi sekaligus -- source.ts (server, menyusun URL ke CMS) dan
 * BscFilterPanel (klien, menyusun form). Menaruhnya di schema.ts berarti
 * komponen klien ikut menarik zod ke bundle cuma untuk membaca satu array
 * konstanta.
 *
 * Berdiri sendiri, tidak menumpang IKAN, karena hierarkinya memang BERBEDA:
 * dataset ini tidak mengenal WPPNRI sama sekali, dan tingkat keenamnya "jenis
 * tangkapan" (KEPITING/RAJUNGAN), bukan family. Menggeneralisasi keduanya jadi
 * satu modul berarti satu daftar tingkat yang setengahnya selalu tidak berlaku
 * untuk salah satu dataset.
 */

/** Urut dari yang paling luas ke yang paling sempit, dan urutan ini BERARTI:
 *  setiap endpoint opsi hanya menerima parameter tingkat-tingkat di ATASNYA,
 *  dan mengganti satu tingkat membatalkan semua pilihan di bawahnya. */
export const BSC_FILTER_LEVELS = [
  'provinsi',
  'kabupaten',
  'lokasiPendaratan',
  'jenisPendataan',
  'alatTangkap',
  'jenisTangkapan',
  'spesies',
] as const;

export type BscFilterLevel = (typeof BSC_FILTER_LEVELS)[number];

/** Segmen terakhir URL endpoint opsinya: `/ext/bsc/opsi/<segmen>`. Berbeda dari
 *  nama tingkat karena API memakai kebab-case. */
export const BSC_LEVEL_ENDPOINT: Record<BscFilterLevel, string> = {
  provinsi: 'provinsi',
  kabupaten: 'kabupaten',
  lokasiPendaratan: 'lokasi-pendaratan',
  jenisPendataan: 'jenis-pendataan',
  alatTangkap: 'alat-tangkap',
  jenisTangkapan: 'jenis-tangkapan',
  spesies: 'spesies',
};

/** Nama parameter kueri saat tingkat ini dikirim sebagai penyaring tingkat di
 *  bawahnya -- snake_case, beda lagi dari dua nama di atas. */
export const BSC_LEVEL_PARAM: Record<BscFilterLevel, string> = {
  provinsi: 'provinsi',
  kabupaten: 'kabupaten',
  lokasiPendaratan: 'lokasi_pendaratan',
  jenisPendataan: 'jenis_pendataan',
  alatTangkap: 'alat_tangkap',
  jenisTangkapan: 'jenis_tangkapan',
  spesies: 'spesies',
};

/** Pilihan pengguna. Kunci yang tidak ada (atau bernilai kosong) = tingkat itu
 *  tidak menyaring apa-apa, dan API memang menerimanya begitu. */
export type BscSelection = Partial<Record<BscFilterLevel, string>>;

/** Satu pilihan pada dropdown. `jumlahTrip` ikut dikirim API dan ikut disimpan,
 *  tapi TIDAK dicetak di dropdown -- lihat komentar yang sama di
 *  ikan-filters.ts. */
export type BscOption = {
  value: string;
  jumlahTrip: number;
};

export type BscOptionsByLevel = Partial<Record<BscFilterLevel, BscOption[]>>;

/** Tingkat-tingkat DI BAWAH `level`, urut. Dipakai untuk mengosongkan pilihan
 *  yang tidak lagi berlaku sekaligus menentukan daftar mana yang diminta
 *  ulang. */
export function descendantLevels(level: BscFilterLevel): BscFilterLevel[] {
  return BSC_FILTER_LEVELS.slice(BSC_FILTER_LEVELS.indexOf(level) + 1);
}

/** Pilihan yang boleh ikut sebagai parameter saat meminta opsi `level`: hanya
 *  yang di ATASNYA. `/opsi/provinsi` memang tidak mengenal `kabupaten`, dan
 *  mengirimnya berarti mengandalkan API mengabaikan parameter asing --
 *  sesuatu yang tidak dijanjikan siapa pun. */
export function ancestorSelection(level: BscFilterLevel, selection: BscSelection): BscSelection {
  const cut = BSC_FILTER_LEVELS.indexOf(level);
  const result: BscSelection = {};

  for (const ancestor of BSC_FILTER_LEVELS.slice(0, cut)) {
    const value = selection[ancestor];
    if (value) result[ancestor] = value;
  }

  return result;
}

/** Tingkat yang IKUT sebagai penyaring grafik trip -- EMPAT teratas.
 *
 *  Endpoint-nya sebetulnya menerima alat tangkap dan jenis tangkapan juga,
 *  tapi keduanya tidak muncul di tab Summary, dan mengirim penyaring yang
 *  tidak terlihat di form berarti angka di kartu menjawab pertanyaan yang
 *  tidak bisa dibaca siapa pun dari layar. Daftar ini yang menjaga apa yang
 *  DIKIRIM sama dengan apa yang DITAMPILKAN. */
export const BSC_TRIP_CHART_LEVELS = BSC_FILTER_LEVELS.slice(0, 4);

/** Tingkat penyaring grafik tangkapan -- LIMA teratas: empat di atas ditambah
 *  alat tangkap, persis field yang tampil di tab Catch Composition. */
export const BSC_CATCH_CHART_LEVELS = BSC_FILTER_LEVELS.slice(0, 5);

/** Frekuensi lebar memakai SELURUH tingkat, termasuk spesies: yang dihitung
 *  sebaran lebar karapas, dan menggabungkan Portunus pelagicus dengan Scylla
 *  serrata dalam satu histogram menyatukan dua sebaran yang berbeda. */
export const BSC_WIDTH_CHART_LEVELS = BSC_FILTER_LEVELS;

/** YYYY-MM-DD, format yang dikirim <input type="date"> dan yang diminta API.
 *
 *  Diperiksa di dua tempat (Server Action dan loader) karena nilainya berakhir
 *  sebagai parameter kueri: tanggal salah bentuk dijawab 422 oleh CMS, dan 422
 *  itu muncul sebagai "grafik gagal dimuat" -- pesan yang menyalahkan jaringan
 *  untuk kesalahan yang ada di kiriman kita. */
export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Satuan waktu grafik trip. 'monthly' bawaan: pendataan masuk harian dan yang
 *  dicari orang pertama kali adalah pola dalam setahun, bukan satu angka per
 *  tahun. */
export const BSC_PERIODS = ['monthly', 'yearly'] as const;

export type BscPeriod = (typeof BSC_PERIODS)[number];

export function isBscPeriod(value: unknown): value is BscPeriod {
  return typeof value === 'string' && (BSC_PERIODS as readonly string[]).includes(value);
}

export function isBscFilterLevel(value: unknown): value is BscFilterLevel {
  return typeof value === 'string' && (BSC_FILTER_LEVELS as readonly string[]).includes(value);
}

/** Jenis kelamin, penyaring khusus frekuensi lebar.
 *
 *  Bukan sekadar penyaring gaya-gayaan: rajungan betina dan jantan matang pada
 *  lebar yang berbeda, jadi Lm gabungan keduanya adalah rata-rata dua sebaran
 *  yang tidak seharusnya dirata-ratakan. null (bawaan) = keduanya digabung,
 *  persis yang dilakukan API saat parameternya dikosongkan. */
export const BSC_SEXES = ['JANTAN', 'BETINA'] as const;

export type BscSex = (typeof BSC_SEXES)[number];

export function isBscSex(value: unknown): value is BscSex {
  return typeof value === 'string' && (BSC_SEXES as readonly string[]).includes(value);
}

/** Batas `selang_kelas` yang diterima API. Lebar selang menentukan berapa
 *  banyak batang yang muncul: pada sebaran 5–87 cm hari ini, 1 cm menghasilkan
 *  83 kelas dan 5 cm menghasilkan 17. */
export const BSC_CLASS_INTERVAL_MIN = 0.1;
export const BSC_CLASS_INTERVAL_MAX = 50;

/** Ambang TKG (tingkat kematangan gonad) yang dihitung sebagai "matang".
 *
 *  Angka, bukan pilihan bebas: API menerima 1–3 dan memakainya dua kali --
 *  untuk `persen_matang` dan untuk menghitung Lm (lebar saat 50% individu
 *  mencapai TKG >= ambang ini). Menaikkan ambangnya menggeser Lm ke kanan;
 *  itu keputusan biologis, bukan tampilan, dan karena itu ada di form. */
export const BSC_TKG_LEVELS = [1, 2, 3] as const;

export type BscTkg = (typeof BSC_TKG_LEVELS)[number];

export function isBscTkg(value: unknown): value is BscTkg {
  return value === 1 || value === 2 || value === 3;
}

/** Satu permintaan grafik trip: penyaring wilayah + satuan waktu + rentang
 *  tanggal. `dari`/`sampai` null = tidak dibatasi. */
export type BscTripQuery = {
  selection: BscSelection;
  period: BscPeriod;
  dari: string | null;
  sampai: string | null;
};

/** Satu permintaan grafik tangkapan. Tanpa satuan waktu: endpoint-nya tidak
 *  mengenal `tipe_tanggal` -- yang dikembalikannya total bobot per spesies,
 *  bukan deret waktu. */
export type BscCatchQuery = {
  selection: BscSelection;
  dari: string | null;
  sampai: string | null;
};

/** Satu permintaan grafik frekuensi lebar. */
export type BscWidthQuery = {
  selection: BscSelection;
  dari: string | null;
  sampai: string | null;
  /** null = jantan dan betina digabung. */
  jenisKelamin: BscSex | null;
  selangKelas: number;
  tkgMatang: BscTkg;
};
