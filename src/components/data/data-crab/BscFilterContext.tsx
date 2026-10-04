'use client';

import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatArticleDate } from '@/lib/date';
import { createContext, useContext, useRef, useState, useTransition } from 'react';
import type { ReactNode } from 'react';

import {
  fetchBscCatchChart,
  fetchBscOptions,
  fetchBscTripChart,
  fetchBscWidthChart,
} from '@/app/[locale]/data/data-crab/actions';
import type { TabId } from '@/components/data/FisheriesDataDashboard';
import type { BscCatchChart, BscTripChart, BscWidthChart } from '@/lib/content';
import {
  BSC_FILTER_LEVELS,
  descendantLevels,
  type BscFilterLevel,
  type BscOptionsByLevel,
  type BscPeriod,
  type BscSelection,
  type BscSex,
  type BscTkg,
} from '@/lib/bsc-filters';

/**
 * Keadaan filter BSC, dipakai bersama oleh form filter dan grafiknya.
 *
 * Context, bukan state di dalam salah satu komponen, karena keduanya dipasang
 * di DUA SLOT BERBEDA milik FisheriesDataDashboard (kolom kiri dan kolom
 * kanan). Satu komponen tidak bisa merender dirinya ke dua tempat, dan
 * mengangkat state ke dasbor berarti dasbor yang generik itu ikut tahu soal
 * lokasi pendaratan dan TKG.
 *
 * Provider-nya dipasang di halaman, MEMBUNGKUS dasbor: kedua elemen slot
 * dirender di dalam pohon dasbor, jadi keduanya membaca context yang sama.
 */

type ChartStatus = 'ready' | 'loading' | 'error';

type BscFilterState = {
  selection: BscSelection;
  options: BscOptionsByLevel;
  loadingLevels: ReadonlySet<BscFilterLevel>;
  period: BscPeriod;
  dateFrom: string;
  dateTo: string;
  classInterval: number;
  /** Jenis kelamin. null = jantan dan betina digabung, persis perilaku API saat
   *  parameternya dikosongkan. */
  sex: BscSex | null;
  /** Ambang TKG yang dihitung sebagai matang. Menggesernya menggeser Lm yang
   *  dihitung API, jadi ia bagian dari pertanyaan -- bukan pengaturan
   *  tampilan. */
  tkg: BscTkg;
  /** Rentang tanggal yang terbalik. Dihitung sekali di sini, bukan di dua
   *  tempat: form memakainya untuk mematikan tombol, dan apply() memakainya
   *  untuk menolak permintaan yang sudah pasti ditolak CMS. */
  rangeInvalid: boolean;

  /** Grafik yang SEDANG TAMPIL -- hasil terakhir yang diterapkan, bukan
   *  bayangan dari filter yang baru diubah-ubah di form. Filter yang berubah
   *  tanpa ditekan tombolnya tidak boleh menggeser grafik: pembaca jadi tidak
   *  bisa tahu angka di layar menjawab pertanyaan yang mana. */
  chart: BscTripChart | null;
  chartStatus: ChartStatus;
  /** Sama untuk tab Catch Composition. Disimpan TERPISAH, bukan satu state
   *  "grafik aktif": keduanya datang dari endpoint berbeda dan diterapkan pada
   *  saat berbeda, jadi menggabungkannya berarti satu tab menghapus hasil tab
   *  lain setiap kali tombolnya ditekan. */
  catchChart: BscCatchChart | null;
  catchStatus: ChartStatus;
  widthChart: BscWidthChart | null;
  widthStatus: ChartStatus;
  /** Ringkasan filter yang MENGHASILKAN grafik yang sedang tampil, untuk
   *  dicetak di kepala kartunya. Satu per tab, dengan alasan yang sama. */
  appliedSummary: string;
  catchAppliedSummary: string;
  widthAppliedSummary: string;

  setLevel: (level: BscFilterLevel, value: string) => void;
  setPeriod: (period: BscPeriod) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setClassInterval: (value: number) => void;
  setSex: (value: BscSex | null) => void;
  setTkg: (value: BscTkg) => void;
  /** Menarik grafik untuk tab yang sedang terbuka. Tab-nya dikirim pemanggil
   *  (form filternya yang tahu, lewat useFisheriesTab) supaya context tidak
   *  perlu ikut melacak tab -- dan supaya menekan Filter di satu tab tidak
   *  membebani CMS dengan permintaan untuk tab yang tidak dilihat siapa pun. */
  apply: (scope: TabId) => void;
  reset: () => void;
  isPending: boolean;
};

const BscFilterStateContext = createContext<BscFilterState | null>(null);

export function useBscFilter(): BscFilterState {
  const value = useContext(BscFilterStateContext);
  // Terlempar, tidak dibiarkan null: komponen yang lupa dibungkus provider akan
  // gagal SEKARANG dengan sebabnya tertulis, bukan merender form kosong yang
  // tidak pernah menjawab klik.
  if (!value) throw new Error('useBscFilter dipakai di luar <BscFilterProvider>.');
  return value;
}

/** Tingkat yang BENAR-BENAR dikirim per tab -- cerminan dari field yang tampil
 *  di form (lihat FIELDS_PER_TAB di BscFilterPanel), dan dari ketiga daftar
 *  BSC_*_CHART_LEVELS di sisi server.
 *
 *  Ada di sini karena pilihannya DIPAKAI BERSAMA lintas tab: alat tangkap yang
 *  dipilih di Catch Composition tetap tersimpan saat pembaca pindah ke Summary,
 *  dan mengirimkannya ke grafik trip berarti angka di kartu menjawab penyaring
 *  yang tidak terlihat di layar tab itu. Memotongnya di sini membuat apa yang
 *  DIKIRIM sama dengan apa yang DITAMPILKAN.
 *
 *  Server memotong ulang hal yang sama (loadBscTripChart dkk). Dua kali, bukan
 *  mubazir: yang di sini menjaga RINGKASAN di kepala kartu ikut jujur, yang di
 *  sana menjaga Server Action yang dipanggil tanpa form. */
const LEVELS_PER_TAB: Record<TabId, number> = {
  summary: 4,
  'catch-composition': 5,
  'length-frequency': 7,
};

function scopedSelection(selection: BscSelection, scope: TabId): BscSelection {
  const scoped: BscSelection = {};

  for (const level of BSC_FILTER_LEVELS.slice(0, LEVELS_PER_TAB[scope])) {
    const value = selection[level];
    if (value) scoped[level] = value;
  }

  return scoped;
}

/** Ringkasan filter untuk kepala kartu grafik: "JAWA TENGAH · DEMAK".
 *
 *  Menyebut NILAINYA, bukan nama fieldnya: di kepala kartu yang sempit,
 *  "JAWA TENGAH" sudah memberi tahu bahwa yang disaring adalah provinsi.
 *
 *  Satuan waktunya TIDAK ikut -- kartu grafik periode sudah mencetak "per
 *  bulan"/"per tahun" sendiri. String kosong berarti tidak ada penyaring sama
 *  sekali, dan pemanggilnya yang memutuskan cara menyambungnya. */
function summarize(
  selection: BscSelection,
  dateFrom: string,
  dateTo: string,
  locale: Locale,
): string {
  const parts = Object.values(selection).filter(Boolean);
  if (dateFrom || dateTo) {
    // Tanggal ISO dari <input type="date"> dicetak seperti tanggal lain di
    // situs ("01 JAN 2024"), bukan "2024-01-01" mentah.
    const show = (value: string) => (value ? formatArticleDate(value, locale) : '…');
    parts.push(getFisheriesDictionary(locale).dateSpan(show(dateFrom), show(dateTo)));
  }
  return parts.join(' · ');
}

export function BscFilterProvider({
  locale,
  initialOptions,
  initialChart,
  initialCatchChart,
  initialWidthChart,
  children,
}: {
  /** Bahasa ringkasan filter di kepala kartu grafik. */
  locale: Locale;
  /** Opsi ketujuh tingkat TANPA penyaring, diambil di server. */
  initialOptions: BscOptionsByLevel;
  /** Grafik trip untuk filter bawaan (tanpa penyaring, bulanan, seluruh
   *  rentang), juga dari server -- kartunya sudah berisi angka sungguhan di
   *  HTML pertama, bukan kosong sampai ada yang menekan tombol. */
  initialChart: BscTripChart | null;
  /** Komposisi tangkapan untuk filter bawaan, juga dari server. */
  initialCatchChart: BscCatchChart | null;
  /** Sebaran lebar untuk filter bawaan, juga dari server. */
  initialWidthChart: BscWidthChart | null;
  children: ReactNode;
}) {
  const [selection, setSelection] = useState<BscSelection>({});
  const [options, setOptions] = useState<BscOptionsByLevel>(initialOptions);
  const [loadingLevels, setLoadingLevels] = useState<ReadonlySet<BscFilterLevel>>(() => new Set());
  const [period, setPeriod] = useState<BscPeriod>('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [classInterval, setClassInterval] = useState(1);
  const [sex, setSex] = useState<BscSex | null>(null);
  const [tkg, setTkg] = useState<BscTkg>(2);

  const [chart, setChart] = useState<BscTripChart | null>(initialChart);
  const [chartStatus, setChartStatus] = useState<ChartStatus>(initialChart ? 'ready' : 'error');
  const [appliedSummary, setAppliedSummary] = useState('');

  const [catchChart, setCatchChart] = useState<BscCatchChart | null>(initialCatchChart);
  const [catchStatus, setCatchStatus] = useState<ChartStatus>(
    initialCatchChart ? 'ready' : 'error',
  );
  const [catchAppliedSummary, setCatchAppliedSummary] = useState('');

  const [widthChart, setWidthChart] = useState<BscWidthChart | null>(initialWidthChart);
  const [widthStatus, setWidthStatus] = useState<ChartStatus>(
    initialWidthChart ? 'ready' : 'error',
  );
  const [widthAppliedSummary, setWidthAppliedSummary] = useState('');
  const [isPending, startTransition] = useTransition();

  /** Nomor urut permintaan opsi terakhir. Dua perubahan beruntun berarti dua
   *  panggilan yang berjalan bersamaan, dan yang lebih tua bisa tiba
   *  belakangan -- tanpa penjaga ini daftar opsi bisa berakhir menampilkan
   *  hasil untuk pilihan yang sudah tidak berlaku. */
  const optionsTicket = useRef(0);
  /** Penjaga yang sama untuk grafik, dihitung terpisah: keduanya berubah pada
   *  saat yang berbeda (opsi saat dropdown diganti, grafik saat tombol
   *  ditekan). */
  const chartTicket = useRef(0);
  const catchTicket = useRef(0);
  const widthTicket = useRef(0);

  const rangeInvalid = dateFrom !== '' && dateTo !== '' && dateFrom > dateTo;

  const setLevel = (level: BscFilterLevel, value: string) => {
    const stale = descendantLevels(level);

    // Pilihan di bawahnya dibatalkan SEKARANG, tidak menunggu jaringan: begitu
    // provinsi berganti, "DEMAK" yang masih tertulis di bawahnya sudah salah,
    // dan membiarkannya terbaca beberapa detik lagi adalah kebohongan kecil
    // yang berakhir jadi kueri yang tidak pernah punya hasil.
    const next: BscSelection = { ...selection };
    if (value) next[level] = value;
    else delete next[level];
    for (const descendant of stale) delete next[descendant];

    setSelection(next);
    setLoadingLevels(new Set(stale));

    // Daftar lama ikut dikosongkan, bukan dibiarkan sampai yang baru tiba:
    // select yang masih memegang sepuluh alat tangkap dari kombinasi sebelumnya
    // terlihat siap dipakai padahal isinya sudah tidak berlaku.
    setOptions((current) => {
      const cleared = { ...current };
      for (const descendant of stale) cleared[descendant] = [];
      return cleared;
    });

    if (stale.length === 0) return;

    const ticket = (optionsTicket.current += 1);
    const [nearest, ...rest] = stale;

    // DUA gelombang, bukan satu permintaan untuk semua tingkat sisanya.
    //
    // Antrean ke CMS dilayani dua-dua dan satu jawaban makan waktu, jadi
    // meminta seluruh tingkat sisanya sekaligus berarti dropdown BERIKUTNYA --
    // yang hampir pasti jadi tujuan klik selanjutnya -- baru hidup setelah
    // tingkat terjauh ikut selesai. Tingkat terdekat karena itu diminta
    // sendirian lebih dulu, sisanya menyusul sambil pengunjung membaca pilihan
    // yang sudah ada.
    startTransition(async () => {
      const nearestOptions = await fetchBscOptions(next, [nearest]);
      if (ticket !== optionsTicket.current) return;

      setOptions((current) => ({ ...current, ...nearestOptions }));
      setLoadingLevels(new Set(rest));
      if (rest.length === 0) return;

      const restOptions = await fetchBscOptions(next, rest);
      if (ticket !== optionsTicket.current) return;

      setOptions((current) => ({ ...current, ...restOptions }));
      setLoadingLevels(new Set());
    });
  };

  const apply = (scope: TabId) => {
    // Rentang terbalik ditolak di sini juga, bukan hanya lewat tombol yang
    // dimatikan: apply() bisa dipanggil dengan Enter dari dalam form.
    if (rangeInvalid) return;

    const scoped = scopedSelection(selection, scope);
    const summary = summarize(scoped, dateFrom, dateTo, locale);

    if (scope === 'length-frequency') {
      const ticket = (widthTicket.current += 1);
      setWidthStatus('loading');

      startTransition(async () => {
        const fresh = await fetchBscWidthChart({
          selection: scoped,
          dari: dateFrom || null,
          sampai: dateTo || null,
          jenisKelamin: sex,
          selangKelas: classInterval,
          tkgMatang: tkg,
        });
        if (ticket !== widthTicket.current) return;

        if (!fresh) {
          setWidthStatus('error');
          return;
        }

        setWidthChart(fresh);
        setWidthStatus('ready');
        setWidthAppliedSummary(
          [summary, sex ?? 'jantan + betina', `TKG ≥ ${tkg}`].filter(Boolean).join(' · '),
        );
      });
      return;
    }

    if (scope === 'catch-composition') {
      const ticket = (catchTicket.current += 1);
      setCatchStatus('loading');

      startTransition(async () => {
        const fresh = await fetchBscCatchChart({
          selection: scoped,
          dari: dateFrom || null,
          sampai: dateTo || null,
        });
        if (ticket !== catchTicket.current) return;

        if (!fresh) {
          setCatchStatus('error');
          return;
        }

        setCatchChart(fresh);
        setCatchStatus('ready');
        setCatchAppliedSummary(summary);
      });
      return;
    }

    const ticket = (chartTicket.current += 1);
    setChartStatus('loading');

    startTransition(async () => {
      const fresh = await fetchBscTripChart({
        selection: scoped,
        period,
        dari: dateFrom || null,
        sampai: dateTo || null,
      });
      if (ticket !== chartTicket.current) return;

      // Grafik lama DIPERTAHANKAN saat gagal, tidak dikosongkan: kartu yang
      // tiba-tiba kosong terbaca sebagai "tidak ada trip" -- jawaban yang
      // berbeda jauh dari "permintaannya gagal", dan keduanya tidak boleh
      // terlihat sama.
      if (!fresh) {
        setChartStatus('error');
        return;
      }

      setChart(fresh);
      setChartStatus('ready');
      setAppliedSummary(summary);
    });
  };

  const reset = () => {
    // Tiket dinaikkan juga di sini: kalau sebuah permintaan masih di jalan saat
    // form direset, hasilnya tidak boleh mendarat di form yang sudah bersih.
    optionsTicket.current += 1;
    chartTicket.current += 1;
    catchTicket.current += 1;
    widthTicket.current += 1;

    setSelection({});
    setOptions(initialOptions);
    setLoadingLevels(new Set());
    setPeriod('monthly');
    setDateFrom('');
    setDateTo('');
    setClassInterval(1);
    setSex(null);
    setTkg(2);

    // Grafik ikut kembali ke keadaan awal halaman -- yang sudah ada di klien,
    // jadi tidak perlu satu pun permintaan.
    setChart(initialChart);
    setChartStatus(initialChart ? 'ready' : 'error');
    setAppliedSummary('');
    setCatchChart(initialCatchChart);
    setCatchStatus(initialCatchChart ? 'ready' : 'error');
    setCatchAppliedSummary('');
    setWidthChart(initialWidthChart);
    setWidthStatus(initialWidthChart ? 'ready' : 'error');
    setWidthAppliedSummary('');
  };

  return (
    <BscFilterStateContext.Provider
      value={{
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
        chart,
        chartStatus,
        catchChart,
        catchStatus,
        widthChart,
        widthStatus,
        appliedSummary,
        catchAppliedSummary,
        widthAppliedSummary,
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
      }}
    >
      {children}
    </BscFilterStateContext.Provider>
  );
}
