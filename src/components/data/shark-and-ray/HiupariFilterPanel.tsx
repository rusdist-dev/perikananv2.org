'use client';

import { useId } from 'react';

import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import {
  HIUPARI_MATURITY_LEVELS,
  HIUPARI_SEXES,
  HIUPARI_SIZE_LABEL,
  HIUPARI_SIZE_TYPES,
  type HiupariMaturity,
  type HiupariOption,
  type HiupariSex,
  type HiupariSizeType,
} from '@/lib/hiupari-filters';

const FIELD_LABEL = 'text-xs font-bold uppercase tracking-wide text-muted';
const CONTROL_CLASS =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted';

/**
 * Form filter dataset HIUPARI.
 *
 * Menerima keadaannya lewat PROP, bukan lewat context seperti IKAN dan Data
 * Crab. Bedanya bukan selera: di sana form dan grafik dipasang ke dua slot
 * terpisah milik FisheriesDataDashboard, jadi tidak ada satu komponen yang bisa
 * memegang keduanya. Halaman ini tidak punya kerangka tab, jadi
 * HiupariExplorer bisa merender keduanya sendiri -- dan context untuk dua
 * komponen bersaudara yang punya induk bersama cuma menyembunyikan aliran
 * datanya.
 */
export function HiupariFilterPanel({
  species,
  selectedSpecies,
  sex,
  sizeType,
  classInterval,
  maturity,
  loading,
  isPending,
  onSpeciesChange,
  onSexChange,
  onSizeTypeChange,
  onClassIntervalChange,
  onMaturityChange,
  onSubmit,
  onReset,
}: {
  species: HiupariOption[];
  selectedSpecies: string;
  sex: HiupariSex | null;
  sizeType: HiupariSizeType;
  classInterval: number;
  maturity: HiupariMaturity;
  loading: boolean;
  isPending: boolean;
  onSpeciesChange: (value: string) => void;
  onSexChange: (value: HiupariSex | null) => void;
  onSizeTypeChange: (value: HiupariSizeType) => void;
  onClassIntervalChange: (value: number) => void;
  onMaturityChange: (value: HiupariMaturity) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const baseId = useId();
  const speciesEmpty = species.length === 0;

  return (
    <ChartCard title="Filter">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {/* --- Spesies ---
            Satu-satunya dropdown di halaman ini: dataset HIUPARI tidak
            dikelompokkan per wilayah sama sekali, jadi tidak ada rantai
            provinsi -> kabupaten -> lokasi seperti dua halaman data lainnya.

            Cacah individu DICETAK di tiap baris, berbeda dari dropdown IKAN dan
            Data Crab yang menyembunyikannya. Di sini angkanya menjawab
            pertanyaan yang langsung menentukan apakah pilihan itu ada gunanya:
            sebaran dari 2 individu (Carcharhinus limbatus) bukan sebaran, dan
            itu harus terlihat SEBELUM tombolnya ditekan, bukan sesudah. */}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${baseId}-species`} className={FIELD_LABEL}>
            Species
          </label>
          <select
            id={`${baseId}-species`}
            value={selectedSpecies}
            disabled={speciesEmpty}
            onChange={(event) => onSpeciesChange(event.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="">
              {speciesEmpty ? 'Daftar spesies tidak tersedia' : 'Semua spesies'}
            </option>
            {species.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value} ({option.jumlahIndividu.toLocaleString('id')})
              </option>
            ))}
          </select>
        </div>

        {/* --- Jenis ukuran ---
            Lima BESARAN berbeda pada hewan yang sama, bukan lima satuan, jadi
            pilihannya menentukan apa yang diukur sumbu datar histogramnya.

            Tanpa pilihan "semua", berbeda dari TL+FL di halaman IKAN:
            menumpuk panjang total dengan panjang headless berarti menggabungkan
            dua angka yang selisihnya sebesar kepala hewannya. API pun
            mewajibkan satu nilai. */}
        <div className="flex flex-col gap-1">
          <label htmlFor={`${baseId}-size-type`} className={FIELD_LABEL}>
            Jenis Ukuran
          </label>
          <select
            id={`${baseId}-size-type`}
            value={sizeType}
            onChange={(event) => onSizeTypeChange(event.target.value as HiupariSizeType)}
            className={CONTROL_CLASS}
          >
            {HIUPARI_SIZE_TYPES.map((value) => (
              <option key={value} value={value}>
                {HIUPARI_SIZE_LABEL[value]}
              </option>
            ))}
          </select>
        </div>

        {/* --- Jenis kelamin ---
            Radio, bukan select: tiga pilihan yang saling meniadakan dan muat di
            satu baris.

            Keterangan di bawahnya bukan hiasan: konsekuensi memilih "semua" di
            sini TIDAK simetris dengan halaman Data Crab. Lm hiu-pari dihitung
            dari kematangan klasper -- organ jantan -- jadi betina dan gabungan
            kedua jenis kelamin sama-sama tidak punya angkanya. Tanpa kalimat
            ini, Lm yang kosong terbaca sebagai data yang hilang. */}
        <fieldset className="flex flex-col gap-1">
          <legend className={FIELD_LABEL}>Jenis Kelamin</legend>
          <div className="mt-1 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-fg">
              <input
                type="radio"
                name={`${baseId}-sex`}
                checked={sex === null}
                onChange={() => onSexChange(null)}
              />
              Semua
            </label>
            {HIUPARI_SEXES.map((value: HiupariSex) => (
              <label key={value} className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name={`${baseId}-sex`}
                  value={value}
                  checked={sex === value}
                  onChange={() => onSexChange(value)}
                />
                {value === 'M' ? 'Jantan (M)' : 'Betina (F)'}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Lm hanya terhitung untuk <strong className="font-bold">Jantan</strong>: kematangan
            diukur dari klasper, yang tidak dimiliki betina. Linf tetap terhitung untuk ketiga
            pilihan.
          </p>
        </fieldset>

        {/* --- Ambang kematangan klasper ---
            Angka yang mengubah HASIL, bukan tampilan: API memakainya untuk
            menghitung persen matang DAN untuk menginterpolasi Lm. Pada spesies
            yang sama, ambang 1 menaruh Lm di 45 cm dan ambang 3 di 116 cm. */}
        <fieldset className="flex flex-col gap-1">
          <legend className={FIELD_LABEL}>Ambang kematangan klasper</legend>
          <div className="mt-1 flex flex-wrap gap-4">
            {HIUPARI_MATURITY_LEVELS.map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="radio"
                  name={`${baseId}-maturity`}
                  value={value}
                  checked={maturity === value}
                  onChange={() => onMaturityChange(value)}
                />
                ≥ {value}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${baseId}-class-interval`} className={FIELD_LABEL}>
            Selang Kelas
          </label>
          <div className="flex items-center gap-3">
            <input
              id={`${baseId}-class-interval`}
              type="range"
              // Mulai dari 5, bukan 1 seperti halaman IKAN dan Data Crab: hiu
              // dan pari terukur sampai 392 cm, dan selang 1 cm di sana
              // menghasilkan 359 batang selebar kurang dari satu piksel.
              min={5}
              max={50}
              step={5}
              value={classInterval}
              onChange={(event) => onClassIntervalChange(Number(event.target.value))}
              className="w-full"
            />
            <span className="shrink-0 font-mono text-sm whitespace-nowrap text-muted">
              {classInterval} cm
            </span>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Memuat…' : 'Show Chart'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted hover:text-primary"
          >
            Reset
          </button>
        </div>

        {/* aria-live supaya hasil penekanan tombol juga TERDENGAR: grafiknya
            berubah di kolom sebelah, jauh dari fokus yang masih di tombol. */}
        <p aria-live="polite" className="text-xs leading-relaxed text-muted">
          Tekan Show Chart untuk memperbarui grafik.
        </p>
      </form>
    </ChartCard>
  );
}
