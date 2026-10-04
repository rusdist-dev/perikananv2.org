'use client';

import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatArticleDate } from '@/lib/date';
import { createContext, useContext, useRef, useState, useTransition } from 'react';
import type { ReactNode } from 'react';

import {
  fetchIkanCatchChart,
  fetchIkanLengthChart,
  fetchIkanOptions,
  fetchIkanTripChart,
} from '@/app/[locale]/data/ikan/actions';
import type { TabId } from '@/components/data/FisheriesDataDashboard';
import type { IkanCatchChart, IkanLengthChart, IkanTripChart } from '@/lib/content';
import {
  descendantLevels,
  type IkanFilterLevel,
  type IkanLengthType,
  type IkanOptionsByLevel,
  type IkanPeriod,
  type IkanSelection,
} from '@/lib/ikan-filters';

/**
 * Keadaan filter IKAN, dipakai bersama oleh form filter dan grafiknya.
 *
 * Context, bukan state di dalam salah satu komponen, karena keduanya dipasang
 * di DUA SLOT BERBEDA milik FisheriesDataDashboard (kolom kiri dan kolom
 * kanan). Satu komponen tidak bisa merender dirinya ke dua tempat, dan
 * mengangkat state ke dasbor berarti dasbor yang generik itu ikut tahu soal
 * WPPNRI dan lokasi pendaratan -- padahal halaman Data Crab memakai dasbor yang
 * sama tanpa satu pun dari itu.
 *
 * Provider-nya dipasang di halaman, MEMBUNGKUS dasbor: kedua elemen slot
 * dirender di dalam pohon dasbor, jadi keduanya membaca context yang sama.
 */

type IkanFilterState = {
  selection: IkanSelection;
  options: IkanOptionsByLevel;
  loadingLevels: ReadonlySet<IkanFilterLevel>;
  period: IkanPeriod;
  dateFrom: string;
  dateTo: string;
  classInterval: number;
  /** Cara ukur panjang. null = TL dan FL digabung, persis perilaku API saat
   *  parameternya dikosongkan. */
  lengthType: IkanLengthType | null;
  /** Panjang matang gonad sebagai garis acuan, dalam satuan grafiknya (cm).
   *  String, bukan number: ia isi <input>, dan kolom yang sedang dikosongkan
   *  pengguna melewati keadaan "" yang bukan angka mana pun. */
  lm: string;
  /** Rentang tanggal yang terbalik. Dihitung sekali di sini, bukan di dua
   *  tempat: form memakainya untuk mematikan tombol, dan apply() memakainya
   *  untuk menolak permintaan yang sudah pasti dijawab 422 oleh CMS. */
  rangeInvalid: boolean;

  /** Grafik yang SEDANG TAMPIL -- hasil terakhir yang diterapkan, bukan
   *  bayangan dari filter yang baru diubah-ubah di form. Filter yang berubah
   *  tanpa ditekan tombolnya tidak boleh menggeser grafik: pembaca jadi tidak
   *  bisa tahu angka di layar menjawab pertanyaan yang mana. */
  chart: IkanTripChart | null;
  chartStatus: ChartStatus;
  /** Sama untuk tab Catch Composition. Disimpan TERPISAH, bukan satu state
   *  "grafik aktif": keduanya datang dari endpoint berbeda dan diterapkan
   *  pada saat berbeda, jadi menggabungkannya berarti satu tab menghapus
   *  hasil tab lain setiap kali tombolnya ditekan. */
  catchChart: IkanCatchChart | null;
  catchStatus: ChartStatus;
  lengthChart: IkanLengthChart | null;
  lengthStatus: ChartStatus;
  /** Ringkasan filter yang MENGHASILKAN grafik yang sedang tampil, untuk
   *  dicetak di kepala kartunya. Satu per tab, dengan alasan yang sama. */
  appliedSummary: string;
  catchAppliedSummary: string;
  lengthAppliedSummary: string;

  setLevel: (level: IkanFilterLevel, value: string) => void;
  setPeriod: (period: IkanPeriod) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setClassInterval: (value: number) => void;
  setLengthType: (value: IkanLengthType | null) => void;
  setLm: (value: string) => void;
  /** Menarik grafik untuk tab yang sedang terbuka. Tab-nya dikirim pemanggil
   *  (form filternya yang tahu, lewat useFisheriesTab) supaya context tidak
   *  perlu ikut melacak tab -- dan supaya menekan Filter di satu tab tidak
   *  membebani CMS dengan permintaan untuk tab yang tidak dilihat siapa pun. */
  apply: (scope: TabId) => void;
  reset: () => void;
  isPending: boolean;
};

type ChartStatus = 'ready' | 'loading' | 'error';

const IkanFilterStateContext = createContext<IkanFilterState | null>(null);

export function useIkanFilter(): IkanFilterState {
  const value = useContext(IkanFilterStateContext);
  // Terlempar, tidak dibiarkan null: komponen yang lupa dibungkus provider akan
  // gagal SEKARANG dengan sebabnya tertulis, bukan merender form kosong yang
  // tidak pernah menjawab klik.
  if (!value) throw new Error('useIkanFilter dipakai di luar <IkanFilterProvider>.');
  return value;
}

/** Ringkasan filter untuk kepala kartu grafik: "WPPNRI-572 · ACEH".
 *
 *  Menyebut NILAINYA, bukan nama fieldnya: di kepala kartu yang sempit,
 *  "WPPNRI-572" sudah memberi tahu bahwa yang disaring adalah WPP.
 *
 *  Satuan waktunya TIDAK ikut -- kartu grafik periode sudah mencetak "per
 *  bulan"/"per tahun" sendiri, dan menyebutnya dua kali di satu baris ("per
 *  bulan · bulanan") cuma menambah kata. String kosong berarti tidak ada
 *  penyaring sama sekali, dan pemanggilnya yang memutuskan cara
 *  menyambungnya. */
function summarize(
  selection: IkanSelection,
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

export function IkanFilterProvider({
  locale,
  initialOptions,
  initialChart,
  initialCatchChart,
  initialLengthChart,
  children,
}: {
  /** Bahasa ringkasan filter di kepala kartu grafik. */
  locale: Locale;
  /** Opsi kedelapan tingkat TANPA penyaring, diambil di server. */
  initialOptions: IkanOptionsByLevel;
  /** Grafik trip untuk filter bawaan (tanpa penyaring, bulanan, seluruh
   *  rentang), juga dari server -- kartunya sudah berisi angka sungguhan di
   *  HTML pertama, bukan kosong sampai ada yang menekan tombol. */
  initialChart: IkanTripChart | null;
  /** Komposisi tangkapan untuk filter bawaan, juga dari server. */
  initialCatchChart: IkanCatchChart | null;
  /** Sebaran panjang untuk filter bawaan, juga dari server. */
  initialLengthChart: IkanLengthChart | null;
  children: ReactNode;
}) {
  const [selection, setSelection] = useState<IkanSelection>({});
  const [options, setOptions] = useState<IkanOptionsByLevel>(initialOptions);
  const [loadingLevels, setLoadingLevels] = useState<ReadonlySet<IkanFilterLevel>>(
    () => new Set(),
  );
  const [period, setPeriod] = useState<IkanPeriod>('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [classInterval, setClassInterval] = useState(1);
  const [lengthType, setLengthType] = useState<IkanLengthType | null>(null);
  const [lm, setLm] = useState('');

  const [chart, setChart] = useState<IkanTripChart | null>(initialChart);
  const [chartStatus, setChartStatus] = useState<ChartStatus>(initialChart ? 'ready' : 'error');
  const [appliedSummary, setAppliedSummary] = useState('');

  const [catchChart, setCatchChart] = useState<IkanCatchChart | null>(initialCatchChart);
  const [catchStatus, setCatchStatus] = useState<ChartStatus>(
    initialCatchChart ? 'ready' : 'error',
  );
  const [catchAppliedSummary, setCatchAppliedSummary] = useState('');

  const [lengthChart, setLengthChart] = useState<IkanLengthChart | null>(initialLengthChart);
  const [lengthStatus, setLengthStatus] = useState<ChartStatus>(
    initialLengthChart ? 'ready' : 'error',
  );
  const [lengthAppliedSummary, setLengthAppliedSummary] = useState('');
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
  const lengthTicket = useRef(0);

  const rangeInvalid = dateFrom !== '' && dateTo !== '' && dateFrom > dateTo;

  const setLevel = (level: IkanFilterLevel, value: string) => {
    const stale = descendantLevels(level);

    // Pilihan di bawahnya dibatalkan SEKARANG, tidak menunggu jaringan: begitu
    // WPPNRI berganti, "Provinsi Aceh" yang masih tertulis di bawahnya sudah
    // salah, dan membiarkannya terbaca beberapa detik lagi adalah kebohongan
    // kecil yang berakhir jadi kueri yang tidak pernah punya hasil.
    const next: IkanSelection = { ...selection };
    if (value) next[level] = value;
    else delete next[level];
    for (const descendant of stale) delete next[descendant];

    setSelection(next);
    setLoadingLevels(new Set(stale));

    // Daftar lama ikut dikosongkan, bukan dibiarkan sampai yang baru tiba:
    // select yang masih memegang 374 spesies dari kombinasi sebelumnya
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
    // meminta ketujuh tingkat sekaligus berarti dropdown BERIKUTNYA -- yang
    // hampir pasti jadi tujuan klik selanjutnya -- baru hidup setelah tingkat
    // terjauh ikut selesai (terukur ~8 detik pada CMS lokal). Tingkat terdekat
    // karena itu diminta sendirian lebih dulu, sisanya menyusul sambil
    // pengunjung membaca pilihan yang sudah ada.
    startTransition(async () => {
      const nearestOptions = await fetchIkanOptions(next, [nearest]);
      if (ticket !== optionsTicket.current) return;

      setOptions((current) => ({ ...current, ...nearestOptions }));
      setLoadingLevels(new Set(rest));
      if (rest.length === 0) return;

      const restOptions = await fetchIkanOptions(next, rest);
      if (ticket !== optionsTicket.current) return;

      setOptions((current) => ({ ...current, ...restOptions }));
      setLoadingLevels(new Set());
    });
  };

  const apply = (scope: TabId) => {
    // Rentang terbalik ditolak di sini juga, bukan hanya lewat tombol yang
    // dimatikan: apply() bisa dipanggil dengan Enter dari dalam form.
    if (rangeInvalid) return;

    const summary = summarize(selection, dateFrom, dateTo, locale);

    if (scope === 'length-frequency') {
      const ticket = (lengthTicket.current += 1);
      setLengthStatus('loading');

      startTransition(async () => {
        const fresh = await fetchIkanLengthChart({
          selection,
          dari: dateFrom || null,
          sampai: dateTo || null,
          tipePanjang: lengthType,
          selangKelas: classInterval,
          // "" (kolom dikosongkan) dan angka tak masuk akal sama-sama jadi
          // null: tanpa Lm, API melewatkan perhitungan persentasenya alih-alih
          // menjawab 422.
          lm: Number.parseFloat(lm) > 0 ? Number.parseFloat(lm) : null,
        });
        if (ticket !== lengthTicket.current) return;

        if (!fresh) {
          setLengthStatus('error');
          return;
        }

        setLengthChart(fresh);
        setLengthStatus('ready');
        setLengthAppliedSummary(
          [summary, lengthType ?? 'TL+FL'].filter(Boolean).join(' · '),
        );
      });
      return;
    }

    if (scope === 'catch-composition') {
      const ticket = (catchTicket.current += 1);
      setCatchStatus('loading');

      startTransition(async () => {
        const fresh = await fetchIkanCatchChart({
          selection,
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
      const fresh = await fetchIkanTripChart({
        selection,
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
    lengthTicket.current += 1;

    setSelection({});
    setOptions(initialOptions);
    setLoadingLevels(new Set());
    setPeriod('monthly');
    setDateFrom('');
    setDateTo('');
    setClassInterval(1);
    setLengthType(null);
    setLm('');

    // Grafik ikut kembali ke keadaan awal halaman -- yang sudah ada di klien,
    // jadi tidak perlu satu pun permintaan.
    setChart(initialChart);
    setChartStatus(initialChart ? 'ready' : 'error');
    setAppliedSummary('');
    setCatchChart(initialCatchChart);
    setCatchStatus(initialCatchChart ? 'ready' : 'error');
    setCatchAppliedSummary('');
    setLengthChart(initialLengthChart);
    setLengthStatus(initialLengthChart ? 'ready' : 'error');
    setLengthAppliedSummary('');
  };

  return (
    <IkanFilterStateContext.Provider
      value={{
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
        chart,
        chartStatus,
        catchChart,
        catchStatus,
        lengthChart,
        lengthStatus,
        appliedSummary,
        catchAppliedSummary,
        lengthAppliedSummary,
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
      }}
    >
      {children}
    </IkanFilterStateContext.Provider>
  );
}
