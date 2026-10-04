'use client';

import { ColumnChart } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { RankedBars } from '@/components/data/RankedBars';
import { useIkanFilter } from '@/components/data/ikan/IkanFilterContext';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatNumber } from '@/lib/number';

/** Berapa label sumbu-x yang dicetak, dihitung dari jumlah batangnya.
 *
 *  Angka tetap tidak bisa dipakai: rentang penuh bulanan hari ini 59 batang,
 *  sementara "2024 saja" cuma 12, dan `labelEvery` yang sama membuat yang
 *  pertama jadi pita hitam atau yang kedua kehilangan sembilan labelnya.
 *  Sasarannya sekitar 12 label -- cukup untuk menandai sumbu, tidak cukup
 *  untuk saling menindih. */
function labelEveryFor(count: number): number {
  return Math.max(1, Math.ceil(count / 12));
}

/** "2025-05" -> "Mei 2025", "2025" -> "2025".
 *
 *  Label sumbu tetap ringkas (59 label "Mei 2025" tidak muat di mana pun);
 *  yang dieja panjang hanya tooltipnya, tempat ruangnya memang ada dan
 *  pembacanya sedang menanyakan satu batang tertentu.
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
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(tanggal);
}

/**
 * Dua grafik tab Summary: jumlah trip per periode dan per lokasi pendaratan.
 *
 * Keduanya dari SATU respons (`/ext/ikan/grafik/trip`) dan karena itu selalu
 * menjawab filter yang sama -- tidak ada keadaan di mana yang satu sudah
 * diperbarui dan yang lain belum.
 *
 * Bentuknya sengaja berbeda: periode itu deret waktu (batang tegak, urutan
 * alaminya waktu), lokasi pendaratan itu peringkat 41 nama panjang (batang
 * mendatar, urutannya nilai). Lihat komentar di RankedBars.
 */
export function IkanTripCharts({ locale }: { locale: Locale }) {
  const t = getFisheriesDictionary(locale);
  const { chart, chartStatus, appliedSummary } = useIkanFilter();

  const loading = chartStatus === 'loading';
  const failed = chartStatus === 'error';

  // Kartu tetap dirender saat gagal supaya tata letaknya tidak melompat, dan
  // supaya form filter di sebelahnya tetap punya tempat untuk "coba lagi".
  if (!chart) {
    return (
      <div className="flex flex-col gap-5">
        <ChartCard title={t.tripsTitle}>
          <p className="text-sm leading-relaxed text-muted">{t.tripsLoadFailed}</p>
        </ChartCard>
      </div>
    );
  }

  const periodeLabels = chart.perPeriode.map((row) => row.periode);
  const periodeValues = chart.perPeriode.map((row) => row.jumlahTrip);
  const total = formatNumber(chart.totalTrip, locale);
  const satuanPeriode = chart.tipeTanggal === 'monthly' ? t.perMonth : t.perYear;
  /** Ringkasan filter cuma disambung kalau memang ada isinya -- tanpa ini,
   *  kepala kartu berakhir dengan pemisah menggantung saat belum ada satu pun
   *  filter dipilih. */
  const filterSuffix = appliedSummary ? ` · ${appliedSummary}` : '';

  /** Kosong bukan cuma "tidak ada baris".
   *
   *  Begitu rentang tanggal diisi, API memadatkan seluruh periode di dalamnya
   *  -- rentang 1999 yang tidak punya satu pun trip tetap datang sebagai 12
   *  baris bernilai nol. Batang setinggi nol semuanya bukan grafik: sumbunya
   *  ikut runtuh (niceDomain(0, 0) menghasilkan -0,5 sampai 0,5) dan yang
   *  terlihat pembaca adalah kotak kosong dengan angka aneh, bukan jawaban
   *  "tidak ada trip di sini". */
  const kosong = chart.totalTrip === 0 || periodeValues.every((value) => value === 0);

  /** Caveat sumbu-x hanya berlaku saat rentangnya TIDAK dibatasi: di sana API
   *  mengirim periode yang punya catatan saja, jadi dua batang bersebelahan
   *  bisa terpisah bertahun-tahun. Dengan rentang tanggal, periode kosongnya
   *  ikut dikirim dan sumbunya rapat. */
  const catatanSumbu = chart.dari || chart.sampai ? '' : t.tripsAxisNote;

  return (
    // Angka yang sedang diganti tetap terlihat apa adanya, tidak diredupkan.
    // Versi pertama memakai opacity-60 sebagai penanda "sedang memuat", dan
    // axe menangkap akibatnya: SELURUH teks di dalamnya -- judul, angka sumbu,
    // nama lokasi -- jatuh di bawah ambang kontras WCAG selama beberapa detik.
    // Keadaan memuat disampaikan teks dan aria-busy saja.
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
        title={t.tripsTitle}
        meta={`${t.tripsMeta(total, satuanPeriode)}${filterSuffix}`}
        note={`${t.tripsNote}${catatanSumbu}`}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">{t.tripsEmpty}</p>
        ) : (
          <ColumnChart
            labels={periodeLabels}
            values={periodeValues}
            color="series-2"
            unit={t.tripUnit}
            seriesLabel={t.tripsSeries}
            locale={locale}
            labelEvery={labelEveryFor(periodeLabels.length)}
            tooltip={(label, value) =>
              t.tripsTooltip(formatPeriode(label, locale), formatNumber(value, locale))
            }
            height={320}
            ariaLabel={t.tripsAria(satuanPeriode, total)}
          />
        )}
      </ChartCard>

      <ChartCard
        title={t.landingTitle}
        meta={`${t.landingMeta(formatNumber(chart.perLokasi.length, locale))}${filterSuffix}`}
        note={t.landingNote}
      >
        <RankedBars
          items={chart.perLokasi.map((row) => ({ label: row.lokasi, value: row.jumlahTrip }))}
          color="series-1"
          unit={t.tripUnit}
          locale={locale}
          emptyLabel={t.landingEmpty}
        />
      </ChartCard>
    </div>
  );
}
