'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';

import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import type { StscWppOption } from '@/lib/stsc-filters';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';

const FIELD_LABEL = 'text-xs font-bold uppercase tracking-wide text-muted';
const CONTROL_CLASS =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted';

/**
 * Form filter bersama `/data/production-data` dan `/data/vessel-data`.
 *
 * Keduanya menyaring dengan WPP dan rentang tahun yang sama persis, dari
 * endpoint opsi yang sama. Yang berbeda cuma SATU field -- dropdown komoditas
 * yang hanya dimiliki halaman produksi -- dan itu dioper sebagai `children`
 * alih-alih dibuatkan dua salinan form.
 *
 * Kolom tahunnya `type="number"`, bukan dua dropdown 32 entri: yang diisi
 * angka empat digit, dan pemilih tahun bawaan peramban sudah mengerti papan
 * ketik, tombol naik-turun, dan batas min/max.
 */
export function StscFilterPanel({
  title,
  wppOptions,
  selectedWpp,
  yearFrom,
  yearTo,
  yearMin,
  yearMax,
  rangeInvalid,
  loading,
  isPending,
  onWppChange,
  onYearFromChange,
  onYearToChange,
  onSubmit,
  onReset,
  children,
  locale,
}: {
  title: string;
  wppOptions: StscWppOption[];
  selectedWpp: string;
  yearFrom: number;
  yearTo: number;
  /** Batas yang BENAR-BENAR dimiliki data, dari `/opsi/wpp` -- bukan angka
   *  tetap di frontend. API menolak (dengan pengalihan, bukan 422) tahun di
   *  luar rentangnya, jadi batas yang salah berarti form yang menawarkan
   *  kegagalan. */
  yearMin: number;
  yearMax: number;
  rangeInvalid: boolean;
  loading: boolean;
  isPending: boolean;
  onWppChange: (value: string) => void;
  onYearFromChange: (value: number) => void;
  onYearToChange: (value: number) => void;
  onSubmit: () => void;
  onReset: () => void;
  /** Field tambahan khas halaman ini -- dropdown komoditas di Production Data,
   *  tidak ada di Vessel Data. */
  children?: ReactNode;
  locale: Locale;
}) {
  const t = getFisheriesDictionary(locale);
  const baseId = useId();
  const wppEmpty = wppOptions.length === 0;

  return (
    <ChartCard title={title}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor={`${baseId}-wpp`} className={FIELD_LABEL}>
            {t.levels.wppnri.label}
          </label>
          <select
            id={`${baseId}-wpp`}
            value={selectedWpp}
            disabled={wppEmpty}
            onChange={(event) => onWppChange(event.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="">
              {wppEmpty ? t.fmaUnavailable : t.allFma}
            </option>
            {wppOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t.fmaCode(option.value)}
              </option>
            ))}
          </select>
        </div>

        {children}

        {/* --- Rentang tahun ---
            Dua kolom, bukan satu: "sejak 2010" dan "sampai 2015" adalah dua
            pertanyaan berbeda, dan keduanya sah diisi sendiri-sendiri.
            min/max saling mengunci supaya rentang terbalik sulit dibuat lewat
            tombol naik-turun; pesan galat di bawah jaring pengaman untuk yang
            mengetik langsung. */}
        <fieldset className="flex flex-col gap-1">
          <legend className={FIELD_LABEL}>{t.yearRange}</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${baseId}-year-from`} className="text-xs text-muted">
                {t.dateFrom}
              </label>
              <input
                id={`${baseId}-year-from`}
                type="number"
                inputMode="numeric"
                min={yearMin}
                max={yearTo}
                step={1}
                value={yearFrom}
                onChange={(event) => onYearFromChange(Number(event.target.value))}
                className={CONTROL_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${baseId}-year-to`} className="text-xs text-muted">
                {t.dateTo}
              </label>
              <input
                id={`${baseId}-year-to`}
                type="number"
                inputMode="numeric"
                min={yearFrom}
                max={yearMax}
                step={1}
                value={yearTo}
                onChange={(event) => onYearToChange(Number(event.target.value))}
                className={CONTROL_CLASS}
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-muted">
            {t.yearsAvailable(String(yearMin), String(yearMax))}
          </p>
          {rangeInvalid ? (
            // role="alert" supaya pembaca layar mendengar koreksinya saat
            // muncul, bukan baru saat pengguna kebetulan melewatinya.
            <p role="alert" className="mt-1 text-xs font-bold text-(--color-series-6)">
              {t.yearRangeInvalid(String(yearMin), String(yearMax))}
            </p>
          ) : null}
        </fieldset>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={rangeInvalid || isPending}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t.loadingButton : t.showChart}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted hover:text-primary"
          >
            {t.reset}
          </button>
        </div>

        {/* aria-live supaya hasil penekanan tombol juga TERDENGAR: grafiknya
            berubah di kolom sebelah, jauh dari fokus yang masih di tombol. */}
        <p aria-live="polite" className="text-xs leading-relaxed text-muted">
          {t.chartHelp(t.showChart)}
        </p>
      </form>
    </ChartCard>
  );
}
