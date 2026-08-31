import { LEVEL_CLASSES, SERIES_CLASSES, fmt } from './chart-theme';
import type { Sensor, Stat, WaterMetric } from './data';

/* =========================================================================
   PANEL ANGKA

   Yang di berkas ini bukan grafik: ringkasan angka, bar ambang, matriks
   korelasi, hasil regresi, daftar pencilan, dan status sensor. Semuanya
   tabel atau daftar -- dan sengaja dirender sebagai <dl>/<table>/<ul>, bukan
   tumpukan <div>, supaya pembaca layar mendapat hubungan label-nilai yang
   sama dengan yang dilihat pembaca lain.
   ========================================================================= */

/** Enam angka terkini di atas grafik. Ini yang dibaca orang yang cuma punya
 *  lima detik; grafik di bawahnya untuk yang punya lima menit. */
export function StatTiles({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => {
        const rising = stat.trend > 0;
        const flat = stat.trend === 0;
        return (
          <div key={stat.label} className="bg-bg p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">{stat.label}</dt>
            <dd className="mt-2">
              <span className="font-mono text-2xl leading-none text-primary">
                {fmt(stat.value, stat.unit === 'ppm' || stat.unit === 'µS/cm' ? 0 : 2)}
              </span>{' '}
              <span className="font-mono text-xs text-muted">{stat.unit}</span>
              {/* Arah tren disampaikan oleh tanda + / - dan kata "naik"/"turun"
                  di label tersembunyi, bukan oleh warna saja. Naik juga tidak
                  otomatis "buruk": CO2 naik dan pH naik berarti dua hal yang
                  berbeda, jadi angkanya dibiarkan netral dan penafsirannya
                  diserahkan ke catatan kartu masing-masing. */}
              <p className="mt-1 font-mono text-xs text-muted">
                {flat ? '=' : rising ? '+' : '-'}
                {fmt(Math.abs(stat.trend), stat.unit === 'ppm' ? 0 : 2)} / 24 jam
              </p>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Bar ambang kualitas air: nilai terkini pada skala yang batas-batasnya ikut
 *  tercetak, jadi pembaca bisa menilai sendiri apakah angkanya wajar. */
export function LevelBars({ metrics }: { metrics: WaterMetric[] }) {
  return (
    <ul className="flex list-none flex-col gap-6 p-0">
      {metrics.map((metric) => {
        const min = metric.ticks[0];
        const max = metric.ticks[metric.ticks.length - 1];
        const ratio = Math.min(1, Math.max(0, (metric.value - min) / (max - min)));
        const classes = LEVEL_CLASSES[metric.level];

        return (
          <li key={metric.name}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-bold text-primary">{metric.name}</span>
              <span className={`text-xs font-bold ${classes.text}`}>{metric.levelLabel}</span>
            </div>

            <p className="mt-1">
              <span className="font-mono text-xl text-primary">
                {fmt(metric.value, metric.unit === 'µS/cm' ? 0 : 2)}
              </span>{' '}
              <span className="font-mono text-xs text-muted">{metric.unit}</span>
            </p>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-sm bg-surface">
              <div className={`h-full ${classes.swatch}`} style={{ width: `${ratio * 100}%` }} />
            </div>

            <div className="mt-1 flex justify-between font-mono text-xs text-muted">
              {metric.ticks.map((tick) => (
                <span key={tick}>{fmt(tick, Number.isInteger(tick) ? 0 : 1)}</span>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Matriks korelasi Pearson.
 *
 *  Sel diwarnai dengan opacity sebanding |r| dan rona mengikuti tandanya
 *  (biru untuk searah, merah bata untuk berlawanan). Opacity ditahan di
 *  bawah 0,32 supaya angka di atasnya tetap terbaca -- kalau ambang itu
 *  dinaikkan, kontras teksnya harus diukur ulang. Dan karena angkanya
 *  tercetak di tiap sel, warnanya cuma pemandu pindai, bukan datanya. */
export function CorrelationMatrix({
  variables,
  matrix,
}: {
  variables: readonly string[];
  matrix: number[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-lg border-collapse text-center font-mono text-xs">
        <caption className="sr-only">
          Matriks koefisien korelasi Pearson antar-variabel pemantauan
        </caption>
        <thead>
          <tr>
            <th className="p-2" />
            {variables.map((name) => (
              <th key={name} scope="col" className="p-2 font-bold text-muted">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variables.map((rowName, i) => (
            <tr key={rowName}>
              <th scope="row" className="whitespace-nowrap p-2 text-end font-bold text-muted">
                {rowName}
              </th>
              {variables.map((colName, j) => {
                const r = matrix[i][j];
                const positive = r >= 0;
                return (
                  <td key={colName} className="relative p-2 text-primary">
                    <span
                      aria-hidden
                      className={`absolute inset-0.5 rounded-sm ${
                        positive ? SERIES_CLASSES['series-2'].swatch : SERIES_CLASSES['series-6'].swatch
                      }`}
                      style={{ opacity: Math.abs(r) * 0.32 }}
                    />
                    <span className="relative">{fmt(r, 2)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Hasil regresi linear + ramalan lima langkah ke depan. */
export function RegressionPanel({
  slope,
  intercept,
  r2,
  current,
  steps,
}: {
  slope: number;
  intercept: number;
  r2: number;
  current: number;
  steps: { label: string; value: number }[];
}) {
  return (
    <div>
      <p className="rounded-md bg-surface p-3 font-mono text-sm text-primary">
        CO₂ = {fmt(slope, 3)} × pasut + {fmt(intercept, 1)}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">Estimasi saat ini</dt>
          <dd className="mt-1 font-mono text-3xl leading-none text-series-1">
            {fmt(current, 0)} <span className="text-xs text-muted">ppm</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">R²</dt>
          <dd className="mt-1 font-mono text-3xl leading-none text-primary">{fmt(r2, 3)}</dd>
        </div>
      </dl>

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-muted">Proyeksi</p>
      <ul className="mt-2 grid list-none grid-cols-5 gap-2 p-0">
        {steps.map((step) => (
          <li key={step.label} className="rounded-md border border-border p-2 text-center">
            <span className="block font-mono text-xs text-muted">{step.label}</span>
            <span className="mt-1 block font-mono text-sm text-primary">{fmt(step.value, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Daftar pencilan CO₂ tanah beserta rentang normalnya. */
export function OutlierPanel({
  lower,
  upper,
  found,
}: {
  lower: number;
  upper: number;
  found: { value: number; time: string }[];
}) {
  return (
    <div>
      <p className="text-sm text-muted">
        {found.length > 0 ? (
          <>
            <span className="font-bold text-level-alert">{found.length} pembacaan</span> berada di
            luar rentang normal selama jendela ini.
          </>
        ) : (
          <span className="font-bold text-level-good">
            Tidak ada pembacaan di luar rentang normal.
          </span>
        )}
      </p>

      {found.length > 0 ? (
        <ul className="mt-3 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {found.map((item) => (
            <li
              key={item.time}
              className="flex justify-between gap-3 rounded-sm bg-surface px-3 py-1.5 font-mono text-xs"
            >
              <span className="text-muted">{item.time}</span>
              <span className="text-level-alert">{fmt(item.value, 0)} ppm</span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-4 font-mono text-xs text-muted">
        rentang normal (1,5 × IQR): {fmt(lower, 0)} - {fmt(upper, 0)} ppm
      </p>
    </div>
  );
}

/** Status sebelas sensor stasiun. */
export function SensorStatus({ sensors }: { sensors: Sensor[] }) {
  return (
    // Tiap ubin berbingkai sendiri, bukan trik "gap-px di atas latar border".
    // Trik itu rapi selama jumlah ubinnya habis dibagi jumlah kolom; sebelas
    // sensor di empat kolom menyisakan tiga sel kosong yang muncul sebagai
    // blok abu-abu di ujung baris terakhir.
    <ul className="grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 lg:grid-cols-4">
      {sensors.map((sensor) => {
        const classes = LEVEL_CLASSES[sensor.level];
        return (
          <li key={sensor.name} className="rounded-lg border border-border bg-bg p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{sensor.name}</p>
            <p className="mt-2">
              <span className="font-mono text-lg text-primary">
                {fmt(sensor.value, sensor.unit === 'ppm' || sensor.unit === 'µS/cm' ? 0 : 1)}
              </span>{' '}
              <span className="font-mono text-xs text-muted">{sensor.unit}</span>
            </p>
            <p className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${classes.text}`}>
              <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${classes.swatch}`} />
              {sensor.status}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/** Ringkasan angin di samping mawar angin. */
export function WindStats({
  stats,
}: {
  stats: {
    dominantDir: string;
    dominantName: string;
    dominantShare: number;
    avgSpeed: number;
    avgBeaufort: string;
    maxSpeed: number;
    maxBeaufort: string;
  };
}) {
  return (
    <dl className="flex flex-col gap-6">
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-muted">Arah dominan</dt>
        <dd className="mt-1">
          <span className="font-mono text-3xl leading-none text-series-1">{stats.dominantDir}</span>
          <p className="mt-1 text-sm text-primary">{stats.dominantName}</p>
          <p className="font-mono text-xs text-muted">{fmt(stats.dominantShare, 1)}% kejadian</p>
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-muted">Kecepatan rata-rata</dt>
        <dd className="mt-1">
          <span className="font-mono text-3xl leading-none text-primary">
            {fmt(stats.avgSpeed, 1)}
          </span>{' '}
          <span className="font-mono text-xs text-muted">m/s</span>
          <p className="mt-1 text-sm text-muted">{stats.avgBeaufort}</p>
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-muted">Hembusan tertinggi</dt>
        <dd className="mt-1">
          <span className="font-mono text-3xl leading-none text-primary">
            {fmt(stats.maxSpeed, 1)}
          </span>{' '}
          <span className="font-mono text-xs text-muted">m/s</span>
          <p className="mt-1 text-sm text-muted">{stats.maxBeaufort}</p>
        </dd>
      </div>
    </dl>
  );
}
