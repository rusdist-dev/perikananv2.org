'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Container } from '@/components/layout/Container';
import { SearchableSelect, type SearchableOption } from '@/components/ui/SearchableSelect';
import {
  IndonesiaMap,
  type BasemapId,
  type MapFocus,
  type MapMarker,
  type MapShape,
} from '@/components/program/IndonesiaMap';
import {
  VillageDetailPanel,
  type VillageDetailStatus,
} from '@/components/program/VillageDetailPanel';
import { fetchVillageDetail } from '@/app/[locale]/discover/our-impact/actions';
// Kotak warna keterangan di bawah peta memakai token yang sama dengan
// poligonnya (--map-mpa / --map-mpa-hl), dan token itu didefinisikan per tema
// di berkas ini. Mengimpornya di sini, bukan menyalin warnanya jadi kelas
// Tailwind, supaya keterangan dan peta tidak bisa berbeda warna.
import '@/components/program/IndonesiaMap.css';
import type { Locale } from '@/i18n/config';
import { getImpactDictionary } from '@/i18n/dictionaries/impact';
import type { ImpactVillage, VillageDetail } from '@/lib/content';
import { formatNumber } from '@/lib/number';

type ImpactVillageMapProps = {
  /** Daftar desa dari CMS, sudah terurut barat -> timur oleh
   *  getImpactVillages(). Diterima sebagai prop dari server component, bukan
   *  diambil sendiri di klien: daftarnya sudah ada saat HTML dikirim, jadi
   *  dropdown dan penanda peta tidak berkedip kosong dulu, dan kunci API CMS
   *  tetap di server. */
  villages: ImpactVillage[];
  /** `id_mpa` kawasan konservasi tempat program bekerja, dari CMS. Poligonnya
   *  sendiri tetap datang dari public/geo/conservation-areas.json -- daftar ini
   *  cuma menentukan mana yang diwarnai sebagai kawasan intervensi.
   *
   *  Array kosong = tidak ada yang ditandai, dan peta tetap menggambar seluruh
   *  kawasan seperti sebelumnya. Itu juga yang terjadi kalau CMS-nya sedang
   *  tidak bisa dihubungi: petanya kehilangan penanda, bukan isinya. */
  interventionMpaIds?: readonly string[];
  locale: Locale;
  selectLabel?: string;
  placeholder?: string;
  hint?: string;
  emptyLabel?: string;
  clearLabel?: string;
  mapAriaLabel?: string;
  /** Basemap yang dinyalakan SAAT sebuah desa dipilih. 'imagery' (bawaan)
   *  memperlihatkan tambak, mangrove, dan garis pantai sungguhan di dalam batas
   *  desa; 'light' mempertahankan tampilan netral situs. Ganti di sini, bukan
   *  di IndonesiaMap -- ini keputusan halaman, bukan kemampuan peta. */
  basemap?: BasemapId;
};

/**
 * Peta Our Impact beserta pemilih desanya.
 *
 * Ada sebagai komponen tersendiri karena hanya BAGIAN INI yang butuh state:
 * halaman /discover/our-impact tetap server component, dan JavaScript yang
 * dikirim ke browser terbatas pada pemilih + peta, bukan seluruh halaman.
 *
 * Pemilihnya dibungkus Container sementara petanya tidak: teks harus sejajar
 * dengan judul halaman dan menyisakan gutter kanan untuk panel navigasi,
 * sedangkan peta memang dimaksudkan selebar viewport.
 */
export function ImpactVillageMap({
  villages,
  interventionMpaIds = [],
  locale,
  selectLabel,
  placeholder,
  hint,
  emptyLabel,
  clearLabel,
  mapAriaLabel,
  basemap = 'imagery',
}: ImpactVillageMapProps) {
  // Teks bawaan mengikuti locale halaman; prop di atas tetap bisa menimpanya.
  const t = getImpactDictionary(locale);
  const [kode, setKode] = useState<string | null>(null);
  const [detail, setDetail] = useState<VillageDetail | null>(null);
  const [status, setStatus] = useState<VillageDetailStatus>('idle');

  /** Detail yang sudah pernah diambil, selama halaman ini terbuka.
   *
   *  Tanpa ini, kembali ke desa yang barusan dilihat memanggil Server Action
   *  lagi dan panelnya berkedip "Memuat…" untuk data yang sudah dipegang --
   *  dan membandingkan dua desa berarti bolak-balik yang tiap langkahnya
   *  menunggu jaringan.
   *
   *  Umurnya sengaja sepanjang halaman dibuka, bukan lebih: kesegaran data
   *  diatur `revalidate` di sisi server (lihat CACHE_TTL_SECONDS di
   *  lib/content/source.ts), dan muat ulang halaman mengosongkannya. `null`
   *  ikut disimpan -- "desa ini memang tidak punya detail" adalah jawaban yang
   *  sama sahihnya untuk di-cache. */
  const cache = useRef(new Map<string, VillageDetail | null>());

  const village = useMemo(
    () => villages.find((item) => item.kode === kode) ?? null,
    [villages, kode],
  );

  useEffect(() => {
    if (!kode) {
      setDetail(null);
      setStatus('idle');
      return;
    }

    const cached = cache.current.get(kode);
    if (cached !== undefined) {
      setDetail(cached);
      setStatus(cached ? 'ready' : 'empty');
      return;
    }

    // Penjaga balapan: pilihan yang berganti sebelum permintaan sebelumnya
    // selesai akan membuat jawaban yang datang belakangan menimpa yang benar.
    // Tanpa ini, klik cepat A -> B bisa berakhir dengan detail A terpampang di
    // bawah nama desa B -- kegagalan yang terlihat persis seperti data salah.
    let active = true;
    setDetail(null);
    setStatus('loading');

    fetchVillageDetail(kode)
      .then((result) => {
        if (!active) return;
        cache.current.set(kode, result);
        setDetail(result);
        setStatus(result ? 'ready' : 'empty');
      })
      .catch(() => {
        if (!active) return;
        // Kegagalannya TIDAK di-cache: ia keadaan sesaat (jaringan putus, CMS
        // sedang di-restart), dan menyimpannya berarti memilih ulang desa itu
        // selamanya menampilkan galat tanpa pernah mencoba lagi.
        setDetail(null);
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [kode]);

  const options = useMemo<SearchableOption[]>(
    () =>
      villages.map((item) => ({
        value: item.kode,
        // Awalan "Desa" ikut dicetak, bukan cuma namanya: "Bulu" atau "Ayah"
        // sendirian tidak terbaca sebagai nama tempat.
        label: t.villageName(item.desa),
        description: `${item.kabupaten}, ${item.provinsi}`,
      })),
    [villages, t],
  );

  /** Disusun di useMemo, bukan di scope modul seperti dulu: daftarnya sekarang
   *  datang dari CMS lewat prop, jadi ia tidak bisa lagi dihitung sekali saat
   *  berkas ini dimuat. IndonesiaMap membaca daftar ini saat peta dibuat, dan
   *  array baru di tiap render akan membuatnya bekerja ulang tanpa alasan.
   *
   *  Desa tanpa koordinat dikeluarkan di sini -- dan HANYA di sini: ia tetap
   *  ada di dropdown dan tetap bisa dibuka panelnya (lihat komentar lat/lng di
   *  impactVillageSchema), yang tidak ada cuma penandanya di peta. */
  const markers = useMemo<MapMarker[]>(
    () =>
      villages
        .filter((item) => item.lat !== null && item.lng !== null)
        .map((item) => ({
          id: item.kode,
          lat: item.lat as number,
          lng: item.lng as number,
          label: t.villageName(item.desa),
        })),
    [villages, t],
  );

  /** Batas wilayah desa terpilih, dari detail yang baru saja diambil.
   *
   *  Di-memo dengan alasan yang sama seperti `focus` di bawah: peta membingkai
   *  ulang setiap kali IDENTITAS nilai ini berganti, dan `detail.batas` adalah
   *  array baru di tiap render kalau tidak dikunci ke `detail`.
   *
   *  null selama detailnya dimuat, dan juga untuk desa yang batas wilayahnya
   *  belum digambar di CMS -- peta menampilkan penandanya saja, tanpa poligon. */
  const shape = useMemo<MapShape | null>(
    () => (detail && detail.batas.length > 0 ? detail.batas : null),
    [detail],
  );

  // Di-memo karena IndonesiaMap menggerakkan peta setiap kali IDENTITAS objek
  // ini berganti. Objek literal baru di tiap render akan memicu flyTo ke titik
  // yang sama berulang-ulang -- termasuk saat pengguna sedang menggeser peta.
  const focus = useMemo<MapFocus | null>(
    () =>
      village && village.lat !== null && village.lng !== null
        ? { lat: village.lat, lng: village.lng, label: t.villageName(village.desa) }
        : null,
    [village, t],
  );

  return (
    <>
      <Container className="page-gutter lg:pe-(--spacing-panel-gutter)">
        <SearchableSelect
          label={selectLabel ?? t.selectLabel}
          options={options}
          value={kode}
          onChange={setKode}
          placeholder={placeholder ?? t.selectPlaceholder}
          hint={
            village
              ? t.selectShowing(village.desa, village.kabupaten, village.provinsi)
              : (hint ?? t.selectHint)
          }
          emptyLabel={emptyLabel ?? t.selectEmpty}
          clearLabel={clearLabel ?? t.selectClear}
          resultsLabel={(count) => t.selectResults(formatNumber(count, locale))}
          className="max-w-md"
        />
      </Container>

      {/* Peta + panel detail sebagai SATU baris dengan tinggi yang dipatok di
          sini, bukan dua blok yang masing-masing setinggi isinya: itulah yang
          membuat panel "setinggi peta" tetap benar saat tab berganti isi.
          Petanya lalu h-full dan panelnya menggulung isinya sendiri.

          Di bawah lg keduanya menumpuk (panel di bawah peta) dan tingginya
          dilepas kembali ke isi: panel setinggi 620px di layar 390px praktis
          menjadi satu layar penuh yang harus dilewati sebelum halaman lanjut. */}
      <Container className="page-gutter mt-8 flex w-full flex-col lg:h-[620px] lg:flex-row">
        <div className="min-w-0 flex-1">
          {/* Preset 'light', bukan 'brand': kontainer peta kini transparan
              (lihat IndonesiaMap.css), jadi lautnya adalah latar halaman ini
              -- putih, bukan --color-primary. Dengan palet brand di atas
              putih, negara tetangga jadi blok navy yang lebih menonjol dari
              subjeknya dan kawasan konservasi (secondary 32% + putih) nyaris
              lenyap. Preset 'light' memang disiapkan untuk section terang. */}
          <IndonesiaMap
            theme="light"
            locale={locale}
            ariaLabel={mapAriaLabel ?? t.mapAriaLabel}
            focus={focus}
            shape={shape}
            // Menyala mengikuti PILIHAN, bukan mengikuti `shape`: basemap sudah
            // berguna sejak peta mendekat ke desanya, dan menunggu batas desa
            // tiba berarti citranya baru muncul setelah gerakan kedua selesai --
            // terlihat seperti peta yang berubah sendiri tanpa sebab.
            //
            // Konsekuensinya juga disengaja: kunjungan yang tidak memilih desa
            // sama sekali tidak pernah menghubungi Esri.
            basemap={village ? basemap : null}
            markers={markers}
            interventionMpaIds={interventionMpaIds}
            // Dinaikkan dari bawaan 9 khusus halaman ini: batas desa dari CMS
            // adalah satu-satunya bentuk presisi di peta ini, dan pada zoom 9
            // satu desa cuma selebar beberapa piksel. 13 kira-kira 19 m/piksel
            // -- desa terkecil di daftar ini masih memenuhi sebagian kanvas,
            // dan generalisasi garis pantai di sekitarnya belum mengganggu.
            maxZoom={13}
            // Klik penanda bermuara ke state yang SAMA dengan dropdown, bukan
            // ke jalur tampilan tersendiri: satu sumber kebenaran berarti peta,
            // teks bantuan, dan panel detail tidak bisa saling berbeda soal
            // desa mana yang sedang dibuka.
            onMarkerSelect={setKode}
            className="h-[380px] md:h-[520px] lg:h-full"
          />
        </div>

        <VillageDetailPanel
          village={village}
          detail={detail}
          status={status}
          locale={locale}
          className="w-full lg:w-[22rem] lg:shrink-0"
        />
      </Container>

      {/* Keterangan warna. Ada karena peta ini memakai warna untuk membedakan
          dua hal yang tidak bisa ditebak dari bentuknya -- dan warna tanpa
          keterangan cuma bisa dibaca oleh yang sudah tahu jawabannya.

          Kotak warnanya aria-hidden dan artinya ditulis sebagai teks di
          sebelahnya: pembaca layar membaca "Kawasan intervensi", bukan
          "gambar". Hanya muncul kalau memang ada yang ditandai. */}
      {interventionMpaIds.length > 0 ? (
        <Container className="page-gutter mt-4 lg:pe-(--spacing-panel-gutter)">
          {/* data-map-theme="light" bukan hiasan: token --map-mpa dan
              --map-mpa-hl didefinisikan PER TEMA di IndonesiaMap.css, jadi
              tanpa atribut ini kotak warnanya tidak mewarisi apa pun dan
              tampil kosong. Nilainya harus sama dengan theme peta di atas. */}
          <ul
            data-map-theme="light"
            className="flex list-none flex-wrap items-center gap-x-5 gap-y-2 p-0 text-xs text-muted"
          >
            <li className="flex items-center gap-2">
              <span aria-hidden className="map-legend-swatch map-legend-swatch-intervention" />
              {t.legendIntervention(formatNumber(interventionMpaIds.length, locale))}
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="map-legend-swatch" />
              {t.legendOther}
            </li>
          </ul>
        </Container>
      ) : null}
    </>
  );
}
