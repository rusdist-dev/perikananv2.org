'use server';

import { getStscArmadaChart } from '@/lib/content';
import type { StscArmadaChart } from '@/lib/content';
import { sanitizeStscText, sanitizeStscYears } from '@/lib/stsc-sanitize';

/**
 * Server Action grafik armada (`/data/vessel-data`).
 *
 * Server Action, bukan fetch dari browser, dengan dua alasan yang sama seperti
 * halaman data lainnya: kunci API CMS tidak boleh meninggalkan server, dan
 * endpoint CMS-nya tidak mengizinkan CORS untuk origin situs ini.
 *
 * SATU action saja -- tidak ada pasangan untuk daftar WPP-nya. Daftar itu tidak
 * bergantung pada pilihan apa pun, jadi ia diambil sekali di server saat
 * halaman dirender dan tidak pernah perlu diminta ulang dari browser.
 *
 * Pemeriksaan kirimannya ada di lib/stsc-sanitize.ts, dipakai bersama dengan
 * halaman Production Data: berkas 'use server' hanya boleh mengekspor fungsi
 * async, jadi pembantu sinkronnya memang tidak bisa tinggal di sini.
 *
 * Berkas ini HANYA mengekspor fungsi async -- syarat modul 'use server'.
 */
export async function fetchStscArmadaChart(query: unknown): Promise<StscArmadaChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  return getStscArmadaChart({
    wpp: sanitizeStscText(raw.wpp),
    ...sanitizeStscYears(raw),
  });
}
