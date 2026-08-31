import type { StaticImageData } from 'next/image';

import placeholderPhoto from '@/assets/sustainable-fisheries/slider1.png';

/**
 * Isi panel detail desa: foto kegiatan, angka, dan tiga daftar kegiatan.
 *
 * SELURUHNYA PLACEHOLDER. Tidak ada satu angka pun di berkas ini yang berasal
 * dari lapangan -- ia ada supaya panelnya bisa dibangun, diukur, dan ditinjau
 * sebelum datanya siap. `getVillageDetail()` di bawah sengaja mengembalikan
 * objek yang SAMA untuk semua desa: kalau tiap desa diberi angka karangan yang
 * berbeda-beda, panel ini akan terbaca seperti data sungguhan dan cepat atau
 * lambat ada yang mengutipnya.
 *
 * Bentuk datanya yang harus bertahan, bukan isinya. Saat data resmi datang,
 * yang berubah cukup isi berkas ini (atau sumbernya diganti CMS/JSON) --
 * VillageDetailPanel tidak perlu disentuh selama tipe di bawah dipenuhi.
 */

/** Satu angka ringkas. `value` sengaja STRING, bukan number: sebagian angka
 *  program datang sebagai rentang atau perkiraan ("1.200+", "12-15"), dan
 *  memaksanya jadi number berarti pemformatannya harus ditebak di komponen. */
export type VillageStat = {
  label: string;
  value: string;
  unit: string;
};

/** Satu baris kegiatan pada tab Rehabilitasi dan Pelatihan. Keduanya berbagi
 *  bentuk yang sama karena keduanya memang daftar "kapan - apa - hasilnya";
 *  memisahkannya jadi dua tipe hanya menggandakan kode panelnya. */
export type VillageActivity = {
  /** Bebas bentuk ("2023", "Mar 2024", "2022-2024") -- lihat alasan di `value`. */
  period: string;
  title: string;
  detail: string;
};

export type VillageDetail = {
  photo: StaticImageData;
  /** Wajib diisi ulang bersama fotonya. Alt yang tertinggal dari foto lama
   *  lebih menyesatkan daripada tidak ada alt sama sekali. */
  photoAlt: string;
  stats: VillageStat[];
  /** Satu string per paragraf. Bukan satu string panjang ber-\n\n: itu
   *  memaksa komponennya memecah teks, dan HTML mentah di data adalah pintu
   *  masuk yang tidak perlu dibuka. */
  description: string[];
  rehabilitation: VillageActivity[];
  training: VillageActivity[];
};

const PLACEHOLDER_DETAIL: VillageDetail = {
  photo: placeholderPhoto,
  photoAlt: 'Foto contoh kegiatan pendampingan FRCI di desa pesisir',
  stats: [
    { label: 'Luas rehabilitasi', value: '24,6', unit: 'ha' },
    { label: 'Bibit ditanam', value: '18.400', unit: 'batang' },
    { label: 'Kelompok binaan', value: '6', unit: 'kelompok' },
    { label: 'Warga terlibat', value: '312', unit: 'orang' },
    { label: 'Pendampingan', value: '2021', unit: 'sejak' },
    { label: 'Tingkat hidup', value: '78', unit: '%' },
  ],
  description: [
    'Teks contoh. Desa ini berada di pesisir dengan tutupan mangrove dan padang lamun yang menjadi tumpuan penangkapan ikan skala kecil. Pendampingan berjalan bersama kelompok nelayan dan pemerintah desa, dengan fokus pada pemulihan habitat serta pencatatan hasil tangkapan.',
    'Teks contoh. Data ekosistem dan ekonomi dari desa ini masuk ke kerangka Ocean Accounts, sehingga perubahan tutupan habitat dapat dibaca berdampingan dengan perubahan pendapatan rumah tangga nelayan.',
  ],
  rehabilitation: [
    {
      period: '2021',
      title: 'Pemetaan dasar habitat',
      detail: 'Contoh: survei tutupan mangrove dan lamun sebagai garis dasar pemantauan.',
    },
    {
      period: '2022',
      title: 'Penanaman mangrove tahap I',
      detail: 'Contoh: 9.200 bibit pada lahan tambak tidak produktif seluas 11,3 ha.',
    },
    {
      period: '2023',
      title: 'Penanaman mangrove tahap II',
      detail: 'Contoh: 9.200 bibit menyusul evaluasi tingkat hidup tahap sebelumnya.',
    },
    {
      period: '2024',
      title: 'Pemantauan dan penyulaman',
      detail: 'Contoh: penggantian bibit mati dan pengukuran pertumbuhan tiap triwulan.',
    },
  ],
  training: [
    {
      period: 'Mar 2022',
      title: 'Pencatatan hasil tangkapan',
      detail: 'Contoh: 34 peserta dari 4 kelompok nelayan.',
    },
    {
      period: 'Agu 2022',
      title: 'Pembibitan mangrove',
      detail: 'Contoh: 28 peserta, termasuk 11 perempuan pengelola pembibitan desa.',
    },
    {
      period: 'Mei 2023',
      title: 'Pengolahan hasil laut',
      detail: 'Contoh: 22 peserta dari kelompok usaha bersama desa.',
    },
    {
      period: 'Feb 2024',
      title: 'Pengawasan kawasan',
      detail: 'Contoh: 19 peserta kelompok pengawas masyarakat (Pokmaswas).',
    },
  ],
};

/**
 * Detail satu desa. Untuk sekarang mengabaikan `villageId` dan mengembalikan
 * placeholder yang sama untuk semuanya -- lihat alasannya di kepala berkas.
 * Tanda tangannya sudah berbentuk final, jadi saat data per desa tersedia,
 * pemanggilnya (VillageDetailPanel) tidak berubah.
 */
export function getVillageDetail(villageId: string): VillageDetail {
  void villageId;
  return PLACEHOLDER_DETAIL;
}
