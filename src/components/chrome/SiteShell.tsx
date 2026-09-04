import type { ReactNode } from 'react';
import { SiteNav, type ResolvedSection } from './SiteNav';
import { SiteFooter } from './SiteFooter';
import { SkipLink, MAIN_CONTENT_ID } from './SkipLink';
import { IconSprite } from '@/icons/generated';
import { getDictionary } from '@/i18n/dictionary';
import { panelNav } from '@/lib/nav';
import type { Locale } from '@/i18n/config';

/**
 * Rangka setiap halaman. Landmark-nya (banner / main / contentinfo) hidup di
 * sini SEKALI; halaman yang menyusun landmark-nya sendiri cepat atau lambat
 * akan menghasilkan dua <main> atau tidak sama sekali, dan keduanya merusak
 * navigasi berbasis landmark.
 *
 * Peran `banner` dipikul SiteNav -- panel sisi kiri menggantikan header.
 *
 * tabIndex={-1} pada <main> perlu supaya target skip link benar-benar bisa
 * menerima fokus: tanpa itu sebagian browser memindahkan viewport tapi
 * meninggalkan fokus keyboard di awal dokumen.
 */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getDictionary(locale);

  // Label diselesaikan di server: SiteNav adalah komponen klien, dan mengirim
  // seluruh kamus ke sana akan mengangkut teks yang tidak dipakai halaman ini.
  const sections: ResolvedSection[] = panelNav.map((section) => ({
    id: section.id,
    heading: t[section.headingKey],
    items: section.items.map((item) => ({
      href: item.href,
      label: item.labelKey ? t[item.labelKey] : item.label,
    })),
  }));

  return (
    <>
      <IconSprite />
      <SkipLink locale={locale} />
      <SiteNav
        locale={locale}
        sections={sections}
        labels={{
          primaryNav: t.primaryNav,
          openMenu: t.openMenu,
          closeMenu: t.closeMenu,
          minimizeMenu: t.minimizeMenu,
          expandMenu: t.expandMenu,
          languageSwitcher: t.languageSwitcher,
          search: t.search,
        }}
      />

      {/* Pengimbang panel. Panel ber-`position: fixed` tidak menyisihkan ruang
          sendiri -- tanpa padding ini konten tertimpa. Nilainya diturunkan dari
          lebar panel + jaraknya dari tepi (lihat --spacing-panel-gutter), jadi
          menggeser panel tidak bisa membuat keduanya menyimpang. */}
      <div className="pt-topbar lg:pt-0">
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className="focus-visible:outline-none">
          {children}
        </main>
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}
