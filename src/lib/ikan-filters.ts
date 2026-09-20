/**
 * Kosakata filter dataset IKAN: nama tingkat, endpoint opsinya, dan nama
 * parameter kuerinya.
 *
 * Modul ini SENGAJA tanpa dependensi -- tidak mengimpor zod, tidak mengimpor
 * lib/content. Ia dipakai di dua sisi sekaligus: source.ts (server, menyusun
 * URL ke CMS) dan IkanFilterPanel (klien, menyusun form). Kalau daftarnya
 * tinggal di schema.ts, komponen klien ikut menarik zod ke bundle hanya untuk
 * membaca satu array konstanta.
 */

/** Urut dari yang paling luas ke yang paling sempit, dan urutan ini BERARTI:
 *  setiap endpoint opsi hanya menerima parameter tingkat-tingkat di ATASNYA,
 *  dan mengganti satu tingkat membatalkan semua pilihan di bawahnya. Menukar
 *  urutannya di sini berarti menukar rantai itu -- tidak ada tempat lain yang
 *  menyimpan hierarkinya. */
export const IKAN_FILTER_LEVELS = [
  'wppnri',
  'provinsi',
  'kabupaten',
  'lokasiPendaratan',
  'jenisData',
  'alatTangkap',
  'family',
  'spesies',
] as const;

export type IkanFilterLevel = (typeof IKAN_FILTER_LEVELS)[number];

/** Segmen terakhir URL endpoint opsinya: `/ext/ikan/opsi/<segmen>`. Berbeda
 *  dari nama tingkat karena API memakai kebab-case. */
export const IKAN_LEVEL_ENDPOINT: Record<IkanFilterLevel, string> = {
  wppnri: 'wppnri',
  provinsi: 'provinsi',
  kabupaten: 'kabupaten',
  lokasiPendaratan: 'lokasi-pendaratan',
  jenisData: 'jenis-data',
  alatTangkap: 'alat-tangkap',
  family: 'family',
  spesies: 'spesies',
};

/** Nama parameter kueri saat tingkat ini dikirim sebagai penyaring tingkat di
 *  bawahnya -- snake_case, beda lagi dari dua nama di atas. */
export const IKAN_LEVEL_PARAM: Record<IkanFilterLevel, string> = {
  wppnri: 'wppnri',
  provinsi: 'provinsi',
  kabupaten: 'kabupaten',
  lokasiPendaratan: 'lokasi_pendaratan',
  jenisData: 'jenis_data',
  alatTangkap: 'alat_tangkap',
  family: 'family',
  spesies: 'spesies',
};

/** Pilihan pengguna. Kunci yang tidak ada (atau bernilai kosong) = tingkat itu
 *  tidak menyaring apa-apa, dan API memang menerimanya begitu: tanpa parameter
 *  sama sekali, tiap endpoint mengembalikan seluruh nilai yang pernah tercatat. */
export type IkanSelection = Partial<Record<IkanFilterLevel, string>>;

/** Satu pilihan pada dropdown.
 *
 *  `jumlahTrip` ikut dikirim API dan ikut disimpan, tapi TIDAK ditampilkan di
 *  dropdown -- ia tinggal di sini karena datanya memang bagian dari respons,
 *  dan karena "berapa trip di balik pilihan ini" adalah angka yang wajar
 *  dibutuhkan tampilan lain nanti. Yang membacanya hari ini: tidak ada. */
export type IkanOption = {
  value: string;
  jumlahTrip: number;
};

/** Daftar opsi per tingkat. Tidak semua tingkat selalu terisi -- lihat
 *  fetchIkanOptions, yang hanya mengambil ulang tingkat yang memang berubah. */
export type IkanOptionsByLevel = Partial<Record<IkanFilterLevel, IkanOption[]>>;

/** Tingkat-tingkat DI BAWAH `level`, urut. Dipakai dua kali: untuk mengosongkan
 *  pilihan yang tidak lagi berlaku, dan untuk menentukan daftar mana yang harus
 *  diminta ulang. */
export function descendantLevels(level: IkanFilterLevel): IkanFilterLevel[] {
  return IKAN_FILTER_LEVELS.slice(IKAN_FILTER_LEVELS.indexOf(level) + 1);
}

/** Pilihan yang boleh ikut sebagai parameter saat meminta opsi `level`: hanya
 *  yang di ATASNYA.
 *
 *  Penyaringan ini bukan kerapian belaka -- endpoint `/opsi/provinsi` memang
 *  tidak mengenal `kabupaten`, dan mengirimnya berarti mengandalkan API
 *  mengabaikan parameter asing, sesuatu yang tidak dijanjikan siapa pun. */
export function ancestorSelection(
  level: IkanFilterLevel,
  selection: IkanSelection,
): IkanSelection {
  const cut = IKAN_FILTER_LEVELS.indexOf(level);
  const result: IkanSelection = {};

  for (const ancestor of IKAN_FILTER_LEVELS.slice(0, cut)) {
    const value = selection[ancestor];
    if (value) result[ancestor] = value;
  }

  return result;
}

/** Tingkat yang diterima endpoint grafik trip -- LIMA teratas saja.
 *
 *  Alat tangkap, family, dan spesies tidak ikut: satu trip bisa memakai
 *  beberapa alat dan mendaratkan banyak spesies, jadi "jumlah trip" tidak bisa
 *  disaring oleh keduanya tanpa berubah arti. Endpoint-nya memang tidak
 *  menerima parameter itu, dan daftar ini yang menjaga frontend tidak
 *  mengirimnya. */
export const IKAN_TRIP_CHART_LEVELS = IKAN_FILTER_LEVELS.slice(0, 5);

/** Tingkat yang diterima endpoint grafik tangkapan -- ENAM teratas, satu lebih
 *  banyak dari grafik trip.
 *
 *  Alat tangkap ikut di sini justru karena satuannya berbeda: yang dihitung
 *  berat tangkapan per spesies, dan berat itu memang bisa dipisah per alat.
 *  "Jumlah trip" tidak bisa (satu trip memakai beberapa alat), dan itulah yang
 *  membuat kedua daftar ini berbeda panjang. */
export const IKAN_CATCH_CHART_LEVELS = IKAN_FILTER_LEVELS.slice(0, 6);

/** Satu permintaan grafik tangkapan. Tanpa satuan waktu: endpoint-nya tidak
 *  mengenal `tipe_tanggal` -- yang dikembalikannya total per spesies, bukan
 *  deret waktu. */
export type IkanCatchQuery = {
  selection: IkanSelection;
  dari: string | null;
  sampai: string | null;
};

/** Satu permintaan grafik trip: penyaring wilayah + satuan waktu + rentang
 *  tanggal. `dari`/`sampai` null = tidak dibatasi. */
export type IkanTripQuery = {
  selection: IkanSelection;
  period: IkanPeriod;
  dari: string | null;
  sampai: string | null;
};

/** YYYY-MM-DD, format yang dikirim <input type="date"> dan yang diminta API.
 *
 *  Diperiksa di dua tempat (Server Action dan loader) karena nilainya berakhir
 *  sebagai parameter kueri: tanggal yang salah bentuk membuat CMS menjawab 422,
 *  dan 422 itu muncul sebagai "grafik gagal dimuat" -- pesan yang menyalahkan
 *  jaringan untuk kesalahan yang sebenarnya ada di kiriman kita. */
export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Grafik frekuensi panjang memakai SELURUH tingkat filter, termasuk family dan
 *  spesies: yang dihitung sebaran panjang ikan, dan sebaran panjang lintas
 *  spesies tidak berarti apa-apa (tongkol 30 cm dan teri 3 cm di satu
 *  histogram). */
export const IKAN_LENGTH_CHART_LEVELS = IKAN_FILTER_LEVELS;

/** Cara panjang ikan diukur.
 *
 *  TL = total length (ujung moncong sampai ujung ekor), FL = fork length
 *  (sampai cabang ekor). Keduanya angka yang BERBEDA untuk ikan yang sama,
 *  jadi memilih salah satunya bukan sekadar penyaring -- ia menentukan besaran
 *  apa yang sedang dibaca sumbu datarnya.
 *
 *  null (bawaan) = keduanya digabung, persis yang dilakukan API saat parameter
 *  ini dikosongkan. */
export const IKAN_LENGTH_TYPES = ['TL', 'FL'] as const;

export type IkanLengthType = (typeof IKAN_LENGTH_TYPES)[number];

export function isIkanLengthType(value: unknown): value is IkanLengthType {
  return typeof value === 'string' && (IKAN_LENGTH_TYPES as readonly string[]).includes(value);
}

/** Batas `selang_kelas` yang diterima API (422 di luar itu). Lebar selang
 *  menentukan berapa banyak batang yang muncul: 1 cm menghasilkan 148 kelas
 *  pada data hari ini, 10 cm menghasilkan 16. */
export const IKAN_CLASS_INTERVAL_MIN = 0.1;
export const IKAN_CLASS_INTERVAL_MAX = 50;

/** Satu permintaan grafik frekuensi panjang. */
export type IkanLengthQuery = {
  selection: IkanSelection;
  dari: string | null;
  sampai: string | null;
  tipePanjang: IkanLengthType | null;
  selangKelas: number;
  /** Panjang matang gonad (cm) sebagai garis acuan. null = tidak digambar, dan
   *  API tidak menghitung persentase ikan di bawahnya. */
  lm: number | null;
};

/** Satuan waktu grafik. 'monthly' yang terpilih secara bawaan: pendataan masuk
 *  harian dan yang dicari orang pertama kali adalah pola dalam setahun, bukan
 *  satu angka per tahun. */
export const IKAN_PERIODS = ['monthly', 'yearly'] as const;

export type IkanPeriod = (typeof IKAN_PERIODS)[number];

export function isIkanPeriod(value: unknown): value is IkanPeriod {
  return typeof value === 'string' && (IKAN_PERIODS as readonly string[]).includes(value);
}

export function isIkanFilterLevel(value: unknown): value is IkanFilterLevel {
  return typeof value === 'string' && (IKAN_FILTER_LEVELS as readonly string[]).includes(value);
}
