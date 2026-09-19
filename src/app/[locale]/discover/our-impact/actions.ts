'use server';

import { getVillageDetail } from '@/lib/content';
import type { VillageDetail } from '@/lib/content';

/**
 * Server Action detail desa untuk peta Our Impact.
 *
 * Server Action, bukan fetch dari browser, karena alasan yang sama dengan
 * submitContact: kunci API CMS tidak boleh pernah meninggalkan server. Di sini
 * ada alasan kedua -- endpoint CMS-nya tidak mengizinkan CORS untuk origin
 * situs ini, jadi memanggilnya langsung dari browser memang tidak akan jalan.
 *
 * Dipanggil sekali per desa yang DIKLIK, bukan untuk ke-19 desa saat halaman
 * dibuka: lihat komentar loadVillageDetail di lib/content/source.ts.
 *
 * Berkas ini HANYA mengekspor fungsi async (impor tipe hilang saat kompilasi,
 * jadi ia tidak dihitung) -- itu syarat modul 'use server'.
 */

/** `desa_kode` BPS: 33.21.12.2011 -- dua digit provinsi, dua kabupaten, dua
 *  kecamatan, empat desa.
 *
 *  Diperiksa di sini karena Server Action adalah endpoint publik: apa pun bisa
 *  memanggilnya dengan string apa pun. Ini bukan penangkal path traversal
 *  (encodeURIComponent di source.ts yang mengurus itu), melainkan penyaring
 *  supaya tebakan asal tidak diteruskan sebagai permintaan ke CMS -- yang akan
 *  menjawab 404 setelah satu perjalanan jaringan yang sia-sia. */
const KODE_DESA = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;

export async function fetchVillageDetail(kode: string): Promise<VillageDetail | null> {
  if (!KODE_DESA.test(kode)) return null;
  return getVillageDetail(kode);
}
