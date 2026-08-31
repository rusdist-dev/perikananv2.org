/**
 * Desa dampingan yang bisa dipilih pada peta Our Impact.
 *
 * DATA CONTOH. Sepuluh entri di bawah dipakai untuk membangun interaksinya
 * (cari -> pilih -> peta terbang ke lokasi); koordinatnya perkiraan pusat desa,
 * bukan hasil survei. Sebelum tayang, ganti isinya dengan data resmi program --
 * bentuk datanya sengaja dibuat sesederhana ini supaya penggantinya bisa datang
 * dari CMS atau berkas JSON tanpa mengubah komponen mana pun.
 *
 * Urutannya BARAT -> TIMUR, bukan alfabet: daftar yang belum difilter lalu
 * terbaca sebagai sapuan melintasi Indonesia, sejalan dengan peta di sebelahnya.
 * Pengurutan alfabet akan mencampur Aceh dengan Raja Ampat di baris berdekatan
 * dan menghapus informasi geografis yang gratis itu.
 */
export type ImpactVillage = {
  /** Stabil dan tidak berubah saat nama desa diperbaiki ejaannya -- id inilah
   *  yang disimpan sebagai state pilihan, bukan namanya. */
  id: string;
  desa: string;
  /** TANPA awalan "Kecamatan": panel detail mencetak awalannya sendiri sebagai
   *  label baris, jadi menuliskannya di sini menghasilkan "Kecamatan Kecamatan
   *  Paloh". Beda dengan `kabupaten` di bawah, yang awalannya bagian dari nama. */
  kecamatan: string;
  /** Sudah termasuk awalannya ("Kabupaten"/"Kota"), karena keduanya muncul di
   *  daftar ini dan menyingkat semuanya jadi "Kab." akan salah untuk Langsa. */
  kabupaten: string;
  provinsi: string;
  lat: number;
  lng: number;
};

export const IMPACT_VILLAGES: readonly ImpactVillage[] = [
  {
    id: 'kuala-langsa',
    desa: 'Kuala Langsa',
    kecamatan: 'Langsa Barat',
    kabupaten: 'Kota Langsa',
    provinsi: 'Aceh',
    lat: 4.5333,
    lng: 98.0167,
  },
  {
    id: 'sebubus',
    desa: 'Sebubus',
    kecamatan: 'Paloh',
    kabupaten: 'Kabupaten Sambas',
    provinsi: 'Kalimantan Barat',
    lat: 1.9167,
    lng: 109.2833,
  },
  {
    id: 'sungsang',
    desa: 'Sungsang',
    kecamatan: 'Banyuasin II',
    kabupaten: 'Kabupaten Banyuasin',
    provinsi: 'Sumatera Selatan',
    lat: -2.35,
    lng: 104.85,
  },
  {
    id: 'pasarbanggi',
    desa: 'Pasarbanggi',
    kecamatan: 'Rembang',
    kabupaten: 'Kabupaten Rembang',
    provinsi: 'Jawa Tengah',
    lat: -6.6789,
    lng: 111.4392,
  },
  {
    id: 'les',
    desa: 'Les',
    kecamatan: 'Tejakula',
    kabupaten: 'Kabupaten Buleleng',
    provinsi: 'Bali',
    lat: -8.1245,
    lng: 115.3372,
  },
  {
    id: 'tanjung-luar',
    desa: 'Tanjung Luar',
    kecamatan: 'Keruak',
    kabupaten: 'Kabupaten Lombok Timur',
    provinsi: 'Nusa Tenggara Barat',
    lat: -8.7597,
    lng: 116.5486,
  },
  {
    id: 'bontosua',
    desa: 'Bontosua',
    kecamatan: 'Liukang Tupabbiring',
    kabupaten: 'Kabupaten Pangkajene dan Kepulauan',
    provinsi: 'Sulawesi Selatan',
    lat: -4.9019,
    lng: 119.3244,
  },
  {
    id: 'bahoi',
    desa: 'Bahoi',
    kecamatan: 'Likupang Barat',
    kabupaten: 'Kabupaten Minahasa Utara',
    provinsi: 'Sulawesi Utara',
    lat: 1.7351,
    lng: 125.0257,
  },
  {
    id: 'ohoililir',
    desa: 'Ohoililir',
    kecamatan: 'Kei Kecil',
    kabupaten: 'Kabupaten Maluku Tenggara',
    provinsi: 'Maluku',
    lat: -5.6667,
    lng: 132.7,
  },
  {
    id: 'arborek',
    desa: 'Arborek',
    kecamatan: 'Meos Mansar',
    kabupaten: 'Kabupaten Raja Ampat',
    provinsi: 'Papua Barat Daya',
    lat: -0.5642,
    lng: 130.5347,
  },
];
