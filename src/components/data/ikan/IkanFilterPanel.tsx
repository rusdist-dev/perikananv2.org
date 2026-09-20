'use client';

import { useId } from 'react';

import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { useFisheriesTab } from '@/components/data/FisheriesDataDashboard';
import { useIkanFilter } from '@/components/data/ikan/IkanFilterContext';
import {
  IKAN_LENGTH_TYPES,
  IKAN_PERIODS,
  type IkanFilterLevel,
  type IkanLengthType,
} from '@/lib/ikan-filters';

/** Label dan teks "semua" per tingkat. Bahasa Inggris mengikuti label filter
 *  yang sudah ada di dasbor ini, bukan keputusan baru -- dan seperti label
 *  lamanya, ia belum melewati kamus i18n. */
const FIELDS: { level: IkanFilterLevel; label: string; all: string }[] = [
  { level: 'wppnri', label: 'Fisheries Management Area', all: 'All management areas' },
  { level: 'provinsi', label: 'Province', all: 'All provinces' },
  { level: 'kabupaten', label: 'Regency/City', all: 'All regencies' },
  { level: 'lokasiPendaratan', label: 'Landing Site', all: 'All landing sites' },
  { level: 'jenisData', label: 'Grouping Data', all: 'All data types' },
  { level: 'alatTangkap', label: 'Fishing Gears', all: 'All fishing gears' },
  { level: 'family', label: 'Family', all: 'All families' },
  { level: 'spesies', label: 'Species', all: 'All species' },
];

/** Tingkat mana yang tampil di tab mana.
 *
 *  Bertambah, tidak berganti: tab Length Frequency memakai seluruh tingkat tab
 *  sebelumnya ditambah family dan spesies. Pilihannya pun satu, dipakai
 *  bersama -- berpindah tab tidak menghapus wilayah yang sudah dipilih, dan
 *  tingkat yang sedang tersembunyi tetap ikut sebagai penyaring (ia memang
 *  bagian dari pertanyaan yang sama). */
const FIELDS_PER_TAB: Record<string, number> = {
  summary: 5,
  'catch-composition': 6,
  'length-frequency': 8,
};

const FIELD_LABEL = 'text-xs font-bold uppercase tracking-wide text-muted';
const CONTROL_CLASS =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted';

/**
 * Form filter dataset IKAN.
 *
 * Tidak memegang state-nya sendiri: seluruhnya tinggal di IkanFilterContext,
 * karena grafik di kolom sebelah membaca pilihan yang sama. Yang jadi milik
 * komponen ini cuma cara menampilkannya.
 */
export function IkanFilterPanel({ datasetName }: { datasetName: string }) {
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
    lengthType,
    lm,
    rangeInvalid,
    chartStatus,
    catchStatus,
    lengthStatus,
    setLevel,
    setPeriod,
    setDateFrom,
    setDateTo,
    setClassInterval,
    setLengthType,
    setLm,
    apply,
    reset,
    isPending,
  } = useIkanFilter();

  const visibleFields = FIELDS.slice(0, FIELDS_PER_TAB[tab] ?? FIELDS.length);

  /** Grafik tab INI yang sedang dimuat -- bukan grafik tab mana pun. Tombol
   *  yang berbunyi "Memuat…" karena tab sebelah sedang menunggu jaringan cuma
   *  membuat orang menekannya dua kali. */
  const memuat =
    tab === 'catch-composition'
      ? catchStatus === 'loading'
      : tab === 'length-frequency'
        ? lengthStatus === 'loading'
        : chartStatus === 'loading';

  /** Satuan waktu hanya berlaku untuk grafik trip. Endpoint tangkapan tidak
   *  mengenal `tipe_tanggal` sama sekali, jadi menampilkan pilihannya di sana
   *  berarti tombol yang tidak mengubah apa pun -- kontrol mati yang tetap
   *  terlihat hidup. Rentang tanggalnya tetap: yang itu memang dipakai kedua
   *  endpoint. */
  const adaPeriode = tab === 'summary';

  return (
    <ChartCard title="Filter">
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
                onChange={(event) => setLevel(level as IkanFilterLevel, event.target.value)}
                className={CONTROL_CLASS}
              >
                <option value="">
                  {isLoading ? 'Memuat pilihan…' : isEmpty ? 'No option for this combination' : all}
                </option>
                {/* Nilainya saja. `jumlahTrip` ikut datang dari API dan tetap
                    ada di datanya, tapi tidak dicetak di sini: yang dijawab
                    dropdown ini "wilayah/alat/spesies mana", bukan "berapa
                    banyak" -- dan angka di tiap baris membuat nama yang
                    sesungguhnya dicari jadi lebih sulit disapu mata. */}
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
            muat di satu baris, dan yang sedang aktif terbaca tanpa harus dibuka
            dulu. */}
        <fieldset className={`flex flex-col gap-1 ${adaPeriode ? '' : 'hidden'}`}>
          <legend className={FIELD_LABEL}>Period</legend>
          <div className="mt-1 flex gap-4">
            {IKAN_PERIODS.map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name={`${baseId}-period`}
                  value={value}
                  checked={period === value}
                  onChange={() => setPeriod(value)}
                />
                {value === 'monthly' ? 'Monthly' : 'Yearly'}
              </label>
            ))}
          </div>
        </fieldset>

        {/* --- Rentang tanggal ---
            Dua input date, bukan satu kolom teks: pemilih tanggal bawaan
            peramban sudah mengerti format lokal, kalender, dan papan ketik --
            tiga hal yang harus ditulis ulang (dan biasanya lebih buruk) kalau
            kolomnya dibuat sendiri.

            Keduanya boleh kosong dan artinya "tidak dibatasi", satu sisi saja
            pun sah: "sejak 1 Januari" adalah pertanyaan yang masuk akal. */}
        <fieldset className="flex flex-col gap-1">
          <legend className={FIELD_LABEL}>Date Range</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`${baseId}-date-from`} className="text-xs text-muted">
                From
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
                To
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
              Tanggal awal melewati tanggal akhir.
            </p>
          ) : null}
        </fieldset>

        {tab === 'length-frequency' ? (
          <>
            {/* --- Cara ukur panjang ---
                TL dan FL adalah dua BESARAN berbeda untuk ikan yang sama, jadi
                pilihannya bukan sekadar penyaring: ia menentukan apa yang
                diukur sumbu datar histogramnya. "Semua" ada karena itu yang
                dilakukan API saat parameternya dikosongkan -- pilihan yang
                sah, dan kartu grafiknya menjelaskan konsekuensinya. */}
            <fieldset className="flex flex-col gap-1">
              <legend className={FIELD_LABEL}>Length Type</legend>
              <div className="mt-1 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-fg">
                  <input
                    type="radio"
                    name={`${baseId}-length-type`}
                    checked={lengthType === null}
                    onChange={() => setLengthType(null)}
                  />
                  TL + FL
                </label>
                {IKAN_LENGTH_TYPES.map((value: IkanLengthType) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-fg">
                    <input
                      type="radio"
                      name={`${baseId}-length-type`}
                      value={value}
                      checked={lengthType === value}
                      onChange={() => setLengthType(value)}
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* --- Lm ---
                Angka acuan yang DIISI PEMBACA, bukan hitungan: API memakainya
                untuk menghitung berapa persen tangkapan berada di bawah
                panjang matang gonad. Dikosongkan berarti garis acuannya tidak
                digambar dan persentasenya tidak dihitung -- bukan galat. */}
            <div className="flex flex-col gap-1">
              <label htmlFor={`${baseId}-lm`} className={FIELD_LABEL}>
                Lm — panjang matang gonad (cm)
              </label>
              <input
                id={`${baseId}-lm`}
                type="number"
                inputMode="decimal"
                min={0.1}
                step={0.1}
                value={lm}
                placeholder="Kosongkan bila tidak dipakai"
                onChange={(event) => setLm(event.target.value)}
                className={CONTROL_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1">
            <label htmlFor={`${baseId}-class-interval`} className={FIELD_LABEL}>
              Selang Kelas
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
                {classInterval} cm
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
            {memuat ? 'Memuat…' : tab === 'length-frequency' ? 'Generate' : 'Filter'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted hover:text-primary"
          >
            Reset
          </button>
        </div>

        {/* aria-live supaya hasil penekanan tombol juga TERDENGAR: grafiknya
            berubah di kolom sebelah, jauh dari fokus yang masih di tombol. */}
        <p aria-live="polite" className="text-xs leading-relaxed text-muted">
          Mengganti satu filter mengosongkan filter di bawahnya. Tekan{' '}
          {tab === 'length-frequency' ? 'Generate' : 'Filter'} untuk memperbarui grafik.
        </p>
      </form>
    </ChartCard>
  );
}
