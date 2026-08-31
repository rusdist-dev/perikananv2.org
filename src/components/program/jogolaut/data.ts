/* =========================================================================
   DATA STATIS DASBOR JOGO LAUT

   Angka di bawah CONTOH, bukan pembacaan sensor. Stasiun Cilacap belum
   terhubung ke situs ini, jadi kartu grafiknya diisi deret yang dibangkitkan
   di sini -- bentuknya (rentang, satuan, pola harian, keterlambatan CO2
   terhadap pasut) meniru dasbor operasional yang sudah berjalan, supaya tata
   letak dan skalanya tidak berubah lagi saat sumber sungguhan dipasang.

   Semua deret DITURUNKAN, bukan diketik: 112 titik x 10 seri sebagai literal
   akan jadi ribuan baris yang tidak bisa dibaca, dan salah satu angkanya
   pasti menyimpang saat disunting. Yang diketik adalah rumusnya.

   Tidak ada Math.random() dan tidak ada Date.now() di berkas ini. Halaman
   /discover/jogo-laut dirender di server; nilai acak atau tanggal "sekarang"
   membuat markup server berbeda dari klien dan membuat hasil build tidak bisa
   direproduksi. `noise()` di bawah deterministik, dan tanggalnya konstanta.

   Cara menukar ke data sungguhan: ganti isi berkas ini dengan pengambilan
   data, pertahankan bentuk objek yang diekspor. Komponen grafiknya tidak tahu
   dari mana angkanya datang.
   ========================================================================= */

/** Hash sin deterministik, 0..1. Bukan PRNG kriptografis -- tugasnya cuma
 *  membuat garis tidak terlihat seperti gelombang sinus sempurna. */
function noise(i: number, seed: number): number {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** noise() digeser ke -1..1, bentuk yang lebih sering dipakai di bawah. */
function swing(i: number, seed: number): number {
  return noise(i, seed) * 2 - 1;
}

const round = (v: number, digits = 2) => Number(v.toFixed(digits));

/* --- Sumbu waktu --------------------------------------------------------
   14 hari, satu sampel tiap 3 jam. Interval 3 jam adalah kompromi yang
   disengaja: cukup rapat untuk memperlihatkan siklus pasut semidiurnal
   (~12,4 jam) sebagai gelombang, cukup jarang supaya path SVG-nya tetap
   ringan dan garisnya tidak jadi pita padat di lebar ponsel. */
const SAMPLE_HOURS = 3;
const DAYS = 14;
const N = (DAYS * 24) / SAMPLE_HOURS;

/** Tanggal jendela data. Konstanta, bukan `new Date()` -- lihat catatan
 *  reproduktibilitas di kepala berkas. */
export const PERIOD_LABEL = '01 - 14 Agustus 2026';
export const LAST_UPDATE = '14 Agu 2026, 21:00 WIB';

const MONTH_SHORT = 'Agu';
const START_DAY = 1;

/** Jam ke-i sejak awal jendela. */
const hourAt = (i: number) => i * SAMPLE_HOURS;

/** Label sumbu-x. Hanya tanggalnya: jam ikut tercetak akan membuat label
 *  bertumpuk di lebar mana pun, dan yang dibaca dari grafik 14 hari memang
 *  harinya, bukan jamnya. */
export const timeLabels: string[] = Array.from({ length: N }, (_, i) => {
  const day = START_DAY + Math.floor(hourAt(i) / 24);
  return `${String(day).padStart(2, '0')} ${MONTH_SHORT}`;
});

/* --- Deret utama --------------------------------------------------------
   Pasut jadi deret pertama karena deret lain menumpang padanya: CO2 tanah
   naik saat air surut (pori tanah terbuka, respirasi terlepas) dan tertekan
   saat pasang. Keterlambatan itu ditulis eksplisit sebagai LAG_STEPS supaya
   angka jeda di kartu regresi tidak jadi klaim yang tidak didukung deretnya
   sendiri. */

/** Pasang surut (cm dari MSL). Dua komponen: M2 semidiurnal (12,42 jam) dan
 *  modulasi purnama-perbani ~14 hari. */
export const pasut: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  const spring = 1 + 0.28 * Math.sin((2 * Math.PI * h) / (14 * 24));
  return round(72 * spring * Math.sin((2 * Math.PI * h) / 12.42) + 6 * swing(i, 1), 1);
});

/** Jeda respons CO2 terhadap pasut, dinyatakan dalam langkah sampel. */
const LAG_STEPS = 1;
export const LAG_MINUTES = LAG_STEPS * SAMPLE_HOURS * 60;

/** Lonjakan singkat: tiga pembacaan yang jauh keluar dari pola.
 *
 *  Ada dengan sengaja. Deret yang mulus sempurna membuat kartu deteksi
 *  pencilan di bawah selalu melaporkan "tidak ada" -- benar untuk datanya,
 *  tapi menyembunyikan justru keadaan yang menjadi alasan kartu itu dibuat.
 *  Data sensor sungguhan memang berlonjak: hujan deras yang membanjiri pori
 *  tanah, surut ekstrem, atau kabel yang tersenggol saat pemeliharaan. */
const SPIKES: Record<number, number> = { 27: 265, 61: -235, 94: 300 };

/** CO2 tanah TANPA lonjakan. Bukan deret yang ditampilkan -- ini dasar untuk
 *  rata-rata diurnal di bawah, yang memang harus mengabaikan pencilan: satu
 *  lonjakan 300 ppm cukup untuk menggeser jam puncak rata-rata ke jam
 *  kejadiannya, dan kartu itu lalu melaporkan artefak sebagai pola harian. */
const co2TanahBase: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  const tide = pasut[Math.max(0, i - LAG_STEPS)];
  const diurnal = 55 * Math.sin((2 * Math.PI * (h - 9)) / 24);
  return round(640 - 0.85 * tide + diurnal + 22 * swing(i, 2), 0);
});

/** CO2 tanah (ppm) sebagaimana terekam, lonjakan ikut. Ini yang digambar di
 *  grafik, dipakai deteksi pencilan, korelasi, dan regresi -- membuang
 *  pencilan sebelum menghitung korelasi akan membuat angkanya terlihat lebih
 *  rapi daripada datanya. */
export const co2Tanah: number[] = co2TanahBase.map((value, i) => value + (SPIKES[i] ?? 0));

/** CO2 udara (ppm). Jauh lebih stabil dari CO2 tanah -- itulah gunanya
 *  ditumpuk di grafik yang sama: pembaca melihat sendiri bahwa yang berayun
 *  adalah tanahnya, bukan sensornya. */
export const co2Udara: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  return round(418 + 9 * Math.sin((2 * Math.PI * (h - 5)) / 24) + 3 * swing(i, 3), 0);
});

export const suhuUdara: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  return round(27.6 + 4.1 * Math.sin((2 * Math.PI * (h - 9)) / 24) + 0.5 * swing(i, 4), 1);
});

export const kelembaban: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  return round(79 - 11 * Math.sin((2 * Math.PI * (h - 9)) / 24) + 2.5 * swing(i, 5), 1);
});

export const kecAngin: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  return round(3.4 + 1.5 * Math.sin((2 * Math.PI * (h - 13)) / 24) + 0.8 * noise(i, 6), 1);
});

export const suhuAir: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  return round(29.1 + 1.3 * Math.sin((2 * Math.PI * (h - 11)) / 24) + 0.3 * swing(i, 7), 1);
});

/** Oksigen terlarut (mg/L). Berbanding terbalik dengan suhu air (kelarutan O2
 *  turun saat air menghangat) dan ikut naik saat pasang membawa air laut yang
 *  lebih teraduk. */
export const doAir: number[] = Array.from({ length: N }, (_, i) =>
  round(6.9 - 0.42 * (suhuAir[i] - 29.1) + 0.004 * pasut[i] + 0.18 * swing(i, 8), 2),
);

export const phAir: number[] = Array.from({ length: N }, (_, i) => {
  const h = hourAt(i);
  return round(7.92 + 0.22 * Math.sin((2 * Math.PI * (h - 15)) / 24) + 0.05 * swing(i, 9), 2);
});

export const konduktivitas: number[] = Array.from({ length: N }, (_, i) =>
  round(1950 + 6.2 * pasut[i] + 70 * swing(i, 10), 0),
);

/** Curah hujan (mm per 3 jam). Sengaja nol di sebagian besar titik: hujan yang
 *  "selalu sedikit" adalah kebohongan visual -- yang terjadi di lapangan
 *  adalah beberapa kejadian pendek yang deras. */
export const curahHujan: number[] = Array.from({ length: N }, (_, i) => {
  const wet = noise(i, 11);
  return wet > 0.9 ? round(2 + 14 * noise(i, 12), 1) : 0;
});

/* --- Jendela sorotan ----------------------------------------------------
   Lima hari terakhir dari jendela yang sama.

   Kenapa perlu: pasut berayun dua kali sehari, jadi 14 hari berarti 28 puncak
   yang harus muat di lebar kartu. Di kartu selebar halaman itu masih terbaca;
   di kartu setengah lebar, dua puluh delapan ayunan menyatu jadi pita padat
   yang tidak mengabarkan apa pun selain "berayun". Kartu setengah lebar karena
   itu memakai potongan lima hari (10 ayunan) dari deret YANG SAMA -- bukan
   deret lain, jadi angka di dua kartu tidak bisa saling bertentangan. */
const RECENT_DAYS = 5;
const RECENT_FROM = N - (RECENT_DAYS * 24) / SAMPLE_HOURS;

export const RECENT_PERIOD_LABEL = `${String(START_DAY + DAYS - RECENT_DAYS).padStart(2, '0')} - ${String(START_DAY + DAYS - 1).padStart(2, '0')} Agustus 2026`;
export const recentTimeLabels = timeLabels.slice(RECENT_FROM);

/** Potongan lima hari terakhir dari sebuah deret. */
export function recent(series: number[]): number[] {
  return series.slice(RECENT_FROM);
}

/* --- Fluks karbon per jam ----------------------------------------------
   Positif = emisi (karbon lepas ke atmosfer), negatif = serapan. Satu hari
   penuh, resolusi 1 jam -- beda dari deret 14 hari di atas, karena yang
   ditanyakan di sini adalah bentuk hariannya. */
export const hourLabels: string[] = Array.from({ length: 24 }, (_, h) =>
  String(h).padStart(2, '0'),
);

export const respirasi: number[] = Array.from({ length: 24 }, (_, h) =>
  round(0.42 + 0.3 * Math.sin((2 * Math.PI * (h - 10)) / 24) + 0.05 * swing(h, 13), 3),
);

export const fluksKarbon: number[] = Array.from({ length: 24 }, (_, h) =>
  round(0.16 * Math.sin((2 * Math.PI * (h - 3)) / 24) + 0.04 * swing(h, 14), 3),
);

/* --- Rata-rata diurnal CO2 tanah ---------------------------------------
   Rata-rata tiap jam sepanjang jendela 14 hari, dengan simpangan bakunya.
   Dihitung dari deret 3 jam-an di atas, bukan dibangkitkan sendiri -- kalau
   tidak, dua kartu di halaman yang sama akan menceritakan hari yang berbeda.
   Sumbernya co2TanahBase (tanpa lonjakan), lihat alasannya di sana. */
const bucket: number[][] = Array.from({ length: 24 }, () => []);
co2TanahBase.forEach((v, i) => bucket[hourAt(i) % 24].push(v));

const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

export const diurnalMean: number[] = bucket.map((values, h) => {
  if (values.length > 0) return round(mean(values), 0);
  // Jam yang tidak pernah tersampel (interval 3 jam hanya mengenai 8 dari 24
  // jam) diisi interpolasi linear dari dua jam bertetangga yang tersampel,
  // bukan nol -- batang nol akan terbaca sebagai "tidak ada emisi jam itu".
  const prev = bucket[(Math.floor(h / SAMPLE_HOURS) * SAMPLE_HOURS) % 24];
  const next = bucket[(Math.ceil(h / SAMPLE_HOURS) * SAMPLE_HOURS) % 24];
  const w = (h % SAMPLE_HOURS) / SAMPLE_HOURS;
  return round(mean(prev) * (1 - w) + mean(next) * w, 0);
});

export const diurnalStd: number[] = diurnalMean.map((_, h) =>
  round(38 + 16 * Math.abs(Math.sin((2 * Math.PI * h) / 24)) + 6 * noise(h, 15), 0),
);

export const peakHour = diurnalMean.indexOf(Math.max(...diurnalMean));

/* --- Mawar angin --------------------------------------------------------
   Frekuensi kemunculan tiap arah (%), 16 penjuru. Timur laut dominan --
   pola musim kemarau di pesisir selatan Jawa. */
export const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

export const windRose: number[] = [
  4.1, 7.8, 13.6, 11.2, 8.4, 5.1, 3.6, 2.4,
  2.1, 2.8, 4.4, 6.2, 8.9, 7.1, 5.6, 6.7,
];

export const windStats = {
  dominantDir: 'NE',
  dominantName: 'Timur Laut',
  dominantShare: 13.6,
  avgSpeed: 3.9,
  avgBeaufort: 'Angin lemah (Beaufort 3)',
  maxSpeed: 9.4,
  maxBeaufort: 'Angin sedang (Beaufort 5)',
};

/* --- Nilai terkini + ambang --------------------------------------------
   `level` adalah TEKS, bukan warna. Komponen memilih warnanya dari level;
   membalik arahnya (warna dulu, teks menyusul) membuat kartu yang lupa
   menulis levelnya tetap terlihat benar bagi yang bisa membedakan warna, dan
   kosong bagi yang tidak. */
export type Level = 'good' | 'warn' | 'alert';

export type WaterMetric = {
  name: string;
  value: number;
  unit: string;
  level: Level;
  levelLabel: string;
  /** Batas skala bar, sekaligus label tick di bawahnya. Yang pertama dan
   *  terakhir jadi domain bar-nya. */
  ticks: number[];
};

export const waterQuality: WaterMetric[] = [
  {
    name: 'Oksigen terlarut',
    value: doAir[N - 1],
    unit: 'mg/L',
    level: 'good',
    levelLabel: 'Baik',
    ticks: [0, 2, 5, 8, 14],
  },
  {
    name: 'Konduktivitas',
    value: konduktivitas[N - 1],
    unit: 'µS/cm',
    level: 'warn',
    levelLabel: 'Payau',
    ticks: [0, 750, 1500, 2250, 3000],
  },
  {
    name: 'Suhu air',
    value: suhuAir[N - 1],
    unit: '°C',
    level: 'good',
    levelLabel: 'Normal',
    ticks: [20, 25, 30, 35, 40],
  },
  {
    name: 'pH air',
    value: phAir[N - 1],
    unit: 'pH',
    level: 'good',
    levelLabel: 'Basa lemah',
    ticks: [0, 3.5, 7, 10.5, 14],
  },
];

export const heatIndex = {
  value: 31.4,
  min: 20,
  max: 55,
  airTemp: suhuUdara[N - 1],
  humidity: kelembaban[N - 1],
  level: 'warn' as Level,
  levelLabel: 'Waspada',
  description:
    'Kelelahan mungkin terjadi setelah paparan panjang. Kerja lapangan disarankan sebelum pukul 10.00 atau setelah 15.00.',
};

export const phGauge = {
  value: phAir[N - 1],
  min: 0,
  max: 14,
  waterTemp: suhuAir[N - 1],
  level: 'good' as Level,
  levelLabel: 'Basa lemah',
};

/* --- Ringkasan angka ----------------------------------------------------
   Enam angka yang paling sering ditanyakan, di atas grafik. `trend` dihitung
   dari deret aslinya (selisih rata-rata 24 jam terakhir terhadap 24 jam
   sebelumnya), bukan diketik -- angka tren yang tidak sinkron dengan grafiknya
   adalah cara tercepat membuat dasbor tidak dipercaya. */
function trendOf(series: number[], digits = 1): number {
  const perDay = 24 / SAMPLE_HOURS;
  const last = mean(series.slice(-perDay));
  const prev = mean(series.slice(-2 * perDay, -perDay));
  return round(last - prev, digits);
}

export type Stat = {
  label: string;
  value: number;
  unit: string;
  trend: number;
};

export const stats: Stat[] = [
  { label: 'CO2 tanah', value: co2Tanah[N - 1], unit: 'ppm', trend: trendOf(co2Tanah, 0) },
  { label: 'CO2 udara', value: co2Udara[N - 1], unit: 'ppm', trend: trendOf(co2Udara, 0) },
  { label: 'Oksigen terlarut', value: doAir[N - 1], unit: 'mg/L', trend: trendOf(doAir, 2) },
  { label: 'pH air', value: phAir[N - 1], unit: 'pH', trend: trendOf(phAir, 2) },
  { label: 'Suhu air', value: suhuAir[N - 1], unit: '°C', trend: trendOf(suhuAir) },
  { label: 'Pasang surut', value: pasut[N - 1], unit: 'cm', trend: trendOf(pasut) },
];

/* --- Matriks korelasi ---------------------------------------------------
   Koefisien Pearson antar-variabel, dihitung dari deret di atas -- bukan
   diketik, karena alasan yang sama dengan tren di atas. */
export const CORR_VARS = ['CO2 tanah', 'Pasut', 'Suhu air', 'DO', 'pH', 'Kelembaban'] as const;

const CORR_SERIES: Record<(typeof CORR_VARS)[number], number[]> = {
  'CO2 tanah': co2Tanah,
  Pasut: pasut,
  'Suhu air': suhuAir,
  DO: doAir,
  pH: phAir,
  Kelembaban: kelembaban,
};

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i += 1) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  return round(num / Math.sqrt(da * db), 2);
}

export const corrMatrix: number[][] = CORR_VARS.map((v1) =>
  CORR_VARS.map((v2) => pearson(CORR_SERIES[v1], CORR_SERIES[v2])),
);

/** Pasangan dengan |r| tertinggi di luar diagonal -- dipakai sebagai catatan
 *  di bawah matriks supaya pembaca tidak perlu memindai 36 sel sendiri. */
export const strongestPair = (() => {
  let best = { a: CORR_VARS[0] as string, b: CORR_VARS[1] as string, r: 0 };
  CORR_VARS.forEach((v1, i) => {
    CORR_VARS.forEach((v2, j) => {
      if (j <= i) return;
      const r = corrMatrix[i][j];
      if (Math.abs(r) > Math.abs(best.r)) best = { a: v1, b: v2, r };
    });
  });
  return best;
})();

/* --- Regresi linear CO2 ~ pasut ---------------------------------------- */
export const regression = (() => {
  const x = pasut.map((_, i) => pasut[Math.max(0, i - LAG_STEPS)]);
  const y = co2Tanah;
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) ** 2;
  }
  const slope = num / den;
  const intercept = my - slope * mx;
  const r = pearson(x, y);
  const predict = (tide: number) => slope * tide + intercept;
  return {
    slope: round(slope, 3),
    intercept: round(intercept, 1),
    r2: round(r * r, 3),
    current: round(predict(pasut[N - 1]), 0),
    /** Lima langkah ke depan, memakai pasut yang diramal dari komponen M2 --
     *  ekstrapolasi harmonik, bukan garis lurus dari titik terakhir. */
    steps: Array.from({ length: 5 }, (_, k) => {
      const h = hourAt(N - 1) + (k + 1) * SAMPLE_HOURS;
      const tide = 72 * Math.sin((2 * Math.PI * h) / 12.42);
      return { label: `+${(k + 1) * SAMPLE_HOURS}j`, value: round(predict(tide), 0) };
    }),
  };
})();

/* --- Pencilan -----------------------------------------------------------
   Metode 1,5 x IQR pada CO2 tanah. */
export const outliers = (() => {
  const sorted = [...co2Tanah].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.floor(sorted.length * p)];
  const iqr = q(0.75) - q(0.25);
  const lower = round(q(0.25) - 1.5 * iqr, 0);
  const upper = round(q(0.75) + 1.5 * iqr, 0);
  const found = co2Tanah
    .map((value, i) => ({
      value,
      time: `${timeLabels[i]} ${String(hourAt(i) % 24).padStart(2, '0')}:00`,
    }))
    .filter((d) => d.value < lower || d.value > upper);
  return { lower, upper, found };
})();

/* --- Status sensor ------------------------------------------------------ */
export type Sensor = {
  name: string;
  value: number;
  unit: string;
  level: Level;
  status: string;
};

export const sensors: Sensor[] = [
  { name: 'CO2 tanah', value: co2Tanah[N - 1], unit: 'ppm', level: 'good', status: 'Aktif' },
  { name: 'CO2 udara', value: co2Udara[N - 1], unit: 'ppm', level: 'good', status: 'Aktif' },
  { name: 'Suhu udara', value: suhuUdara[N - 1], unit: '°C', level: 'good', status: 'Aktif' },
  { name: 'Kelembaban', value: kelembaban[N - 1], unit: '%', level: 'good', status: 'Aktif' },
  { name: 'Kecepatan angin', value: kecAngin[N - 1], unit: 'm/s', level: 'good', status: 'Aktif' },
  { name: 'Oksigen terlarut', value: doAir[N - 1], unit: 'mg/L', level: 'good', status: 'Aktif' },
  { name: 'pH air', value: phAir[N - 1], unit: 'pH', level: 'good', status: 'Aktif' },
  { name: 'Suhu air', value: suhuAir[N - 1], unit: '°C', level: 'good', status: 'Aktif' },
  {
    name: 'Konduktivitas',
    value: konduktivitas[N - 1],
    unit: 'µS/cm',
    level: 'warn',
    status: 'Kalibrasi terjadwal',
  },
  { name: 'Pasang surut', value: pasut[N - 1], unit: 'cm', level: 'good', status: 'Aktif' },
  { name: 'Curah hujan', value: curahHujan[N - 1], unit: 'mm', level: 'good', status: 'Aktif' },
];

export const SAMPLE_COUNT = N;
export const SAMPLE_INTERVAL_HOURS = SAMPLE_HOURS;
