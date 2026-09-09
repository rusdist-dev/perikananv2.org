import type { Locale } from './config';
import { commonDictionary, type CommonDictionary } from './dictionaries/common';
import { programDictionary, type ProgramDictionary } from './dictionaries/program';
import { discoverDictionary, type DiscoverDictionary } from './dictionaries/discover';
import { dataDictionary, type DataDictionary } from './dictionaries/data';
import { connectDictionary, type ConnectDictionary } from './dictionaries/connect';

/**
 * Kamus dipecah per seksi menu (PROGRAM/DISCOVER/DATA/CONNECT) plus COMMON
 * untuk chrome/beranda/pencarian, masing-masing di src/i18n/dictionaries/ --
 * supaya kelihatan rapi dan gampang ditemukan di VS Code, dan supaya
 * menambah teks di satu seksi tidak perlu menyisir file kamus lengkap.
 * File ini cuma menggabungkan kelimanya jadi satu Dictionary.
 *
 * Yang diterjemahkan di sini HANYA chrome: nav, footer, kontrol, label form,
 * pesan sistem. Konten editorial (artikel/publikasi) hidup di src/data +
 * lib/content dengan field `lang`-nya sendiri; menaruhnya di sini akan
 * memaksa deploy setiap kali ada artikel baru.
 *
 * Record<Locale, ...> membuat locale baru gagal saat typecheck, bukan diam-diam
 * jatuh ke bahasa Inggris saat runtime.
 */

export type Dictionary = CommonDictionary &
  ProgramDictionary &
  DiscoverDictionary &
  DataDictionary &
  ConnectDictionary;

const dictionaries: Record<Locale, Dictionary> = {
  id: {
    ...commonDictionary.id,
    ...programDictionary.id,
    ...discoverDictionary.id,
    ...dataDictionary.id,
    ...connectDictionary.id,
  },
  en: {
    ...commonDictionary.en,
    ...programDictionary.en,
    ...discoverDictionary.en,
    ...dataDictionary.en,
    ...connectDictionary.en,
  },
};

export type DictionaryKey = keyof Dictionary;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
