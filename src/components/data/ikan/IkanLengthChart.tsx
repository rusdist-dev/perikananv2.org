'use client';

import { ColumnChart, type ColumnMarker } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { useIkanFilter } from '@/components/data/ikan/IkanFilterContext';
import type { Locale } from '@/i18n/config';
import type { IkanLengthChart as IkanLengthChartData } from '@/lib/content';

/** Angka panjang: dua desimal, dan koma desimalnya mengikuti locale pembaca. */
function num(value: number | null, locale: Locale, decimals = 2): string {
  return value === null
    ? '—'
    : value.toLocaleString(locale, { maximumFractionDigits: decimals });
}

/** Berapa label sumbu-x yang dicetak. Sama alasannya dengan grafik trip: jumlah
 *  kelasnya berubah drastis mengikuti selang kelas (148 batang pada 1 cm, 16
 *  pada 10 cm), jadi jarak labelnya harus ikut dihitung. */
function labelEveryFor(count: number): number {
  return Math.max(1, Math.ceil(count / 12));
}

/** Garis acuan Lc dan Lm di atas histogram.
 *
 *  Keduanya hanya digambar kalau ColumnMarker bisa menempatkannya dengan benar:
 *  posisinya diinterpolasi antara nilai tengah kelas PERTAMA dan TERAKHIR, jadi
 *  Lm 40 cm pada sebaran yang berhenti di 30 cm akan digambar di luar bingkai.
 *  Nilai di luar rentang itu dibuang dari grafik -- angkanya tetap tercetak di
 *  kartu indikator di bawah, tempat ia tidak bisa salah dibaca sebagai posisi. */
function buildMarkers(chart: IkanLengthChartData, locale: Locale): ColumnMarker[] {
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

/** Satu angka ringkasan. <dl>, bukan tabel: enam pasang label-nilai yang tidak
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
 * Tab Length Frequency: histogram sebaran panjang + ringkasan dan indikatornya.
 *
 * DUA kartu, dan yang kedua bukan hiasan: histogram menunjukkan bentuk sebaran,
 * sementara Lc (panjang pertama tertangkap) dan Lm (panjang matang gonad)
 * itulah yang menjawab pertanyaan yang membuat grafik ini dibuat -- berapa
 * banyak ikan yang tertangkap sebelum sempat memijah. Angka itu tidak bisa
 * dibaca dari bentuk batangnya.
 */
export function IkanLengthChart({ locale }: { locale: Locale }) {
  const { lengthChart, lengthStatus, lengthAppliedSummary } = useIkanFilter();

  const loading = lengthStatus === 'loading';
  const failed = lengthStatus === 'error';

  if (!lengthChart) {
    return (
      <ChartCard title="Length Frequency">
        <p className="text-sm leading-relaxed text-muted">
          Grafik frekuensi panjang gagal dimuat. Ubah filter lalu tekan Generate untuk mencoba
          lagi.
        </p>
      </ChartCard>
    );
  }

  const { unit, selangKelas, ringkasan, indikator, komposisiTipePanjang, kelas } = lengthChart;
  const filterSuffix = lengthAppliedSummary ? ` · ${lengthAppliedSummary}` : '';
  const kosong = ringkasan.jumlahIkan === 0 || kelas.length === 0;

  // Label sumbu HARUS angka mentah ("23.5", bukan "23,5"): ColumnMarker
  // menghitung posisi garis acuannya dengan Number(labels[i]), dan koma desimal
  // locale membuatnya NaN -- garis Lc/Lm lalu hilang tanpa error.
  const labels = kelas.map((row) => String(row.nilaiTengah));
  const values = kelas.map((row) => row.jumlah);

  const komposisi = komposisiTipePanjang
    .map((row) => `${row.tipe ?? 'tidak tercatat'} ${row.jumlah.toLocaleString(locale)}`)
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
        meta={`${ringkasan.jumlahIkan.toLocaleString(locale)} ikan · selang ${num(selangKelas, locale, 1)} ${unit}${filterSuffix}`}
        note={`Sebaran panjang ikan yang diukur, dikelompokkan per ${num(selangKelas, locale, 1)} ${unit}. Sumbu datar adalah nilai tengah kelasnya.${
          lengthChart.tipePanjang
            ? ''
            : ' TL dan FL DIGABUNG di sini karena cara ukur belum dipilih -- keduanya mengukur ikan yang sama dengan ujung akhir yang berbeda, jadi sebarannya melebar sedikit oleh perbedaan itu sendiri.'
        }`}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">
            Tidak ada pengukuran panjang yang tercatat untuk filter ini.
          </p>
        ) : (
          <ColumnChart
            labels={labels}
            values={values}
            color="series-3"
            unit="ikan"
            seriesLabel="Jumlah Ikan"
            labelEvery={labelEveryFor(labels.length)}
            markers={buildMarkers(lengthChart, locale)}
            tooltip={(label, value) => {
              const row = kelas.find((item) => String(item.nilaiTengah) === label);
              const rentang = row
                ? `${num(row.batasBawah, locale, 1)}–${num(row.batasAtas, locale, 1)} ${unit}`
                : `${label} ${unit}`;
              return `${rentang} · ${value.toLocaleString(locale)} ikan${
                row ? ` (${num(row.persen, locale, 1)}%)` : ''
              }`;
            }}
            height={320}
            ariaLabel={`Histogram sebaran panjang ikan IKAN, ${ringkasan.jumlahIkan.toLocaleString(locale)} pengukuran dalam kelas selebar ${num(selangKelas, locale, 1)} ${unit}`}
          />
        )}
      </ChartCard>

      <ChartCard
        title="Ringkasan & Indikator"
        meta={komposisi || undefined}
        note={
          indikator.lcMetode
            ? `Lc dihitung dengan ${indikator.lcMetode}. Lm bukan hitungan API -- ia angka acuan yang Anda isi sendiri di filter, dan persentase di bawahnya dihitung terhadapnya.`
            : undefined
        }
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
          <StatItem label="Jumlah ikan" value={ringkasan.jumlahIkan.toLocaleString(locale)} />
          <StatItem
            label="Rentang"
            value={
              ringkasan.panjangMin === null || ringkasan.panjangMaks === null
                ? '—'
                : `${num(ringkasan.panjangMin, locale, 1)}–${num(ringkasan.panjangMaks, locale, 1)} ${unit}`
            }
          />
          <StatItem label="Rata-rata" value={`${num(ringkasan.rataRata, locale)} ${unit}`} />
          <StatItem label="Median" value={`${num(ringkasan.median, locale)} ${unit}`} />
          <StatItem label="Modus" value={`${num(ringkasan.modus, locale)} ${unit}`} />
          <StatItem
            label={`Lc (panjang tertangkap)`}
            value={indikator.lc === null ? '—' : `${num(indikator.lc, locale)} ${unit}`}
          />
          <StatItem
            label="Lm (matang gonad)"
            value={indikator.lm === null ? '—' : `${num(indikator.lm, locale)} ${unit}`}
          />
          <StatItem
            label="Di bawah Lm"
            value={
              indikator.persenDiBawahLm === null ? '—' : `${num(indikator.persenDiBawahLm, locale, 1)}%`
            }
          />
        </dl>
      </ChartCard>
    </div>
  );
}
