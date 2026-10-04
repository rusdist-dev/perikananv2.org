import type { Locale } from '../config';

/**
 * Teks halaman data perikanan di bawah menu "Data": kerangka bersama
 * (FisheriesDataDashboard -- tab, catatan, kartu contoh) dan dataset IKAN
 * (/data/ikan), Data Crab/BSC (/data/data-crab), dan Hiu dan Pari
 * (/data/shark-and-ray) -- panel filter, grafik, ringkasan filter.
 *
 * Kamus tersendiri, TIDAK digabung ke Dictionary umum: entrinya banyak yang
 * fungsi penyisip angka/label, dan pemakainya komponen KLIEN -- berkas ini
 * yang ikut ke browser, bukan kamus seluruh situs.
 *
 * Angka yang disisipkan SUDAH diformat pemanggil (lib/number.ts) dengan locale
 * yang sama. Nilai dari CMS (nama wilayah, lokasi pendaratan, alat tangkap,
 * spesies, metode Lc) ditampilkan apa adanya.
 *
 * `en` diketik `typeof id`, jadi entri yang ada di satu bahasa tapi hilang di
 * bahasa lain gagal saat typecheck.
 */
const id = {
  /* --- Kerangka bersama (FisheriesDataDashboard) --- */
  eyebrow: 'Data',
  noteLabel: 'Catatan:',
  sampleNote: (dataset: string) =>
    `filter dan grafik di halaman ini masih data contoh untuk keperluan tampilan -- belum tersambung ke sumber data ${dataset} sesungguhnya.`,
  tabs: {
    summary: 'Ringkasan',
    'catch-composition': 'Komposisi Tangkapan',
    'length-frequency': 'Frekuensi Panjang',
  },
  staticRegion: 'Wilayah',
  staticPeriod: 'Periode',
  choose: (what: string) => `Pilih ${what}`,
  chooseRegion: 'Pilih Provinsi/Kabupaten',
  choosePeriod: 'Pilih Tahunan/Bulanan',
  sampleMetaTrips: 'contoh · per bulan',
  sampleMetaCatch: 'contoh · per spesies',
  sampleMetaLength: 'contoh · sebaran panjang',
  sampleNoteTrips: (dataset: string) =>
    `Data contoh untuk pratinjau tampilan grafik. Grafik akan menampilkan jumlah trip sesungguhnya setelah halaman ini tersambung ke sumber data ${dataset}.`,
  sampleNoteCatch: (dataset: string) =>
    `Data contoh untuk pratinjau tampilan grafik. Grafik akan menampilkan komposisi tangkapan sesungguhnya setelah halaman ini tersambung ke sumber data ${dataset}.`,
  sampleNoteLength: (dataset: string) =>
    `Data contoh untuk pratinjau tampilan grafik. Grafik akan menampilkan sebaran panjang sesungguhnya setelah halaman ini tersambung ke sumber data ${dataset}.`,
  sampleAriaTrips: (dataset: string) => `Grafik batang contoh jumlah trip per bulan untuk ${dataset}`,
  sampleAriaCatch: (dataset: string) =>
    `Grafik batang contoh komposisi tangkapan per spesies untuk ${dataset}`,
  sampleAriaLength: (dataset: string) =>
    `Grafik batang contoh frekuensi panjang per kelas ukuran untuk ${dataset}`,
  sdLegend: '± 1 simpangan baku',

  /* --- IKAN: catatan halaman --- */
  ikanNote: 'seluruh filter dan grafik di halaman ini sudah tersambung ke data IKAN di CMS.',

  /* --- Panel filter --- */
  filterTitle: 'Filter',
  levels: {
    wppnri: { label: 'Wilayah Pengelolaan Perikanan', all: 'Semua wilayah pengelolaan' },
    provinsi: { label: 'Provinsi', all: 'Semua provinsi' },
    kabupaten: { label: 'Kabupaten/Kota', all: 'Semua kabupaten/kota' },
    lokasiPendaratan: { label: 'Lokasi Pendaratan', all: 'Semua lokasi pendaratan' },
    jenisData: { label: 'Pengelompokan Data', all: 'Semua jenis data' },
    alatTangkap: { label: 'Alat Tangkap', all: 'Semua alat tangkap' },
    family: { label: 'Famili', all: 'Semua famili' },
    spesies: { label: 'Spesies', all: 'Semua spesies' },
  },
  loadingOptions: 'Memuat pilihan…',
  noOption: 'Tidak ada pilihan untuk kombinasi ini',
  period: 'Periode',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
  dateRange: 'Rentang Tanggal',
  dateFrom: 'Dari',
  dateTo: 'Sampai',
  rangeInvalid: 'Tanggal awal melewati tanggal akhir.',
  lengthType: 'Cara Ukur Panjang',
  lmLabel: 'Lm — panjang matang gonad (cm)',
  lmPlaceholder: 'Kosongkan bila tidak dipakai',
  classInterval: 'Selang Kelas',
  loadingButton: 'Memuat…',
  generate: 'Generate',
  filter: 'Filter',
  reset: 'Reset',
  filterHelp: (button: string) =>
    `Mengganti satu filter mengosongkan filter di bawahnya. Tekan ${button} untuk memperbarui grafik.`,
  /** Rentang tanggal di ringkasan filter, dengan tanggal yang sudah diformat. */
  dateSpan: (from: string, to: string) => `${from} s.d. ${to}`,

  /* --- Grafik: keadaan bersama --- */
  updating: 'Memperbarui grafik… angka di bawah masih hasil filter sebelumnya.',
  updateFailed: 'Grafik gagal diperbarui. Yang tampil di bawah masih hasil filter sebelumnya.',

  /* --- Grafik trip --- */
  tripsTitle: 'Jumlah Trip',
  tripsLoadFailed: 'Grafik trip gagal dimuat. Ubah filter lalu tekan Filter untuk mencoba lagi.',
  perMonth: 'per bulan',
  perYear: 'per tahun',
  tripsMeta: (total: string, per: string) => `${total} trip · ${per}`,
  tripsNote:
    'Jumlah trip pendataan per periode. Sumbu tegaknya mulai dari nol, jadi tinggi batang bisa dibandingkan apa adanya.',
  tripsAxisNote:
    ' Sumbu datarnya hanya memuat periode yang PUNYA catatan -- dua batang bersebelahan tidak selalu berarti dua bulan berurutan.',
  tripsEmpty: 'Tidak ada trip yang tercatat untuk filter ini.',
  tripUnit: 'trip',
  tripsSeries: 'Jumlah Trip',
  tripsTooltip: (period: string, count: string) => `${period} · ${count} trip`,
  tripsAria: (per: string, total: string) =>
    `Grafik batang jumlah trip IKAN ${per}, total ${total} trip`,
  landingTitle: 'Trip per Lokasi Pendaratan',
  landingMeta: (count: string) => `${count} lokasi`,
  landingNote:
    'Diurutkan dari lokasi dengan trip terbanyak. Panjang batang dibandingkan terhadap lokasi teratas, bukan terhadap total.',
  landingEmpty: 'Tidak ada lokasi pendaratan yang tercatat untuk filter ini.',

  /* --- Grafik komposisi tangkapan --- */
  catchTitle: 'Komposisi Tangkapan',
  catchLoadFailed:
    'Grafik komposisi tangkapan gagal dimuat. Ubah filter lalu tekan Filter untuk mencoba lagi.',
  catchMeta: (total: string, unit: string, species: string) =>
    `${total} ${unit} · ${species} spesies`,
  catchNote: (unit: string) =>
    `Berat tangkapan per spesies, diurutkan dari yang terbesar. Panjang batang dibandingkan terhadap spesies teratas, bukan terhadap total ${unit}.`,
  catchEmpty: 'Tidak ada tangkapan yang tercatat untuk filter ini.',

  /* --- Grafik frekuensi panjang --- */
  lengthTitle: 'Frekuensi Panjang',
  lengthLoadFailed:
    'Grafik frekuensi panjang gagal dimuat. Ubah filter lalu tekan Generate untuk mencoba lagi.',
  lengthMeta: (count: string, interval: string, unit: string) =>
    `${count} ikan · selang ${interval} ${unit}`,
  lengthNote: (interval: string, unit: string) =>
    `Sebaran panjang ikan yang diukur, dikelompokkan per ${interval} ${unit}. Sumbu datar adalah nilai tengah kelasnya.`,
  lengthCombinedNote:
    ' TL dan FL DIGABUNG di sini karena cara ukur belum dipilih -- keduanya mengukur ikan yang sama dengan ujung akhir yang berbeda, jadi sebarannya melebar sedikit oleh perbedaan itu sendiri.',
  lengthEmpty: 'Tidak ada pengukuran panjang yang tercatat untuk filter ini.',
  fishUnit: 'ikan',
  fishSeries: 'Jumlah Ikan',
  lengthTooltip: (range: string, count: string, pct: string | null) =>
    `${range} · ${count} ikan${pct ? ` (${pct}%)` : ''}`,
  lengthAria: (count: string, interval: string, unit: string) =>
    `Histogram sebaran panjang ikan IKAN, ${count} pengukuran dalam kelas selebar ${interval} ${unit}`,
  summaryTitle: 'Ringkasan & Indikator',
  lcNote: (method: string) =>
    `Lc dihitung dengan ${method}. Lm bukan hitungan API -- ia angka acuan yang Anda isi sendiri di filter, dan persentase di bawahnya dihitung terhadapnya.`,
  notRecorded: 'tidak tercatat',
  stats: {
    count: 'Jumlah ikan',
    range: 'Rentang',
    mean: 'Rata-rata',
    median: 'Median',
    mode: 'Modus',
    lc: 'Lc (panjang tertangkap)',
    lm: 'Lm (matang gonad)',
    belowLm: 'Di bawah Lm',
  },

  /* --- Data Crab (BSC) --- */
  crabNote:
    'seluruh filter dan grafik di halaman ini sudah tersambung ke data rajungan dan kepiting di CMS. Dataset ini tidak dikelompokkan per WPPNRI, jadi filter wilayah dimulai dari provinsi.',
  /** Label tingkat filter yang hanya ada di dataset BSC. "Jenis Tangkapan",
   *  bukan "Famili": isinya KEPITING / RAJUNGAN -- pengelompokan tangkapan,
   *  bukan takson. */
  crabLevels: {
    jenisPendataan: { label: 'Pengelompokan Data', all: 'Semua jenis data' },
    jenisTangkapan: { label: 'Jenis Tangkapan', all: 'Semua jenis tangkapan' },
  },
  sex: 'Jenis Kelamin',
  sexAll: 'Semua',
  /** Nilai jenis kelamin dari API (huruf besar) -> tampilan. */
  sexValues: { JANTAN: 'Jantan', BETINA: 'Betina' } as Record<string, string>,
  tkgThreshold: 'Ambang TKG matang',
  filterHelpDataset: (button: string, dataset: string) =>
    `Mengganti satu filter mengosongkan filter di bawahnya. Tekan ${button} untuk memperbarui grafik ${dataset}.`,
  crabTripsAria: (per: string, total: string) =>
    `Grafik batang jumlah trip rajungan dan kepiting ${per}, total ${total} trip`,
  crabCatchNote: (unit: string) =>
    `Bobot tangkapan per spesies dalam ${unit} (satuan dari sumber datanya, tidak dikonversi), diurutkan dari yang terbesar. Panjang batang dibandingkan terhadap spesies teratas, bukan terhadap total.`,
  widthLoadFailed:
    'Grafik frekuensi lebar gagal dimuat. Ubah filter lalu tekan Generate untuk mencoba lagi.',
  widthMeta: (count: string, interval: string, unit: string) =>
    `${count} individu · selang ${interval} ${unit}`,
  widthNote: (interval: string, unit: string) =>
    `Sebaran lebar karapas yang diukur, dikelompokkan per ${interval} ${unit}. Sumbu datar adalah nilai tengah kelasnya.`,
  sexCombinedNote:
    ' Jantan dan betina DIGABUNG di sini karena jenis kelamin belum dipilih -- keduanya matang pada lebar yang berbeda, jadi Lm di bawah adalah satu angka untuk dua sebaran.',
  widthEmpty: 'Tidak ada pengukuran lebar yang tercatat untuk filter ini.',
  individualUnit: 'individu',
  individualSeries: 'Jumlah Individu',
  widthTooltip: (range: string, count: string, pct: string | null, mature: string | null) =>
    `${range} · ${count} individu${pct ? ` (${pct}%${mature ? `, matang ${mature}%` : ''})` : ''}`,
  widthAria: (count: string, interval: string, unit: string) =>
    `Histogram sebaran lebar karapas rajungan dan kepiting, ${count} pengukuran dalam kelas selebar ${interval} ${unit}`,
  crabMethodNote: (lc: string, lm: string) =>
    `Lc: ${lc}. Lm: ${lm}. Keduanya hitungan API, bukan angka yang diisi sendiri.`,
  crabStats: {
    count: 'Jumlah individu',
    lc: 'Lc (lebar tertangkap)',
    lm: (tkg: string) => `Lm (TKG ≥ ${tkg})`,
    mature: 'Matang gonad',
    noTkg: 'Tanpa catatan TKG',
  },

  /* --- Hiu dan Pari (HIUPARI) --- */
  sharkLead:
    'Sebaran frekuensi panjang hiu dan pari per spesies dari data yang dikumpulkan di lapangan.',
  sharkNote:
    'filter dan grafik di halaman ini sudah tersambung ke data hiu dan pari di CMS. Dataset ini tidak dikelompokkan per wilayah maupun per tanggal, jadi penyaringnya hanya spesies, jenis kelamin, dan cara ukurnya.',
  speciesUnavailable: 'Daftar spesies tidak tersedia',
  sizeType: 'Jenis Ukuran',
  /** Label jenis ukuran per nilai API (snake_case). */
  sizeTypes: {
    panjang_total: 'Panjang Total',
    precaudal_length: 'Panjang Prekaudal',
    fork_length: 'Panjang Cagak',
    predorsal_length: 'Panjang Predorsal',
    panjang_headless: 'Panjang Tanpa Kepala',
  } as Record<string, string>,
  sharkSexValues: { M: 'Jantan (M)', F: 'Betina (F)' } as Record<string, string>,
  sharkLmHintLead: 'Lm hanya terhitung untuk',
  sharkLmHintMale: 'Jantan',
  sharkLmHintRest:
    ': kematangan diukur dari klasper, yang tidak dimiliki betina. Linf tetap terhitung untuk ketiga pilihan.',
  clasperThreshold: 'Ambang kematangan klasper',
  showChart: 'Tampilkan Grafik',
  sharkHelp: (button: string) => `Tekan ${button} untuk memperbarui grafik.`,
  sharkSummary: (sex: string, maturity: string) => `${sex} · klasper ≥ ${maturity}`,
  sharkSexSummary: { M: 'jantan', F: 'betina', all: 'jantan + betina' },
  sharkLoadFailed: (button: string) =>
    `Grafik frekuensi panjang gagal dimuat. Ubah filter lalu tekan ${button} untuk mencoba lagi.`,
  sharkTitle: (species: string) => `Frekuensi Panjang — ${species}`,
  allSpecies: 'Semua spesies',
  sharkMeta: (count: string, size: string, unit: string, interval: string) =>
    `${count} individu · ${size} (${unit}) · selang ${interval} ${unit}`,
  sharkNoteText: (size: string, interval: string, unit: string) =>
    `Sebaran ${size.toLowerCase()} yang diukur, dikelompokkan per ${interval} ${unit}. Sumbu datar adalah nilai tengah kelasnya.`,
  sharkAllSpeciesNote:
    ' SELURUH spesies digabung di sini karena belum ada yang dipilih -- yang terlihat adalah campuran hiu dan pari dengan ukuran dewasa yang sangat berbeda, bukan sebaran satu populasi.',
  sharkLinfNote: (linf: string) =>
    ` Garis Linf tidak tergambar karena ${linf} berada di luar rentang histogram ini -- panjang asimtotik memang bukan panjang yang pernah terukur. Angkanya ada di kartu di bawah.`,
  sharkEmpty: (size: string) =>
    `Tidak ada pengukuran ${size.toLowerCase()} yang tercatat untuk filter ini.`,
  sharkAria: (size: string, species: string, count: string, interval: string, unit: string) =>
    `Histogram sebaran ${size.toLowerCase()} untuk ${species}, ${count} pengukuran dalam kelas selebar ${interval} ${unit}`,
  allSharkSpecies: 'seluruh spesies hiu dan pari',
  sharkMethodNote: (linf: string, lm: string) =>
    `Linf: ${linf}. Lm: ${lm}. Keduanya hitungan API, bukan angka yang diisi sendiri. Baris meta di atas menyebut berapa individu yang punya ukuran untuk TIAP jenis ukuran -- itu yang menjelaskan kenapa sampelnya menyusut saat jenis ukurannya diganti.`,
  sharkStats: {
    linf: 'Linf (asimtotik)',
    lm: (maturity: string) => `Lm (klasper ≥ ${maturity})`,
    mature: 'Matang',
    without: (size: string) => `Tanpa ${size.toLowerCase()}`,
  },
  sharkLmMissingTitle: 'Lm tidak terhitung',
  sharkLmMissingLead:
    ' untuk pilihan ini. Kematangan hiu dan pari diukur dari klasper, organ yang hanya dimiliki jantan, jadi angkanya hanya muncul saat jenis kelamin',
  sharkLmMissingMale: 'Jantan (M)',
  sharkLmMissingRest: ' dipilih. Linf tidak terpengaruh.',

  /* --- STSC: Production Data & Vessel Data (komponen bersama) --- */
  /** Kode wilayah pengelolaan perikanan. "WPP-RI" padanan resmi bahasa
   *  Indonesia untuk "FMA-RI". */
  fmaCode: (code: string) => `WPP-RI ${code}`,
  allFma: 'Semua WPP-RI',
  fmaUnavailable: 'Daftar WPP tidak tersedia',
  fmaLegendTitle: 'Wilayah Pengelolaan Perikanan (WPP-RI)',
  yearRange: 'Rentang Tahun',
  yearsAvailable: (min: string, max: string) => `Data tersedia ${min}–${max}.`,
  yearRangeInvalid: (min: string, max: string) =>
    `Rentang tahun tidak sah. Isi antara ${min} dan ${max}, dengan tahun awal tidak melewati tahun akhir.`,
  chartHelp: (button: string) => `Tekan ${button} untuk memperbarui grafik.`,
  noDrawable: 'Tidak ada data yang bisa digambar untuk pilihan ini.',
  stscSummary: (fma: string, from: string, to: string) => `${fma} · ${from}–${to}`,
  allFmaSummary: 'seluruh WPP-RI',

  /* --- Production Data --- */
  productionLead:
    'Data produksi ikan per kelompok jenis, jumlah kapal, dan total tonase kapal di setiap Wilayah Pengelolaan Perikanan Negara Republik Indonesia bersumber dari statistik perikanan tangkap yang diterbitkan Kementerian Pertanian dan Kementerian Kelautan dan Perikanan. Sebagian data disusun berdasarkan proporsi yang tersedia dalam statistik perikanan tangkap, sehingga sangat mungkin terdapat bias di dalamnya. Saran dan koreksi atas data sangat kami harapkan.',
  productionNote:
    'filter dan grafik di halaman ini sudah tersambung ke statistik perikanan tangkap di CMS. Angkanya tahunan per WPP-RI, bukan per trip pendataan seperti halaman IKAN dan Data Crab.',
  commodity: 'Komoditas',
  commodityUnavailable: 'Daftar komoditas tidak tersedia',
  allCommodities: 'Semua komoditas',
  commodityHint: 'Dikosongkan berarti seluruh komoditas, masing-masing dengan grafiknya sendiri.',
  productionLoadFailed: (button: string) =>
    `Grafik produksi gagal dimuat. Ubah filter lalu tekan ${button} untuk mencoba lagi.`,
  productionEmpty: 'Tidak ada produksi yang tercatat untuk filter ini.',
  productionTotal: (total: string, unit: string, count: string) =>
    `Total ${total} ${unit} dari ${count} komoditas`,
  productionTotalRest:
    '. Tiap komoditas punya grafiknya sendiri: satuannya memang sama, tapi besarannya tidak sebanding, dan menumpuknya di satu bingkai membuat komoditas kecil rata di sumbu nol.',
  productionMeta: (total: string, unit: string, count: string) => `${total} ${unit} · ${count} WPP`,
  productionCardNote: (commodity: string) =>
    `Produksi ${commodity} per tahun di tiap WPP-RI. Sumbu tegaknya mulai dari nol dan diskalakan terhadap komoditas INI saja -- tinggi garis tidak bisa dibandingkan antar-kartu. Tahun tanpa catatan membuat garisnya terputus, bukan turun ke nol.`,
  productionAria: (commodity: string, count: string, from: string, to: string) =>
    `Grafik garis produksi ${commodity} per tahun untuk ${count} WPP-RI, ${from} sampai ${to}`,

  /* --- Vessel Data --- */
  vesselsTitle: 'Jumlah Armada',
  tonnageTitle: 'Total Tonase Armada',
  vesselLoadFailed: (button: string) =>
    `Grafik armada gagal dimuat. Ubah filter lalu tekan ${button} untuk mencoba lagi.`,
  vesselMeta: (count: string, unit: string) => `${count} WPP · ${unit}`,
  vesselsNote:
    'Jumlah armada penangkapan per tahun di tiap WPP-RI. Sumbu tegaknya mulai dari nol, jadi tinggi garis bisa dibandingkan apa adanya. Tahun tanpa catatan membuat garisnya TERPUTUS, bukan turun ke nol.',
  tonnageNote: (gt: string, vessels: string) =>
    `Total tonase kotor armada per tahun di tiap WPP-RI. Dipisah dari kartu di atas karena satuannya berbeda arti: ${gt} mengukur kapasitas, ${vessels} mengukur cacah kapal -- dan menumpuk keduanya di satu sumbu membuat kenaikan yang satu terlihat seperti kenaikan yang lain.`,
  vesselsAria: (count: string, from: string, to: string) =>
    `Grafik garis jumlah armada per tahun untuk ${count} WPP-RI, ${from} sampai ${to}`,
  tonnageAria: (count: string, from: string, to: string) =>
    `Grafik garis total tonase armada per tahun untuk ${count} WPP-RI, ${from} sampai ${to}`,
};

export type FisheriesDictionary = typeof id;

const en: FisheriesDictionary = {
  eyebrow: 'Data',
  noteLabel: 'Note:',
  sampleNote: (dataset: string) =>
    `the filters and charts on this page are still sample data for display purposes -- not yet connected to the actual ${dataset} data source.`,
  tabs: {
    summary: 'Summary',
    'catch-composition': 'Catch Composition',
    'length-frequency': 'Length Frequency',
  },
  staticRegion: 'Region',
  staticPeriod: 'Period',
  choose: (what: string) => `Choose ${what}`,
  chooseRegion: 'Choose Province/Regency',
  choosePeriod: 'Choose Yearly/Monthly',
  sampleMetaTrips: 'sample · per month',
  sampleMetaCatch: 'sample · per species',
  sampleMetaLength: 'sample · length distribution',
  sampleNoteTrips: (dataset: string) =>
    `Sample data to preview the chart layout. The chart will show actual trip counts once this page is connected to the ${dataset} data source.`,
  sampleNoteCatch: (dataset: string) =>
    `Sample data to preview the chart layout. The chart will show the actual catch composition once this page is connected to the ${dataset} data source.`,
  sampleNoteLength: (dataset: string) =>
    `Sample data to preview the chart layout. The chart will show the actual length distribution once this page is connected to the ${dataset} data source.`,
  sampleAriaTrips: (dataset: string) => `Sample bar chart of monthly trip counts for ${dataset}`,
  sampleAriaCatch: (dataset: string) => `Sample bar chart of catch composition by species for ${dataset}`,
  sampleAriaLength: (dataset: string) =>
    `Sample bar chart of length frequency by size class for ${dataset}`,
  sdLegend: '± 1 standard deviation',

  ikanNote: 'all filters and charts on this page are connected to the IKAN data in the CMS.',

  filterTitle: 'Filter',
  levels: {
    wppnri: { label: 'Fisheries Management Area', all: 'All management areas' },
    provinsi: { label: 'Province', all: 'All provinces' },
    kabupaten: { label: 'Regency/City', all: 'All regencies/cities' },
    lokasiPendaratan: { label: 'Landing Site', all: 'All landing sites' },
    jenisData: { label: 'Data Grouping', all: 'All data types' },
    alatTangkap: { label: 'Fishing Gear', all: 'All fishing gears' },
    family: { label: 'Family', all: 'All families' },
    spesies: { label: 'Species', all: 'All species' },
  },
  loadingOptions: 'Loading options…',
  noOption: 'No option for this combination',
  period: 'Period',
  monthly: 'Monthly',
  yearly: 'Yearly',
  dateRange: 'Date Range',
  dateFrom: 'From',
  dateTo: 'To',
  rangeInvalid: 'The start date is after the end date.',
  lengthType: 'Length Type',
  lmLabel: 'Lm — length at maturity (cm)',
  lmPlaceholder: 'Leave empty if not used',
  classInterval: 'Class Interval',
  loadingButton: 'Loading…',
  generate: 'Generate',
  filter: 'Filter',
  reset: 'Reset',
  filterHelp: (button: string) =>
    `Changing one filter clears the filters below it. Press ${button} to update the charts.`,
  dateSpan: (from: string, to: string) => `${from} – ${to}`,

  updating: 'Updating charts… the figures below are still from the previous filter.',
  updateFailed: 'The charts failed to update. What is shown below is still from the previous filter.',

  tripsTitle: 'Number of Trips',
  tripsLoadFailed: 'The trip chart failed to load. Change a filter and press Filter to try again.',
  perMonth: 'per month',
  perYear: 'per year',
  tripsMeta: (total: string, per: string) => `${total} trips · ${per}`,
  tripsNote:
    'Number of surveyed trips per period. The vertical axis starts at zero, so bar heights can be compared directly.',
  tripsAxisNote:
    ' The horizontal axis only includes periods that HAVE records -- two adjacent bars are not always two consecutive months.',
  tripsEmpty: 'No trips recorded for this filter.',
  tripUnit: 'trips',
  tripsSeries: 'Number of Trips',
  tripsTooltip: (period: string, count: string) => `${period} · ${count} trips`,
  tripsAria: (per: string, total: string) =>
    `Bar chart of IKAN trip counts ${per}, ${total} trips in total`,
  landingTitle: 'Trips per Landing Site',
  landingMeta: (count: string) => `${count} sites`,
  landingNote:
    'Sorted from the site with the most trips. Bar length is relative to the top site, not to the total.',
  landingEmpty: 'No landing sites recorded for this filter.',

  catchTitle: 'Catch Composition',
  catchLoadFailed:
    'The catch composition chart failed to load. Change a filter and press Filter to try again.',
  catchMeta: (total: string, unit: string, species: string) =>
    `${total} ${unit} · ${species} species`,
  catchNote: (unit: string) =>
    `Catch weight per species, sorted from largest. Bar length is relative to the top species, not to the total ${unit}.`,
  catchEmpty: 'No catch recorded for this filter.',

  lengthTitle: 'Length Frequency',
  lengthLoadFailed:
    'The length frequency chart failed to load. Change a filter and press Generate to try again.',
  lengthMeta: (count: string, interval: string, unit: string) =>
    `${count} fish · ${interval} ${unit} interval`,
  lengthNote: (interval: string, unit: string) =>
    `Length distribution of the measured fish, grouped in ${interval} ${unit} classes. The horizontal axis is the class midpoint.`,
  lengthCombinedNote:
    ' TL and FL are COMBINED here because no length type has been chosen -- both measure the same fish to a different end point, so the distribution widens slightly from that difference alone.',
  lengthEmpty: 'No length measurements recorded for this filter.',
  fishUnit: 'fish',
  fishSeries: 'Number of Fish',
  lengthTooltip: (range: string, count: string, pct: string | null) =>
    `${range} · ${count} fish${pct ? ` (${pct}%)` : ''}`,
  lengthAria: (count: string, interval: string, unit: string) =>
    `Histogram of IKAN fish length distribution, ${count} measurements in ${interval} ${unit} classes`,
  summaryTitle: 'Summary & Indicators',
  lcNote: (method: string) =>
    `Lc is computed with ${method}. Lm is not computed by the API -- it is a reference value you enter in the filter, and the percentage below is calculated against it.`,
  notRecorded: 'not recorded',
  stats: {
    count: 'Number of fish',
    range: 'Range',
    mean: 'Mean',
    median: 'Median',
    mode: 'Mode',
    lc: 'Lc (length at first capture)',
    lm: 'Lm (length at maturity)',
    belowLm: 'Below Lm',
  },

  crabNote:
    'all filters and charts on this page are connected to the blue swimming crab and mud crab data in the CMS. This dataset is not grouped by fisheries management area, so the region filter starts at province.',
  crabLevels: {
    jenisPendataan: { label: 'Data Grouping', all: 'All data types' },
    jenisTangkapan: { label: 'Catch Type', all: 'All catch types' },
  },
  sex: 'Sex',
  sexAll: 'All',
  sexValues: { JANTAN: 'Male', BETINA: 'Female' },
  tkgThreshold: 'Maturity stage (TKG) threshold',
  filterHelpDataset: (button: string, dataset: string) =>
    `Changing one filter clears the filters below it. Press ${button} to update the ${dataset} charts.`,
  crabTripsAria: (per: string, total: string) =>
    `Bar chart of blue swimming crab and mud crab trip counts ${per}, ${total} trips in total`,
  crabCatchNote: (unit: string) =>
    `Catch weight per species in ${unit} (the unit of the source data, not converted), sorted from largest. Bar length is relative to the top species, not to the total.`,
  widthLoadFailed:
    'The width frequency chart failed to load. Change a filter and press Generate to try again.',
  widthMeta: (count: string, interval: string, unit: string) =>
    `${count} individuals · ${interval} ${unit} interval`,
  widthNote: (interval: string, unit: string) =>
    `Distribution of measured carapace widths, grouped in ${interval} ${unit} classes. The horizontal axis is the class midpoint.`,
  sexCombinedNote:
    ' Males and females are COMBINED here because no sex has been chosen -- they mature at different widths, so the Lm below is one figure for two distributions.',
  widthEmpty: 'No width measurements recorded for this filter.',
  individualUnit: 'individuals',
  individualSeries: 'Number of Individuals',
  widthTooltip: (range: string, count: string, pct: string | null, mature: string | null) =>
    `${range} · ${count} individuals${pct ? ` (${pct}%${mature ? `, ${mature}% mature` : ''})` : ''}`,
  widthAria: (count: string, interval: string, unit: string) =>
    `Histogram of blue swimming crab and mud crab carapace width distribution, ${count} measurements in ${interval} ${unit} classes`,
  crabMethodNote: (lc: string, lm: string) =>
    `Lc: ${lc}. Lm: ${lm}. Both are computed by the API, not entered manually.`,
  crabStats: {
    count: 'Number of individuals',
    lc: 'Lc (width at first capture)',
    lm: (tkg: string) => `Lm (TKG ≥ ${tkg})`,
    mature: 'Mature',
    noTkg: 'Without TKG record',
  },

  sharkLead:
    'Length frequency distribution of sharks and rays by species, from data collected in the field.',
  sharkNote:
    'the filters and charts on this page are connected to the shark and ray data in the CMS. This dataset is not grouped by region or by date, so the only filters are species, sex, and measurement type.',
  speciesUnavailable: 'Species list unavailable',
  sizeType: 'Measurement Type',
  sizeTypes: {
    panjang_total: 'Total Length',
    precaudal_length: 'Precaudal Length',
    fork_length: 'Fork Length',
    predorsal_length: 'Predorsal Length',
    panjang_headless: 'Headless Length',
  },
  sharkSexValues: { M: 'Male (M)', F: 'Female (F)' },
  sharkLmHintLead: 'Lm is only computed for',
  sharkLmHintMale: 'Males',
  sharkLmHintRest:
    ': maturity is measured from the clasper, which females do not have. Linf is computed for all three options.',
  clasperThreshold: 'Clasper maturity threshold',
  showChart: 'Show Chart',
  sharkHelp: (button: string) => `Press ${button} to update the chart.`,
  sharkSummary: (sex: string, maturity: string) => `${sex} · clasper ≥ ${maturity}`,
  sharkSexSummary: { M: 'male', F: 'female', all: 'male + female' },
  sharkLoadFailed: (button: string) =>
    `The length frequency chart failed to load. Change a filter and press ${button} to try again.`,
  sharkTitle: (species: string) => `Length Frequency — ${species}`,
  allSpecies: 'All species',
  sharkMeta: (count: string, size: string, unit: string, interval: string) =>
    `${count} individuals · ${size} (${unit}) · ${interval} ${unit} interval`,
  sharkNoteText: (size: string, interval: string, unit: string) =>
    `Distribution of measured ${size.toLowerCase()}, grouped in ${interval} ${unit} classes. The horizontal axis is the class midpoint.`,
  sharkAllSpeciesNote:
    ' ALL species are combined here because none has been chosen -- what you see is a mix of sharks and rays with very different adult sizes, not the distribution of one population.',
  sharkLinfNote: (linf: string) =>
    ` The Linf line is not drawn because ${linf} lies outside the range of this histogram -- asymptotic length is not a length that has ever been measured. The figure is in the card below.`,
  sharkEmpty: (size: string) => `No ${size.toLowerCase()} measurements recorded for this filter.`,
  sharkAria: (size: string, species: string, count: string, interval: string, unit: string) =>
    `Histogram of ${size.toLowerCase()} distribution for ${species}, ${count} measurements in ${interval} ${unit} classes`,
  allSharkSpecies: 'all shark and ray species',
  sharkMethodNote: (linf: string, lm: string) =>
    `Linf: ${linf}. Lm: ${lm}. Both are computed by the API, not entered manually. The meta line above shows how many individuals have a size for EACH measurement type -- which explains why the sample shrinks when the measurement type changes.`,
  sharkStats: {
    linf: 'Linf (asymptotic)',
    lm: (maturity: string) => `Lm (clasper ≥ ${maturity})`,
    mature: 'Mature',
    without: (size: string) => `Without ${size.toLowerCase()}`,
  },
  sharkLmMissingTitle: 'Lm is not computed',
  sharkLmMissingLead:
    ' for this selection. Shark and ray maturity is measured from the clasper, an organ only males have, so the figure only appears when the sex',
  sharkLmMissingMale: 'Male (M)',
  sharkLmMissingRest: ' is selected. Linf is not affected.',

  fmaCode: (code: string) => `FMA-RI ${code}`,
  allFma: 'All Fisheries Management Areas',
  fmaUnavailable: 'FMA list unavailable',
  fmaLegendTitle: 'Fisheries Management Areas (FMA-RI)',
  yearRange: 'Year Range',
  yearsAvailable: (min: string, max: string) => `Data available ${min}–${max}.`,
  yearRangeInvalid: (min: string, max: string) =>
    `Invalid year range. Enter years between ${min} and ${max}, with the start year not after the end year.`,
  chartHelp: (button: string) => `Press ${button} to update the chart.`,
  noDrawable: 'There is no data to draw for this selection.',
  stscSummary: (fma: string, from: string, to: string) => `${fma} · ${from}–${to}`,
  allFmaSummary: 'all FMA-RI',

  productionLead:
    'The data on the fish production per species group, the number of vessels, and the total vessel tonnage in each Fisheries Management Area of the Republic of Indonesia are sourced from capture fisheries statistics issued by the Ministry of Agriculture and the Ministry of Marine Affairs and Fisheries. Some data were constructed based on the proportions available in capture fisheries statistics, so it is highly likely to find biases within the data. Suggestions and corrections to the data are highly expected.',
  productionNote:
    'the filters and charts on this page are connected to the capture fisheries statistics in the CMS. The figures are annual per FMA-RI, not per surveyed trip like the IKAN and Data Crab pages.',
  commodity: 'Commodity',
  commodityUnavailable: 'Commodity list unavailable',
  allCommodities: 'All commodities',
  commodityHint: 'Leave empty for all commodities, each with its own chart.',
  productionLoadFailed: (button: string) =>
    `The production chart failed to load. Change a filter and press ${button} to try again.`,
  productionEmpty: 'No production recorded for this filter.',
  productionTotal: (total: string, unit: string, count: string) =>
    `Total ${total} ${unit} from ${count} commodities`,
  productionTotalRest:
    '. Each commodity has its own chart: the unit is the same, but the magnitudes are not comparable, and stacking them in one frame flattens small commodities onto the zero axis.',
  productionMeta: (total: string, unit: string, count: string) => `${total} ${unit} · ${count} FMA`,
  productionCardNote: (commodity: string) =>
    `Annual ${commodity} production in each FMA-RI. The vertical axis starts at zero and is scaled to THIS commodity only -- line heights cannot be compared across cards. Years without records break the line rather than dropping it to zero.`,
  productionAria: (commodity: string, count: string, from: string, to: string) =>
    `Line chart of annual ${commodity} production for ${count} FMA-RI, ${from} to ${to}`,

  vesselsTitle: 'Number of Vessels',
  tonnageTitle: 'Total Vessel Tonnage',
  vesselLoadFailed: (button: string) =>
    `The fleet chart failed to load. Change a filter and press ${button} to try again.`,
  vesselMeta: (count: string, unit: string) => `${count} FMA · ${unit}`,
  vesselsNote:
    'Number of fishing vessels per year in each FMA-RI. The vertical axis starts at zero, so line heights can be compared directly. Years without records BREAK the line rather than dropping it to zero.',
  tonnageNote: (gt: string, vessels: string) =>
    `Total gross tonnage of the fleet per year in each FMA-RI. Kept separate from the card above because the units mean different things: ${gt} measures capacity, ${vessels} counts vessels -- and stacking both on one axis makes a rise in one look like a rise in the other.`,
  vesselsAria: (count: string, from: string, to: string) =>
    `Line chart of the number of vessels per year for ${count} FMA-RI, ${from} to ${to}`,
  tonnageAria: (count: string, from: string, to: string) =>
    `Line chart of total fleet tonnage per year for ${count} FMA-RI, ${from} to ${to}`,
};

const dictionaries: Record<Locale, FisheriesDictionary> = { id, en };

export function getFisheriesDictionary(locale: Locale): FisheriesDictionary {
  return dictionaries[locale];
}
