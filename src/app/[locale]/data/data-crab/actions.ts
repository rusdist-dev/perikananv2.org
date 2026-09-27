'use server';

import {
  getBscCatchChart,
  getBscFilterOptions,
  getBscTripChart,
  getBscWidthChart,
} from '@/lib/content';
import type { BscCatchChart, BscTripChart, BscWidthChart } from '@/lib/content';
import {
  BSC_CLASS_INTERVAL_MAX,
  BSC_CLASS_INTERVAL_MIN,
  BSC_FILTER_LEVELS,
  isBscFilterLevel,
  isBscPeriod,
  isBscSex,
  isBscTkg,
  isIsoDate,
  type BscFilterLevel,
  type BscOptionsByLevel,
  type BscSelection,
} from '@/lib/bsc-filters';

/**
 * Server Action filter dan grafik dataset BSC (`/data/data-crab`).
 *
 * Server Action, bukan fetch dari browser, dengan dua alasan yang sama seperti
 * padanannya di /data/ikan: kunci API CMS tidak boleh meninggalkan server, dan
 * endpoint CMS-nya tidak mengizinkan CORS untuk origin situs ini.
 *
 * Berkas ini HANYA mengekspor fungsi async -- syarat modul 'use server'.
 */

/** Batas panjang nilai filter.
 *
 *  Diperiksa karena Server Action adalah endpoint publik: apa pun bisa
 *  memanggilnya dengan string apa pun, dan nilai-nilai ini berakhir sebagai
 *  parameter kueri ke CMS. Bukan penangkal injeksi (URLSearchParams yang
 *  mengurus peng-escape-an), melainkan pembatas supaya kiriman sepanjang
 *  megabyte tidak diteruskan sebagai permintaan.
 *
 *  120 karakter memberi ruang lebih dari cukup: nilai terpanjang di dataset ini
 *  hari ini adalah "JARING INSANG HANYUT" (20) dan "Portunus sanguinolentus"
 *  (23). */
const MAX_VALUE_LENGTH = 120;

/** Menyaring kiriman klien jadi bentuk yang dikenal: kunci yang bukan nama
 *  tingkat dibuang, nilai yang bukan string atau kepanjangan dibuang. Yang
 *  tersisa dijamin cocok dengan BscSelection -- bukan sekadar di-cast jadi
 *  seolah-olah cocok. */
function sanitizeSelection(raw: unknown): BscSelection {
  if (!raw || typeof raw !== 'object') return {};

  const selection: BscSelection = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isBscFilterLevel(key)) continue;
    if (typeof value !== 'string') continue;

    const trimmed = value.trim();
    if (trimmed === '' || trimmed.length > MAX_VALUE_LENGTH) continue;

    selection[key] = trimmed;
  }

  return selection;
}

export async function fetchBscOptions(
  selection: unknown,
  levels: unknown,
): Promise<BscOptionsByLevel> {
  const wanted = Array.isArray(levels) ? levels.filter(isBscFilterLevel) : [];

  // Tanpa daftar tingkat yang sah tidak ada yang perlu diambil. Dikembalikan
  // kosong, bukan "semua tingkat": panggilan yang salah bentuk tidak boleh
  // berubah jadi tujuh permintaan ke CMS.
  if (wanted.length === 0) return {};

  // Urutkan mengikuti hierarki, bukan urutan kiriman: antrean ke CMS dilayani
  // dua-dua, jadi yang paling mungkin dipakai berikutnya -- tingkat terdekat --
  // harus berangkat lebih dulu.
  const ordered = BSC_FILTER_LEVELS.filter((level) => wanted.includes(level));

  return getBscFilterOptions(sanitizeSelection(selection), ordered as BscFilterLevel[]);
}

/**
 * Dua grafik tab Summary untuk filter yang barusan diterapkan.
 *
 * Seluruh kiriman diperiksa ulang di sini, bukan dipercaya dari klien: form di
 * browser memang sudah menolak rentang tanggal terbalik dan hanya mengirim dua
 * nilai period, tapi Server Action bisa dipanggil tanpa melewati form itu sama
 * sekali.
 *
 * Nilai yang tidak lolos DIBUANG, bukan membuat seluruh panggilan gagal:
 * hasilnya grafik yang lebih luas dari yang diminta, bukan kartu kosong tanpa
 * penjelasan.
 */
export async function fetchBscTripChart(query: unknown): Promise<BscTripChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  const dari = isIsoDate(raw.dari) ? raw.dari : null;
  const sampai = isIsoDate(raw.sampai) ? raw.sampai : null;

  return getBscTripChart({
    selection: sanitizeSelection(raw.selection),
    period: isBscPeriod(raw.period) ? raw.period : 'monthly',
    dari,
    // Rentang terbalik dijatuhkan seluruhnya, bukan ditukar diam-diam:
    // menukarnya berarti menjawab pertanyaan yang tidak diajukan siapa pun.
    sampai: dari && sampai && sampai < dari ? null : sampai,
  });
}

/**
 * Komposisi tangkapan untuk filter yang barusan diterapkan.
 *
 * Pemeriksaannya sama dengan fetchBscTripChart, dikurangi satuan waktu:
 * endpoint tangkapan tidak mengenal `tipe_tanggal`.
 */
export async function fetchBscCatchChart(query: unknown): Promise<BscCatchChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  const dari = isIsoDate(raw.dari) ? raw.dari : null;
  const sampai = isIsoDate(raw.sampai) ? raw.sampai : null;

  return getBscCatchChart({
    selection: sanitizeSelection(raw.selection),
    dari,
    sampai: dari && sampai && sampai < dari ? null : sampai,
  });
}

/**
 * Sebaran lebar karapas untuk filter yang barusan diterapkan.
 *
 * `selangKelas` DIJEPIT, bukan dibuang saat di luar jangkauan: batasnya keras
 * di API (0,1 sampai 50) dan nilai di luar itu ditolak. Menjepitnya berarti
 * kiriman aneh menghasilkan grafik dengan selang terdekat yang sah;
 * membuangnya berarti diam-diam kembali ke 1 cm, yang pada sebaran 5-87 cm
 * menghasilkan 83 batang -- perbedaan yang terlihat seperti grafik rusak,
 * bukan seperti nilai yang dikoreksi.
 *
 * `tkgMatang` justru TIDAK dijepit melainkan dikembalikan ke 2: ia enum tiga
 * nilai, bukan besaran kontinu, dan "4 dibulatkan jadi 3" berarti menjawab
 * pertanyaan biologis yang berbeda dari yang diajukan.
 */
export async function fetchBscWidthChart(query: unknown): Promise<BscWidthChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  const dari = isIsoDate(raw.dari) ? raw.dari : null;
  const sampai = isIsoDate(raw.sampai) ? raw.sampai : null;

  const selangKelas =
    typeof raw.selangKelas === 'number' && Number.isFinite(raw.selangKelas)
      ? Math.min(BSC_CLASS_INTERVAL_MAX, Math.max(BSC_CLASS_INTERVAL_MIN, raw.selangKelas))
      : 1;

  return getBscWidthChart({
    selection: sanitizeSelection(raw.selection),
    dari,
    sampai: dari && sampai && sampai < dari ? null : sampai,
    jenisKelamin: isBscSex(raw.jenisKelamin) ? raw.jenisKelamin : null,
    selangKelas,
    tkgMatang: isBscTkg(raw.tkgMatang) ? raw.tkgMatang : 2,
  });
}
