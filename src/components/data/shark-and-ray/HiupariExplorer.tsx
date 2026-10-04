'use client';

import { useRef, useState, useTransition } from 'react';

import { fetchHiupariLengthChart } from '@/app/[locale]/data/shark-and-ray/actions';
import { HiupariFilterPanel } from '@/components/data/shark-and-ray/HiupariFilterPanel';
import { HiupariLengthChart } from '@/components/data/shark-and-ray/HiupariLengthChart';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatNumber } from '@/lib/number';
import type { HiupariLengthChart as HiupariLengthChartData } from '@/lib/content';
import {
  type HiupariMaturity,
  type HiupariOption,
  type HiupariSex,
  type HiupariSizeType,
} from '@/lib/hiupari-filters';

type ChartStatus = 'ready' | 'loading' | 'error';

/** Selang kelas bawaan. 10 cm, bukan 1 cm seperti IKAN dan Data Crab: sebaran
 *  hiu-pari membentang 34-392 cm, dan selang 1 cm di sana menghasilkan 359
 *  batang -- bentuk yang tidak terbaca sebagai apa pun. */
const DEFAULT_CLASS_INTERVAL = 10;

/** Ringkasan filter untuk kepala kartu grafik.
 *
 *  Spesies dan jenis ukuran TIDAK ikut: keduanya sudah dicetak kartunya sendiri
 *  di judul dan di baris meta, dan menyebutnya dua kali di satu baris cuma
 *  menambah kata. Yang tersisa justru yang tidak terlihat di tempat lain --
 *  jenis kelamin dan ambang kematangannya. */
function summarize(sex: HiupariSex | null, maturity: HiupariMaturity, locale: Locale): string {
  const t = getFisheriesDictionary(locale);
  return t.sharkSummary(t.sharkSexSummary[sex ?? 'all'], formatNumber(maturity, locale));
}

/**
 * Pemilik keadaan filter `/data/shark-and-ray`.
 *
 * Merender KEDUA kolom sendiri -- form filter dan grafiknya -- alih-alih
 * menitipkan keduanya ke slot dasbor lewat context seperti IKAN dan Data Crab.
 * Halaman ini tidak punya kerangka tab yang memisahkan keduanya, jadi satu
 * induk bersama sudah cukup, dan context untuk dua komponen bersaudara cuma
 * menyembunyikan aliran datanya.
 */
export function HiupariExplorer({
  species,
  initialChart,
  locale,
}: {
  /** Daftar spesies, diambil di server: formnya sudah terisi di HTML pertama,
   *  dan kunci API CMS tidak pernah ikut ke browser. */
  species: HiupariOption[];
  /** Grafik untuk filter BAWAAN, juga dari server -- kartunya sudah berisi
   *  angka sungguhan di HTML pertama, bukan kosong sampai ada yang menekan
   *  tombol. */
  initialChart: HiupariLengthChartData | null;
  locale: Locale;
}) {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [sex, setSex] = useState<HiupariSex | null>(null);
  const [sizeType, setSizeType] = useState<HiupariSizeType>('panjang_total');
  const [classInterval, setClassInterval] = useState(DEFAULT_CLASS_INTERVAL);
  const [maturity, setMaturity] = useState<HiupariMaturity>(3);

  const [chart, setChart] = useState<HiupariLengthChartData | null>(initialChart);
  const [status, setStatus] = useState<ChartStatus>(initialChart ? 'ready' : 'error');
  const [appliedSummary, setAppliedSummary] = useState('');
  const [isPending, startTransition] = useTransition();

  /** Nomor urut permintaan terakhir. Dua penekanan tombol beruntun berarti dua
   *  panggilan yang berjalan bersamaan, dan yang lebih tua bisa tiba
   *  belakangan -- tanpa penjaga ini grafiknya bisa berakhir menampilkan hasil
   *  untuk filter yang sudah tidak berlaku. */
  const ticket = useRef(0);

  const apply = () => {
    const current = (ticket.current += 1);
    setStatus('loading');

    startTransition(async () => {
      const fresh = await fetchHiupariLengthChart({
        spesies: selectedSpecies || null,
        jenisKelamin: sex,
        jenisUkuran: sizeType,
        selangKelas: classInterval,
        kematanganMatang: maturity,
      });
      if (current !== ticket.current) return;

      // Grafik lama DIPERTAHANKAN saat gagal, tidak dikosongkan: kartu yang
      // tiba-tiba kosong terbaca sebagai "tidak ada pengukuran" -- jawaban yang
      // berbeda jauh dari "permintaannya gagal", dan keduanya tidak boleh
      // terlihat sama.
      if (!fresh) {
        setStatus('error');
        return;
      }

      setChart(fresh);
      setStatus('ready');
      setAppliedSummary(summarize(sex, maturity, locale));
    });
  };

  const reset = () => {
    // Tiket dinaikkan juga di sini: kalau sebuah permintaan masih di jalan saat
    // form direset, hasilnya tidak boleh mendarat di form yang sudah bersih.
    ticket.current += 1;

    setSelectedSpecies('');
    setSex(null);
    setSizeType('panjang_total');
    setClassInterval(DEFAULT_CLASS_INTERVAL);
    setMaturity(3);

    // Grafik ikut kembali ke keadaan awal halaman -- yang sudah ada di klien,
    // jadi tidak perlu satu pun permintaan.
    setChart(initialChart);
    setStatus(initialChart ? 'ready' : 'error');
    setAppliedSummary('');
  };

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[20rem_1fr] lg:items-start">
      <HiupariFilterPanel
        locale={locale}
        species={species}
        selectedSpecies={selectedSpecies}
        sex={sex}
        sizeType={sizeType}
        classInterval={classInterval}
        maturity={maturity}
        loading={status === 'loading'}
        isPending={isPending}
        onSpeciesChange={setSelectedSpecies}
        onSexChange={setSex}
        onSizeTypeChange={setSizeType}
        onClassIntervalChange={setClassInterval}
        onMaturityChange={setMaturity}
        onSubmit={apply}
        onReset={reset}
      />

      <HiupariLengthChart
        chart={chart}
        status={status}
        appliedSummary={appliedSummary}
        locale={locale}
      />
    </div>
  );
}
