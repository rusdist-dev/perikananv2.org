'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { cn } from '@/lib/cn';
import type { ImpactVillage } from '@/data/impact-villages';
import { getVillageDetail, type VillageActivity } from '@/data/village-detail';

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

type VillageDetailPanelProps = {
  /** `null` berarti belum ada desa yang dipilih. Panelnya TETAP dirender dalam
   *  keadaan itu, bukan disembunyikan: panel yang muncul dan hilang menggeser
   *  lebar peta di sebelahnya, dan Leaflet harus memproyeksi ulang seluruh
   *  isinya setiap kali orang mengganti pilihan. */
  village: ImpactVillage | null;
  className?: string;
  emptyTitle?: string;
  emptyHint?: string;
  ariaLabel?: string;
};

/** Daftar kegiatan untuk tab Rehabilitasi dan Pelatihan.
 *
 *  <ol>, bukan tumpukan <div>: keduanya urut waktu, dan pembaca layar
 *  mengumumkan "daftar, 4 butir" sehingga panjangnya diketahui sebelum
 *  dibacakan satu per satu. */
function ActivityList({ items }: { items: VillageActivity[] }) {
  return (
    <ol className="flex list-none flex-col gap-4 p-0">
      {items.map((item) => (
        <li key={`${item.period}-${item.title}`} className="border-s-2 border-border ps-3">
          {/* Periode duluan dan dicetak mono: mata menyusuri kolom tahun di
              tepi kiri untuk mencari "kapan", bukan membaca tiap judul. */}
          <p className="font-mono text-xs text-secondary">{item.period}</p>
          <p className="mt-0.5 text-sm leading-snug font-bold text-primary">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * Panel detail desa di sisi kanan peta Our Impact.
 *
 * Tingginya dikunci oleh baris di ImpactVillageMap, bukan oleh isinya: tab
 * "Deskripsi" dan "Rehabilitasi" punya panjang yang jauh berbeda, dan tanpa
 * kunci itu peta di sebelahnya ikut memanjang-memendek tiap kali tab diganti.
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
  className,
  emptyTitle = 'Belum ada desa dipilih',
  emptyHint = 'Pilih desa lewat pencarian di atas peta untuk melihat foto kegiatan, lokasi, dan capaian programnya.',
  ariaLabel = 'Detail desa terpilih',
}: VillageDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('statistik');
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const detail = village ? getVillageDetail(village.id) : null;

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

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden border-t border-border bg-bg lg:border-t-0 lg:border-s',
        className,
      )}
    >
      {!village || !detail ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm font-bold text-primary">{emptyTitle}</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">{emptyHint}</p>
        </div>
      ) : (
        <>
          {/* --- Foto kegiatan ---
              Rasionya dikunci, bukan mengikuti gambar: foto pengganti nanti
              datang dengan rasio macam-macam, dan tinggi blok foto yang ikut
              berubah akan menaruh bilah tab di posisi berbeda tiap desa. */}
          <div className="relative aspect-[16/9] w-full shrink-0 bg-surface">
            <Image
              src={detail.photo}
              alt={detail.photoAlt}
              fill
              // Panelnya selebar 22rem di >= lg dan selebar layar di bawahnya.
              // Tanpa ini Next menganggapnya selebar viewport dan mengunduh
              // berkas jauh lebih besar dari yang benar-benar dipakai.
              sizes="(min-width: 64rem) 22rem, 100vw"
              className="object-cover"
            />
          </div>

          {/* --- Lokasi desa --- */}
          <div className="shrink-0 border-b border-border p-5">
            <h2 className="text-xl leading-tight font-bold text-primary">Desa {village.desa}</h2>

            {/* <dl>, bukan tiga baris teks: hubungan label-nilai ("Kecamatan"
                -> "Paloh") ikut terbaca pembaca layar. Labelnya juga yang
                membuat dua baris bernama sama tidak membingungkan -- ada
                kecamatan DAN kabupaten yang sama-sama bernama Rembang. */}
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted">Kecamatan</dt>
              <dd className="font-bold text-fg">{village.kecamatan}</dd>

              <dt className="text-muted">Kota/Kabupaten</dt>
              <dd className="font-bold text-fg">{village.kabupaten}</dd>

              <dt className="text-muted">Provinsi</dt>
              <dd className="font-bold text-fg">{village.provinsi}</dd>
            </dl>
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
              ada di DOM. */}
          {TABS.map((tab) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={panelId(tab.id)}
              aria-labelledby={tabId(tab.id)}
              hidden={tab.id !== activeTab}
              // Bisa difokus karena ia area scroll: pengguna keyboard butuh
              // perhentian di sini untuk menggulung isinya dengan panah.
              tabIndex={0}
              className="min-h-0 flex-1 overflow-y-auto p-5"
            >
              {tab.id === 'statistik' && (
                // gap-px di atas latar border: garis kisi dibuat oleh celah
                // yang menembus ke latar, jadi tidak ada border ganda di
                // pertemuan dua kartu.
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
                  {detail.stats.map((stat) => (
                    <div key={stat.label} className="bg-bg p-3">
                      <dt className="text-xs leading-snug tracking-wide text-muted uppercase">
                        {stat.label}
                      </dt>
                      <dd className="mt-1.5">
                        <span className="font-mono text-xl leading-none text-primary">
                          {stat.value}
                        </span>{' '}
                        <span className="font-mono text-xs text-muted">{stat.unit}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {tab.id === 'deskripsi' && (
                <div className="flex flex-col gap-3">
                  {detail.description.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-sm leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {tab.id === 'rehabilitasi' && <ActivityList items={detail.rehabilitation} />}

              {tab.id === 'pelatihan' && <ActivityList items={detail.training} />}
            </div>
          ))}
        </>
      )}
    </aside>
  );
}
