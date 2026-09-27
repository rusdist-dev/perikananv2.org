'use server';

import { getHiupariLengthChart } from '@/lib/content';
import type { HiupariLengthChart } from '@/lib/content';
import {
  HIUPARI_CLASS_INTERVAL_MAX,
  HIUPARI_CLASS_INTERVAL_MIN,
  isHiupariMaturity,
  isHiupariSex,
  isHiupariSizeType,
} from '@/lib/hiupari-filters';

/**
 * Server Action grafik frekuensi panjang HIUPARI (`/data/shark-and-ray`).
 *
 * Server Action, bukan fetch dari browser, dengan dua alasan yang sama seperti
 * padanannya di /data/ikan dan /data/data-crab: kunci API CMS tidak boleh
 * meninggalkan server, dan endpoint CMS-nya tidak mengizinkan CORS untuk origin
 * situs ini.
 *
 * SATU action saja -- tidak ada pasangan `fetchHiupariOptions` seperti dua
 * dataset lain. Daftar spesiesnya tidak bergantung pada pilihan apa pun, jadi
 * ia diambil sekali di server saat halaman dirender dan tidak pernah perlu
 * diminta ulang dari browser.
 *
 * Berkas ini HANYA mengekspor fungsi async -- syarat modul 'use server'.
 */

/** Batas panjang nilai spesies.
 *
 *  Diperiksa karena Server Action adalah endpoint publik: apa pun bisa
 *  memanggilnya dengan string apa pun, dan nilainya berakhir sebagai parameter
 *  kueri ke CMS. Bukan penangkal injeksi (URLSearchParams yang mengurus
 *  peng-escape-an), melainkan pembatas supaya kiriman sepanjang megabyte tidak
 *  diteruskan sebagai permintaan.
 *
 *  120 karakter memberi ruang lebih dari cukup: nama terpanjang yang
 *  benar-benar ada hari ini adalah "Rhynchobatus australiae" (23). */
const MAX_VALUE_LENGTH = 120;

function sanitizeSpecies(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (trimmed === '' || trimmed.length > MAX_VALUE_LENGTH) return null;

  return trimmed;
}

/**
 * Sebaran panjang untuk filter yang barusan diterapkan.
 *
 * Seluruh kiriman diperiksa ulang di sini, bukan dipercaya dari klien: form di
 * browser memang hanya mengirim nilai dari enum yang sah, tapi Server Action
 * bisa dipanggil tanpa melewati form itu sama sekali -- dan API menjawab
 * kiriman di luar enum dengan pengalihan, bukan dengan data.
 *
 * `selangKelas` DIJEPIT, bukan dibuang saat di luar jangkauan: batasnya keras
 * di API (0,1 sampai 50). Menjepitnya berarti kiriman aneh menghasilkan grafik
 * dengan selang terdekat yang sah; membuangnya berarti diam-diam kembali ke
 * 1 cm, yang pada sebaran 34-392 cm menghasilkan 359 batang -- perbedaan yang
 * terlihat seperti grafik rusak, bukan seperti nilai yang dikoreksi.
 *
 * `jenisUkuran` dan `kematanganMatang` justru TIDAK dijepit melainkan
 * dikembalikan ke bawaannya: keduanya enum, bukan besaran kontinu, dan "4
 * dibulatkan jadi 3" berarti menjawab pertanyaan biologis yang berbeda dari
 * yang diajukan.
 */
export async function fetchHiupariLengthChart(query: unknown): Promise<HiupariLengthChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  const selangKelas =
    typeof raw.selangKelas === 'number' && Number.isFinite(raw.selangKelas)
      ? Math.min(HIUPARI_CLASS_INTERVAL_MAX, Math.max(HIUPARI_CLASS_INTERVAL_MIN, raw.selangKelas))
      : 1;

  return getHiupariLengthChart({
    spesies: sanitizeSpecies(raw.spesies),
    jenisKelamin: isHiupariSex(raw.jenisKelamin) ? raw.jenisKelamin : null,
    jenisUkuran: isHiupariSizeType(raw.jenisUkuran) ? raw.jenisUkuran : 'panjang_total',
    selangKelas,
    kematanganMatang: isHiupariMaturity(raw.kematanganMatang) ? raw.kematanganMatang : 3,
  });
}
