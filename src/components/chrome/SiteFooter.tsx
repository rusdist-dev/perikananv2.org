import { AppLink } from '@/components/ui/AppLink';
import { Container } from '@/components/layout/Container';
import { getDictionary } from '@/i18n/dictionary';
import { footerNav } from '@/lib/nav';
import { site } from '@/lib/site';
import type { Locale } from '@/i18n/config';

/** Tahun dibaca sekali per render server. Tidak ada state, jadi tidak ada
 *  ketidakcocokan hydration -- angka yang sama sampai ke klien. */
function currentYear(): number {
  return new Date().getFullYear();
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const socials = Object.entries(site.social).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );
  const contacts = Object.entries(site.contact).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );

  return (
    <footer className="mt-16 border-t border-border py-10 text-sm text-muted">
      <Container className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-fg">{site.name}</p>
          <p>
            © {currentYear()} {site.name}. {t.allRightsReserved}
          </p>
        </div>

        <nav aria-label={t.footerNav}>
          <ul className="flex flex-col gap-2">
            {footerNav.map((item) => (
              <li key={item.href}>
                <AppLink href={item.href} className="hover:text-fg">
                  {item.labelKey ? t[item.labelKey] : item.label}
                </AppLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* §4j: yang belum dikonfigurasi menyatakan diri kosong. Menampilkan
            alamat atau nomor karangan sebagai placeholder jauh lebih berbahaya
            daripada tidak menampilkan apa-apa -- pembaca akan menghubunginya. */}
        <div className="flex flex-col gap-2">
          {contacts.length === 0 && socials.length === 0 ? (
            <p data-config="missing">{t.configMissing}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {contacts.map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
              {socials.map(([key, value]) => (
                <li key={key}>
                  <a href={value} className="hover:text-fg" rel="me noopener">
                    {key}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </footer>
  );
}
