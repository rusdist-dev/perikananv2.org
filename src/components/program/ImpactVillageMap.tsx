'use client';

import { useMemo, useState } from 'react';

import { Container } from '@/components/layout/Container';
import { SearchableSelect, type SearchableOption } from '@/components/ui/SearchableSelect';
import { IndonesiaMap, type MapFocus, type MapMarker } from '@/components/program/IndonesiaMap';
import { VillageDetailPanel } from '@/components/program/VillageDetailPanel';
import { IMPACT_VILLAGES } from '@/data/impact-villages';

/** Disusun sekali di scope modul, bukan di dalam komponen: IndonesiaMap membaca
 *  daftar ini saat peta dibuat, dan array baru di tiap render tidak akan
 *  terbaca -- selain memberi kesan keliru bahwa isinya bisa berubah. */
const VILLAGE_MARKERS: MapMarker[] = IMPACT_VILLAGES.map((village) => ({
  id: village.id,
  lat: village.lat,
  lng: village.lng,
  // Awalan "Desa" ikut, dengan alasan yang sama seperti pada daftar pilihan.
  label: `Desa ${village.desa}`,
}));

type ImpactVillageMapProps = {
  selectLabel?: string;
  placeholder?: string;
  hint?: string;
  emptyLabel?: string;
  clearLabel?: string;
  mapAriaLabel?: string;
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
  selectLabel = 'Find a village',
  placeholder = 'Search by village, regency, or province',
  hint = 'Select a village from the list, or click a marker on the map.',
  emptyLabel = 'No village matches your search',
  clearLabel = 'Clear selection',
  mapAriaLabel = 'Interactive map of FRCI village work areas across Indonesia',
}: ImpactVillageMapProps) {
  const [villageId, setVillageId] = useState<string | null>(null);

  const options = useMemo<SearchableOption[]>(
    () =>
      IMPACT_VILLAGES.map((village) => ({
        value: village.id,
        // Awalan "Desa" ikut dicetak, bukan cuma namanya: "Les" atau "Bahoi"
        // sendirian tidak terbaca sebagai nama tempat.
        label: `Desa ${village.desa}`,
        description: `${village.kabupaten}, ${village.provinsi}`,
      })),
    [],
  );

  const village = useMemo(
    () => IMPACT_VILLAGES.find((item) => item.id === villageId) ?? null,
    [villageId],
  );

  // Di-memo karena IndonesiaMap menggerakkan peta setiap kali IDENTITAS objek
  // ini berganti. Objek literal baru di tiap render akan memicu flyTo ke titik
  // yang sama berulang-ulang -- termasuk saat pengguna sedang menggeser peta.
  const focus = useMemo<MapFocus | null>(
    () =>
      village
        ? { lat: village.lat, lng: village.lng, label: `Desa ${village.desa}` }
        : null,
    [village],
  );

  return (
    <>
      <Container className="page-gutter lg:pe-(--spacing-panel-gutter)">
        <SearchableSelect
          label={selectLabel}
          options={options}
          value={villageId}
          onChange={setVillageId}
          placeholder={placeholder}
          hint={
            village
              ? `Showing ${village.desa}, ${village.kabupaten}, ${village.provinsi}.`
              : hint
          }
          emptyLabel={emptyLabel}
          clearLabel={clearLabel}
          resultsLabel={(count) => `${count} villages available`}
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
            ariaLabel={mapAriaLabel}
            focus={focus}
            markers={VILLAGE_MARKERS}
            // Klik penanda bermuara ke state yang SAMA dengan dropdown, bukan
            // ke jalur tampilan tersendiri: satu sumber kebenaran berarti peta,
            // teks bantuan, dan panel detail tidak bisa saling berbeda soal
            // desa mana yang sedang dibuka.
            onMarkerSelect={setVillageId}
            className="h-[380px] md:h-[520px] lg:h-full"
          />
        </div>

        <VillageDetailPanel village={village} className="w-full lg:w-[22rem] lg:shrink-0" />
      </Container>
    </>
  );
}
