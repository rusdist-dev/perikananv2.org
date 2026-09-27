'use client';

import { useRef, useState, useTransition } from 'react';

import { fetchStscArmadaChart } from '@/app/[locale]/data/vessel-data/actions';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { StscFilterPanel } from '@/components/data/stsc/StscFilterPanel';
import { WppLineChart, type WppSeries } from '@/components/data/stsc/WppLineChart';
import type { Locale } from '@/i18n/config';
import type { StscArmadaChart } from '@/lib/content';
import type { StscSeries, StscWppOption } from '@/lib/stsc-filters';

type ChartStatus = 'ready' | 'loading' | 'error';

/** Deret API -> deret grafik, disejajarkan ke sumbu-x BERSAMA.
 *
 *  Titik dipetakan lewat tahunnya, bukan lewat urutan indeksnya: kalau satu
 *  WPP kehilangan satu tahun di tengah, penyejajaran per indeks akan menggeser
 *  seluruh sisa garisnya ke kiri -- pergeseran yang tidak terlihat seperti
 *  kesalahan, cuma seperti tren yang berbeda.
 *
 *  Tahun yang tidak punya titik jadi null, dan WppLineChart MEMUTUS garisnya
 *  di sana alih-alih menariknya ke nol. */
function toSeries(raw: StscSeries[], years: number[]): WppSeries[] {
  return raw.map((series) => {
    const byYear = new Map(series.titik.map((point) => [point.tahun, point.nilai]));
    return {
      wpp: series.wpp,
      nilai: years.map((year) => byYear.get(year) ?? null),
    };
  });
}

/**
 * Pemilik keadaan filter `/data/vessel-data`.
 *
 * Merender kedua kolom sendiri -- form filter dan grafiknya -- pola yang sama
 * dengan HiupariExplorer, dan alasannya sama: halaman ini tidak punya kerangka
 * tab yang memisahkan keduanya ke slot berbeda, jadi satu induk bersama sudah
 * cukup dan context cuma akan menyembunyikan aliran datanya.
 *
 * DUA kartu grafik, bukan satu kartu dua sumbu: jumlah armada (unit) dan total
 * tonase (GT) punya satuan yang berbeda arti, dan dengan sebelas WPP satu
 * kartu berarti 22 garis di satu bingkai.
 */
export function VesselExplorer({
  wppOptions,
  initialChart,
  yearMin,
  yearMax,
  locale,
}: {
  wppOptions: StscWppOption[];
  initialChart: StscArmadaChart | null;
  yearMin: number;
  yearMax: number;
  locale: Locale;
}) {
  const [wpp, setWpp] = useState('');
  const [yearFrom, setYearFrom] = useState(yearMin);
  const [yearTo, setYearTo] = useState(yearMax);

  const [chart, setChart] = useState<StscArmadaChart | null>(initialChart);
  const [status, setStatus] = useState<ChartStatus>(initialChart ? 'ready' : 'error');
  const [appliedSummary, setAppliedSummary] = useState('');
  const [isPending, startTransition] = useTransition();

  /** Nomor urut permintaan terakhir. Dua penekanan tombol beruntun berarti dua
   *  panggilan yang berjalan bersamaan, dan yang lebih tua bisa tiba
   *  belakangan -- tanpa penjaga ini grafiknya bisa berakhir menampilkan hasil
   *  untuk filter yang sudah tidak berlaku. */
  const ticket = useRef(0);

  /** Rentang yang tidak mungkin dijawab API. Dihitung sekali di sini: form
   *  memakainya untuk mematikan tombol, apply() untuk menolak permintaan yang
   *  sudah pasti dialihkan CMS. */
  const rangeInvalid =
    !Number.isInteger(yearFrom) ||
    !Number.isInteger(yearTo) ||
    yearFrom > yearTo ||
    yearFrom < yearMin ||
    yearTo > yearMax;

  const apply = () => {
    if (rangeInvalid) return;

    const current = (ticket.current += 1);
    setStatus('loading');

    startTransition(async () => {
      const fresh = await fetchStscArmadaChart({
        wpp: wpp || null,
        dariTahun: yearFrom,
        sampaiTahun: yearTo,
      });
      if (current !== ticket.current) return;

      // Grafik lama DIPERTAHANKAN saat gagal, tidak dikosongkan: kartu yang
      // tiba-tiba kosong terbaca sebagai "tidak ada kapal" -- jawaban yang
      // berbeda jauh dari "permintaannya gagal".
      if (!fresh) {
        setStatus('error');
        return;
      }

      setChart(fresh);
      setStatus('ready');
      setAppliedSummary(
        `${wpp ? `FMA-RI ${wpp}` : 'seluruh WPP'} · ${yearFrom}–${yearTo}`,
      );
    });
  };

  const reset = () => {
    // Tiket dinaikkan juga di sini: kalau sebuah permintaan masih di jalan saat
    // form direset, hasilnya tidak boleh mendarat di form yang sudah bersih.
    ticket.current += 1;

    setWpp('');
    setYearFrom(yearMin);
    setYearTo(yearMax);

    setChart(initialChart);
    setStatus(initialChart ? 'ready' : 'error');
    setAppliedSummary('');
  };

  const loading = status === 'loading';
  const failed = status === 'error';
  const years = chart?.tahun ?? [];
  const suffix = appliedSummary ? ` · ${appliedSummary}` : '';

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[20rem_1fr] lg:items-start">
      <StscFilterPanel
        title="Vessel Data"
        wppOptions={wppOptions}
        selectedWpp={wpp}
        yearFrom={yearFrom}
        yearTo={yearTo}
        yearMin={yearMin}
        yearMax={yearMax}
        rangeInvalid={rangeInvalid}
        loading={loading}
        isPending={isPending}
        onWppChange={setWpp}
        onYearFromChange={setYearFrom}
        onYearToChange={setYearTo}
        onSubmit={apply}
        onReset={reset}
      />

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

        {!chart ? (
          <ChartCard title="Number of Vessels">
            <p className="text-sm leading-relaxed text-muted">
              Grafik armada gagal dimuat. Ubah filter lalu tekan Show Chart untuk mencoba lagi.
            </p>
          </ChartCard>
        ) : (
          <>
            <ChartCard
              title="Number of Vessels"
              meta={`${chart.armada.length} WPP · ${chart.unitArmada}${suffix}`}
              note={`Jumlah armada penangkapan per tahun di tiap WPP-RI. Sumbu tegaknya mulai dari nol, jadi tinggi garis bisa dibandingkan apa adanya. Tahun tanpa catatan membuat garisnya TERPUTUS, bukan turun ke nol.`}
            >
              <WppLineChart
                years={years}
                series={toSeries(chart.armada, years)}
                unit={chart.unitArmada}
                ariaLabel={`Grafik garis jumlah armada per tahun untuk ${chart.armada.length} WPP-RI, ${years[0]} sampai ${years[years.length - 1]}`}
              />
            </ChartCard>

            <ChartCard
              title="Total Vessel Tonnage"
              meta={`${chart.gt.length} WPP · ${chart.unitGt}${suffix}`}
              note={`Total tonase kotor armada per tahun di tiap WPP-RI. Dipisah dari kartu di atas karena satuannya berbeda arti: ${chart.unitGt} mengukur kapasitas, ${chart.unitArmada} mengukur cacah kapal -- dan menumpuk keduanya di satu sumbu membuat kenaikan yang satu terlihat seperti kenaikan yang lain.`}
            >
              <WppLineChart
                years={years}
                series={toSeries(chart.gt, years)}
                unit={chart.unitGt}
                ariaLabel={`Grafik garis total tonase armada per tahun untuk ${chart.gt.length} WPP-RI, ${years[0]} sampai ${years[years.length - 1]}`}
              />
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
}
