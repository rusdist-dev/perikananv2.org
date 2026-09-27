/**
 * Pemeriksa kiriman klien untuk kedua Server Action STSC.
 *
 * Modul TERPISAH dari actions.ts, dan itu bukan pilihan gaya: berkas
 * 'use server' hanya boleh mengekspor fungsi async, jadi dua pembantu sinkron
 * ini tidak bisa tinggal di sana. Terpisah dari stsc-filters.ts juga, karena
 * yang ini urusan sisi server saja -- form di browser tidak pernah
 * memanggilnya.
 *
 * Halaman IKAN dan Data Crab menyimpan pembantu serupa di dalam actions.ts
 * masing-masing, tidak diekspor. Di sini tidak bisa: DUA halaman
 * (`/data/production-data` dan `/data/vessel-data`) memakai endpoint dan
 * aturan yang sama, dan menyalinnya dua kali berarti dua aturan yang bisa
 * menyimpang.
 */

import { STSC_FALLBACK_YEAR_MAX, STSC_FALLBACK_YEAR_MIN, isStscYear } from '@/lib/stsc-filters';

/** Batas panjang nilai teks (WPP, komoditas).
 *
 *  Diperiksa karena Server Action adalah endpoint publik: apa pun bisa
 *  memanggilnya dengan string apa pun, dan nilai-nilai ini berakhir sebagai
 *  parameter kueri ke CMS. Bukan penangkal injeksi (URLSearchParams yang
 *  mengurus peng-escape-an), melainkan pembatas supaya kiriman sepanjang
 *  megabyte tidak diteruskan sebagai permintaan.
 *
 *  120 karakter memberi ruang lebih dari cukup: nilai terpanjang yang
 *  benar-benar ada hari ini adalah "TCT (Tuna-Cakalang-Tongkol)" (27). */
const MAX_VALUE_LENGTH = 120;

export function sanitizeStscText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (trimmed === '' || trimmed.length > MAX_VALUE_LENGTH) return null;

  return trimmed;
}

/**
 * Rentang tahun yang aman dikirim ke CMS.
 *
 * Diperiksa ulang di sini, bukan dipercaya dari klien: form di browser memang
 * sudah mengunci min/max dan menolak rentang terbalik, tapi Server Action bisa
 * dipanggil tanpa melewati form itu sama sekali.
 *
 * Yang membuat pemeriksaan ini lebih perlu daripada padanannya di halaman lain:
 * endpoint STSC menjawab tahun salah bentuk dengan PENGALIHAN 302 ke halaman
 * depan, bukan 422. Yang tiba kemudian HTML, dan HTML di parser JSON muncul
 * sebagai "grafik gagal dimuat" -- pesan yang menyalahkan jaringan untuk
 * kesalahan yang ada di kiriman kita.
 *
 * Nilai yang tidak lolos DIGANTI bawaan, bukan membuat panggilan gagal:
 * hasilnya grafik rentang penuh, bukan kartu kosong tanpa penjelasan.
 *
 * Rentang terbalik DITUKAR di sini -- berbeda dari rentang TANGGAL di halaman
 * IKAN dan Data Crab, yang justru menjatuhkan batas akhirnya. Bedanya
 * disengaja: di sana menukar berarti menjawab pertanyaan yang tidak diajukan
 * siapa pun, sementara dua tahun telanjang tanpa konteks lain memang cuma
 * punya satu tafsir yang masuk akal.
 */
export function sanitizeStscYears(raw: Record<string, unknown>): {
  dariTahun: number;
  sampaiTahun: number;
} {
  const dari = isStscYear(raw.dariTahun) ? raw.dariTahun : STSC_FALLBACK_YEAR_MIN;
  const sampai = isStscYear(raw.sampaiTahun) ? raw.sampaiTahun : STSC_FALLBACK_YEAR_MAX;

  return dari <= sampai
    ? { dariTahun: dari, sampaiTahun: sampai }
    : { dariTahun: sampai, sampaiTahun: dari };
}
