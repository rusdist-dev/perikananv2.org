'use client';

import Image from 'next/image';
import { Fragment, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { formatArticleDate } from '@/lib/date';
import { formatMetricCell, metricLabel } from '@/lib/metrics';
import type { Locale } from '@/i18n/config';
import type {
  ImpactVillage,
  VillageDetail,
  VillageMetric,
  VillageRehabilitation,
  VillageTraining,
} from '@/lib/content';

/** Urutannya ikut urutan tab di layar, dan dipakai langsung oleh navigasi
 *  panah -- jadi mengubah urutan di sini sudah cukup, tidak ada indeks lain
 *  yang perlu ikut disesuaikan. */
const TABS = [
  { id: 'statistik', label: 'Statistik' },
  { id: 'deskripsi', label: 'Deskripsi' },
  { id: 'rehabilitasi', label: 'Rehabilitasi' },
  { id: 'pelatihan', label: 'Pelatihan' },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** Keadaan pemuatan detail, dipegang ImpactVillageMap dan diteruskan ke sini.
 *
 *  'empty' dan 'error' sengaja DIBEDAKAN meski keduanya berakhir tanpa data:
 *  yang pertama berarti CMS menjawab dengan jujur bahwa desa itu belum punya
 *  pendataan terverifikasi (tidak ada yang perlu dicoba lagi), yang kedua
 *  berarti permintaannya sendiri gagal (mencoba lagi masuk akal). Pesan yang
 *  sama untuk keduanya akan menyuruh orang memuat ulang halaman yang
 *  sebenarnya baik-baik saja. */
export type VillageDetailStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

type VillageDetailPanelProps = {
  /** `null` berarti belum ada desa yang dipilih. Panelnya TETAP dirender dalam
   *  keadaan itu, bukan disembunyikan: panel yang muncul dan hilang menggeser
   *  lebar peta di sebelahnya, dan Leaflet harus memproyeksi ulang seluruh
   *  isinya setiap kali orang mengganti pilihan. */
  village: ImpactVillage | null;
  /** Detail dari CMS. null selama dimuat, dan juga saat desanya memang belum
   *  punya detail -- `status` yang membedakan keduanya. */
  detail: VillageDetail | null;
  status: VillageDetailStatus;
  /** Dipakai untuk memformat tanggal dan angka saja. Label tab dan judul baris
   *  masih tetap bahasa Indonesia, sama seperti sebelum panel ini memakai CMS:
   *  label metriknya sendiri (`VillageMetric.label`) datang dari CMS dan cuma
   *  ada dalam bahasa Indonesia, jadi menerjemahkan bingkainya saja akan
   *  menghasilkan panel setengah-Inggris yang lebih membingungkan. */
  locale: Locale;
  className?: string;
  emptyTitle?: string;
  emptyHint?: string;
  ariaLabel?: string;
};

/** Angka biasa di luar tabel statistik (jumlah bibit, jumlah peserta) -- selalu
 *  utuh, tidak pernah ringkas: nilainya tidak pernah sebesar metrik rupiah. */
function formatCount(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

/** Tanggal ISO -> "14 JUL 2026", memakai pemformat yang sama dengan tanggal
 *  artikel supaya kolom periode di panel ini terbaca sama dengan kolom tanggal
 *  di seluruh situs. */
function formatDate(value: string | null, locale: Locale): string {
  return value ? formatArticleDate(value, locale) : '—';
}

/** Merangkai potongan keterangan jadi satu baris, melewati yang kosong.
 *
 *  Dipakai karena formulir CMS tidak mewajibkan seluruh kolomnya: baris
 *  rehabilitasi yang cuma punya luas tetap menghasilkan kalimat yang benar,
 *  bukan "0,1 ha ·  · " dengan pemisah menggantung. */
function joinFacts(parts: (string | null)[]): string | null {
  const facts = parts.filter((part): part is string => part !== null && part !== '');
  return facts.length > 0 ? facts.join(' · ') : null;
}

function rehabilitationFacts(item: VillageRehabilitation, locale: Locale): string | null {
  return joinFacts([
    item.luas === null ? null : `${formatCount(item.luas, locale)} ha`,
    item.jumlahBibit === null ? null : `${formatCount(item.jumlahBibit, locale)} bibit`,
    // Angka 0 ikut ditampilkan, tidak disembunyikan seperti selisih di atas:
    // tingkat hidup 0% adalah hasil pemantauan, bukan ketiadaan data.
    item.survivalRate === null ? null : `tingkat hidup ${formatCount(item.survivalRate, locale)}%`,
    item.statusLahan === null ? null : `lahan ${item.statusLahan.toLowerCase()}`,
    item.pelaksana,
    item.kolaborator === null ? null : `bersama ${item.kolaborator}`,
  ]);
}

function trainingFacts(item: VillageTraining, locale: Locale): string | null {
  const rincian = joinFacts([
    item.pria === null ? null : `${formatCount(item.pria, locale)} pria`,
    item.wanita === null ? null : `${formatCount(item.wanita, locale)} wanita`,
    item.remaja === null ? null : `${formatCount(item.remaja, locale)} remaja`,
    item.lansia === null ? null : `${formatCount(item.lansia, locale)} lansia`,
    item.disabilitas === null ? null : `${formatCount(item.disabilitas, locale)} disabilitas`,
  ]);

  return joinFacts([
    item.peserta === null ? null : `${formatCount(item.peserta, locale)} peserta`,
    rincian === null ? null : `(${rincian})`,
  ]);
}

/** Kedalaman sarang -> indentasi label. Tiga tingkat pada data hari ini
 *  ("Dampak Ekonomi (Produksi)" -> "Perikanan Tangkap" -> "Lainnya"); tingkat
 *  keempat dari CMS memakai indentasi terdalam alih-alih kehilangan kelasnya,
 *  karena Tailwind tidak bisa menghitung nama kelas saat berjalan. */
const METRIC_INDENT = ['', 'ps-4', 'ps-7'] as const;

/** Segitiga buka-tutup. SVG sebaris, bukan <Icon>: tidak ada chevron di
 *  src/icons, dan ikon ini tidak dipakai di tempat lain. aria-hidden karena
 *  keadaannya sudah disampaikan aria-expanded tombolnya. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={cn('mt-[0.2em] size-3 shrink-0 transition-transform', open && 'rotate-90')}
    >
      <path
        d="M4.5 2.5 8 6l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type MetricRowsProps = {
  metrics: VillageMetric[];
  /** 0 untuk metrik puncak. Hanya menentukan indentasi -- sarangnya sendiri
   *  datang dari data, bukan dari angka ini. */
  depth: number;
  locale: Locale;
  openKeys: ReadonlySet<string>;
  onToggle: (key: string) => void;
};

/** Baris-baris satu tingkat, memanggil dirinya sendiri untuk rinciannya.
 *
 *  Rincian dirender sebagai <tr> BERSAUDARA, bukan tabel bersarang di dalam
 *  sel: hanya dengan begitu angka anak jatuh di kolom tahun yang sama dengan
 *  angka induknya. Konsekuensinya rincian tidak bisa dibungkus satu elemen,
 *  jadi tombolnya tidak memakai aria-controls (yang butuh satu id) -- cukup
 *  aria-expanded, yang memang tidak mewajibkannya.
 *
 *  Baris tertutup TIDAK dirender sama sekali, bukan disembunyikan dengan
 *  `hidden`: yang hilang saat ia dibuang cuma angka -- tidak ada posisi scroll
 *  atau isian form yang ikut terbuang. */
function MetricRows({ metrics, depth, locale, openKeys, onToggle }: MetricRowsProps): ReactNode {
  return (
    <>
      {metrics.map((metric) => {
        const hasChildren = metric.children.length > 0;
        const open = hasChildren && openKeys.has(metric.key);
        const indent = METRIC_INDENT[Math.min(depth, METRIC_INDENT.length - 1)];
        const label = metricLabel(metric);

        return (
          <Fragment key={metric.key}>
            <tr className="border-t border-border">
              {/* <th scope="row">, bukan <td>: pembaca layar mengumumkan nama
                  metriknya lagi saat pembaca berpindah ke kolom angkanya --
                  tanpa itu "3,1 M" dibacakan tanpa keterangan apa pun. */}
              <th
                scope="row"
                className={cn(
                  'py-2 pe-2 text-start align-top text-xs leading-snug font-normal text-fg',
                  indent,
                  // Metrik puncak yang beranak adalah judul kelompoknya; yang
                  // tanpa anak berdiri sendiri dan tidak perlu menonjol.
                  depth === 0 && hasChildren && 'font-bold text-primary',
                )}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => onToggle(metric.key)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-1 text-start hover:text-primary"
                  >
                    <Chevron open={open} />
                    <span>{label}</span>
                  </button>
                ) : (
                  // Perata selebar chevron: tanpa ini label baris tunggal
                  // menggantung di kiri label baris yang punya tombol.
                  <span className="flex items-start gap-1">
                    <span aria-hidden className="size-3 shrink-0" />
                    <span>{label}</span>
                  </span>
                )}

                {/* Ditaruh di dalam sel keterangan, bukan sebagai baris colSpan
                    sendiri: baris selebar tabel akan memotong kolom tahun
                    berjalan yang diberi latar penanda. */}
                {open && metric.childrenSumToTotal === false ? (
                  <span className="mt-1 block text-[0.6875rem] leading-snug font-normal text-muted">
                    Rincian bisa tumpang tindih, tidak selalu menjumlah.
                  </span>
                ) : null}
              </th>

              {/* Tahun pembanding: muted dan tidak tebal -- ia latar cerita,
                  bukan angka yang sedang dibaca. */}
              <td className="px-1 py-2 text-end align-top font-mono text-xs text-muted">
                {formatMetricCell(metric.lama, metric.decimals, locale)}
              </td>

              {/* Tahun berjalan: SATU-SATUNYA kolom yang berlatar, dan latarnya
                  menyambung sampai ke kepala tabel supaya terbaca sebagai satu
                  kolom penuh. Penandanya bukan warna teks saja (WCAG 1.4.1):
                  latar + tebal + judul kolom yang bertahun. */}
              <td className="bg-surface px-2 py-2 text-end align-top font-mono text-xs font-bold text-primary">
                {formatMetricCell(metric.baru, metric.decimals, locale)}
              </td>
            </tr>

            {open ? (
              <MetricRows
                metrics={metric.children}
                depth={depth + 1}
                locale={locale}
                openKeys={openKeys}
                onToggle={onToggle}
              />
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
}

/**
 * Tab Statistik: satu baris per metrik, dua kolom tahun.
 *
 * <table>, bukan kisi kartu seperti sebelumnya: begitu tiap metrik membawa
 * angka tahun lalu DAN tahun berjalan, isinya memang tabel -- dan tabel beneran
 * yang membuat pembaca layar mengumumkan "Total Nilai Ekonomi, 2025, 1,35 T"
 * saat berpindah sel, sesuatu yang tidak bisa ditiru tumpukan <div>.
 *
 * Keadaan buka-tutup dipegang di sini dan SENGAJA tidak direset saat pengunjung
 * berganti desa: kunci metriknya sama di semua desa, jadi kelompok yang tadi
 * dibuka tetap terbuka saat membandingkan desa berikutnya.
 */
function MetricTable({
  metrics,
  tahunBaru,
  tahunLama,
  locale,
  desa,
}: {
  metrics: VillageMetric[];
  tahunBaru: number | null;
  tahunLama: number | null;
  locale: Locale;
  desa: string;
}) {
  const [openKeys, setOpenKeys] = useState<ReadonlySet<string>>(() => new Set<string>());

  const toggle = (key: string) =>
    setOpenKeys((current) => {
      const next = new Set(current);
      // delete() mengembalikan false kalau kuncinya memang belum ada -- satu
      // panggilan untuk memeriksa sekaligus menghapus.
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    // table-fixed supaya lebar kolom ditentukan <th> di bawah, bukan oleh isi
    // sel terpanjang: tanpa itu kolom angka melar mengikuti "3,27 T" dan kolom
    // keterangan yang tersisa tinggal beberapa huruf per baris.
    <table className="w-full table-fixed border-collapse">
      <caption className="sr-only">
        Statistik Desa {desa}
        {tahunBaru === null ? '' : `, angka tahun ${tahunBaru}`}
        {tahunLama === null ? '' : ` dibandingkan tahun ${tahunLama}`}. Baris bertanda segitiga
        bisa dibuka untuk melihat rinciannya.
      </caption>

      {/* Kepala tabel melekat saat isinya digulung: begitu rincian dibuka,
          tabelnya lebih tinggi dari panel (area tabnya cuma ~200px), dan dua
          kolom angka tanpa tahunnya tidak bisa dibedakan.

          -top-5, bukan top-0: elemen sticky di dalam wadah scroll ber-padding
          berhenti di TEPI PADDING, jadi dengan top-0 baris yang lewat tetap
          terlihat di celah 20px (p-5) di atasnya. Offset negatif sebesar
          padding itu menarik kepala tabel sampai ke tepi wadah. */}
      <thead>
        <tr className="text-xs">
          <th
            scope="col"
            className="sticky -top-5 z-10 border-b border-border bg-bg py-2 pe-2 text-start font-bold tracking-wide text-muted uppercase"
          >
            Keterangan
          </th>
          <th
            scope="col"
            className="sticky -top-5 z-10 w-[4.25rem] border-b border-border bg-bg px-1 py-2 text-end font-mono font-bold text-muted"
          >
            {tahunLama ?? '—'}
          </th>
          <th
            scope="col"
            className="sticky -top-5 z-10 w-[4.75rem] border-b border-border bg-surface px-2 py-2 text-end font-mono font-bold text-primary"
          >
            {tahunBaru ?? '—'}
          </th>
        </tr>
      </thead>

      <tbody>
        <MetricRows
          metrics={metrics}
          depth={0}
          locale={locale}
          openKeys={openKeys}
          onToggle={toggle}
        />
      </tbody>
    </table>
  );
}

/** Pesan di dalam tab yang tidak punya isi. Kalimatnya menyebut APA yang belum
 *  ada, bukan "tidak ada data": desa tanpa catatan pelatihan dan desa yang
 *  gagal dimuat tidak boleh terbaca sama. */
function TabEmpty({ children }: { children: string }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>;
}

/** Daftar kegiatan untuk tab Rehabilitasi dan Pelatihan.
 *
 *  <ol>, bukan tumpukan <div>: keduanya urut waktu, dan pembaca layar
 *  mengumumkan "daftar, 4 butir" sehingga panjangnya diketahui sebelum
 *  dibacakan satu per satu. */
function ActivityList({
  items,
}: {
  items: { key: string; period: string; title: string; detail: string | null }[];
}) {
  return (
    <ol className="flex list-none flex-col gap-4 p-0">
      {items.map((item) => (
        <li key={item.key} className="border-s-2 border-border ps-3">
          {/* Periode duluan dan dicetak mono: mata menyusuri kolom tanggal di
              tepi kiri untuk mencari "kapan", bukan membaca tiap judul. */}
          <p className="font-mono text-xs text-secondary">{item.period}</p>
          <p className="mt-0.5 text-sm leading-snug font-bold text-primary">{item.title}</p>
          {item.detail ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * Panel detail desa di sisi kanan peta Our Impact.
 *
 * Isinya datang dari `/ext/coast/desa/{desa_kode}` lewat Server Action (lihat
 * ImpactVillageMap), bukan dari berkas contoh seperti sebelumnya. Yang berubah
 * karena itu: panel punya keadaan MEMUAT dan GAGAL, dan kepala panel dirender
 * dari entri daftar (yang sudah ada di klien) supaya nama desa muncul seketika
 * sementara angkanya menyusul.
 *
 * Tingginya dikunci oleh baris di ImpactVillageMap, bukan oleh isinya: tab
 * "Deskripsi" dan "Statistik" punya panjang yang jauh berbeda, dan tanpa kunci
 * itu peta di sebelahnya ikut memanjang-memendek tiap kali tab diganti.
 * Konsekuensinya isi tab yang panjang harus bisa di-scroll SENDIRI -- itu
 * bagian `overflow-y-auto` + `tabIndex={0}` di bawah, yang membuat area scroll
 * juga bisa dicapai keyboard (kalau tidak, isinya terjebak bagi yang tidak
 * memakai tetikus).
 *
 * Pola tabnya mengikuti ARIA Authoring Practices "tabs with automatic
 * activation": panah kiri/kanan langsung mengganti panel, Tab keluar dari
 * bilah tab menuju isinya. Yang tidak terpilih dikeluarkan dari urutan tab
 * (`tabIndex={-1}`) supaya bilah ini satu perhentian Tab, bukan empat.
 */
export function VillageDetailPanel({
  village,
  detail,
  status,
  locale,
  className,
  emptyTitle = 'Belum ada desa dipilih',
  emptyHint = 'Pilih desa lewat pencarian di atas peta untuk melihat foto kegiatan, lokasi, dan capaian programnya.',
  ariaLabel = 'Detail desa terpilih',
}: VillageDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('statistik');
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabId = (id: TabId) => `${baseId}-tab-${id}`;
  const panelId = (id: TabId) => `${baseId}-panel-${id}`;

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    // Home/End ikut ditangani karena keduanya bagian dari pola ARIA-nya; tanpa
    // itu keduanya menggulung halaman di belakang panel, bukan memindah tab.
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % TABS.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + TABS.length) % TABS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? TABS.length - 1
              : null;

    if (next === null) return;

    event.preventDefault();
    setActiveTab(TABS[next].id);
    // Fokus dipindah manual: tab yang tidak terpilih ber-tabIndex -1, jadi
    // browser tidak akan memindahkannya sendiri.
    tabRefs.current[next]?.focus();
  };

  if (!village) {
    return (
      <aside
        aria-label={ariaLabel}
        className={cn(
          'flex min-h-0 flex-col overflow-hidden border-t border-border bg-bg lg:border-t-0 lg:border-s',
          className,
        )}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm font-bold text-primary">{emptyTitle}</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">{emptyHint}</p>
        </div>
      </aside>
    );
  }

  const photo = detail?.gambar[0] ?? null;
  const paragraphs = (detail?.gambar ?? [])
    .map((image) => image.keterangan)
    .filter((keterangan): keterangan is string => keterangan !== null);

  // Satu kalimat yang menggantikan SELURUH isi tab saat detailnya tidak ada.
  // Dihitung sekali di sini, bukan diulang di empat tab.
  const fallbackMessage =
    status === 'loading'
      ? 'Memuat data desa…'
      : status === 'error'
        ? 'Gagal memuat data desa. Pilih ulang desanya untuk mencoba lagi.'
        : 'Data desa ini belum tersedia di sistem pendataan.';

  const hasDetail = status === 'ready' && detail !== null;

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden border-t border-border bg-bg lg:border-t-0 lg:border-s',
        className,
      )}
    >
      {/* --- Foto kegiatan ---
          Rasionya dikunci, bukan mengikuti gambar: foto CMS datang dengan
          rasio macam-macam, dan tinggi blok foto yang ikut berubah akan
          menaruh bilah tab di posisi berbeda tiap desa. Kotaknya tetap
          dirender saat fotonya belum ada supaya tata letak tidak melompat
          begitu detailnya mendarat. */}
      <div className="relative aspect-[16/9] w-full shrink-0 bg-surface">
        {photo ? (
          <Image
            src={photo.url}
            // Keterangan CMS adalah paragraf profil desa (ia mengisi tab
            // Deskripsi), bukan deskripsi rupa fotonya -- memakainya sebagai
            // alt akan membacakan satu paragraf penuh sebagai nama gambar.
            alt={`Foto Desa ${village.desa}`}
            fill
            // Panelnya selebar 22rem di >= lg dan selebar layar di bawahnya.
            // Tanpa ini Next menganggapnya selebar viewport dan mengunduh
            // berkas jauh lebih besar dari yang benar-benar dipakai -- foto
            // desa dari CMS berukuran ~2,6 MB.
            sizes="(min-width: 64rem) 22rem, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      {/* --- Lokasi desa ---
          Dirender dari entri DAFTAR, bukan dari detail: nama dan wilayahnya
          sudah ada di klien sejak halaman dimuat, jadi kepala panel tidak
          perlu menunggu permintaan detail selesai. */}
      <div className="shrink-0 border-b border-border p-5">
        <h2 className="text-xl leading-tight font-bold text-primary">Desa {village.desa}</h2>

        {/* <dl>, bukan tiga baris teks: hubungan label-nilai ("Kecamatan"
            -> "Kandeman") ikut terbaca pembaca layar. Labelnya juga yang
            membuat dua baris bernama sama tidak membingungkan -- ada
            kecamatan DAN kabupaten yang sama-sama bernama Brebes. */}
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-muted">Kecamatan</dt>
          <dd className="font-bold text-fg">{village.kecamatan}</dd>

          <dt className="text-muted">Kota/Kabupaten</dt>
          <dd className="font-bold text-fg">{village.kabupaten}</dd>

          <dt className="text-muted">Provinsi</dt>
          <dd className="font-bold text-fg">{village.provinsi}</dd>
        </dl>

        {/* Dasar angkanya disebut, bukan disembunyikan: seluruh isi panel ini
            berasal dari sejumlah formulir pendataan terverifikasi, dan
            pembaca berhak tahu berapa banyak dan sampai kapan. */}
        {village.jumlahForm > 0 ? (
          <p className="mt-3 text-xs text-muted">
            {formatCount(village.jumlahForm, locale)} formulir pendataan
            {village.pendataanTerakhir
              ? ` · terakhir ${formatDate(village.pendataanTerakhir, locale)}`
              : ''}
          </p>
        ) : null}
      </div>

      {/* --- Bilah tab --- */}
      <div
        role="tablist"
        aria-label="Kategori informasi desa"
        className="flex shrink-0 overflow-x-auto border-b border-border"
      >
        {TABS.map((tab, index) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={selected}
              aria-controls={panelId(tab.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                // -mb-px menaruh garis tab TEPAT di atas garis bawah bilah,
                // bukan menumpuknya jadi dua garis setebal 3px.
                '-mb-px flex-1 border-b-2 px-2 py-3 text-xs font-bold whitespace-nowrap transition-colors',
                // Keadaan terpilih TIDAK ditandai warna saja: garis
                // bawahnya yang jadi penanda bentuk (WCAG 1.4.1), dan
                // aria-selected yang menyampaikannya ke pembaca layar.
                selected
                  ? 'border-secondary text-primary'
                  : 'border-transparent text-muted hover:text-primary',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- Isi tab ---
          Keempat panel dirender lalu disembunyikan dengan `hidden`, bukan
          dibuat-dibuang saat tab berganti: posisi scroll tiap tab bertahan,
          dan `aria-controls` di atas selalu menunjuk elemen yang benar-benar
          ada di DOM.

          aria-busy dipasang saat memuat supaya pembaca layar tahu isinya
          sedang berubah, bukan diam karena kosong. */}
      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={panelId(tab.id)}
          aria-labelledby={tabId(tab.id)}
          aria-busy={status === 'loading'}
          hidden={tab.id !== activeTab}
          // Bisa difokus karena ia area scroll: pengguna keyboard butuh
          // perhentian di sini untuk menggulung isinya dengan panah.
          tabIndex={0}
          className="min-h-0 flex-1 overflow-y-auto p-5"
        >
          {!hasDetail || detail === null ? (
            <TabEmpty>{fallbackMessage}</TabEmpty>
          ) : (
            <>
              {tab.id === 'statistik' &&
                (detail.metrik.length === 0 ? (
                  <TabEmpty>Belum ada angka yang tercatat untuk desa ini.</TabEmpty>
                ) : (
                  <MetricTable
                    metrics={detail.metrik}
                    tahunBaru={detail.tahunBaru}
                    tahunLama={detail.tahunLama}
                    locale={locale}
                    desa={village.desa}
                  />
                ))}

              {tab.id === 'deskripsi' &&
                (paragraphs.length === 0 ? (
                  <TabEmpty>Profil desa ini belum ditulis di sistem pendataan.</TabEmpty>
                ) : (
                  <div className="flex flex-col gap-3">
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)} className="text-sm leading-relaxed text-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}

              {tab.id === 'rehabilitasi' &&
                (detail.rehabilitasi.length === 0 ? (
                  <TabEmpty>Belum ada kegiatan rehabilitasi yang tercatat di desa ini.</TabEmpty>
                ) : (
                  <ActivityList
                    items={detail.rehabilitasi.map((item, index) => ({
                      // Tanggal saja tidak cukup jadi kunci: satu desa bisa
                      // punya dua baris rehabilitasi pada tanggal yang sama
                      // untuk ekosistem berbeda.
                      key: `${item.tanggal ?? 'tanpa-tanggal'}-${index}`,
                      period: formatDate(item.tanggal, locale),
                      title: item.ekosistem ?? 'Rehabilitasi',
                      detail: rehabilitationFacts(item, locale),
                    }))}
                  />
                ))}

              {tab.id === 'pelatihan' &&
                (detail.pelatihan.length === 0 ? (
                  <TabEmpty>Belum ada pelatihan yang tercatat di desa ini.</TabEmpty>
                ) : (
                  <ActivityList
                    items={detail.pelatihan.map((item, index) => ({
                      key: `${item.tanggal ?? 'tanpa-tanggal'}-${index}`,
                      period: formatDate(item.tanggal, locale),
                      title: item.nama ?? 'Pelatihan',
                      detail: trainingFacts(item, locale),
                    }))}
                  />
                ))}
            </>
          )}
        </div>
      ))}
    </aside>
  );
}
