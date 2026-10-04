import type { CSSProperties } from 'react';
import '@/components/program/ImpactStatsMarquee.css';
import type { Locale } from '@/i18n/config';
import type { JlAnalysis, JlEcosystem, JlKpi, JlTable, JlWindrose } from '@/lib/content/jogolaut';
import { SERIES_CLASSES, apiColor, fmt, type SeriesColor } from './chart-theme';
import { getJogoLautDictionary } from '@/i18n/dictionaries/jogolaut';
import { clockLabel, dateTimeLabel } from './time';

/* =========================================================================
   PANEL ANGKA

   Yang di berkas ini bukan grafik: ringkasan angka, matriks korelasi, hasil
   regresi, daftar pencilan, status ekosistem, dan tabel pembacaan. Semuanya
   tabel atau daftar -- dan sengaja dirender sebagai <dl>/<table>/<ul>, bukan
   tumpukan <div>, supaya pembaca layar mendapat hubungan label-nilai yang
   sama dengan yang dilihat pembaca lain.
   ========================================================================= */

const signed = (value: number, digits: number, locale: Locale) =>
  `${value > 0 ? '+' : value < 0 ? '-' : '±'}${fmt(Math.abs(value), digits, locale)}`;

/** Detik per ubin. Sama dengan pita totalan Our Impact: pelan, karena
 *  angkanya dibaca sambil lewat. Dihitung per ubin supaya lajunya tidak
 *  berubah saat API menambah KPI -- yang bertambah panjang barisnya. */
const SECONDS_PER_TILE = 6;

function StatTile({ item, locale }: { item: JlKpi; locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  return (
    // me-3, bukan gap di <ul>: jarak antar-ubin harus sama juga di sambungan
    // antara daftar asli dan salinannya, dan gap tidak berlaku di sana.
    <li className="me-3 w-52 shrink-0 rounded-lg border border-border bg-bg p-4">
      {/* Dua baris dengan tinggi tetap, bukan truncate: "Jarak sensor ke muka
          air" terpotong jadi tebakan. Tinggi tetap menjaga angka besar di
          semua ubin tetap sebaris. */}
      <p className="line-clamp-2 min-h-8 text-xs font-bold uppercase leading-4 tracking-wide text-muted">
        {item.label}
      </p>
      <p className="mt-2">
        <span className="font-mono text-2xl leading-none text-primary">
          {item.latest === null ? '–' : fmt(item.latest, item.dec, locale)}
        </span>{' '}
        <span className="font-mono text-xs text-muted">{item.unit}</span>
      </p>
      {item.min !== null && item.max !== null ? (
        <p className="mt-1 font-mono text-xs text-muted">
          {fmt(item.min, item.dec, locale)} – {fmt(item.max, item.dec, locale)}
        </p>
      ) : null}
      {/* Arahnya disampaikan tanda + / -, bukan warna. Naik juga tidak
          otomatis "buruk": CO2 naik dan pH naik berarti dua hal yang
          berbeda, jadi angkanya dibiarkan netral. */}
      {item.delta !== null ? (
        <p className="font-mono text-xs text-muted">
          {signed(item.delta, item.dec, locale)} {t.kpiVsYesterday}
        </p>
      ) : null}
      {item.latestAt ? (
        <p className="font-mono text-xs text-muted">{t.kpiAt(clockLabel(item.latestAt))}</p>
      ) : null}
    </li>
  );
}

/** Angka terkini tiap sensor sebagai pita berjalan dua baris.
 *
 *  Memakai CSS pita totalan Our Impact (ImpactStatsMarquee.css): gerakan
 *  murni CSS, berhenti saat disentuh atau difokus, dan mati total di bawah
 *  prefers-reduced-motion -- di sana wadahnya jadi area yang digulir sendiri.
 *  Baris kedua berjalan ke arah sebaliknya.
 *
 *  Tiap baris dirender DUA KALI; salinannya aria-hidden, karena pembaca layar
 *  tidak boleh mendengar setiap KPI dua kali. */
export function StatTiles({ items, locale }: { items: JlKpi[]; locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  const half = Math.ceil(items.length / 2);
  const rows = items.length > 4 ? [items.slice(0, half), items.slice(half)] : [items];

  return (
    <div
      className="stats-marquee flex flex-col gap-3"
      tabIndex={0}
      role="group"
      aria-label={t.kpiAria(fmt(items.length, 0, locale))}
    >
      {rows.map((row, r) => (
        <div
          key={r}
          className="stats-marquee-track"
          data-direction={r === 1 ? 'reverse' : undefined}
          style={{ '--stats-marquee-duration': `${row.length * SECONDS_PER_TILE}s` } as CSSProperties}
        >
          <ul className="flex list-none p-0">
            {row.map((item) => (
              <StatTile key={item.key} item={item} locale={locale} />
            ))}
          </ul>
          <ul aria-hidden className="stats-marquee-clone flex list-none p-0">
            {row.map((item) => (
              <StatTile key={item.key} item={item} locale={locale} />
            ))}
          </ul>
        </div>
      ))}
    </div>
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
  locale,
}: {
  variables: readonly string[];
  matrix: (number | null)[][];
  locale: Locale;
}) {
  const t = getJogoLautDictionary(locale);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-lg border-collapse text-center font-mono text-xs">
        <caption className="sr-only">{t.corrCaption}</caption>
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
                if (r === null) {
                  return (
                    <td key={colName} className="p-2 text-muted">
                      –
                    </td>
                  );
                }
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
                    <span className="relative">{fmt(r, 2, locale)}</span>
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

/** Regresi linear CO2 tanah terhadap pasut + proyeksi beberapa langkah ke
 *  depan. Proyeksinya dicetak sebagian (tiap 15 menit), bukan kedua belas
 *  langkah: selisih antar-langkah 5 menit di bawah satu ppm, dan dua belas
 *  kotak berisi angka yang nyaris sama cuma menambah yang harus dipindai. */
export function RegressionPanel({ analysis, locale }: { analysis: JlAnalysis; locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  const { regression, estimateNow, unit } = analysis;
  const shown = analysis.predictions.filter(
    (p, i, all) => p.value !== null && (p.minutesAhead % 15 === 0 || all.length <= 5),
  );

  return (
    <div>
      {regression ? (
        <p className="rounded-md bg-surface p-3 font-mono text-sm text-primary">
          CO₂ = {fmt(regression.slope, 4, locale)} × {t.regressionTide} {regression.intercept < 0 ? '−' : '+'}{' '}
          {fmt(Math.abs(regression.intercept), 1, locale)}
        </p>
      ) : null}

      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">{t.estimateNow}</dt>
          <dd className="mt-1 font-mono text-3xl leading-none text-series-1">
            {estimateNow === null ? '–' : fmt(estimateNow, 0, locale)}{' '}
            <span className="text-xs text-muted">{unit}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">{t.lagTitle}</dt>
          <dd className="mt-1 font-mono text-3xl leading-none text-primary">
            {analysis.lagMinutes === null ? '–' : fmt(analysis.lagMinutes, 0, locale)}{' '}
            <span className="text-xs text-muted">{t.minutes}</span>
          </dd>
        </div>
      </dl>

      {shown.length > 0 ? (
        <>
          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-muted">{t.projection}</p>
          <ul className="mt-2 grid list-none grid-cols-4 gap-2 p-0">
            {shown.map((step) => (
              <li key={step.minutesAhead} className="rounded-md border border-border p-2 text-center">
                <span className="block font-mono text-xs text-muted">+{fmt(step.minutesAhead, 0, locale)} {t.minutesShort}</span>
                <span className="mt-1 block font-mono text-sm text-primary">
                  {fmt(step.value ?? 0, 0, locale)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {regression?.n ? (
        <p className="mt-4 font-mono text-xs text-muted">{t.pairCount(fmt(regression.n, 0, locale))}</p>
      ) : null}
    </div>
  );
}

/** Daftar pencilan CO₂ tanah beserta rentang normalnya. */
export function OutlierPanel({
  analysis,
  locale,
}: {
  analysis: JlAnalysis;
  locale: Locale;
}) {
  const t = getJogoLautDictionary(locale);
  const { items, lower, upper } = analysis.outliers;
  const unit = analysis.unit;

  return (
    <div>
      <p className="text-sm text-muted">
        {items.length > 0 ? (
          <>
            <span className="font-bold text-level-alert">
              {t.outlierCount(fmt(items.length, 0, locale))}
            </span>
            {t.outlierCountRest}
          </>
        ) : (
          <span className="font-bold text-level-good">{t.outlierNone}</span>
        )}
      </p>

      {items.length > 0 ? (
        <ul className="mt-3 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li
              key={`${item.time ?? ''}-${i}`}
              className="flex justify-between gap-3 rounded-sm bg-surface px-3 py-1.5 font-mono text-xs"
            >
              <span className="text-muted">{item.time ? dateTimeLabel(item.time, locale) : '–'}</span>
              <span className="text-level-alert">
                {item.value === null ? '–' : fmt(item.value, 0, locale)} {unit}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {lower !== null && upper !== null ? (
        <p className="mt-4 font-mono text-xs text-muted">
          {t.outlierRange(fmt(lower, 0, locale), fmt(upper, 0, locale), unit)}
        </p>
      ) : null}
    </div>
  );
}

/** Kode arah dari API -> kunci `direction` di kamus. Beberapa sinonim
 *  diterima karena kodenya belum pernah terlihat selain "stable". */
const DIRECTION_KEY: Record<string, string> = {
  up: 'up',
  rising: 'up',
  increase: 'up',
  increasing: 'up',
  down: 'down',
  falling: 'down',
  decrease: 'down',
  decreasing: 'down',
  stable: 'stable',
};

/** Klasifikasi ekosistem dari API: label + uraian, ditambah tren deret yang
 *  dipakai untuk mengklasifikasikannya -- supaya labelnya bisa diperiksa,
 *  bukan cuma dipercaya. */
export function EcosystemPanel({
  ecosystem,
  labelFor,
  unitFor,
  locale,
}: {
  ecosystem: JlEcosystem;
  locale: Locale;
  /** Nama tampilan untuk key deret (co2_tanah, do, pasut_ma, ...). */
  labelFor: (key: string) => string;
  unitFor: (key: string) => string;
}) {
  const t = getJogoLautDictionary(locale);
  const color = apiColor(ecosystem.color);
  const change = ecosystem.co2Change;

  return (
    <div>
      <p className={`flex items-center gap-2 text-lg font-bold ${SERIES_CLASSES[color].text}`}>
        <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${SERIES_CLASSES[color].swatch}`} />
        {ecosystem.label}
      </p>
      {ecosystem.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">{ecosystem.description}</p>
      ) : null}

      {ecosystem.trends.length > 0 || change ? (
        <dl className="mt-5 flex flex-col gap-3">
          {ecosystem.trends.map((trend) => (
            <div
              key={trend.key}
              className="flex items-baseline justify-between gap-3 border-b border-border pb-3"
            >
              <dt className="text-sm text-muted">{t.ecoTrend(labelFor(trend.key))}</dt>
              <dd className="font-mono text-sm text-primary">
                {signed(trend.value, Math.abs(trend.value) < 0.1 ? 3 : 1, locale)} {unitFor(trend.key)}
              </dd>
            </div>
          ))}
          {change ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm text-muted">{t.ecoCo2Change}</dt>
              <dd className="font-mono text-sm text-primary">
                {signed(change.delta, 0, locale)} {unitFor('co2_tanah')}
                {change.direction ? (
                  <span className="ms-2 text-muted">
                    ({t.direction[DIRECTION_KEY[change.direction] ?? ''] ?? change.direction})
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}

/** Ringkasan angin di samping mawar angin, termasuk sebaran kelas
 *  kecepatannya -- mawar angin cuma menggambar arah. */
export function WindStats({ windrose, locale }: { windrose: JlWindrose; locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  const { dominant, total, unit } = windrose;
  const dominantCount = dominant
    ? (windrose.directions.find((d) => d.dir === dominant.dir)?.count ?? 0)
    : 0;

  return (
    <dl className="flex flex-col gap-6">
      {dominant ? (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">{t.windDominant}</dt>
          <dd className="mt-1">
            <span className="font-mono text-3xl leading-none text-series-1">{dominant.dir}</span>
            <p className="mt-1 text-sm text-primary">{dominant.label}</p>
            {total > 0 ? (
              <p className="font-mono text-xs text-muted">
                {t.windShare(fmt((dominantCount / total) * 100, 1, locale), fmt(total, 0, locale))}
              </p>
            ) : null}
          </dd>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">{t.windAverage}</dt>
          <dd className="mt-1">
            <span className="font-mono text-2xl leading-none text-primary">
              {windrose.avgSpeed === null ? '–' : fmt(windrose.avgSpeed, 1, locale)}
            </span>{' '}
            <span className="font-mono text-xs text-muted">{unit}</span>
            {windrose.beaufortAvg ? (
              <p className="mt-1 text-sm text-muted">{windrose.beaufortAvg}</p>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">{t.windMax}</dt>
          <dd className="mt-1">
            <span className="font-mono text-2xl leading-none text-primary">
              {windrose.maxSpeed === null ? '–' : fmt(windrose.maxSpeed, 1, locale)}
            </span>{' '}
            <span className="font-mono text-xs text-muted">{unit}</span>
            {windrose.beaufortMax ? (
              <p className="mt-1 text-sm text-muted">{windrose.beaufortMax}</p>
            ) : null}
          </dd>
        </div>
      </div>
      {windrose.speedBins.length > 0 && total > 0 ? (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-muted">
            {t.windSpeedDistribution}
          </dt>
          <dd className="mt-2">
            <ul className="flex list-none flex-col gap-1.5 p-0">
              {windrose.speedBins.map((bin) => {
                const share = (bin.count / total) * 100;
                return (
                  <li key={bin.key} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-2">
                    <span className="font-mono text-xs text-muted">
                      {bin.max === null ? `≥ ${fmt(bin.min, 0, locale)}` : `${fmt(bin.min, 0, locale)}–${fmt(bin.max, 0, locale)}`}{' '}
                      {unit}
                    </span>
                    <span className="h-2 overflow-hidden rounded-sm bg-surface">
                      <span
                        className="block h-full bg-series-1"
                        style={{ width: `${share}%`, opacity: 0.75 }}
                      />
                    </span>
                    <span className="text-end font-mono text-xs text-muted">{fmt(share, 0, locale)}%</span>
                  </li>
                );
              })}
            </ul>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

/** Pembacaan mentah sensor CO2 terbaru. Kolom dan labelnya datang dari API,
 *  jadi kolom baru di CMS muncul di sini tanpa perubahan kode. */
export function DataTable({ table, locale }: { table: JlTable; locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-xl border-collapse text-xs">
        <caption className="sr-only">{t.tableCaption}</caption>
        <thead>
          <tr className="border-b border-border">
            {table.columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`p-2 font-bold text-muted ${col.key === 'waktu' ? 'text-start' : 'text-end'}`}
              >
                {col.label}
                {col.unit ? <span className="ms-1 font-mono font-normal">({col.unit})</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={`${String(row.waktu ?? '')}-${i}`} className="border-b border-border last:border-0">
              {table.columns.map((col) => {
                const v = row[col.key];
                const shown =
                  typeof v === 'number'
                    ? fmt(v, col.dec ?? 1, locale)
                    : typeof v === 'string'
                      ? col.key === 'waktu'
                        ? dateTimeLabel(v, locale)
                        : v
                      : '–';
                return (
                  <td
                    key={col.key}
                    className={`whitespace-nowrap p-2 font-mono ${
                      col.key === 'waktu' ? 'text-start text-muted' : 'text-end text-primary'
                    }`}
                  >
                    {shown}
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

export type LevelBarItem = {
  key: string;
  label: string;
  value: number;
  unit: string;
  dec: number;
  levelLabel: string;
  color: SeriesColor;
  min: number;
  max: number;
  /** Batas baku yang ditandai di atas bar (mis. pH 6,5 dan 8,5). */
  thresholds?: number[];
  /** Asal skalanya, dicetak di bawah bar: "skala tetap" atau rentang jendela
   *  pengamatan. Dua bar yang skalanya berasal dari sumber berbeda tidak
   *  boleh terlihat seolah-olah sebanding. */
  scaleNote: string;
};

/** Nilai terkini beberapa parameter sebagai daftar bar. Tiap bar mencetak
 *  batas skalanya sendiri, jadi panjang isinya bisa dibaca tanpa bergantung
 *  pada warnanya -- dan tingkatnya tetap ditulis sebagai teks. */
export function LevelBars({ items, locale }: { items: LevelBarItem[]; locale: Locale }) {
  return (
    <ul className="flex list-none flex-col gap-6 p-0">
      {items.map((item) => {
        const span = item.max - item.min;
        const pct = (v: number) =>
          span > 0 ? Math.min(100, Math.max(0, ((v - item.min) / span) * 100)) : 50;
        const classes = SERIES_CLASSES[item.color];
        const digits = Number.isInteger(item.min) && Number.isInteger(item.max) ? 0 : item.dec;

        return (
          <li key={item.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-sm font-bold text-primary">{item.label}</span>
              <span className={`text-xs font-bold ${classes.text}`}>{item.levelLabel}</span>
            </div>

            <p className="mt-1">
              <span className="font-mono text-xl text-primary">{fmt(item.value, item.dec, locale)}</span>{' '}
              <span className="font-mono text-xs text-muted">{item.unit}</span>
            </p>

            <div
              className="relative mt-2 h-2 w-full rounded-sm bg-surface"
              role="meter"
              aria-label={item.label}
              aria-valuemin={item.min}
              aria-valuemax={item.max}
              aria-valuenow={item.value}
              aria-valuetext={`${fmt(item.value, item.dec, locale)} ${item.unit}, ${item.levelLabel}`}
            >
              <div
                className={`h-full rounded-sm ${classes.swatch}`}
                style={{ width: `${pct(item.value)}%` }}
              />
              {item.thresholds?.map((t) => (
                <span
                  key={t}
                  aria-hidden
                  className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-primary"
                  style={{ left: `${pct(t)}%` }}
                />
              ))}
            </div>

            <div className="relative mt-1 h-4 font-mono text-xs text-muted">
              <span className="absolute start-0">{fmt(item.min, digits, locale)}</span>
              {item.thresholds?.map((t) => (
                <span
                  key={t}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${pct(t)}%` }}
                >
                  {fmt(t, Number.isInteger(t) ? 0 : 1, locale)}
                </span>
              ))}
              <span className="absolute end-0">{fmt(item.max, digits, locale)}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{item.scaleNote}</p>
          </li>
        );
      })}
    </ul>
  );
}
