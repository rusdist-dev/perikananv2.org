'use server';

import { getStscKomoditasOptions, getStscProduksiChart } from '@/lib/content';
import type { StscProduksiChart } from '@/lib/content';
import type { StscKomoditasOption } from '@/lib/stsc-filters';
import { sanitizeStscText, sanitizeStscYears } from '@/lib/stsc-sanitize';

/**
 * Server Action filter dan grafik produksi (`/data/production-data`).
 *
 * Server Action, bukan fetch dari browser, dengan dua alasan yang sama seperti
 * halaman data lainnya: kunci API CMS tidak boleh meninggalkan server, dan
 * endpoint CMS-nya tidak mengizinkan CORS untuk origin situs ini.
 *
 * Pemeriksaan kirimannya ada di lib/stsc-sanitize.ts, dipakai bersama dengan
 * halaman Vessel Data.
 *
 * Berkas ini HANYA mengekspor fungsi async -- syarat modul 'use server'.
 */

/**
 * Daftar komoditas untuk WPP yang barusan dipilih.
 *
 * Yang berubah CACAHNYA, bukan daftarnya: kesebelas komoditas tercatat di
 * kesebelas WPP, jadi `?wpp=712` mengembalikan sebelas entri yang sama dengan
 * `jumlahWpp: 1`. Tetap diminta ulang karena angka itu yang dicetak di
 * dropdown -- dan karena daftarnya BISA menyusut begitu CMS menerima WPP yang
 * tidak punya semua komoditas.
 *
 * Itu juga sebabnya mengganti WPP tidak pernah membatalkan pilihan komoditas
 * di form, tidak seperti rantai provinsi -> kabupaten di halaman IKAN.
 */
export async function fetchStscKomoditasOptions(wpp: unknown): Promise<StscKomoditasOption[]> {
  return getStscKomoditasOptions(sanitizeStscText(wpp));
}

/**
 * Produksi untuk filter yang barusan diterapkan.
 *
 * `komoditas` null = seluruh komoditas, dan API menjawabnya dengan SEBELAS
 * kelompok sekaligus -- satu per komoditas. Halaman menggambar satu kartu
 * grafik per kelompok.
 *
 * Komoditas yang tidak dikenal bukan kegagalan: API menjawab 200 dengan
 * `komoditas: []`, dan itu tiba sebagai "tidak ada catatan" yang sah.
 */
export async function fetchStscProduksiChart(query: unknown): Promise<StscProduksiChart | null> {
  const raw = (query ?? {}) as Record<string, unknown>;

  return getStscProduksiChart({
    wpp: sanitizeStscText(raw.wpp),
    komoditas: sanitizeStscText(raw.komoditas),
    ...sanitizeStscYears(raw),
  });
}
