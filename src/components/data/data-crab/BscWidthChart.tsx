'use client';

import { ColumnChart, type ColumnMarker } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { useBscFilter } from '@/components/data/data-crab/BscFilterContext';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatNumber } from '@/lib/number';
import type { BscWidthChart as BscWidthChartData } from '@/lib/content';

/** Angka lebar: dua desimal, dan koma desimalnya mengikuti locale pembaca. */
function num(value: number | null, locale: Locale, decimals = 2): string {
  return value === null ? '—' : formatNumber(value, locale, { maximumFractionDigits: decimals });
}

/** Berapa label sumbu-x yang dicetak. Sama alasannya dengan grafik trip: jumlah
 *  kelasnya berubah drastis mengikuti selang kelas (83 batang pada 1 cm, 17
 *  pada 5 cm), jadi jarak labelnya harus ikut dihitung. */
function labelEveryFor(count: number): number {
  return Math.max(1, Math.ceil(count / 12));
}

/** Garis acuan Lc dan Lm di atas histogram.
 *
 *  Keduanya hanya digambar kalau ColumnMarker bisa menempatkannya dengan benar:
 *  posisinya diinterpolasi antara nilai tengah kelas PERTAMA dan TERAKHIR, jadi
 *  Lm 40 cm pada sebaran yang berhenti di 20 cm akan digambar di luar bingkai.
 *  Nilai di luar rentang itu dibuang dari grafik -- angkanya tetap tercetak di
 *  kartu indikator di bawah, tempat ia tidak bisa salah dibaca sebagai posisi.
 *
 *  Berbeda dari padanannya di IKAN, DUA-DUANYA hitungan API di sini: Lm
 *  rajungan diinterpolasi dari TKG, bukan diketik pembaca. */
function buildMarkers(chart: BscWidthChartData, locale: Locale): ColumnMarker[] {
  if (chart.kelas.length < 2) return [];

  const min = chart.kelas[0].nilaiTengah;
  const max = chart.kelas[chart.kelas.length - 1].nilaiTengah;
  const inRange = (value: number) => value >= min && value <= max;

  const markers: ColumnMarker[] = [];

  if (chart.indikator.lc !== null && inRange(chart.indikator.lc)) {
    markers.push({
      value: chart.indikator.lc,
      label: `Lc ${num(chart.indikator.lc, locale, 1)} ${chart.unit}`,
      color: 'series-4',
    });
  }

  if (chart.indikator.lm !== null && inRange(chart.indikator.lm)) {
    markers.push({
      value: chart.indikator.lm,
      label: `Lm ${num(chart.indikator.lm, locale, 1)} ${chart.unit}`,
      color: 'series-6',
    });
  }

  return markers;
}

/** Satu angka ringkasan. <dl>, bukan tabel: pasangan label-nilai yang tidak
 *  punya hubungan baris-kolom apa pun. */
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs tracking-wide text-muted uppercase">{label}</dt>
      <dd className="font-mono text-sm font-bold text-primary">{value}</dd>
    </div>
  );
}

/**
 * Tab Length Frequency: histogram sebaran LEBAR KARAPAS + ringkasan dan
 * indikatornya.
 *
 * DUA kartu, dan yang kedua bukan hiasan: histogram menunjukkan bentuk sebaran,
 * sementara Lc (lebar pertama tertangkap) dan Lm (lebar matang gonad) itulah
 * yang menjawab pertanyaan yang membuat grafik ini dibuat -- berapa banyak
 * rajungan yang tertangkap sebelum sempat memijah. Angka itu tidak bisa dibaca
 * dari bentuk batangnya.
 */
export function BscWidthChart({ locale }: { locale: Locale }) {
  const t = getFisheriesDictionary(locale);
  const { widthChart, widthStatus, widthAppliedSummary } = useBscFilter();

  const loading = widthStatus === 'loading';
  const failed = widthStatus === 'error';

  if (!widthChart) {
    return (
      <ChartCard title={t.lengthTitle}>
        <p className="text-sm leading-relaxed text-muted">{t.widthLoadFailed}</p>
      </ChartCard>
    );
  }

  const { unit, selangKelas, tkgMatang, ringkasan, indikator, komposisiJenisKelamin, kelas } =
    widthChart;
  const filterSuffix = widthAppliedSummary ? ` · ${widthAppliedSummary}` : '';
  const kosong = ringkasan.jumlahIndividu === 0 || kelas.length === 0;

  // Label sumbu HARUS angka mentah ("12.5", bukan "12,5"): ColumnMarker
  // menghitung posisi garis acuannya dengan Number(labels[i]), dan koma desimal
  // locale membuatnya NaN -- garis Lc/Lm lalu hilang tanpa error.
  const labels = kelas.map((row) => String(row.nilaiTengah));
  const values = kelas.map((row) => row.jumlah);

  const komposisi = komposisiJenisKelamin
    .map(
      (row) =>
        `${row.jenisKelamin ? (t.sexValues[row.jenisKelamin] ?? row.jenisKelamin) : t.notRecorded} ${formatNumber(row.jumlah, locale)}`,
    )
    .join(' · ');

  return (
    <div aria-busy={loading} className="flex flex-col gap-5">
      {loading ? (
        <p aria-live="polite" className="text-xs text-muted">
          {t.updating}
        </p>
      ) : null}

      {failed ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-bg p-3 text-xs font-bold text-(--color-series-6)"
        >
          {t.updateFailed}
        </p>
      ) : null}

      <ChartCard
        title={t.lengthTitle}
        meta={`${t.widthMeta(
          formatNumber(ringkasan.jumlahIndividu, locale),
          num(selangKelas, locale, 1),
          unit,
        )}${filterSuffix}`}
        note={`${t.widthNote(num(selangKelas, locale, 1), unit)}${
          widthChart.jenisKelamin ? '' : t.sexCombinedNote
        }`}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">{t.widthEmpty}</p>
        ) : (
          <ColumnChart
            labels={labels}
            values={values}
            color="series-3"
            unit={t.individualUnit}
            seriesLabel={t.individualSeries}
            locale={locale}
            // Labelnya angka mentah (lihat komentar `labels` di atas); yang
            // dicetak di sumbu mengikuti pemisah desimal locale.
            formatLabel={(label) => num(Number(label), locale, 2)}
            labelEvery={labelEveryFor(labels.length)}
            markers={buildMarkers(widthChart, locale)}
            tooltip={(label, value) => {
              const row = kelas.find((item) => String(item.nilaiTengah) === label);
              const rentang = row
                ? `${num(row.batasBawah, locale, 1)}–${num(row.batasAtas, locale, 1)} ${unit}`
                : `${label} ${unit}`;
              if (!row) return t.widthTooltip(rentang, formatNumber(value, locale), null, null);
              // Persen matang DILEWATI saat null -- itu kelas kosong, dan
              // "matang 0,0%" di sana adalah angka yang tidak pernah dihitung.
              return t.widthTooltip(
                rentang,
                formatNumber(value, locale),
                num(row.persen, locale, 1),
                row.persenMatang === null ? null : num(row.persenMatang, locale, 1),
              );
            }}
            height={320}
            ariaLabel={t.widthAria(
              formatNumber(ringkasan.jumlahIndividu, locale),
              num(selangKelas, locale, 1),
              unit,
            )}
          />
        )}
      </ChartCard>

      <ChartCard
        title={t.summaryTitle}
        meta={komposisi || undefined}
        note={
          indikator.lcMetode || indikator.lmMetode
            ? t.crabMethodNote(indikator.lcMetode ?? '—', indikator.lmMetode ?? '—')
            : undefined
        }
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
          <StatItem
            label={t.crabStats.count}
            value={formatNumber(ringkasan.jumlahIndividu, locale)}
          />
          <StatItem
            label={t.stats.range}
            value={
              ringkasan.lebarMin === null || ringkasan.lebarMaks === null
                ? '—'
                : `${num(ringkasan.lebarMin, locale, 1)}–${num(ringkasan.lebarMaks, locale, 1)} ${unit}`
            }
          />
          <StatItem label={t.stats.mean} value={`${num(ringkasan.rataRata, locale)} ${unit}`} />
          <StatItem label={t.stats.median} value={`${num(ringkasan.median, locale)} ${unit}`} />
          <StatItem label={t.stats.mode} value={`${num(ringkasan.modus, locale)} ${unit}`} />
          <StatItem
            label={t.crabStats.lc}
            value={indikator.lc === null ? '—' : `${num(indikator.lc, locale)} ${unit}`}
          />
          <StatItem
            label={t.crabStats.lm(formatNumber(tkgMatang, locale))}
            value={indikator.lm === null ? '—' : `${num(indikator.lm, locale)} ${unit}`}
          />
          <StatItem
            label={t.crabStats.mature}
            value={
              indikator.persenMatang === null ? '—' : `${num(indikator.persenMatang, locale, 1)}%`
            }
          />
          {/* Individu yang terukur lebarnya tapi TKG-nya tidak dicatat: mereka
              masuk histogram tapi tidak bisa masuk hitungan persen matang, dan
              selisih itu harus terbaca -- kalau tidak, "65% matang" terbaca
              sebagai persentase dari seluruh batang di atas. */}
          <StatItem label={t.crabStats.noTkg} value={formatNumber(ringkasan.tanpaTkg, locale)} />
        </dl>
      </ChartCard>
    </div>
  );
}
