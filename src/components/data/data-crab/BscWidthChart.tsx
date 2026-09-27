'use client';

import { ColumnChart, type ColumnMarker } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { useBscFilter } from '@/components/data/data-crab/BscFilterContext';
import type { Locale } from '@/i18n/config';
import type { BscWidthChart as BscWidthChartData } from '@/lib/content';

/** Angka lebar: dua desimal, dan koma desimalnya mengikuti locale pembaca. */
function num(value: number | null, locale: Locale, decimals = 2): string {
  return value === null ? '—' : value.toLocaleString(locale, { maximumFractionDigits: decimals });
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
  const { widthChart, widthStatus, widthAppliedSummary } = useBscFilter();

  const loading = widthStatus === 'loading';
  const failed = widthStatus === 'error';

  if (!widthChart) {
    return (
      <ChartCard title="Length Frequency">
        <p className="text-sm leading-relaxed text-muted">
          Grafik frekuensi lebar gagal dimuat. Ubah filter lalu tekan Generate untuk mencoba lagi.
        </p>
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
    .map((row) => `${row.jenisKelamin ?? 'tidak tercatat'} ${row.jumlah.toLocaleString(locale)}`)
    .join(' · ');

  return (
    <div aria-busy={loading} className="flex flex-col gap-5">
      {loading ? (
        <p aria-live="polite" className="text-xs text-muted">
          Memperbarui grafik… angka di bawah masih hasil filter sebelumnya.
        </p>
      ) : null}

      {failed ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-bg p-3 text-xs font-bold text-(--color-series-6)"
        >
          Grafik gagal diperbarui. Yang tampil di bawah masih hasil filter sebelumnya.
        </p>
      ) : null}

      <ChartCard
        title="Length Frequency"
        meta={`${ringkasan.jumlahIndividu.toLocaleString(locale)} individu · selang ${num(selangKelas, locale, 1)} ${unit}${filterSuffix}`}
        note={`Sebaran lebar karapas yang diukur, dikelompokkan per ${num(selangKelas, locale, 1)} ${unit}. Sumbu datar adalah nilai tengah kelasnya.${
          widthChart.jenisKelamin
            ? ''
            : ' Jantan dan betina DIGABUNG di sini karena jenis kelamin belum dipilih -- keduanya matang pada lebar yang berbeda, jadi Lm di bawah adalah satu angka untuk dua sebaran.'
        }`}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">
            Tidak ada pengukuran lebar yang tercatat untuk filter ini.
          </p>
        ) : (
          <ColumnChart
            labels={labels}
            values={values}
            color="series-3"
            unit="individu"
            seriesLabel="Jumlah Individu"
            labelEvery={labelEveryFor(labels.length)}
            markers={buildMarkers(widthChart, locale)}
            tooltip={(label, value) => {
              const row = kelas.find((item) => String(item.nilaiTengah) === label);
              const rentang = row
                ? `${num(row.batasBawah, locale, 1)}–${num(row.batasAtas, locale, 1)} ${unit}`
                : `${label} ${unit}`;
              if (!row) return `${rentang} · ${value.toLocaleString(locale)} individu`;
              // Persen matang DILEWATI saat null -- itu kelas kosong, dan
              // "matang 0,0%" di sana adalah angka yang tidak pernah dihitung.
              const matang =
                row.persenMatang === null
                  ? ''
                  : `, matang ${num(row.persenMatang, locale, 1)}%`;
              return `${rentang} · ${value.toLocaleString(locale)} individu (${num(row.persen, locale, 1)}%${matang})`;
            }}
            height={320}
            ariaLabel={`Histogram sebaran lebar karapas rajungan dan kepiting, ${ringkasan.jumlahIndividu.toLocaleString(locale)} pengukuran dalam kelas selebar ${num(selangKelas, locale, 1)} ${unit}`}
          />
        )}
      </ChartCard>

      <ChartCard
        title="Ringkasan & Indikator"
        meta={komposisi || undefined}
        note={
          indikator.lcMetode || indikator.lmMetode
            ? `Lc: ${indikator.lcMetode ?? '—'}. Lm: ${indikator.lmMetode ?? '—'}. Keduanya hitungan API, bukan angka yang diisi sendiri.`
            : undefined
        }
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
          <StatItem
            label="Jumlah individu"
            value={ringkasan.jumlahIndividu.toLocaleString(locale)}
          />
          <StatItem
            label="Rentang"
            value={
              ringkasan.lebarMin === null || ringkasan.lebarMaks === null
                ? '—'
                : `${num(ringkasan.lebarMin, locale, 1)}–${num(ringkasan.lebarMaks, locale, 1)} ${unit}`
            }
          />
          <StatItem label="Rata-rata" value={`${num(ringkasan.rataRata, locale)} ${unit}`} />
          <StatItem label="Median" value={`${num(ringkasan.median, locale)} ${unit}`} />
          <StatItem label="Modus" value={`${num(ringkasan.modus, locale)} ${unit}`} />
          <StatItem
            label="Lc (lebar tertangkap)"
            value={indikator.lc === null ? '—' : `${num(indikator.lc, locale)} ${unit}`}
          />
          <StatItem
            label={`Lm (TKG ≥ ${tkgMatang})`}
            value={indikator.lm === null ? '—' : `${num(indikator.lm, locale)} ${unit}`}
          />
          <StatItem
            label="Matang gonad"
            value={
              indikator.persenMatang === null ? '—' : `${num(indikator.persenMatang, locale, 1)}%`
            }
          />
          {/* Individu yang terukur lebarnya tapi TKG-nya tidak dicatat: mereka
              masuk histogram tapi tidak bisa masuk hitungan persen matang, dan
              selisih itu harus terbaca -- kalau tidak, "65% matang" terbaca
              sebagai persentase dari seluruh batang di atas. */}
          <StatItem label="Tanpa catatan TKG" value={ringkasan.tanpaTkg.toLocaleString(locale)} />
        </dl>
      </ChartCard>
    </div>
  );
}
