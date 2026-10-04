import type { Locale } from '../config';

/**
 * Teks dasbor pemantauan Jogo Laut (/discover/jogo-laut).
 *
 * Kamus tersendiri, TIDAK digabung ke Dictionary umum (dictionary.ts): banyak
 * entrinya fungsi yang menyisipkan angka atau label ke kalimat, dan kamus umum
 * hanya berisi string -- ia juga dikirim ke komponen klien, sementara dasbor
 * ini seluruhnya server component.
 *
 * Angka yang disisipkan SUDAH diformat oleh pemanggil (fmt() dengan locale
 * yang sama), jadi fungsi di sini tidak pernah memformat angka sendiri. Label
 * deret, tingkat, dan uraian dari API tidak ada di sini: API sudah mengirimnya
 * sesuai `?locale=`.
 *
 * `en` diketik `typeof id`, jadi entri yang ada di satu bahasa tapi hilang di
 * bahasa lain gagal saat typecheck.
 */
const id = {
  eyebrow: 'Pemantauan Ekosistem',
  heading: 'Apa yang direkam stasiun Jogo Laut',
  intro:
    'Stasiun riset terpadu di Cilacap merekam karbon tanah, kualitas air, pasang surut, dan cuaca permukaan secara menerus. Kartu di bawah memperlihatkan pembacaan rangkaian sensor itu selama satu jendela pengamatan.',

  unavailableTitle: 'Data pemantauan sedang tidak tersedia.',
  unavailableBody:
    'Sambungan ke server data stasiun gagal atau belum dikonfigurasi. Halaman ini akan menampilkan pembacaan sensor lagi begitu sambungannya pulih; silakan muat ulang beberapa menit lagi.',
  noReadings: 'Belum ada pembacaan untuk jendela pengamatan ini.',

  liveLead: 'Pembacaan sensor langsung',
  liveRest: (period: string, updated: string) =>
    `, diperbarui tiap lima menit. Periode ${period} · pembaruan terakhir ${updated}. Celah pada grafik adalah rentang waktu tanpa pembacaan dari sensornya.`,
  periodFallback: 'jendela terbaru',
  lastDays: (days: string) => `${days} hari terakhir`,
  timezone: 'WIB',

  /* --- Angin --- */
  windRoseTitle: 'Mawar angin',
  windRoseMeta: (window: string) => `${window} · 16 penjuru`,
  windRoseNote:
    'Panjang tiap sektor sebanding dengan seberapa sering angin datang dari arah itu. Cincin acuan menandai seperempat, setengah, tiga perempat, dan seluruh frekuensi tertinggi.',
  windRoseAria: (dominant: string | null) =>
    `Mawar angin 16 penjuru${dominant ? `; arah dominan ${dominant}` : ''}`,
  windRoseOuterRing: (pct: string) => `cincin terluar = ${pct}% kejadian`,
  windSummaryTitle: 'Ringkasan angin',
  windDominant: 'Arah dominan',
  windShare: (pct: string, total: string) => `${pct}% dari ${total} pembacaan`,
  windAverage: 'Rata-rata',
  windMax: 'Tertinggi',
  windSpeedDistribution: 'Sebaran kecepatan',

  /* --- Kondisi terkini --- */
  groupCurrent: 'Kondisi terkini',
  gaugeScale: 'skala',
  gaugeAria: (label: string, value: string, unit: string, level: string) =>
    `Pengukur ${label}, ${value} ${unit}, tingkat ${level}`,
  waterNowTitle: 'Kualitas air terkini',
  waterNowNote:
    'Garis tegak pada bar pH menandai rentang baku mutu 6,5–8,5. Bar konduktivitas memakai rentang terendah–tertinggi jendela pengamatan sebagai skalanya, bukan skala tetap: rentang wajarnya bergantung pada kalibrasi sensor, jadi panjang bar itu menunjukkan posisi pembacaan sekarang di antara pembacaan beberapa hari terakhir.',
  scaleFixed: 'skala tetap',
  scaleWindow: (window: string) => `rentang ${window}`,

  /* --- Atmosfer --- */
  groupAtmosphere: 'Atmosfer & cuaca permukaan',
  atmTitle: 'Atmosfer',
  atmNote:
    'Tiga besaran dengan satuan berbeda dalam satu grafik: suhu di sumbu kiri, kelembaban dan kecepatan angin di dua sumbu kanan. Angka tiap sumbu berwarna sama dengan garisnya. Suhu dan kelembaban lazimnya membentuk pola cermin khas pesisir tropis: kelembaban turun saat suhu memuncak pada tengah hari.',
  atmAria: 'Grafik garis suhu udara, kelembaban relatif, dan kecepatan angin',

  /* --- Kualitas air --- */
  groupWater: 'Kualitas air',
  doTitle: 'Oksigen terlarut, suhu air, & curah hujan',
  doNote:
    'Kelarutan oksigen turun saat air menghangat, jadi dua garis pertama lazimnya bergerak berlawanan; hujan deras bisa memutus pola itu karena air tawar masuk dan mengaduk kolom air. Oksigen terlarut di bawah 5 mg/L untuk waktu lama adalah tekanan nyata bagi ikan dan biota dasar. Angka tiap sumbu berwarna sama dengan garisnya.',
  doAria: 'Grafik garis oksigen terlarut, suhu air, dan curah hujan',

  /* --- Karbon --- */
  groupCarbon: 'Karbon & pasang surut',
  co2Title: 'CO₂ tanah, CO₂ udara, dan pasang surut',
  co2Note:
    'CO₂ tanah dan CO₂ udara berbagi sumbu kiri, jadi besar ayunannya bisa dibandingkan langsung: ayunan yang hanya muncul di garis tanah berasal dari tanahnya, bukan dari udara di atasnya. Pasut digambar sebagai rata-rata bergerak supaya riak gelombang tidak menutupi pola pasang-surutnya.',
  co2Aria: (period: string) => `Grafik garis CO₂ tanah, CO₂ udara, dan pasang surut, ${period}`,
  phTitle: 'pH air, suhu air, & pasang surut',
  phNote:
    'Rentang pH 6,5–8,5 umum dipakai sebagai baku mutu air laut untuk biota. Siklus harian pH mengikuti fotosintesis: cenderung naik pada siang hari dan turun pada malam hari. Pasut ditumpangkan supaya terlihat apakah perubahan pH ikut masuknya air laut; ia digambar sebagai rata-rata bergerak. Angka tiap sumbu berwarna sama dengan garisnya.',
  phAria: 'Grafik garis pH air, suhu air, dan pasang surut',
  ctdTempTitle: 'Konduktivitas, suhu air, & pasang surut',
  ctdTempNote:
    'Konduktivitas naik saat air laut masuk dan turun saat air tawar mendominasi — penanda seberapa jauh air laut menjangkau perairan payau di sekitar stasiun. Suhu air di sini dari sensor CTD yang sama, jadi keduanya terbaca pada titik yang sama. Pasut digambar sebagai rata-rata bergerak. Angka tiap sumbu berwarna sama dengan garisnya.',
  ctdTempAria: 'Grafik garis konduktivitas air, suhu air, dan pasang surut',
  fluxTitle: 'Respirasi CO₂ & fluks karbon',
  fluxMeta: 'rata-rata per jam',
  fluxNote:
    'Nilai di atas nol berarti tanah melepas CO₂ ke udara, di bawahnya berarti CO₂ terserap. Satu garis dibaca di dua sumbu: kiri sebagai respirasi CO₂, kanan sebagai fluks karbon — fluks karbon adalah respirasi yang dihitung sebagai massa karbonnya saja (× 12/44), jadi keduanya satu sinyal dalam dua satuan. Tiap titik adalah rata-rata satu jam; celah pada garis adalah rentang tanpa pembacaan.',
  fluxAria: 'Grafik garis respirasi CO₂ dan fluks karbon per jam',
  diurnalTitle: 'Rata-rata diurnal CO₂ tanah',
  diurnalNote:
    'Tiap titik adalah rata-rata seluruh pembacaan pada jam tersebut sepanjang jendela pengamatan; dua garis putus-putus menandai ± 1 simpangan baku di sekitarnya.',
  diurnalPeak: (hour: string) => `Puncaknya di sekitar pukul ${hour}.`,
  diurnalAria: 'Grafik garis rata-rata CO₂ tanah tiap jam beserta rentang ± 1 simpangan bakunya',
  sdPlus: '+1 simpangan baku',
  sdMinus: '−1 simpangan baku',
  regressionTitle: 'Regresi CO₂ tanah terhadap pasut',
  regressionMeta: 'kuadrat terkecil',
  regressionNote:
    'Persamaan di atas memperkirakan CO₂ tanah dari ketinggian pasut saja. Proyeksinya memakai pasut yang diperkirakan untuk beberapa menit ke depan, jadi ia melemah cepat semakin jauh ke depan.',
  regressionTide: 'pasut',
  estimateNow: 'Estimasi saat ini',
  lagTitle: 'Jeda CO₂ ↔ pasut',
  minutes: 'menit',
  minutesShort: 'mnt',
  projection: 'Proyeksi',
  pairCount: (n: string) => `n = ${n} pasangan data`,
  ccfTitle: 'Korelasi silang CO₂ tanah – pasut',
  ccfMeta: 'per jeda waktu',
  ccfNote:
    'Tiap batang adalah korelasi CO₂ tanah dengan pasut yang digeser sejauh jeda itu. Jeda dengan batang tertinggi adalah keterlambatan respons tanah terhadap air',
  ccfNoteLag: (minutes: string) => ` — untuk jendela ini sekitar ${minutes} menit`,
  ccfPositive: 'Searah',
  ccfNegative: 'Berlawanan',
  ccfLag: (lag: string) => `jeda ${lag}`,
  ccfAria: 'Grafik batang korelasi silang CO₂ tanah dan pasut untuk tiap jeda waktu',
  ecoTitle: 'Status ekosistem',
  ecoNote:
    'Klasifikasi dihitung server dari arah tren CO₂ tanah, oksigen terlarut, dan pasut. Tren di bawahnya dicetak supaya klasifikasinya bisa diperiksa, bukan sekadar dipercaya.',
  ecoTrend: (label: string) => `Tren ${label}`,
  ecoCo2Change: 'Perubahan CO₂ tanah',
  direction: { up: 'naik', down: 'turun', stable: 'stabil' } as Record<string, string>,
  ctdLevelTitle: 'Konduktivitas, level air, & pasang surut',
  ctdLevelNote:
    'Konduktivitas naik saat air laut masuk dan turun saat air tawar mendominasi — penanda seberapa jauh air laut menjangkau perairan payau di sekitar stasiun. Level air diukur sensor CTD; pasut dari sensor jarak di menara, digambar sebagai rata-rata bergerak.',
  ctdLevelAria: 'Grafik garis konduktivitas air, level air, dan pasang surut',

  /* --- Statistik --- */
  groupStats: 'Analisis statistik',
  corrTitle: 'Matriks korelasi antar-variabel',
  corrMeta: 'koefisien Pearson',
  corrStrongest: 'Korelasi terkuat di luar diagonal ada pada pasangan',
  corrCausation:
    'Korelasi bukan sebab-akibat: dua variabel bisa bergerak bersama karena sama-sama mengikuti pasut atau siklus harian matahari.',
  corrCaption: 'Matriks koefisien korelasi Pearson antar-variabel pemantauan',
  outlierTitle: 'Deteksi pencilan CO₂ tanah',
  outlierMeta: 'metode 1,5 × IQR',
  outlierNote:
    'Pencilan tidak otomatis berarti sensor rusak — sebagian di antaranya adalah kejadian nyata (hujan deras, surut ekstrem) yang justru paling menarik untuk ditelusuri.',
  outlierCount: (n: string) => `${n} pembacaan`,
  outlierCountRest: ' berada di luar rentang normal selama jendela ini.',
  outlierNone: 'Tidak ada pembacaan di luar rentang normal.',
  outlierRange: (lower: string, upper: string, unit: string) =>
    `rentang normal (1,5 × IQR): ${lower} - ${upper} ${unit}`,

  /* --- Tabel & KPI --- */
  groupLatest: 'Pembacaan terbaru',
  tableTitle: 'Sensor CO₂ tanah',
  tableMeta: (shown: string, total: string) => `${shown} dari ${total} pembacaan`,
  tableCaption: 'Pembacaan sensor CO₂ tanah terbaru',
  kpiCaption: (window: string) =>
    `Angka besar = pembacaan terakhir; di bawahnya rentang terendah–tertinggi selama ${window}.`,
  kpiAria: (n: string) => `Pembacaan terakhir ${n} sensor`,
  kpiVsYesterday: 'vs kemarin',
  kpiAt: (time: string) => `pukul ${time}`,
};

export type JogoLautDictionary = typeof id;

const en: JogoLautDictionary = {
  eyebrow: 'Ecosystem Monitoring',
  heading: 'What the Jogo Laut station records',
  intro:
    'The integrated research station in Cilacap continuously records soil carbon, water quality, tides, and surface weather. The cards below show what that sensor array read over one observation window.',

  unavailableTitle: 'Monitoring data is currently unavailable.',
  unavailableBody:
    'The connection to the station data server failed or has not been configured. This page will show sensor readings again as soon as the connection is restored; please reload in a few minutes.',
  noReadings: 'No readings yet for this observation window.',

  liveLead: 'Live sensor readings',
  liveRest: (period: string, updated: string) =>
    `, refreshed every five minutes. Period ${period} · last updated ${updated}. Gaps in the charts are stretches of time with no readings from the sensor.`,
  periodFallback: 'latest window',
  lastDays: (days: string) => `last ${days} days`,
  timezone: 'WIB',

  windRoseTitle: 'Wind rose',
  windRoseMeta: (window: string) => `${window} · 16 points`,
  windRoseNote:
    'The length of each sector is proportional to how often the wind came from that direction. The reference rings mark a quarter, half, three quarters, and all of the highest frequency.',
  windRoseAria: (dominant: string | null) =>
    `16-point wind rose${dominant ? `; prevailing direction ${dominant}` : ''}`,
  windRoseOuterRing: (pct: string) => `outer ring = ${pct}% of readings`,
  windSummaryTitle: 'Wind summary',
  windDominant: 'Prevailing direction',
  windShare: (pct: string, total: string) => `${pct}% of ${total} readings`,
  windAverage: 'Average',
  windMax: 'Highest',
  windSpeedDistribution: 'Speed distribution',

  groupCurrent: 'Current conditions',
  gaugeScale: 'scale',
  gaugeAria: (label: string, value: string, unit: string, level: string) =>
    `${label} gauge, ${value} ${unit}, level ${level}`,
  waterNowTitle: 'Current water quality',
  waterNowNote:
    'The vertical marks on the pH bar show the 6.5–8.5 quality standard range. The conductivity bar uses the lowest–highest range of the observation window as its scale rather than a fixed one: its normal range depends on sensor calibration, so the bar length shows where the current reading sits among the readings of the past few days.',
  scaleFixed: 'fixed scale',
  scaleWindow: (window: string) => `range over the ${window}`,

  groupAtmosphere: 'Atmosphere & surface weather',
  atmTitle: 'Atmosphere',
  atmNote:
    'Three quantities with different units in one chart: temperature on the left axis, humidity and wind speed on the two right axes. Each axis is coloured like its line. Temperature and humidity usually mirror each other, typical of a tropical coast: humidity drops as temperature peaks around midday.',
  atmAria: 'Line chart of air temperature, relative humidity, and wind speed',

  groupWater: 'Water quality',
  doTitle: 'Dissolved oxygen, water temperature, & rainfall',
  doNote:
    'Oxygen solubility falls as water warms, so the first two lines usually move in opposite directions; heavy rain can break that pattern as fresh water flows in and mixes the water column. Dissolved oxygen below 5 mg/L for long periods is real stress for fish and bottom-dwelling organisms. Each axis is coloured like its line.',
  doAria: 'Line chart of dissolved oxygen, water temperature, and rainfall',

  groupCarbon: 'Carbon & tides',
  co2Title: 'Soil CO₂, air CO₂, and tides',
  co2Note:
    'Soil CO₂ and air CO₂ share the left axis, so their swings can be compared directly: a swing that only appears in the soil line comes from the soil, not from the air above it. The tide is drawn as a moving average so that wave ripple does not hide the tidal pattern.',
  co2Aria: (period: string) => `Line chart of soil CO₂, air CO₂, and tides, ${period}`,
  phTitle: 'Water pH, water temperature, & tides',
  phNote:
    'A pH range of 6.5–8.5 is commonly used as the seawater quality standard for marine life. The daily pH cycle follows photosynthesis: it tends to rise during the day and fall at night. The tide is overlaid to show whether pH changes follow incoming seawater; it is drawn as a moving average. Each axis is coloured like its line.',
  phAria: 'Line chart of water pH, water temperature, and tides',
  ctdTempTitle: 'Conductivity, water temperature, & tides',
  ctdTempNote:
    'Conductivity rises as seawater flows in and falls when fresh water dominates — a marker of how far seawater reaches into the brackish water around the station. Water temperature here comes from the same CTD sensor, so both are read at the same point. The tide is drawn as a moving average. Each axis is coloured like its line.',
  ctdTempAria: 'Line chart of water conductivity, water temperature, and tides',
  fluxTitle: 'CO₂ respiration & carbon flux',
  fluxMeta: 'hourly average',
  fluxNote:
    'Values above zero mean the soil is releasing CO₂ to the air; below zero means CO₂ is being taken up. One line is read on two axes: the left as CO₂ respiration, the right as carbon flux — carbon flux is respiration counted as the mass of its carbon only (× 12/44), so the two are one signal in two units. Each point is a one-hour average; gaps in the line are stretches without readings.',
  fluxAria: 'Line chart of hourly CO₂ respiration and carbon flux',
  diurnalTitle: 'Diurnal average of soil CO₂',
  diurnalNote:
    'Each point is the average of all readings at that hour across the observation window; the two dashed lines mark ± 1 standard deviation around it.',
  diurnalPeak: (hour: string) => `It peaks around ${hour}.`,
  diurnalAria: 'Line chart of hourly average soil CO₂ with its ± 1 standard deviation range',
  sdPlus: '+1 standard deviation',
  sdMinus: '−1 standard deviation',
  regressionTitle: 'Regression of soil CO₂ on tide',
  regressionMeta: 'least squares',
  regressionNote:
    'The equation above estimates soil CO₂ from tide height alone. Its projection uses the tide forecast for the next few minutes, so it weakens quickly the further ahead it goes.',
  regressionTide: 'tide',
  estimateNow: 'Current estimate',
  lagTitle: 'CO₂ ↔ tide lag',
  minutes: 'minutes',
  minutesShort: 'min',
  projection: 'Projection',
  pairCount: (n: string) => `n = ${n} data pairs`,
  ccfTitle: 'Cross-correlation of soil CO₂ and tide',
  ccfMeta: 'by time lag',
  ccfNote:
    'Each bar is the correlation between soil CO₂ and the tide shifted by that lag. The lag with the tallest bar is how long the soil takes to respond to the water',
  ccfNoteLag: (minutes: string) => ` — about ${minutes} minutes for this window`,
  ccfPositive: 'Same direction',
  ccfNegative: 'Opposite',
  ccfLag: (lag: string) => `lag ${lag}`,
  ccfAria: 'Bar chart of the cross-correlation between soil CO₂ and tide for each time lag',
  ecoTitle: 'Ecosystem status',
  ecoNote:
    'The classification is computed by the server from the trends in soil CO₂, dissolved oxygen, and tide. The trends are printed below so the classification can be checked, not just trusted.',
  ecoTrend: (label: string) => `${label} trend`,
  ecoCo2Change: 'Soil CO₂ change',
  direction: { up: 'rising', down: 'falling', stable: 'stable' },
  ctdLevelTitle: 'Conductivity, water level, & tides',
  ctdLevelNote:
    'Conductivity rises as seawater flows in and falls when fresh water dominates — a marker of how far seawater reaches into the brackish water around the station. Water level is measured by the CTD sensor; the tide comes from the distance sensor on the tower, drawn as a moving average.',
  ctdLevelAria: 'Line chart of water conductivity, water level, and tides',

  groupStats: 'Statistical analysis',
  corrTitle: 'Correlation matrix between variables',
  corrMeta: 'Pearson coefficient',
  corrStrongest: 'The strongest off-diagonal correlation is between',
  corrCausation:
    'Correlation is not causation: two variables can move together because both follow the tide or the daily solar cycle.',
  corrCaption: 'Matrix of Pearson correlation coefficients between monitored variables',
  outlierTitle: 'Soil CO₂ outlier detection',
  outlierMeta: '1.5 × IQR method',
  outlierNote:
    'An outlier does not automatically mean a faulty sensor — some are real events (heavy rain, extreme low tide) that are the most interesting to investigate.',
  outlierCount: (n: string) => `${n} readings`,
  outlierCountRest: ' fall outside the normal range in this window.',
  outlierNone: 'No readings outside the normal range.',
  outlierRange: (lower: string, upper: string, unit: string) =>
    `normal range (1.5 × IQR): ${lower} - ${upper} ${unit}`,

  groupLatest: 'Latest readings',
  tableTitle: 'Soil CO₂ sensor',
  tableMeta: (shown: string, total: string) => `${shown} of ${total} readings`,
  tableCaption: 'Latest soil CO₂ sensor readings',
  kpiCaption: (window: string) =>
    `Large figure = latest reading; below it the lowest–highest range over the ${window}.`,
  kpiAria: (n: string) => `Latest readings from ${n} sensors`,
  kpiVsYesterday: 'vs yesterday',
  kpiAt: (time: string) => `at ${time}`,
};

const dictionaries: Record<Locale, JogoLautDictionary> = { id, en };

export function getJogoLautDictionary(locale: Locale): JogoLautDictionary {
  return dictionaries[locale];
}
