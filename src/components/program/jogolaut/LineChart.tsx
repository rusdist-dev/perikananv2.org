import { ChartFrame, ChartLegend, xPercent } from './ChartFrame';
import { SERIES_CLASSES, type SeriesColor } from './chart-theme';
import { niceDomain } from './scale';

export type LineSeries = {
  label: string;
  values: number[];
  color: SeriesColor;
  /** Sumbu mana yang menskalakan deret ini. Default kiri. */
  axis?: 'left' | 'right';
  dashed?: boolean;
  /** Isi area di bawah garis. Pakai HANYA untuk satu deret per grafik -- dua
   *  area transparan yang bertumpuk menghasilkan warna ketiga yang tidak ada
   *  di legenda dan tidak berarti apa-apa. */
  area?: boolean;
};

type AxisConfig = {
  unit: string;
  color: SeriesColor;
  min?: number;
  max?: number;
};

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
   akan ikut teregang jadi elips. Deret 112 titik memang tidak butuh penanda.

   Batas dua sumbu. Grafik sumber di dasbor lama menumpuk sampai empat sumbu-y
   di satu kartu; yang dihasilkannya bukan kepadatan informasi melainkan empat
   garis yang tidak bisa dibandingkan satu sama lain. Di sini maksimal dua, dan
   deret ketiga yang butuh skala sendiri berarti kartu baru.
   ========================================================================= */
export function LineChart({
  labels,
  series,
  left,
  right,
  height = 240,
  xTickCount = 5,
  ariaLabel,
}: {
  labels: string[];
  series: LineSeries[];
  left: AxisConfig;
  right?: AxisConfig;
  height?: number;
  xTickCount?: number;
  ariaLabel: string;
}) {
  const domainFor = (side: 'left' | 'right', config: AxisConfig) => {
    const values = series.filter((s) => (s.axis ?? 'left') === side).flatMap((s) => s.values);
    return niceDomain(config.min ?? Math.min(...values), config.max ?? Math.max(...values));
  };

  const leftDomain = domainFor('left', left);
  const rightDomain = right ? domainFor('right', right) : null;

  /** Nilai -> koordinat y dalam ruang 0..100 (0 di atas, seperti SVG). */
  const project = (value: number, axis: 'left' | 'right') => {
    const d = axis === 'right' && rightDomain ? rightDomain : leftDomain;
    return 100 - ((value - d.min) / (d.max - d.min)) * 100;
  };

  const n = labels.length;

  const linePath = (s: LineSeries) =>
    s.values
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'}${xPercent(i, n).toFixed(3)},${project(v, s.axis ?? 'left').toFixed(3)}`,
      )
      .join(' ');

  const areaPath = (s: LineSeries) => `${linePath(s)} L100,100 L0,100 Z`;

  return (
    <figure className="m-0">
      <figcaption>
        <ChartLegend
          items={series.map((s) => ({
            label: s.label,
            color: s.color,
            unit: (s.axis ?? 'left') === 'right' && right ? right.unit : left.unit,
            dashed: s.dashed,
          }))}
        />
      </figcaption>

      <ChartFrame
        height={height}
        left={{ unit: left.unit, color: left.color, domain: leftDomain }}
        right={right && rightDomain ? { unit: right.unit, color: right.color, domain: rightDomain } : undefined}
        labels={labels}
        xTickCount={xTickCount}
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
      </ChartFrame>
    </figure>
  );
}
