import { getDictionary } from '@/i18n/dictionary';
import type { Locale } from '@/i18n/config';

/** Id yang ditunjuk skip link. Diekspor supaya <main> tidak bisa menyimpang
 *  darinya tanpa ketahuan -- skip link yang menunjuk id tak ada gagal diam. */
export const MAIN_CONTENT_ID = 'main-content';

/**
 * Elemen pertama yang bisa difokus di halaman. Tanpa ini, pengguna keyboard
 * harus menelusuri seluruh nav di SETIAP halaman sebelum sampai ke isi.
 *
 * Bukan `sr-only` biasa: ia harus muncul secara visual saat difokus, kalau
 * tidak pengguna keyboard yang awas menekan Tab lalu tidak melihat apa pun
 * bergerak dan mengira fokusnya hilang.
 */
export function SkipLink({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
      {t.skipToContent}
    </a>
  );
}
