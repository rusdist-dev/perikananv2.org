import { LEVEL_CLASSES, fmt } from './chart-theme';
import type { Level } from './data';

/* =========================================================================
   PENGUKUR RADIAL

   Busur 270 derajat, dibuka ke bawah. Berbeda dari grafik lain di berkas
   sebelah, SVG di sini memakai preserveAspectRatio bawaan (seragam) karena
   bentuknya memang harus lingkaran -- dan tidak ada satu pun <text> di
   dalamnya, jadi tidak ada teks yang ikut terskala. Angka di tengah dan
   keterangan di bawahnya elemen HTML yang ditumpuk di atas SVG-nya.

   Pengukur ini dipakai untuk nilai yang punya AMBANG bermakna (indeks panas,
   pH) -- bukan untuk angka yang cuma perlu dibaca besarnya. Untuk yang
   terakhir, satu angka besar di kartu ringkasan lebih jelas dan lebih murah.
   ========================================================================= */

const CENTER = 50;
const RADIUS = 38;
const START_DEG = 135;
const SWEEP_DEG = 270;

function polar(radius: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function arcPath(radius: number, fromDeg: number, toDeg: number): string {
  const [x0, y0] = polar(radius, fromDeg);
  const [x1, y1] = polar(radius, toDeg);
  const largeArc = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M${x0.toFixed(3)},${y0.toFixed(3)} A${radius},${radius} 0 ${largeArc} 1 ${x1.toFixed(3)},${y1.toFixed(3)}`;
}

export function Gauge({
  value,
  min,
  max,
  digits = 1,
  unit,
  level,
  levelLabel,
  /** Nilai ambang yang ditandai sebagai garis kecil melintang busur. Menandai
   *  batasnya membuat pembaca bisa menilai sendiri seberapa jauh angkanya dari
   *  ambang, bukan cuma percaya pada warnanya. */
  thresholds = [],
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  digits?: number;
  unit: string;
  level: Level;
  levelLabel: string;
  thresholds?: number[];
  ariaLabel: string;
}) {
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const classes = LEVEL_CLASSES[level];

  return (
    <div className="mx-auto w-full max-w-52">
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="block h-auto w-full"
          role="img"
          aria-label={ariaLabel}
          focusable="false"
        >
          <path
            d={arcPath(RADIUS, START_DEG, START_DEG + SWEEP_DEG)}
            className="stroke-border"
            fill="none"
            strokeWidth={9}
            strokeLinecap="round"
          />
          {ratio > 0 ? (
            <path
              d={arcPath(RADIUS, START_DEG, START_DEG + SWEEP_DEG * ratio)}
              className={classes.stroke}
              fill="none"
              strokeWidth={9}
              strokeLinecap="round"
            />
          ) : null}
          {thresholds.map((threshold) => {
            const deg = START_DEG + SWEEP_DEG * ((threshold - min) / (max - min));
            const [x0, y0] = polar(RADIUS - 6, deg);
            const [x1, y1] = polar(RADIUS + 6, deg);
            return (
              <line
                key={threshold}
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                className="stroke-bg"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>

        {/* Angka di tengah sebagai HTML: ukurannya mengikuti skala tipografi
            proyek, bukan lebar pengukurnya. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl leading-none text-primary">{fmt(value, digits)}</span>
          <span className="mt-1 font-mono text-xs text-muted">{unit}</span>
        </div>
      </div>

      {/* Tingkatnya ditulis sebagai TEKS, tidak cuma diwarnai -- warna bukan
          satu-satunya penanda (WCAG 1.4.1). */}
      <p className={`mt-3 text-center text-sm font-bold ${classes.text}`}>{levelLabel}</p>
      <p className="mt-1 text-center font-mono text-xs text-muted">
        skala {fmt(min, 0)} - {fmt(max, 0)}
      </p>
    </div>
  );
}
