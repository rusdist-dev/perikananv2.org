import type { Locale } from '../config';

/**
 * Teks halaman Our Impact (/discover/our-impact): pemilih desa, peta, panel
 * detail desa, dan pita totalan.
 *
 * Kamus tersendiri, TIDAK digabung ke Dictionary umum (dictionary.ts), karena
 * dua alasan: banyak entrinya fungsi yang menyisipkan nama atau angka ke
 * kalimat, dan sebagian besar pemakainya komponen KLIEN (peta, panel desa) --
 * berkas sekecil ini yang ikut ke browser, bukan seluruh kamus situs.
 *
 * Angka yang disisipkan SUDAH diformat pemanggil (lib/number.ts) dengan locale
 * yang sama. Isi dari CMS -- nama desa/wilayah, label metrik, nama kegiatan,
 * status lahan -- tidak ada di sini: CMS hanya menyediakannya dalam bahasa
 * Indonesia, dan teks itu ditampilkan apa adanya.
 *
 * `en` diketik `typeof id`, jadi entri yang ada di satu bahasa tapi hilang di
 * bahasa lain gagal saat typecheck.
 */
const id = {
  /* --- Pemilih desa & peta --- */
  selectLabel: 'Cari desa',
  selectPlaceholder: 'Cari nama desa, kabupaten, atau provinsi',
  selectHint: 'Pilih desa dari daftar, atau klik penanda di peta.',
  selectShowing: (desa: string, kabupaten: string, provinsi: string) =>
    `Menampilkan ${desa}, ${kabupaten}, ${provinsi}.`,
  selectEmpty: 'Tidak ada desa yang cocok dengan pencarian',
  selectClear: 'Hapus pilihan',
  selectResults: (count: string) => `${count} desa tersedia`,
  mapAriaLabel: 'Peta interaktif wilayah kerja desa FRCI di Indonesia',
  legendIntervention: (count: string) => `Kawasan intervensi (${count})`,
  legendOther: 'Kawasan konservasi lain',
  /** Nama tampilan desa. "Desa" ikut dicetak: "Bulu" atau "Ayah" sendirian
   *  tidak terbaca sebagai nama tempat. */
  villageName: (desa: string) => `Desa ${desa}`,

  /* --- Panel detail desa --- */
  panelAriaLabel: 'Detail desa terpilih',
  panelEmptyTitle: 'Belum ada desa dipilih',
  panelEmptyHint:
    'Pilih desa lewat pencarian di atas peta untuk melihat foto kegiatan, lokasi, dan capaian programnya.',
  photoAlt: (desa: string) => `Foto Desa ${desa}`,
  district: 'Kecamatan',
  regency: 'Kota/Kabupaten',
  province: 'Provinsi',
  formCount: (count: string) => `${count} formulir pendataan`,
  latest: (date: string) => `terakhir ${date}`,
  tablistLabel: 'Kategori informasi desa',
  tabs: {
    statistik: 'Statistik',
    deskripsi: 'Deskripsi',
    rehabilitasi: 'Rehabilitasi',
    pelatihan: 'Pelatihan',
  },
  loading: 'Memuat data desa…',
  loadError: 'Gagal memuat data desa. Pilih ulang desanya untuk mencoba lagi.',
  notAvailable: 'Data desa ini belum tersedia di sistem pendataan.',
  emptyStats: 'Belum ada angka yang tercatat untuk desa ini.',
  emptyDescription: 'Profil desa ini belum ditulis di sistem pendataan.',
  emptyRehabilitation: 'Belum ada kegiatan rehabilitasi yang tercatat di desa ini.',
  emptyTraining: 'Belum ada pelatihan yang tercatat di desa ini.',

  /* --- Tabel statistik --- */
  tableIndicator: 'Keterangan',
  tableCaption: (desa: string, tahunBaru: string | null, tahunLama: string | null) =>
    `Statistik Desa ${desa}${tahunBaru ? `, angka tahun ${tahunBaru}` : ''}${
      tahunLama ? ` dibandingkan tahun ${tahunLama}` : ''
    }. Baris bertanda segitiga bisa dibuka untuk melihat rinciannya.`,
  childrenOverlap: 'Rincian bisa tumpang tindih, tidak selalu menjumlah.',

  /* --- Rincian kegiatan --- */
  hectares: (value: string) => `${value} ha`,
  seedlings: (value: string) => `${value} bibit`,
  survivalRate: (value: string) => `tingkat hidup ${value}%`,
  landStatus: (status: string) => `lahan ${status.toLowerCase()}`,
  withCollaborator: (name: string) => `bersama ${name}`,
  participants: (value: string) => `${value} peserta`,
  men: (value: string) => `${value} pria`,
  women: (value: string) => `${value} wanita`,
  youth: (value: string) => `${value} remaja`,
  elderly: (value: string) => `${value} lansia`,
  disability: (value: string) => `${value} disabilitas`,

  /* --- Pita totalan --- */
  statsHeading: 'Totalan seluruh desa',
  statsVillages: (count: string) => `${count} desa`,
  statsForms: (count: string) => `${count} formulir pendataan`,
  statsAria: (heading: string, count: string) => `${heading}: ${count} metrik`,

  /* --- Peta (IndonesiaMap) --- */
  mapDefaultAriaLabel: 'Peta interaktif wilayah kerja di Indonesia',
  mapBoundaries: 'Batas wilayah',
  mapImagery: 'Citra',
  mapBasemap: 'Peta dasar',
  mapInterventionBadge: 'Kawasan intervensi',
  mapZoomIn: 'Perbesar',
  mapZoomOut: 'Perkecil',
};

export type ImpactDictionary = typeof id;

const en: ImpactDictionary = {
  selectLabel: 'Find a village',
  selectPlaceholder: 'Search by village, regency, or province',
  selectHint: 'Select a village from the list, or click a marker on the map.',
  selectShowing: (desa: string, kabupaten: string, provinsi: string) =>
    `Showing ${desa}, ${kabupaten}, ${provinsi}.`,
  selectEmpty: 'No village matches your search',
  selectClear: 'Clear selection',
  selectResults: (count: string) => `${count} villages available`,
  mapAriaLabel: 'Interactive map of FRCI village work areas across Indonesia',
  legendIntervention: (count: string) => `Intervention areas (${count})`,
  legendOther: 'Other conservation areas',
  villageName: (desa: string) => `${desa} Village`,

  panelAriaLabel: 'Selected village details',
  panelEmptyTitle: 'No village selected yet',
  panelEmptyHint:
    'Pick a village using the search above the map to see activity photos, its location, and program results.',
  photoAlt: (desa: string) => `Photo of ${desa} Village`,
  district: 'District',
  regency: 'City/Regency',
  province: 'Province',
  formCount: (count: string) => `${count} survey forms`,
  latest: (date: string) => `latest ${date}`,
  tablistLabel: 'Village information categories',
  tabs: {
    statistik: 'Statistics',
    deskripsi: 'Description',
    rehabilitasi: 'Rehabilitation',
    pelatihan: 'Training',
  },
  loading: 'Loading village data…',
  loadError: 'Failed to load village data. Select the village again to retry.',
  notAvailable: 'Data for this village is not yet available in the survey system.',
  emptyStats: 'No figures have been recorded for this village yet.',
  emptyDescription: 'A profile for this village has not been written in the survey system yet.',
  emptyRehabilitation: 'No rehabilitation activities have been recorded in this village yet.',
  emptyTraining: 'No training has been recorded in this village yet.',

  tableIndicator: 'Indicator',
  tableCaption: (desa: string, tahunBaru: string | null, tahunLama: string | null) =>
    `${desa} Village statistics${tahunBaru ? `, figures for ${tahunBaru}` : ''}${
      tahunLama ? ` compared with ${tahunLama}` : ''
    }. Rows marked with a triangle can be expanded to show their breakdown.`,
  childrenOverlap: 'Breakdown items may overlap and do not always add up.',

  hectares: (value: string) => `${value} ha`,
  seedlings: (value: string) => `${value} seedlings`,
  survivalRate: (value: string) => `${value}% survival rate`,
  landStatus: (status: string) => `land: ${status.toLowerCase()}`,
  withCollaborator: (name: string) => `with ${name}`,
  participants: (value: string) => `${value} participants`,
  men: (value: string) => `${value} men`,
  women: (value: string) => `${value} women`,
  youth: (value: string) => `${value} youth`,
  elderly: (value: string) => `${value} elderly`,
  disability: (value: string) => `${value} people with disabilities`,

  statsHeading: 'Totals across all villages',
  statsVillages: (count: string) => `${count} villages`,
  statsForms: (count: string) => `${count} survey forms`,
  statsAria: (heading: string, count: string) => `${heading}: ${count} metrics`,

  mapDefaultAriaLabel: 'Interactive map of work areas in Indonesia',
  mapBoundaries: 'Boundaries',
  mapImagery: 'Imagery',
  mapBasemap: 'Basemap',
  mapInterventionBadge: 'Intervention area',
  mapZoomIn: 'Zoom in',
  mapZoomOut: 'Zoom out',
};

const dictionaries: Record<Locale, ImpactDictionary> = { id, en };

export function getImpactDictionary(locale: Locale): ImpactDictionary {
  return dictionaries[locale];
}
