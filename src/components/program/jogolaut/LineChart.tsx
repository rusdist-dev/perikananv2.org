import type { Locale } from '@/i18n/config';
import { ChartFrame, ChartLegend, xPercent } from './ChartFrame';
import { SERIES_CLASSES, type SeriesColor } from './chart-theme';
import { niceDomain } from './scale';
import { LineTooltip, type TooltipSeries } from './LineTooltip';
import { clockLabelFromStamp, dayLabelFromStamp } from './time';

export type LineSeries = {
  label: string;
  /** null = tidak ada pembacaan di titik itu. Garisnya diputus di sana,
   *  bukan disambung lurus melewati celah -- garis yang menembus celah
   *  mengarang pembacaan yang tidak pernah ada. */
  values: (number | null)[];
  color: SeriesColor;
  /** Sumbu mana yang menskalakan deret ini. Default kiri. `right2` = sumbu
   *  kanan kedua (lihat catatan batas sumbu di bawah). */
  axis?: LineAxis;
  dashed?: boolean;
  /** Isi area di bawah garis. Pakai HANYA untuk satu deret per grafik -- dua
   *  area transparan yang bertumpuk menghasilkan warna ketiga yang tidak ada
   *  di legenda dan tidak berarti apa-apa. */
  area?: boolean;
  /** Sambung garis melewati null. Khusus deret yang JARANG karena memang
   *  disampel pada linimasa lain (pasut MA yang diselaraskan ke linimasa CO2,
   *  lalu ditumpangkan di linimasa DO yang empat kali lebih rapat): di sana
   *  null berarti "tidak disampel di titik ini", bukan "sensornya diam".
   *  Celah WAKTU yang panjang tetap memutus garisnya. */
  connectGaps?: boolean;
  /** Desimal angka deret ini di tooltip. Default 2. */
  dec?: number;
};

export type LineAxis = 'left' | 'right' | 'right2';

type AxisConfig = {
  unit: string;
  color: SeriesColor;
  /** Hanya untuk `right`: sumbu ini membaca garis sumbu KIRI dalam satuan
   *  lain, dengan nilai = nilai kiri x `mirror` (mis. respirasi CO2 -> fluks
   *  karbon, x 12/44). Tidak ada deret yang menempel padanya; tick-nya jatuh
   *  tepat di garis kisi tick kiri, jadi angkanya tidak dibulatkan ulang. */
  mirror?: number;
  min?: number;
  max?: number;
};

const DAY_MS = 86_400_000;

/** Celah waktu yang memutus garis: empat kali jarak antar-pembacaan yang
 *  lazim (median) pada deret itu sendiri. Median, bukan rata-rata: satu celah
 *  enam hari akan menaikkan rata-ratanya sampai celah itu sendiri tidak lagi
 *  terhitung celah. */
function gapThreshold(times: number[]): number {
  const deltas: number[] = [];
  for (let i = 1; i < times.length; i += 1) {
    const dt = times[i] - times[i - 1];
    if (dt > 0) deltas.push(dt);
  }
  if (deltas.length === 0) return Infinity;
  deltas.sort((a, b) => a - b);
  return deltas[Math.floor(deltas.length / 2)] * 4;
}

/* =========================================================================
   GRAFIK GARIS

   Geometrinya di SVG, seluruh teksnya di HTML (lihat ChartFrame.tsx untuk
   alasannya). Yang masuk SVG hanya path-nya, dengan viewBox 0..100 dan
   preserveAspectRatio="none" supaya koordinatnya cukup dinyatakan sebagai
   persen -- tanpa perlu tahu berapa piksel lebar kartunya saat dirender.

   Regangan non-seragam itu biasanya merusak tebal garis. `vector-effect=
   "non-scaling-stroke"` menahannya tetap 1,5 px CSS berapa pun lebar
   kartunya; menghapus atribut itu membuat garis di kartu lebar jadi rambut
   dan garis di kartu sempit jadi pita.

   Konsekuensi yang disengaja: tidak ada penanda titik di garis. Lingkaran
   akan ikut teregang jadi elips. Deret ratusan titik memang tidak butuh
   penanda.

   Dua mode sumbu-x. Tanpa `times`, titik dibagi rata per indeks (cocok untuk
   deret yang jaraknya memang seragam). Dengan `times`, posisi titik
   sebanding dengan WAKTUNYA -- wajib untuk data sensor sungguhan: stasiun
   yang mati enam hari akan tergambar sebagai dua titik bersebelahan kalau
   posisinya mengikuti indeks, dan pembaca tidak punya cara untuk tahu ada
   enam hari yang hilang di antaranya.

   Batas tiga sumbu. Grafik sumber di dasbor lama menumpuk sampai empat sumbu-y
   di satu kartu; yang dihasilkannya bukan kepadatan informasi melainkan empat
   garis yang tidak bisa dibandingkan satu sama lain. Bawaannya dua (kiri dan
   kanan). Sumbu ketiga (`right2`) ada untuk kartu yang memang diminta
   memuat tiga besaran dalam satu plot; saat ia dipakai, angka tiap sumbu
   diwarnai seperti garisnya (ChartFrame), karena posisi kiri/kanan saja
   tidak lagi cukup untuk mencocokkan garis dengan skalanya. Empat sumbu
   tetap berarti kartu baru.
   ========================================================================= */
export function LineChart({
  labels,
  times,
  locale = 'id',
  series,
  left,
  right,
  right2,
  height = 240,
  xTickCount = 5,
  showXAxis = true,
  tickColumnWidth,
  tooltipLabels,
  tooltipExtra = [],
  ariaLabel,
}: {
  labels: string[];
  /** Milidetik tiap titik (lihat time.ts `stamp`), sejajar dengan `labels`. */
  times?: number[];
  /** Bahasa label tanggal sumbu-x pada mode `times`. */
  locale?: Locale;
  series: LineSeries[];
  left: AxisConfig;
  right?: AxisConfig;
  right2?: AxisConfig;
  height?: number;
  xTickCount?: number;
  /** false untuk panel yang ditumpuk di atas panel lain bersumbu-x sama --
   *  label tanggalnya cukup dicetak sekali, di panel paling bawah. */
  showXAxis?: boolean;
  /** Lihat ChartFrame. */
  tickColumnWidth?: string;
  /** Label waktu lengkap tiap titik untuk kepala tooltip ("27 Sep 23:40").
   *  Mengisinya MENYALAKAN tooltip; tanpa prop ini grafiknya tetap murni
   *  server-rendered, tanpa satu byte JavaScript pun. */
  tooltipLabels?: string[];
  /** Baris tooltip tambahan yang tidak digambar sebagai garis -- nilai
   *  pendamping dari API (mis. fluks karbon di samping respirasi). */
  tooltipExtra?: Omit<TooltipSeries, 'domain'>[];
  ariaLabel: string;
}) {
  const present = (s: LineSeries) => s.values.filter((v): v is number => v !== null);

  const domainFor = (side: LineAxis, config: AxisConfig) => {
    const values = series.filter((s) => (s.axis ?? 'left') === side).flatMap(present);
    return niceDomain(config.min ?? Math.min(...values), config.max ?? Math.max(...values));
  };

  const leftDomain = domainFor('left', left);
  const rightDomain = right
    ? right.mirror !== undefined
      ? {
          min: leftDomain.min * right.mirror,
          max: leftDomain.max * right.mirror,
          step: leftDomain.step * right.mirror,
        }
      : domainFor('right', right)
    : null;
  const right2Domain = right2 ? domainFor('right2', right2) : null;

  /** Nilai -> koordinat y dalam ruang 0..100 (0 di atas, seperti SVG). */
  const project = (value: number, axis: LineAxis) => {
    const d =
      axis === 'right' && rightDomain
        ? rightDomain
        : axis === 'right2' && right2Domain
          ? right2Domain
          : leftDomain;
    return 100 - ((value - d.min) / (d.max - d.min)) * 100;
  };

  const n = labels.length;
  const t0 = times?.[0] ?? 0;
  const span = times ? times[times.length - 1] - t0 : 0;
  const xAt = (i: number) =>
    times && span > 0 ? ((times[i] - t0) / span) * 100 : xPercent(i, n);

  /** Potongan garis yang bersambung: putus di null (kecuali connectGaps) dan
   *  di celah waktu yang jauh lebih lebar dari jarak pembacaan biasanya. */
  const segments = (s: LineSeries): [number, number][][] => {
    const axis = s.axis ?? 'left';
    const threshold = times
      ? gapThreshold(s.values.flatMap((v, i) => (v === null ? [] : [times[i]])))
      : Infinity;

    const out: [number, number][][] = [];
    let current: [number, number][] = [];
    let prev = -1;

    s.values.forEach((v, i) => {
      if (v === null) {
        if (!s.connectGaps && current.length > 0) {
          out.push(current);
          current = [];
        }
        return;
      }
      if (times && prev >= 0 && current.length > 0 && times[i] - times[prev] > threshold) {
        out.push(current);
        current = [];
      }
      current.push([xAt(i), project(v, axis)]);
      prev = i;
    });
    if (current.length > 0) out.push(current);
    return out;
  };

  const toPath = (points: [number, number][]) =>
    points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

  const linePath = (s: LineSeries) => segments(s).map(toPath).join(' ');

  const areaPath = (s: LineSeries) =>
    segments(s)
      .filter((points) => points.length > 1)
      .map((points) => {
        const first = points[0][0].toFixed(2);
        const last = points[points.length - 1][0].toFixed(2);
        return `${toPath(points)} L${last},100 L${first},100 Z`;
      })
      .join(' ');

  return (
    <figure className="m-0">
      <figcaption>
        <ChartLegend
          items={series.map((s) => ({
            label: s.label,
            color: s.color,
            unit:
              s.axis === 'right' && right
                ? right.unit
                : s.axis === 'right2' && right2
                  ? right2.unit
                  : left.unit,
            dashed: s.dashed,
          }))}
        />
      </figcaption>

      <ChartFrame
        height={height}
        left={{ unit: left.unit, color: left.color, domain: leftDomain }}
        right={right && rightDomain ? { unit: right.unit, color: right.color, domain: rightDomain } : undefined}
        right2={
          right2 && right2Domain
            ? { unit: right2.unit, color: right2.color, domain: right2Domain }
            : undefined
        }
        labels={labels}
        xTickCount={xTickCount}
        tickColumnWidth={tickColumnWidth}
        locale={locale}
        xAxis={
          !showXAxis ? (
            <div />
          ) : times && span > 0 ? (
            <TimeAxis t0={t0} span={span} count={xTickCount} locale={locale} />
          ) : undefined
        }
        ariaLabel={ariaLabel}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          focusable="false"
        >
          {series
            .filter((s) => s.area)
            .map((s) => (
              <path
                key={`${s.label}-area`}
                d={areaPath(s)}
                className={SERIES_CLASSES[s.color].fill}
                fillOpacity={0.1}
              />
            ))}
          {series.map((s) => (
            <path
              key={s.label}
              d={linePath(s)}
              className={SERIES_CLASSES[s.color].stroke}
              fill="none"
              strokeWidth={s.dashed ? 1.25 : 1.5}
              strokeDasharray={s.dashed ? '5 3' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {tooltipLabels ? (
          <LineTooltip
            xs={labels.map((_, i) => Number(xAt(i).toFixed(2)))}
            labels={tooltipLabels}
            locale={locale}
            series={[
              ...series.map((s) => {
                const axis = s.axis ?? 'left';
                const d =
                  axis === 'right' && rightDomain
                    ? rightDomain
                    : axis === 'right2' && right2Domain
                      ? right2Domain
                      : leftDomain;
                return {
                  label: s.label,
                  color: s.color,
                  unit: axis === 'right' && right ? right.unit : axis === 'right2' && right2 ? right2.unit : left.unit,
                  dec: s.dec ?? 2,
                  values: s.values,
                  domain: { min: d.min, max: d.max },
                  dashed: s.dashed,
                  sparse: s.connectGaps,
                };
              }),
              ...tooltipExtra,
            ]}
          />
        ) : null}
      </ChartFrame>
    </figure>
  );
}

/** Label sumbu-x pada mode waktu: jatuh tepat di tengah malam, bukan dibagi
 *  rata sepanjang rentang. Tick yang dibagi rata menaruh "27 Sep" di jam 17:52
 *  tanggal itu, dan garis harian di grafik tidak lagi bisa dicocokkan dengan
 *  labelnya. Hari dilompati (tiap 2, 3, ... hari) sampai jumlahnya muat. */
function TimeAxis({
  t0,
  span,
  count,
  locale,
}: {
  t0: number;
  span: number;
  count: number;
  locale: Locale;
}) {
  const totalDays = span / DAY_MS;

  // Rentang pendek (sensor yang baru menyala lagi, mis. CO2 dengan data satu
  // hari saja) cuma melewati satu tengah malam -- tick per hari menyisakan
  // satu label di seluruh sumbu. Di bawah dua hari tick-nya per enam jam;
  // yang jatuh di tengah malam tetap dilabeli tanggal, sisanya jam.
  const short = totalDays < 2;
  const stepMs = short ? DAY_MS / 4 : Math.max(1, Math.ceil(totalDays / count)) * DAY_MS;
  const first = Math.ceil(t0 / stepMs) * stepMs;

  const ticks: number[] = [];
  for (let t = first; t <= t0 + span; t += stepMs) ticks.push(t);
  // Rentang di bawah enam jam mungkin tidak melewati satu tick pun; kedua
  // ujungnya tetap diberi label supaya sumbunya tidak kosong.
  if (ticks.length === 0) ticks.push(t0, t0 + span);

  const label = (t: number) =>
    t % DAY_MS === 0 ? dayLabelFromStamp(t, locale) : clockLabelFromStamp(t);

  return (
    <div className="relative h-4">
      {ticks.map((t, k) => {
        const pct = ((t - t0) / span) * 100;
        return (
          <span
            key={t}
            // Di lebar ponsel area plotnya cuma ~200 px, dan empat label
            // tanggal saling menimpa. Label berselang disembunyikan di bawah
            // md; yang tersisa tetap jatuh tepat di tengah malamnya.
            // Pada rentang pendek, tick tengah malam (satu-satunya pembawa
            // tanggal) tidak pernah ikut disembunyikan.
            className={`absolute top-0 whitespace-nowrap font-mono text-xs text-muted ${
              k % 2 === 1 && !(short && t % DAY_MS === 0) ? 'hidden md:inline' : ''
            }`}
            style={{
              left: `${pct}%`,
              // Label di dekat tepi digeser ke dalam supaya tidak keluar kartu.
              transform:
                pct < 8 ? 'translateX(0)' : pct > 92 ? 'translateX(-100%)' : 'translateX(-50%)',
            }}
          >
            {label(t)}
          </span>
        );
      })}
    </div>
  );
}
