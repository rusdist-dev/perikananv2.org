import { ChartFrame, ChartLegend } from './ChartFrame';
import { SERIES_CLASSES, type SeriesColor } from './chart-theme';
import { niceDomain } from './scale';

/* =========================================================================
   GRAFIK BATANG

   Batangnya elemen HTML (flex + tinggi persen), bukan <rect> SVG. Alasannya
   sama dengan yang di ChartFrame -- teks label ikut terskala di dalam SVG
   ber-viewBox -- ditambah satu lagi: lebar batang di sini ditentukan flexbox,
   jadi 24 batang tetap punya jarak yang benar di lebar kartu berapa pun
   tanpa satu pun perhitungan lebar di TypeScript.

   Label sumbu-x dirender di sini, bukan diserahkan ke ChartFrame. Titik data
   grafik garis duduk DI garis kisi vertikal; batang duduk di TENGAH slotnya.
   Memakai penempatan yang sama untuk keduanya akan menggeser tiap label
   setengah slot dari batangnya.
   ========================================================================= */

/** Baris label yang memakai flex + gap yang sama persis dengan barisan
 *  batangnya, jadi tiap label pasti duduk di tengah batangnya. */
function BarLabels({ labels, every }: { labels: string[]; every: number }) {
  return (
    <div className="flex gap-1">
      {labels.map((label, i) => (
        <span
          key={label}
          className="min-w-0 flex-1 text-center font-mono text-xs text-muted"
          // Mencetak 24 label jam di lebar ponsel menghasilkan pita hitam.
          // Yang disembunyikan tetap ada di DOM sebagai slot kosong supaya
          // barisannya tidak bergeser -- bukan dihapus.
        >
          {i % every === 0 ? label : ' '}
        </span>
      ))}
    </div>
  );
}

/** Grafik batang dengan dasar NOL dan galat opsional (± 1 simpangan baku).
 *
 *  Dasarnya selalu nol, tidak pernah nilai minimum data. Batang yang dipotong
 *  dari bawah melebih-lebihkan selisih antar-batang secara visual: dua nilai
 *  yang berbeda 3% bisa tampak berbeda dua kali lipat. Kalau selisihnya jadi
 *  sulit terlihat karena itu, yang salah adalah pilihan grafiknya (pakai
 *  garis), bukan dasarnya. */
export function ColumnChart({
  labels,
  values,
  errors,
  color,
  unit,
  seriesLabel,
  height = 220,
  labelEvery = 3,
  ariaLabel,
}: {
  labels: string[];
  values: number[];
  /** Panjang whisker ke atas DAN ke bawah dari ujung batang. */
  errors?: number[];
  color: SeriesColor;
  unit: string;
  seriesLabel: string;
  height?: number;
  labelEvery?: number;
  ariaLabel: string;
}) {
  const upper = values.map((v, i) => v + (errors?.[i] ?? 0));
  const domain = niceDomain(0, Math.max(...upper));
  const pct = (v: number) => (v / (domain.max - domain.min)) * 100;

  return (
    <figure className="m-0">
      <figcaption>
        <ChartLegend
          items={[
            { label: seriesLabel, color, unit, shape: 'block' },
            ...(errors ? [{ label: '± 1 simpangan baku', color: 'series-6' as SeriesColor }] : []),
          ]}
        />
      </figcaption>

      <ChartFrame
        height={height}
        left={{ unit, color, domain }}
        ariaLabel={ariaLabel}
        xAxis={<BarLabels labels={labels} every={labelEvery} />}
      >
        <div className="absolute inset-0 flex items-end gap-1">
          {values.map((value, i) => {
            const error = errors?.[i] ?? 0;
            return (
              <div key={labels[i]} className="relative h-full min-w-0 flex-1">
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-t-sm ${SERIES_CLASSES[color].swatch}`}
                  style={{ height: `${pct(value)}%`, opacity: 0.75 }}
                />
                {error > 0 ? (
                  <span
                    aria-hidden
                    className="absolute start-1/2 w-px -translate-x-1/2 bg-level-alert"
                    style={{
                      bottom: `${pct(value - error)}%`,
                      height: `${pct(2 * error)}%`,
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </ChartFrame>
    </figure>
  );
}

/** Grafik batang dua arah di sekitar garis nol: batang ke atas dan ke bawah
 *  punya ARTI berbeda, bukan cuma nilai berbeda.
 *
 *  Warnanya tidak pernah jadi satu-satunya penanda arah -- posisinya
 *  (di atas atau di bawah garis nol) menyampaikan hal yang sama, dan legenda
 *  menuliskannya sebagai teks. */
export function DivergingBars({
  labels,
  values,
  unit,
  positive,
  negative,
  height = 220,
  labelEvery = 3,
  ariaLabel,
}: {
  labels: string[];
  values: number[];
  unit: string;
  positive: { label: string; color: SeriesColor };
  negative: { label: string; color: SeriesColor };
  height?: number;
  labelEvery?: number;
  ariaLabel: string;
}) {
  const domain = niceDomain(Math.min(0, ...values), Math.max(0, ...values));
  const span = domain.max - domain.min;
  const zeroFromTop = ((domain.max - 0) / span) * 100;

  return (
    <figure className="m-0">
      <figcaption>
        <ChartLegend
          items={[
            { label: positive.label, color: positive.color, unit, shape: 'block' },
            { label: negative.label, color: negative.color, unit, shape: 'block' },
          ]}
        />
      </figcaption>

      <ChartFrame
        height={height}
        left={{ unit, color: positive.color, domain }}
        ariaLabel={ariaLabel}
        xAxis={<BarLabels labels={labels} every={labelEvery} />}
      >
        {/* Garis nol lebih tegas dari garis kisi lain: ia batas antara emisi
            dan serapan, bukan sekadar salah satu tick. */}
        <span
          aria-hidden
          className="absolute inset-x-0 h-px bg-muted"
          style={{ top: `${zeroFromTop}%` }}
        />

        <div className="absolute inset-0 flex items-stretch gap-1">
          {values.map((value, i) => {
            const color = value >= 0 ? positive.color : negative.color;
            return (
              <div key={labels[i]} className="relative min-w-0 flex-1">
                <div
                  className={`absolute inset-x-0 ${SERIES_CLASSES[color].swatch} ${
                    value >= 0 ? 'rounded-t-sm' : 'rounded-b-sm'
                  }`}
                  style={{
                    top: `${((domain.max - Math.max(value, 0)) / span) * 100}%`,
                    height: `${(Math.abs(value) / span) * 100}%`,
                    opacity: 0.75,
                  }}
                />
              </div>
            );
          })}
        </div>
      </ChartFrame>
    </figure>
  );
}
