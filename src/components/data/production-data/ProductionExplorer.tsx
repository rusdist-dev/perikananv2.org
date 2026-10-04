'use client';

import { useRef, useState, useTransition } from 'react';

import {
  fetchStscKomoditasOptions,
  fetchStscProduksiChart,
} from '@/app/[locale]/data/production-data/actions';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { StscFilterPanel } from '@/components/data/stsc/StscFilterPanel';
import { WppLineChart, type WppSeries } from '@/components/data/stsc/WppLineChart';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatNumber } from '@/lib/number';
import type { StscProduksiChart } from '@/lib/content';
import type { StscKomoditasOption, StscSeries, StscWppOption } from '@/lib/stsc-filters';

type ChartStatus = 'ready' | 'loading' | 'error';

const FIELD_LABEL = 'text-xs font-bold uppercase tracking-wide text-muted';
const CONTROL_CLASS =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted';

/** Deret API -> deret grafik, disejajarkan ke sumbu-x BERSAMA.
 *
 *  Titik dipetakan lewat tahunnya, bukan lewat urutan indeksnya: kalau satu
 *  WPP kehilangan satu tahun di tengah, penyejajaran per indeks akan menggeser
 *  seluruh sisa garisnya ke kiri -- pergeseran yang tidak terlihat seperti
 *  kesalahan, cuma seperti tren yang berbeda. */
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
 * Pemilik keadaan filter `/data/production-data`.
 *
 * SATU KARTU GRAFIK PER KOMODITAS -- itu bentuk yang diminta, dan juga bentuk
 * yang dikirim API: responsnya membawa `komoditas` sebagai DAFTAR kelompok,
 * masing-masing dengan deret per WPP-nya sendiri. Tanpa penyaring komoditas,
 * yang datang sebelas kelompok, jadi halaman menggambar sebelas kartu.
 *
 * Alternatifnya -- satu bingkai berisi semuanya -- berarti 121 garis (11
 * komoditas x 11 WPP) yang satuannya memang sama (ton) tapi besarannya tidak
 * sebanding: Ikan Demersal 234.707 ton akan memampatkan Lobster di dasar
 * grafik jadi garis lurus di sumbu nol.
 */
export function ProductionExplorer({
  title,
  wppOptions,
  initialKomoditasOptions,
  initialChart,
  yearMin,
  yearMax,
  locale,
}: {
  /** Judul kartu filter dan kartu keadaan gagal/kosong -- nama halamannya. */
  title: string;
  wppOptions: StscWppOption[];
  initialKomoditasOptions: StscKomoditasOption[];
  initialChart: StscProduksiChart | null;
  yearMin: number;
  yearMax: number;
  locale: Locale;
}) {
  const t = getFisheriesDictionary(locale);
  const [wpp, setWpp] = useState('');
  const [komoditas, setKomoditas] = useState('');
  const [komoditasOptions, setKomoditasOptions] =
    useState<StscKomoditasOption[]>(initialKomoditasOptions);
  const [yearFrom, setYearFrom] = useState(yearMin);
  const [yearTo, setYearTo] = useState(yearMax);

  const [chart, setChart] = useState<StscProduksiChart | null>(initialChart);
  const [status, setStatus] = useState<ChartStatus>(initialChart ? 'ready' : 'error');
  const [appliedSummary, setAppliedSummary] = useState('');
  const [isPending, startTransition] = useTransition();

  const optionsTicket = useRef(0);
  const chartTicket = useRef(0);

  const rangeInvalid =
    !Number.isInteger(yearFrom) ||
    !Number.isInteger(yearTo) ||
    yearFrom > yearTo ||
    yearFrom < yearMin ||
    yearTo > yearMax;

  /** Mengganti WPP meminta ulang daftar komoditas -- tapi TIDAK membatalkan
   *  komoditas yang sudah dipilih, berbeda dari rantai provinsi -> kabupaten di
   *  halaman IKAN.
   *
   *  Bedanya ada di datanya: `/opsi/komoditas?wpp=712` mengembalikan kesebelas
   *  komoditas yang sama, cuma dengan `jumlahWpp` yang berubah dari 11 jadi 1.
   *  Yang disaring cacahnya, bukan daftarnya, jadi pilihan yang sudah dibuat
   *  tetap sah -- dan mengosongkannya cuma akan membuang pekerjaan pembaca. */
  const changeWpp = (value: string) => {
    setWpp(value);

    const current = (optionsTicket.current += 1);
    startTransition(async () => {
      const fresh = await fetchStscKomoditasOptions(value || null);
      if (current !== optionsTicket.current) return;
      setKomoditasOptions(fresh);
    });
  };

  const apply = () => {
    if (rangeInvalid) return;

    const current = (chartTicket.current += 1);
    setStatus('loading');

    startTransition(async () => {
      const fresh = await fetchStscProduksiChart({
        wpp: wpp || null,
        komoditas: komoditas || null,
        dariTahun: yearFrom,
        sampaiTahun: yearTo,
      });
      if (current !== chartTicket.current) return;

      // Grafik lama DIPERTAHANKAN saat gagal, tidak dikosongkan: kartu yang
      // tiba-tiba kosong terbaca sebagai "tidak ada produksi" -- jawaban yang
      // berbeda jauh dari "permintaannya gagal".
      if (!fresh) {
        setStatus('error');
        return;
      }

      setChart(fresh);
      setStatus('ready');
      setAppliedSummary(
        t.stscSummary(wpp ? t.fmaCode(wpp) : t.allFmaSummary, String(yearFrom), String(yearTo)),
      );
    });
  };

  const reset = () => {
    optionsTicket.current += 1;
    chartTicket.current += 1;

    setWpp('');
    setKomoditas('');
    setKomoditasOptions(initialKomoditasOptions);
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
  const komoditasEmpty = komoditasOptions.length === 0;

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[20rem_1fr] lg:items-start">
      <StscFilterPanel
        title={title}
        locale={locale}
        wppOptions={wppOptions}
        selectedWpp={wpp}
        yearFrom={yearFrom}
        yearTo={yearTo}
        yearMin={yearMin}
        yearMax={yearMax}
        rangeInvalid={rangeInvalid}
        loading={loading}
        isPending={isPending}
        onWppChange={changeWpp}
        onYearFromChange={setYearFrom}
        onYearToChange={setYearTo}
        onSubmit={apply}
        onReset={reset}
      >
        {/* Field khas halaman ini, dioper sebagai children ke form bersama --
            Vessel Data tidak punya komoditas sama sekali. */}
        <div className="flex flex-col gap-1">
          <label htmlFor="production-komoditas" className={FIELD_LABEL}>
            {t.commodity}
          </label>
          <select
            id="production-komoditas"
            value={komoditas}
            disabled={komoditasEmpty}
            onChange={(event) => setKomoditas(event.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="">
              {komoditasEmpty ? t.commodityUnavailable : t.allCommodities}
            </option>
            {komoditasOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
          <p className="text-xs leading-relaxed text-muted">{t.commodityHint}</p>
        </div>
      </StscFilterPanel>

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

        {!chart ? (
          <ChartCard title={title}>
            <p className="text-sm leading-relaxed text-muted">
              {t.productionLoadFailed(t.showChart)}
            </p>
          </ChartCard>
        ) : chart.komoditas.length === 0 ? (
          <ChartCard title={title}>
            <p className="text-sm leading-relaxed text-muted">{t.productionEmpty}</p>
          </ChartCard>
        ) : (
          <>
            {/* Totalan di atas, sekali -- bukan diulang di tiap kartu:
                pertanyaan "berapa seluruhnya" ditanyakan sekali, sementara
                tiap kartu di bawah menjawab "bagaimana bentuknya per
                komoditas". */}
            <p className="text-xs leading-relaxed text-muted">
              {t.productionTotal(
                formatNumber(chart.totalProduksi, locale, { maximumFractionDigits: 0 }),
                chart.unit,
                formatNumber(chart.komoditas.length, locale),
              )}
              {suffix}
              {t.productionTotalRest}
            </p>

            {chart.komoditas.map((group) => (
              <ChartCard
                key={group.komoditas}
                title={group.komoditas}
                meta={`${t.productionMeta(
                  formatNumber(group.totalProduksi, locale, { maximumFractionDigits: 0 }),
                  chart.unit,
                  formatNumber(group.seri.length, locale),
                )}${suffix}`}
                note={t.productionCardNote(group.komoditas)}
              >
                <WppLineChart
                  years={years}
                  series={toSeries(group.seri, years)}
                  unit={chart.unit}
                  height={260}
                  locale={locale}
                  ariaLabel={t.productionAria(
                    group.komoditas,
                    formatNumber(group.seri.length, locale),
                    String(years[0]),
                    String(years[years.length - 1]),
                  )}
                />
              </ChartCard>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
