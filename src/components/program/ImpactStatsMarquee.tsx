import type { CSSProperties } from 'react';

import { Container } from '@/components/layout/Container';
import { formatArticleDate } from '@/lib/date';
import { formatMetricCell, metricLabel } from '@/lib/metrics';
import type { Locale } from '@/i18n/config';
import { getImpactDictionary } from '@/i18n/dictionaries/impact';
import type { CoastStats, VillageMetric } from '@/lib/content';
import { formatNumber } from '@/lib/number';

import './ImpactStatsMarquee.css';

/** Detik per kartu. 12 metrik hari ini berarti satu putaran ~72 detik -- pelan,
 *  karena kartunya untuk dibaca sambil lewat, bukan untuk dikejar. Dihitung per
 *  kartu, bukan dipatok, supaya kecepatannya tidak ikut berubah saat CMS
 *  menambah metrik: yang bertambah panjangnya, bukan lajunya. */
const SECONDS_PER_CARD = 6;

/** Satu kartu totalan.
 *
 *  Susunannya: label + satuan, lalu dua baris tahun. Tahun berjalan yang
 *  diberi latar dan dicetak tebal -- penandanya sama dengan kolom tahun
 *  berjalan di tabel per-desa (VillageDetailPanel), jadi "yang berlatar itu
 *  angka terbaru" berlaku di kedua tempat.
 *
 *  <dl>: pasangan tahun-nilai memang daftar keterangan, dan pembaca layar
 *  mengumumkan "2026, 6.931,84" sebagai satu pasang alih-alih empat angka
 *  lepas. <div> pembungkus tiap pasang legal di dalam <dl> dan itulah yang
 *  membuat baris bisa diberi latar utuh. */
function StatCard({
  metric,
  tahunBaru,
  tahunLama,
  locale,
}: {
  metric: VillageMetric;
  tahunBaru: number | null;
  tahunLama: number | null;
  locale: Locale;
}) {
  return (
    <li className="flex w-56 shrink-0 flex-col border-s border-border px-4 py-3">
      <p className="text-xs leading-snug font-bold text-primary">{metricLabel(metric, locale)}</p>

      <dl className="mt-auto pt-3">
        <div className="mt-1 flex items-baseline justify-between gap-2 rounded-sm bg-surface px-2 py-1 text-primary">
          <dt className="font-mono text-xs font-bold">{tahunBaru ?? '—'}</dt>
          <dd className="font-mono text-sm font-bold">
            {formatMetricCell(metric.baru, metric.decimals, locale)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-2 px-2 text-muted">
          <dt className="font-mono text-xs">{tahunLama ?? '—'}</dt>
          <dd className="font-mono text-xs">
            {formatMetricCell(metric.lama, metric.decimals, locale)}
          </dd>
        </div>
      </dl>
    </li>
  );
}

/**
 * Kartu totalan seluruh desa, berjalan otomatis, di bawah peta Our Impact.
 *
 * Angkanya dari `/ext/coast/statistik` -- totalan lintas desa, bukan jumlah
 * dari yang kebetulan sedang dipilih di peta. Metriknya datang RATA (12 metrik
 * tanpa rincian), jadi kartunya tidak punya apa pun untuk dibuka-tutup, beda
 * dari tabel per-desa di panel.
 *
 * Server component: seluruh gerakannya CSS (lihat ImpactStatsMarquee.css), jadi
 * bagian ini tidak menambah satu byte pun JavaScript ke halaman.
 *
 * Isinya dirender DUA KALI. Salinan kedua aria-hidden -- ia cuma sambungan
 * visual supaya putarannya tidak terlihat meloncat, dan pembaca layar tidak
 * boleh mendengar 12 metrik yang sama dua kali.
 */
export function ImpactStatsMarquee({
  stats,
  locale,
  heading: headingProp,
}: {
  stats: CoastStats;
  locale: Locale;
  heading?: string;
}) {
  const t = getImpactDictionary(locale);
  const heading = headingProp ?? t.statsHeading;

  // Tanpa metrik tidak ada yang bisa dijalankan -- dan pita kosong setinggi
  // 100px lebih membingungkan daripada tidak ada pita sama sekali.
  if (stats.metrik.length === 0) return null;

  const cards = stats.metrik.map((metric) => (
    <StatCard
      key={metric.key}
      metric={metric}
      tahunBaru={stats.tahunBaru}
      tahunLama={stats.tahunLama}
      locale={locale}
    />
  ));

  const sumber = [
    t.statsVillages(formatNumber(stats.jumlahDesa, locale)),
    t.statsForms(formatNumber(stats.jumlahForm, locale)),
    stats.pendataanTerakhir ? t.latest(formatArticleDate(stats.pendataanTerakhir, locale)) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section aria-labelledby="stats-marquee-heading" className="mt-10 border-y border-border py-6">
      <Container className="page-gutter lg:pe-(--spacing-panel-gutter)">
        <h2 id="stats-marquee-heading" className="text-sm font-bold text-primary">
          {heading}
        </h2>
        {/* Dasar angkanya disebut, sama seperti di kepala panel desa: totalan
            tanpa keterangan "dari berapa desa, sampai kapan" adalah angka yang
            tidak bisa diperiksa siapa pun. */}
        <p className="mt-1 text-xs text-muted">{sumber}</p>
      </Container>

      {/* Di LUAR Container: pitanya memang harus menyentuh kedua tepi layar --
          itu yang membuatnya terbaca sebagai sesuatu yang lewat, bukan sebagai
          baris kartu yang kebetulan terpotong.

          tabIndex={0} karena dengan prefers-reduced-motion wadah ini jadi area
          yang digulir sendiri, dan area scroll tanpa perhentian Tab tidak bisa
          dicapai pengguna keyboard. Efek sampingnya diinginkan juga: fokus di
          sini menghentikan animasinya (lihat :focus-within di CSS). */}
      <div
        className="stats-marquee mt-4"
        style={
          {
            '--stats-marquee-duration': `${stats.metrik.length * SECONDS_PER_CARD}s`,
          } as CSSProperties
        }
        tabIndex={0}
        role="group"
        aria-label={t.statsAria(heading, formatNumber(stats.metrik.length, locale))}
      >
        <div className="stats-marquee-track">
          <ul className="flex list-none p-0">{cards}</ul>
          <ul aria-hidden className="stats-marquee-clone flex list-none p-0">
            {cards}
          </ul>
        </div>
      </div>
    </section>
  );
}
