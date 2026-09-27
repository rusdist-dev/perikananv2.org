'use client';

import { ColumnChart } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { RankedBars } from '@/components/data/RankedBars';
import { useBscFilter } from '@/components/data/data-crab/BscFilterContext';
import type { Locale } from '@/i18n/config';

/** Berapa label sumbu-x yang dicetak, dihitung dari jumlah batangnya.
 *
 *  Angka tetap tidak bisa dipakai: rentang penuh bulanan hari ini puluhan
 *  batang, sementara "2025 saja" cuma 12, dan `labelEvery` yang sama membuat
 *  yang pertama jadi pita hitam atau yang kedua kehilangan sembilan labelnya.
 *  Sasarannya sekitar 12 label. */
function labelEveryFor(count: number): number {
  return Math.max(1, Math.ceil(count / 12));
}

/** "2025-05" -> "Mei 2025", "2025" -> "2025".
 *
 *  Date.UTC, bukan `new Date("2025-05")`: yang terakhir ditafsirkan sebagai
 *  tengah malam UTC lalu digeser ke zona waktu pembaca, dan di sebelah barat
 *  Greenwich "2025-05" berubah jadi April.
 *
 *  Bentuk yang tidak dikenali dikembalikan apa adanya -- kalau CMS suatu saat
 *  mengirim format ketiga, tooltipnya menampilkan string mentah alih-alih
 *  "Invalid Date". */
function formatPeriode(periode: string, locale: Locale): string {
  const cocok = /^(\d{4})-(\d{2})$/.exec(periode);
  if (!cocok) return periode;

  const tanggal = new Date(Date.UTC(Number(cocok[1]), Number(cocok[2]) - 1, 1));
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(tanggal);
}

/**
 * Dua grafik tab Summary: jumlah trip per periode dan per lokasi pendaratan.
 *
 * Keduanya dari SATU respons (`/ext/bsc/grafik/trip`) dan karena itu selalu
 * menjawab filter yang sama -- tidak ada keadaan di mana yang satu sudah
 * diperbarui dan yang lain belum.
 *
 * Bentuknya sengaja berbeda: periode itu deret waktu (batang tegak, urutan
 * alaminya waktu), lokasi pendaratan itu peringkat nama panjang (batang
 * mendatar, urutannya nilai). Lihat komentar di RankedBars.
 */
export function BscTripCharts({ locale }: { locale: Locale }) {
  const { chart, chartStatus, appliedSummary } = useBscFilter();

  const loading = chartStatus === 'loading';
  const failed = chartStatus === 'error';

  // Kartu tetap dirender saat gagal supaya tata letaknya tidak melompat, dan
  // supaya form filter di sebelahnya tetap punya tempat untuk "coba lagi".
  if (!chart) {
    return (
      <div className="flex flex-col gap-5">
        <ChartCard title="Number of Trips">
          <p className="text-sm leading-relaxed text-muted">
            Grafik trip gagal dimuat. Ubah filter lalu tekan Filter untuk mencoba lagi.
          </p>
        </ChartCard>
      </div>
    );
  }

  const periodeLabels = chart.perPeriode.map((row) => row.periode);
  const periodeValues = chart.perPeriode.map((row) => row.jumlahTrip);
  const total = chart.totalTrip.toLocaleString(locale);
  const satuanPeriode = chart.tipeTanggal === 'monthly' ? 'per bulan' : 'per tahun';
  /** Ringkasan filter cuma disambung kalau memang ada isinya -- tanpa ini,
   *  kepala kartu berakhir dengan pemisah menggantung saat belum ada satu pun
   *  filter dipilih. */
  const filterSuffix = appliedSummary ? ` · ${appliedSummary}` : '';

  /** Kosong bukan cuma "tidak ada baris".
   *
   *  Begitu rentang tanggal diisi, API memadatkan seluruh periode di dalamnya
   *  -- rentang yang tidak punya satu pun trip tetap datang sebagai 12 baris
   *  bernilai nol. Batang setinggi nol semuanya bukan grafik: sumbunya ikut
   *  runtuh dan yang terlihat pembaca adalah kotak kosong dengan angka aneh,
   *  bukan jawaban "tidak ada trip di sini". */
  const kosong = chart.totalTrip === 0 || periodeValues.every((value) => value === 0);

  /** Caveat sumbu-x hanya berlaku saat rentangnya TIDAK dibatasi: di sana API
   *  mengirim periode yang punya catatan saja, jadi dua batang bersebelahan
   *  bisa terpisah bertahun-tahun. */
  const catatanSumbu =
    chart.dari || chart.sampai
      ? ''
      : ' Sumbu datarnya hanya memuat periode yang PUNYA catatan -- dua batang bersebelahan tidak selalu berarti dua bulan berurutan.';

  return (
    // Angka yang sedang diganti tetap terlihat apa adanya, tidak diredupkan:
    // opacity sebagai penanda "sedang memuat" menjatuhkan SELURUH teks di
    // dalamnya di bawah ambang kontras WCAG selama beberapa detik. Keadaan
    // memuat disampaikan teks dan aria-busy saja.
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
        title="Number of Trips"
        meta={`${total} trip · ${satuanPeriode}${filterSuffix}`}
        note={`Jumlah trip pendataan per periode. Sumbu tegaknya mulai dari nol, jadi tinggi batang bisa dibandingkan apa adanya.${catatanSumbu}`}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">
            Tidak ada trip yang tercatat untuk filter ini.
          </p>
        ) : (
          <ColumnChart
            labels={periodeLabels}
            values={periodeValues}
            color="series-2"
            unit="trip"
            seriesLabel="Jumlah Trip"
            labelEvery={labelEveryFor(periodeLabels.length)}
            tooltip={(label, value) =>
              `${formatPeriode(label, locale)} · ${value.toLocaleString(locale)} trip`
            }
            height={320}
            ariaLabel={`Grafik batang jumlah trip rajungan dan kepiting ${satuanPeriode}, total ${total} trip`}
          />
        )}
      </ChartCard>

      <ChartCard
        title="Trips per Landing Site"
        meta={`${chart.perLokasi.length} lokasi${filterSuffix}`}
        note="Diurutkan dari lokasi dengan trip terbanyak. Panjang batang dibandingkan terhadap lokasi teratas, bukan terhadap total."
      >
        <RankedBars
          items={chart.perLokasi.map((row) => ({ label: row.lokasi, value: row.jumlahTrip }))}
          color="series-1"
          unit="trip"
          locale={locale}
          emptyLabel="Tidak ada lokasi pendaratan yang tercatat untuk filter ini."
        />
      </ChartCard>
    </div>
  );
}
