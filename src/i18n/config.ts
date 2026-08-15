export const locales = ['id', 'en'] as const;

export type Locale = (typeof locales)[number];

/** Locale ini hidup tanpa prefiks URL: /berita, bukan /id/berita. */
export const defaultLocale: Locale = 'id';

/** Dipakai untuk atribut <html lang> dan hreflang, bukan untuk segmen URL. */
export const htmlLang: Record<Locale, string> = {
  id: 'id-ID',
  en: 'en',
};

/** Nama bahasa dalam bahasanya sendiri -- language switcher tidak boleh
 *  menuliskan "Indonesian" kepada pembaca yang belum bisa membaca Inggris. */
export const localeLabel: Record<Locale, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
