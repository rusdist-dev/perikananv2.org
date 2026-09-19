import { notFound } from 'next/navigation';
import Image from 'next/image';
import waveBg from '@/assets/banner/bg_wave1.png';
import { Container } from '@/components/layout/Container';
import { ImpactStatsMarquee } from '@/components/program/ImpactStatsMarquee';
import { ImpactVillageMap } from '@/components/program/ImpactVillageMap';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';
import { getCoastStats, getImpactVillages, getInterventionMpaIds } from '@/lib/content';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({
    locale,
    path: '/discover/our-impact',
    title: getDictionary(locale).navOurImpact,
  });
}

export default async function OurImpactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  // Daftar desanya diambil DI SINI, bukan di dalam ImpactVillageMap: komponen
  // itu client component, dan kunci API CMS tidak boleh ikut ke browser.
  // Detail per desa menyusul lewat Server Action saat ada yang diklik (lihat
  // ./actions.ts) -- menariknya sekaligus di sini berarti 19 permintaan untuk
  // satu panel yang menampilkan satu desa.
  //
  // Ketiganya diminta BERBARENGAN: tidak ada yang bergantung pada hasil yang
  // lain, dan menunggunya berurutan berarti tiga perjalanan ke CMS yang
  // dijumlahkan, bukan tiga yang berjalan bersamaan.
  //
  // allSettled, bukan all: kegagalan daftar kawasan atau totalan tidak boleh
  // menjatuhkan halaman yang bagian utamanya (peta + dropdown) baik-baik saja.
  // Yang gagal kehilangan penanda warnanya atau pita kartunya; sisanya jalan.
  const [villagesResult, mpaIdsResult, statsResult] = await Promise.allSettled([
    getImpactVillages(),
    getInterventionMpaIds(),
    getCoastStats(),
  ]);

  // Daftar desa TIDAK punya jalan keluar: tanpa itu tidak ada peta, tidak ada
  // dropdown, dan tidak ada halaman -- jadi kegagalannya dilempar ulang supaya
  // error boundary Next yang menanganinya, bukan halaman kosong tanpa sebab.
  if (villagesResult.status === 'rejected') throw villagesResult.reason;

  const villages = villagesResult.value;
  const interventionMpaIds = mpaIdsResult.status === 'fulfilled' ? mpaIdsResult.value : [];
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;

  return (
    <div className="relative isolate overflow-hidden bg-bg">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src={waveBg}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover opacity-5 select-none"
        />
      </div>

      <Container className="page-gutter relative pt-10 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb
          items={[
            { label: t.home, href: '/' },
            { label: t.navDiscover, href: '/discover/about-us' },
            { label: t.navOurImpact, href: '/discover/our-impact' },
          ]}
        />

        <span className="mt-4 inline-block rounded-full border border-secondary px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
          {t.navDiscover}
        </span>

        <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-primary sm:text-5xl">
          {t.ourImpactHeading}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          {t.ourImpactBody}
        </p>

        <div className="mt-6 h-1 w-full max-w-5xl bg-secondary" />
      </Container>

      {/* Di LUAR Container: pemilih desanya membawa Container sendiri supaya
          sejajar dengan teks di atas, sedangkan petanya full-bleed selebar
          viewport. */}
      <div className="relative mt-10 w-full ">
        <ImpactVillageMap
          villages={villages}
          interventionMpaIds={interventionMpaIds}
          locale={locale}
        />

        {/* Di bawah peta, bukan di atasnya: yang dicari orang di halaman ini
            adalah desanya. Totalan ini jawaban untuk pertanyaan berikutnya
            ("seberapa besar semuanya"), jadi ia menunggu giliran. */}
        {stats ? <ImpactStatsMarquee stats={stats} locale={locale} /> : null}
      </div>
    </div>
  );
}
