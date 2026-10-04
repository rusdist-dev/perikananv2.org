'use client';

import { useId } from 'react';

import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { useFisheriesTab } from '@/components/data/FisheriesDataDashboard';
import { useBscFilter } from '@/components/data/data-crab/BscFilterContext';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatNumber } from '@/lib/number';
import {
  BSC_FILTER_LEVELS,
  BSC_PERIODS,
  BSC_SEXES,
  BSC_TKG_LEVELS,
  type BscFilterLevel,
  type BscSex,
} from '@/lib/bsc-filters';

/** Label dan teks "semua" per tingkat. Bahasa Inggris mengikuti label filter
 *  yang sudah ada di dasbor ini, bukan keputusan baru -- dan seperti label
 *  lamanya, ia belum melewati kamus i18n.
 *
 *  TANPA "Fisheries Management Area": dataset BSC tidak punya tingkat WPPNRI
 *  sama sekali (bandingkan BSC_FILTER_LEVELS dengan IKAN_FILTER_LEVELS), jadi
 *  yang di sini bukan field yang disembunyikan melainkan field yang memang
 *  tidak ada.
 *
 *  Tingkat keenam diberi label "Catch Type", bukan "Family": isinya KEPITING /
 *  RAJUNGAN / "KEPITING & RAJUNGAN" -- pengelompokan tangkapan, bukan takson.
 *  Menyebutnya family berarti menjanjikan Portunidae dan memberikan sesuatu
 *  yang lain. */
/* Labelnya di kamus (i18n/dictionaries/fisheries.ts): tingkat yang sama
   dengan IKAN memakai `levels`, dua yang khas BSC memakai `crabLevels`. */

/** Tingkat mana yang tampil di tab mana.
 *
 *  Bertambah, tidak berganti: tab Length Frequency memakai seluruh tingkat tab
 *  sebelumnya ditambah jenis tangkapan dan spesies. Pilihannya pun satu,
 *  dipakai bersama -- berpindah tab tidak menghapus wilayah yang sudah dipilih.
 *
 *  Yang TIDAK tampil juga tidak ikut sebagai penyaring: lihat LEVELS_PER_TAB di
 *  BscFilterContext, yang memotong pilihannya mengikuti angka-angka ini. */
const FIELDS_PER_TAB: Record<string, number> = {
  summary: 4,
  'catch-composition': 5,
  'length-frequency': 7,
};

const FIELD_LABEL = 'text-xs font-bold uppercase tracking-wide text-muted';
const CONTROL_CLASS =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted';

/**
 * Form filter dataset BSC.
 *
 * Tidak memegang state-nya sendiri: seluruhnya tinggal di BscFilterContext,
 * karena grafik di kolom sebelah membaca pilihan yang sama. Yang jadi milik
 * komponen ini cuma cara menampilkannya.
 */
export function BscFilterPanel({ datasetName, locale }: { datasetName: string; locale: Locale }) {
  const t = getFisheriesDictionary(locale);
  const tab = useFisheriesTab();
  const baseId = useId();

  const {
    selection,
    options,
    loadingLevels,
    period,
    dateFrom,
    dateTo,
    classInterval,
    sex,
    tkg,
    rangeInvalid,
    chartStatus,
    catchStatus,
    widthStatus,
    setLevel,
    setPeriod,
    setDateFrom,
    setDateTo,
    setClassInterval,
    setSex,
    setTkg,
    apply,
    reset,
    isPending,
  } = useBscFilter();

  const visibleFields = BSC_FILTER_LEVELS.slice(
    0,
    FIELDS_PER_TAB[tab] ?? BSC_FILTER_LEVELS.length,
  ).map((level) => ({
    level,
    ...(level === 'jenisPendataan' || level === 'jenisTangkapan'
      ? t.crabLevels[level]
      : t.levels[level]),
  }));

  /** Grafik tab INI yang sedang dimuat -- bukan grafik tab mana pun. Tombol
   *  yang berbunyi "Memuat…" karena tab sebelah sedang menunggu jaringan cuma
   *  membuat orang menekannya dua kali. */
  const memuat =
    tab === 'catch-composition'
      ? catchStatus === 'loading'
      : tab === 'length-frequency'
        ? widthStatus === 'loading'
        : chartStatus === 'loading';

  /** Satuan waktu hanya berlaku untuk grafik trip. Endpoint tangkapan dan
   *  frekuensi lebar tidak mengenal `tipe_tanggal` sama sekali, jadi
   *  menampilkan pilihannya di sana berarti kontrol mati yang tetap terlihat
   *  hidup. Rentang tanggalnya tetap: yang itu dipakai ketiga endpoint. */
  const adaPeriode = tab === 'summary';

  return (
    <ChartCard title={t.filterTitle}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          apply(tab);
        }}
        className="flex flex-col gap-4"
      >
        {visibleFields.map(({ level, label, all }) => {
          const id = `${baseId}-${level}`;
          const list = options[level] ?? [];
          const isLoading = loadingLevels.has(level);
          // Kosong DAN tidak sedang memuat berarti kombinasi di atasnya memang
          // tidak punya catatan -- keadaan yang sah, dan select yang bisa
          // dibuka untuk menemukan satu pilihan kosong tidak menjelaskan apa
          // pun. Placeholder-nya yang menjelaskan.
          const isEmpty = !isLoading && list.length === 0;

          return (
            <div key={level} className="flex flex-col gap-1">
              <label htmlFor={id} className={FIELD_LABEL}>
                {label}
              </label>
              <select
                id={id}
                value={selection[level] ?? ''}
                disabled={isLoading || isEmpty}
                aria-busy={isLoading}
                onChange={(event) => setLevel(level as BscFilterLevel, event.target.value)}
                className={CONTROL_CLASS}
              >
                <option value="">
                  {isLoading ? t.loadingOptions : isEmpty ? t.noOption : all}
                </option>
                {/* Nilainya saja. `jumlahTrip` ikut datang dari API dan tetap
                    ada di datanya, tapi tidak dicetak di sini: yang dijawab
                    dropdown ini "wilayah/alat/spesies mana", bukan "berapa
                    banyak". */}
                {list.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {/* --- Period ---
            Radio, bukan select: dua pilihan yang saling meniadakan, keduanya
            muat di satu baris, dan yang sedang aktif terbaca tanpa harus
            dibuka dulu.

            `hidden`, bukan dilepas dari pohon, supaya pilihan yang sudah dibuat
            tidak hilang saat pembaca mampir ke tab lain lalu kembali. */}
        <fieldset className={`flex flex-col gap-1 ${adaPeriode ? '' : 'hidden'}`}>
          <legend className={FIELD_LABEL}>{t.period}</legend>
          <div className="mt-1 flex gap-4">
            {BSC_PERIODS.map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name={`${baseId}-period`}
                  value={value}
                  checked={period === value}
                  onChange={() => setPeriod(value)}
                />
                {value === 'monthly' ? t.monthly : t.yearly}
              </label>
            ))}
          </div>
        </fieldset>

        {/* --- Rentang tanggal ---
            Dua input date, bukan satu kolom teks: pemilih tanggal bawaan
            peramban sudah mengerti format lokal, kalender, dan papan ketik.

            Keduanya boleh kosong dan artinya "tidak dibatasi", satu sisi saja
            pun sah: "sejak 1 Januari" adalah pertanyaan yang masuk akal. */}
        <fieldset className="flex flex-col gap-1">
          <legend className={FIELD_LABEL}>{t.dateRange}</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${baseId}-date-from`} className="text-xs text-muted">
                {t.dateFrom}
              </label>
              <input
                id={`${baseId}-date-from`}
                type="date"
                value={dateFrom}
                // max/min saling mengunci: kalender sisi satunya langsung
                // menutup tanggal yang akan membuat rentangnya terbalik, jadi
                // pesan galat di bawah cuma jaring pengaman untuk yang
                // mengetik langsung.
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
                className={CONTROL_CLASS}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${baseId}-date-to`} className="text-xs text-muted">
                {t.dateTo}
              </label>
              <input
                id={`${baseId}-date-to`}
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
                className={CONTROL_CLASS}
              />
            </div>
          </div>
          {rangeInvalid ? (
            // role="alert" supaya pembaca layar mendengar koreksinya saat
            // muncul, bukan baru saat pengguna kebetulan melewatinya.
            <p role="alert" className="mt-1 text-xs font-bold text-(--color-series-6)">
              {t.rangeInvalid}
            </p>
          ) : null}
        </fieldset>

        {tab === 'length-frequency' ? (
          <>
            {/* --- Jenis kelamin ---
                Bukan penyaring gaya-gayaan: rajungan betina dan jantan matang
                pada lebar yang berbeda, jadi Lm gabungan keduanya adalah
                rata-rata dua sebaran yang tidak seharusnya dirata-ratakan.
                "Semua" ada karena itu yang dilakukan API saat parameternya
                dikosongkan -- pilihan yang sah, dan kartu grafiknya
                menjelaskan konsekuensinya. */}
            <fieldset className="flex flex-col gap-1">
              <legend className={FIELD_LABEL}>{t.sex}</legend>
              <div className="mt-1 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-fg">
                  <input
                    type="radio"
                    name={`${baseId}-sex`}
                    checked={sex === null}
                    onChange={() => setSex(null)}
                  />
                  {t.sexAll}
                </label>
                {BSC_SEXES.map((value: BscSex) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-fg">
                    <input
                      type="radio"
                      name={`${baseId}-sex`}
                      value={value}
                      checked={sex === value}
                      onChange={() => setSex(value)}
                    />
                    {t.sexValues[value] ?? value}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* --- Ambang TKG ---
                Angka yang mengubah HASIL, bukan tampilan: API memakainya untuk
                menghitung persen matang DAN untuk menginterpolasi Lm (lebar
                saat 50% individu mencapai TKG >= ambang ini). Menaikkannya
                menggeser Lm ke kanan. */}
            <fieldset className="flex flex-col gap-1">
              <legend className={FIELD_LABEL}>{t.tkgThreshold}</legend>
              <div className="mt-1 flex flex-wrap gap-4">
                {BSC_TKG_LEVELS.map((value) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-fg">
                    <input
                      type="radio"
                      name={`${baseId}-tkg`}
                      value={value}
                      checked={tkg === value}
                      onChange={() => setTkg(value)}
                    />
                    TKG ≥ {formatNumber(value, locale)}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${baseId}-class-interval`} className={FIELD_LABEL}>
                {t.classInterval}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={`${baseId}-class-interval`}
                  type="range"
                  min={1}
                  max={10}
                  value={classInterval}
                  onChange={(event) => setClassInterval(Number(event.target.value))}
                  className="w-full"
                />
                <span className="shrink-0 font-mono text-sm whitespace-nowrap text-muted">
                  {formatNumber(classInterval, locale)} cm
                </span>
              </div>
            </div>
          </>
        ) : null}

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={rangeInvalid || isPending}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {memuat ? t.loadingButton : tab === 'length-frequency' ? t.generate : t.filter}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted hover:text-primary"
          >
            {t.reset}
          </button>
        </div>

        {/* aria-live supaya hasil penekanan tombol juga TERDENGAR: grafiknya
            berubah di kolom sebelah, jauh dari fokus yang masih di tombol. */}
        <p aria-live="polite" className="text-xs leading-relaxed text-muted">
          {t.filterHelpDataset(tab === 'length-frequency' ? t.generate : t.filter, datasetName)}
        </p>
      </form>
    </ChartCard>
  );
}
