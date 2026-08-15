import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { getDictionary } from '@/i18n/dictionary';
import { defaultLocale } from '@/i18n/config';

/**
 * not-found.tsx tidak menerima params, jadi locale-nya tidak bisa dibaca dari
 * rute. Kamus default dipakai untuk teks server-rendered; itu kompromi sadar --
 * alternatifnya (menebak dari header) menghasilkan halaman yang tidak bisa
 * di-cache demi satu paragraf.
 */
export default function NotFound() {
  const t = getDictionary(defaultLocale);

  return (
    <Container as="div" width="content" className="py-24">
      <h1 className="text-3xl font-semibold text-fg">{t.notFoundTitle}</h1>
      <p className="mt-4 text-muted">{t.notFoundBody}</p>
      <p className="mt-8">
        <AppLink href="/" className="text-primary underline underline-offset-4">
          {t.backHome}
        </AppLink>
      </p>
    </Container>
  );
}
