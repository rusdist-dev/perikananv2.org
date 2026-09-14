'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Locale } from './config';

/**
 * Jembatan satu arah: halaman detail berita (Server Component, jauh di dalam
 * <main>) ke LanguageSwitcher (Client Component di panel navigasi, saudara
 * dari <main> -- lihat SiteShell). React context adalah satu-satunya cara
 * data itu sampai ke sana tanpa mengubah SiteShell/SiteNav jadi tahu tentang
 * artikel, karena Provider-nya HARUS jadi leluhur bersama keduanya
 * ([locale]/layout.tsx), sementara isinya cuma relevan untuk satu rute.
 *
 * Alasan context ini perlu ada sama sekali: CMS Rekam menerbitkan slug hasil
 * generate dari judul per bahasa, jadi varian id/en satu artikel yang sama
 * bisa punya slug yang benar-benar berbeda (lihat komentar `cmsId` di
 * lib/content/schema.ts). Tanpa jembatan ini, LanguageSwitcher hanya bisa
 * menukar prefiks locale pada path yang sama persis -- benar untuk semua
 * halaman lain, tapi 404 di /berita/[slug] begitu translasinya di slug lain.
 *
 * State dan setter-nya SENGAJA dua context terpisah, bukan satu objek
 * `{alternates, setAlternates}`. Kalau digabung, objek context value itu
 * berubah identitas tiap kali `alternates` berubah -- dan karena
 * SetArticleLocaleAlternates memanggil setter itu sendiri dari dalam
 * useEffect yang bergantung padanya, itu jadi loop tanpa henti (setiap
 * pemanggilan mengubah identitas objek, yang memicu efek berjalan lagi).
 * `setAlternates` dari useState identitasnya stabil selama Provider hidup,
 * jadi men-taruhnya di context sendiri membuat efek itu hanya berjalan saat
 * `idSlug`/`enSlug` sungguhan berubah (pindah artikel), bukan tiap render.
 */

type ArticleLocaleAlternates = Partial<Record<Locale, string>>;

const StateContext = createContext<ArticleLocaleAlternates | null>(null);
const SetterContext = createContext<((value: ArticleLocaleAlternates | null) => void) | null>(null);

export function ArticleLocaleAlternatesProvider({ children }: { children: ReactNode }) {
  const [alternates, setAlternates] = useState<ArticleLocaleAlternates | null>(null);
  return (
    <SetterContext.Provider value={setAlternates}>
      <StateContext.Provider value={alternates}>{children}</StateContext.Provider>
    </SetterContext.Provider>
  );
}

/** Dibaca LanguageSwitcher. null = halaman saat ini bukan detail berita --
 *  switcher pakai jalur lama (tukar prefiks locale pada path yang sama). */
export function useArticleLocaleAlternates(): ArticleLocaleAlternates | null {
  return useContext(StateContext);
}

/**
 * Dipasang HANYA oleh /berita/[slug]/page.tsx. Efeknya berjalan tiap kali
 * path artikel berganti (unmount saat berpindah ke rute lain membersihkannya
 * lagi), supaya LanguageSwitcher tidak pernah memakai data artikel yang lama
 * setelah pembaca pindah ke halaman non-artikel.
 */
export function SetArticleLocaleAlternates({ alternates }: { alternates: ArticleLocaleAlternates }) {
  const setAlternates = useContext(SetterContext);
  const idSlug = alternates.id;
  const enSlug = alternates.en;

  useEffect(() => {
    setAlternates?.({ id: idSlug, en: enSlug });
    return () => setAlternates?.(null);
  }, [setAlternates, idSlug, enSlug]);

  return null;
}
