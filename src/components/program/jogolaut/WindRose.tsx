import { SERIES_CLASSES, fmt, type SeriesColor } from './chart-theme';

/* =========================================================================
   MAWAR ANGIN

   Enam belas sektor, panjangnya sebanding dengan frekuensi kemunculan arah
   itu. Utara di atas, searah jarum jam -- konvensi kompas, bukan pilihan
   gaya: memutarnya akan membuat pembaca yang terbiasa membaca mawar angin
   salah membaca arah dominan.

   Sektornya SVG (bentuknya harus lingkaran, jadi skalanya seragam), tapi
   label penjuru dan label cincin persen elemen HTML yang ditumpuk di atasnya
   -- <text> di dalam SVG ber-viewBox akan menyusut jadi tak terbaca di lebar
   ponsel.

   Hanya delapan penjuru yang diberi label, bukan enam belas. Enam belas label
   di lingkaran selebar 260 px saling bertindihan; delapan sudah cukup untuk
   membaca arah, dan arah dominannya sendiri tercetak sebagai angka di kartu
   sebelahnya.
   ========================================================================= */

const CENTER = 50;
/** Sengaja tidak sampai 50: label penjuru duduk di luar cincin terluar, dan
 *  radius yang mepet tepi viewBox membuat label "E" dan "W" separuh keluar
 *  dari kartunya. */
const MAX_RADIUS = 38;
/** Setengah lebar sektor dalam derajat. 16 arah = 22,5 derajat per slot;
 *  9 derajat menyisakan celah tipis di antara sektor supaya dua arah
 *  bersebelahan tidak menyatu jadi satu bentuk. */
const HALF_WIDTH = 9;

const LABELLED = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function polar(radius: number, deg: number): [number, number] {
  // -90 supaya 0 derajat menunjuk ke ATAS (utara), bukan ke kanan.
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function sectorPath(radius: number, centerDeg: number): string {
  const [x0, y0] = polar(radius, centerDeg - HALF_WIDTH);
  const [x1, y1] = polar(radius, centerDeg + HALF_WIDTH);
  return `M${CENTER},${CENTER} L${x0.toFixed(3)},${y0.toFixed(3)} A${radius},${radius} 0 0 1 ${x1.toFixed(3)},${y1.toFixed(3)} Z`;
}

export function WindRose({
  directions,
  values,
  color = 'series-1',
  ariaLabel,
}: {
  directions: readonly string[];
  /** Frekuensi tiap arah dalam persen. */
  values: number[];
  color?: SeriesColor;
  ariaLabel: string;
}) {
  const max = Math.max(...values);
  const step = 22.5;

  return (
    <div className="mx-auto w-full max-w-80">
      <div className="relative aspect-square">
        <svg
          viewBox="0 0 100 100"
          className="block h-full w-full"
          role="img"
          aria-label={ariaLabel}
          focusable="false"
        >
          {/* Cincin acuan: seperempat, setengah, tiga perempat, dan penuh dari
              frekuensi tertinggi. Tanpa cincin, panjang sektor cuma bisa
              dibandingkan satu sama lain, tidak bisa dibaca nilainya. */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={MAX_RADIUS * r}
              className="stroke-border"
              fill="none"
              strokeWidth={0.5}
            />
          ))}
          {/* Jari-jari penjuru utama */}
          {LABELLED.map((_, i) => {
            const [x, y] = polar(MAX_RADIUS, i * 45);
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                className="stroke-border"
                strokeWidth={0.5}
              />
            );
          })}

          {values.map((value, i) => {
            const radius = (value / max) * MAX_RADIUS;
            if (radius < 1) return null;
            return (
              <path
                key={directions[i]}
                d={sectorPath(radius, i * step)}
                className={SERIES_CLASSES[color].fill}
                // Sektor yang lebih sering muncul digambar lebih pekat: satu
                // penanda tambahan di samping panjangnya, untuk pembaca yang
                // kesulitan membandingkan panjang di sekitar lingkaran.
                fillOpacity={0.3 + (value / max) * 0.5}
              />
            );
          })}
        </svg>

        {LABELLED.map((label, i) => {
          const [x, y] = polar(MAX_RADIUS + 8, i * 45);
          return (
            <span
              key={label}
              className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <p className="mt-2 text-center font-mono text-xs text-muted">
        cincin terluar = {fmt(max, 1)}% kejadian
      </p>
    </div>
  );
}
