'use server';

import {
  getIkanCatchChart,
  getIkanFilterOptions,
  getIkanLengthChart,
  getIkanTripChart,
} from '@/lib/content';
import type { IkanCatchChart, IkanLengthChart, IkanTripChart } from '@/lib/content';
import {
  IKAN_CLASS_INTERVAL_MAX,
  IKAN_CLASS_INTERVAL_MIN,
  IKAN_FILTER_LEVELS,
  isIkanFilterLevel,
  isIkanLengthType,
  isIkanPeriod,
  isIsoDate,
  type IkanFilterLevel,
  type IkanOptionsByLevel,
  type IkanSelection,
} from '@/lib/ikan-filters';

/**
 * Server Action opsi filter IKAN.
 *
 * Server Action, bukan fetch dari browser, dengan dua alasan yang sama seperti
 * fetchVillageDetail di /discover/our-impact: kunci API CMS tidak boleh
 * meninggalkan server, dan endpoint CMS-nya tidak mengizinkan CORS untuk origin
 * situs ini.
 *
 * Dipanggil setiap kali satu tingkat filter berubah -- dengan daftar tingkat DI
 * BAWAHNYA saja, bukan kedelapan-delapannya. Tingkat di atas yang berubah tidak
 * mungkin ikut berubah isinya (rantai opsinya searah, lihat ancestorSelection),
 * jadi memintanya ulang cuma menambah antrean ke CMS tanpa mengubah apa pun di
 * layar.
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
 *  120 karakter memberi ruang lebih dari cukup: nilai terpanjang yang benar-
 *  benar ada hari ini adalah nama alat tangkap "PUKAT CINCIN PELAGIS KECIL
 *  DENGAN SATU KAPAL" (44). */
const MAX_VALUE_LENGTH = 120;

/** Menyaring kiriman klien jadi bentuk yang dikenal: kunci yang bukan nama
 *  tingkat dibuang, nilai yang bukan string atau kepanjangan dibuang. Yang
 *  tersisa dijamin cocok dengan IkanSelection -- bukan sekadar di-cast jadi
 *  seolah-olah cocok. */
function sanitizeSelection(raw: unknown): IkanSelection {
  if (!raw || typeof raw !== 'object') return {};

  const selection: IkanSelection = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isIkanFilterLevel(key)) continue;
    if (typeof value !== 'string') continue;

    const trimmed = value.trim();
    if (trimmed === '' || trimmed.length > MAX_VALUE_LENGTH) continue;

    selection[key] = trimmed;
  }

  return selection;
}

export async function fetchIkanOptions(
  selection: unknown,
  levels: unknown,
): Promise<IkanOptionsByLevel> {
  const wanted = Array.isArray(levels) ? levels.filter(isIkanFilterLevel) : [];

  // Tanpa daftar tingkat yang sah tidak ada yang perlu diambil. Dikembalikan
  // kosong, bukan "semua tingkat": panggilan yang salah bentuk tidak boleh
  // berubah jadi delapan permintaan ke CMS.
  if (wanted.length === 0) return {};

  // Urutkan mengikuti hierarki, bukan urutan kiriman: antrean ke CMS dilayani
  // dua-dua (MAX_CONCURRENT_REQUESTS), jadi yang paling mungkin dipakai
  // berikutnya -- tingkat terdekat -- harus berangkat lebih dulu.
  const ordered = IKAN_FILTER_LEVELS.filter((level) => wanted.includes(level));

  return getIkanFilterOptions(sanitizeSelection(selection), ordered as IkanFilterLevel[]);
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
 * hasilnya grafik yang lebih luas dari yang diminta (tanpa batas tanggal,
 * misalnya), bukan kartu yang kosong tanpa penjelasan.
 */
export async function fetchIkanTripChart(query: unknown): Promise<IkanTripChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  const dari = isIsoDate(raw.dari) ? raw.dari : null;
  const sampai = isIsoDate(raw.sampai) ? raw.sampai : null;

  return getIkanTripChart({
    selection: sanitizeSelection(raw.selection),
    period: isIkanPeriod(raw.period) ? raw.period : 'monthly',
    dari,
    // Rentang terbalik dijatuhkan seluruhnya, bukan ditukar diam-diam:
    // menukarnya berarti menjawab pertanyaan yang tidak diajukan siapa pun.
    sampai: dari && sampai && sampai < dari ? null : sampai,
  });
}

/**
 * Komposisi tangkapan untuk filter yang barusan diterapkan.
 *
 * Pemeriksaannya sama dengan fetchIkanTripChart, dikurangi satuan waktu:
 * endpoint tangkapan tidak mengenal `tipe_tanggal`.
 */
export async function fetchIkanCatchChart(query: unknown): Promise<IkanCatchChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  const dari = isIsoDate(raw.dari) ? raw.dari : null;
  const sampai = isIsoDate(raw.sampai) ? raw.sampai : null;

  return getIkanCatchChart({
    selection: sanitizeSelection(raw.selection),
    dari,
    sampai: dari && sampai && sampai < dari ? null : sampai,
  });
}

/**
 * Sebaran panjang untuk filter yang barusan diterapkan.
 *
 * Dua angka di sini DIJEPIT, bukan dibuang saat di luar jangkauan:
 * `selang_kelas` punya batas keras di API (0,1 sampai 50) dan nilai di luar itu
 * dijawab 422. Menjepitnya berarti kiriman aneh menghasilkan grafik dengan
 * selang terdekat yang sah; membuangnya berarti diam-diam kembali ke 1 cm,
 * yang pada data 150 cm menghasilkan 148 batang -- perbedaan yang terlihat
 * seperti grafik rusak, bukan seperti nilai yang dikoreksi.
 */
export async function fetchIkanLengthChart(query: unknown): Promise<IkanLengthChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  const dari = isIsoDate(raw.dari) ? raw.dari : null;
  const sampai = isIsoDate(raw.sampai) ? raw.sampai : null;

  const selangKelas =
    typeof raw.selangKelas === 'number' && Number.isFinite(raw.selangKelas)
      ? Math.min(IKAN_CLASS_INTERVAL_MAX, Math.max(IKAN_CLASS_INTERVAL_MIN, raw.selangKelas))
      : 1;

  // Lm nol atau negatif bukan panjang -- ia dibuang, bukan dijepit: garis acuan
  // di 0 cm menjawab pertanyaan yang tidak ada.
  const lm =
    typeof raw.lm === 'number' && Number.isFinite(raw.lm) && raw.lm > 0 ? raw.lm : null;

  return getIkanLengthChart({
    selection: sanitizeSelection(raw.selection),
    dari,
    sampai: dari && sampai && sampai < dari ? null : sampai,
    tipePanjang: isIkanLengthType(raw.tipePanjang) ? raw.tipePanjang : null,
    selangKelas,
    lm,
  });
}
