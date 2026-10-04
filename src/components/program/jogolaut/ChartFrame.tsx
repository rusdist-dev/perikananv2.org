import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { SERIES_CLASSES, fmt, type SeriesColor } from './chart-theme';
import { GRID_RATIOS, tickValues, type Domain } from './scale';

export type FrameAxis = {
  /** Judul sumbu = SATUANNYA saja. Nama besarannya sudah ada di legenda;
   *  mengulangnya di sumbu cuma menambah teks yang harus diabaikan. */
  unit: string;
  color: SeriesColor;
  domain: Domain;
};

/* =========================================================================
   BINGKAI GRAFIK

   Kerangka bersama LineChart, ColumnChart, dan DivergingBars: kolom tick
   kiri, area plot, kolom tick kanan, label sumbu-x. Isi plotnya sendiri
   dikirim sebagai children dan diposisikan absolut di dalam area itu.

   Kenapa grid tiga kolom x tiga baris, bukan flex bertumpuk: label satuan
   ("ppm") duduk DI ATAS kolom tick, dan label tanggal DI BAWAH area plot.
   Dengan flex, ketiga kolom harus saling menebak tinggi baris satu sama lain
   -- satu perubahan ukuran font membuat angka tick bergeser setengah baris
   dari garis kisinya, dan tidak ada yang menyadarinya sampai ada yang
   membandingkan dua kartu bersebelahan. Grid membuat perataan itu urusan
   tata letak, bukan urusan angka ajaib.

   Semua TEKS di sini elemen HTML, bukan <text> SVG. Alasannya ada di kepala
   LineChart.tsx: SVG ber-viewBox ikut menskalakan fontnya, dan grafik yang
   enak dibaca di lebar laptop akan mencetak label 5 px di lebar ponsel.
   ========================================================================= */
export function ChartFrame({
  height,
  left,
  right,
  right2,
  labels,
  xTickCount = 5,
  xAxis,
  tickColumnWidth,
  locale = 'id',
  ariaLabel,
  children,
}: {
  /** Tinggi area plot dalam piksel. Bukan aspect-ratio: tinggi tetap membuat
   *  dua kartu bersebelahan sejajar, dan grafik tidak jadi pendek sekali saat
   *  kartunya berada di kolom sempit. */
  height: number;
  left: FrameAxis;
  right?: FrameAxis;
  /** Sumbu kanan KEDUA, di luar `right`. Hanya untuk kartu yang memang harus
   *  memuat tiga besaran bersatuan berbeda dalam satu area plot (mis. DO,
   *  suhu air, dan curah hujan). Warna angkanya mengikuti garisnya, dan
   *  legenda mencetak satuan tiap garis -- tanpa keduanya, dua kolom angka
   *  di kanan tidak bisa dibedakan mana milik garis mana. */
  right2?: FrameAxis;
  /** Label sumbu-x untuk grafik yang titik datanya duduk DI garis kisi
   *  (grafik garis). Grafik batang menempatkan datanya di TENGAH slot, bukan
   *  di garis -- ia mengirim barisan labelnya sendiri lewat `xAxis`. */
  labels?: string[];
  xTickCount?: number;
  xAxis?: ReactNode;
  /** Lebar tetap kolom angka sumbu-y (mis. "3rem"). Hanya untuk grafik yang
   *  DITUMPUK dengan sumbu-x bersama: tanpanya tiap panel melebarkan kolomnya
   *  sesuai label tick terpanjangnya sendiri ("100" vs "0,5"), dan area plot
   *  panel-panelnya bergeser beberapa piksel satu sama lain -- persis bagian
   *  yang dipakai mencocokkan waktu antar-panel. */
  tickColumnWidth?: string;
  /** Format angka tick: id 1.234,5 / en 1,234.5. Default 'id' untuk pemakai
   *  lama (grafik IKAN/BSC/STSC) yang belum mengirim locale. */
  locale?: Locale;
  ariaLabel: string;
  children: ReactNode;
}) {
  const n = labels?.length ?? 0;
  const tickCount = Math.min(xTickCount, n);
  const xTickIndexes =
    n > 1 ? Array.from({ length: tickCount }, (_, i) => Math.round((i / (tickCount - 1)) * (n - 1))) : [];

  return (
    <div
      className="grid gap-x-2"
      style={{
        gridTemplateColumns: [
          tickColumnWidth ?? 'auto',
          'minmax(0,1fr)',
          right && tickColumnWidth ? tickColumnWidth : 'auto',
          ...(right2 ? [tickColumnWidth ?? 'auto'] : []),
        ].join(' '),
      }}
    >
      <AxisUnit axis={left} side="left" />
      <div />
      {right ? <AxisUnit axis={right} side="right" /> : <div />}
      {right2 ? <AxisUnit axis={right2} side="right" /> : null}

      <AxisTicks
        domain={left.domain}
        height={height}
        side="left"
        locale={locale}
        color={right2 ? left.color : undefined}
      />

      <div className="relative" style={{ height }} role="img" aria-label={ariaLabel}>
        <GridLines />
        {children}
      </div>

      {right ? (
        <AxisTicks
          domain={right.domain}
          height={height}
          side="right"
          locale={locale}
          color={right2 ? right.color : undefined}
        />
      ) : (
        <div />
      )}
      {right2 ? (
        <AxisTicks
          domain={right2.domain}
          height={height}
          side="right"
          color={right2.color}
          locale={locale}
        />
      ) : null}

      <div />
      {/* Label sumbu-x diposisikan absolut pada persentase indeksnya, bukan
          dibagi rata dengan justify-between -- kotak teks punya lebar, jadi
          pembagian rata menggeser label dari titik datanya. */}
      <div className="mt-2">
        {xAxis ?? (
          <div className="relative h-4">
            {xTickIndexes.map((i, k) => (
              <span
                key={i}
                className="absolute top-0 whitespace-nowrap font-mono text-xs text-muted"
                style={{
                  left: `${xPercent(i, n)}%`,
                  transform:
                    k === 0
                      ? 'translateX(0)'
                      : k === xTickIndexes.length - 1
                        ? 'translateX(-100%)'
                        : 'translateX(-50%)',
                }}
              >
                {labels?.[i]}
              </span>
            ))}
          </div>
        )}
      </div>
      <div />
      {right2 ? <div /> : null}
    </div>
  );
}

/** Posisi horizontal titik ke-i dalam persen. Dipakai LineChart untuk path
 *  dan ChartFrame untuk label, jadi keduanya tidak bisa menyimpang. */
export function xPercent(i: number, n: number): number {
  return n > 1 ? (i / (n - 1)) * 100 : 50;
}

function AxisUnit({ axis, side }: { axis: FrameAxis; side: 'left' | 'right' }) {
  return (
    <div
      className={`mb-1 font-mono text-xs ${SERIES_CLASSES[axis.color].text} ${
        side === 'right' ? 'text-start' : 'text-end'
      }`}
    >
      {axis.unit}
    </div>
  );
}

/** Desimal yang dibutuhkan langkah tick, dari angkanya sendiri -- bukan dari
 *  pangkat sepuluhnya. Pangkat sepuluh dari 0,25 memberi satu desimal, dan
 *  tick 0,25 / 0,75 lalu tercetak "0,3" / "0,8": dua label yang berbeda dari
 *  garis kisinya. Dibatasi dua desimal; langkah yang lebih halus dari itu
 *  tidak dihasilkan niceDomain untuk data dasbor ini. */
function stepDigits(step: number): number {
  for (let d = 0; d < 2; d += 1) {
    const scaled = step * 10 ** d;
    if (Math.abs(scaled - Math.round(scaled)) < 1e-9) return d;
  }
  return 2;
}

function AxisTicks({
  domain,
  height,
  side,
  color,
  locale,
}: {
  domain: Domain;
  height: number;
  side: 'left' | 'right';
  locale: Locale;
  /** Warnai angka tick dengan warna garisnya. Hanya dipakai saat ada tiga
   *  sumbu; dengan dua, kiri dan kanan sudah cukup dibedakan oleh posisinya
   *  dan angkanya tetap abu-abu netral. */
  color?: SeriesColor;
}) {
  const ticks = tickValues(domain);
  const digits = stepDigits(domain.step);
  const longest = Math.max(...ticks.map((v) => fmt(v, digits, locale).length));

  return (
    <div
      // Label tick absolut tidak memberi lebar apa pun pada kolom grid-nya.
      // Dengan satu sumbu per sisi itu tidak terlihat -- labelnya cuma
      // meluber ke padding kartu. Dengan dua sumbu kanan (mode berwarna),
      // kolomnya harus memesan lebar sendiri, atau angka kedua sumbu
      // bertumpuk di tempat yang sama. `ch` dihitung dari font tick ini
      // sendiri (font-mono text-xs), jadi lebarnya pas dengan labelnya.
      className={color ? 'relative font-mono text-xs' : 'relative'}
      style={{ height, minWidth: color ? `${longest}ch` : undefined }}
    >
      {ticks.map((value, i) => (
        <span
          key={value}
          className={`absolute font-mono text-xs ${color ? SERIES_CLASSES[color].text : 'text-muted'} ${
            side === 'right' ? 'start-0' : 'end-0'
          }`}
          style={{
            top: `${(1 - i / (ticks.length - 1)) * 100}%`,
            // Tick paling bawah dan paling atas digeser ke DALAM, bukan
            // dipusatkan pada garisnya: dipusatkan, keduanya menonjol setengah
            // baris keluar dari area plot dan merusak perataan kartu
            // bersebelahan.
            transform:
              i === 0
                ? 'translateY(-100%)'
                : i === ticks.length - 1
                  ? 'translateY(0)'
                  : 'translateY(-50%)',
          }}
        >
          {fmt(value, digits, locale)}
        </span>
      ))}
    </div>
  );
}

function GridLines() {
  return (
    <>
      {GRID_RATIOS.map((r) => (
        <span
          key={r}
          aria-hidden
          className="absolute inset-x-0 h-px bg-border"
          style={{ top: `${r * 100}%` }}
        />
      ))}
    </>
  );
}

/** Legenda seri. Di ATAS grafik, bukan di bawah: pembaca butuh tahu garis
 *  mana milik siapa sebelum menafsirkan bentuknya, bukan sesudah. */
export function ChartLegend({
  items,
}: {
  items: {
    label: string;
    color: SeriesColor;
    /** Kosongkan untuk seri yang satuannya sudah jelas dari labelnya sendiri
     *  (mis. "Emisi" / "Serapan" pada grafik fluks). */
    unit?: string;
    dashed?: boolean;
    /** Bentuk contoh warna: garis untuk grafik garis, kotak untuk batang --
     *  supaya legendanya terlihat seperti benda yang diwakilinya. */
    shape?: 'line' | 'block';
  }[];
}) {
  return (
    <ul className="mb-4 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-xs">
          <span
            aria-hidden
            className={`shrink-0 rounded-sm ${
              item.shape === 'block' ? 'h-3 w-3' : 'h-0.5 w-5'
            } ${SERIES_CLASSES[item.color].swatch} ${item.dashed ? 'opacity-55' : ''}`}
          />
          <span className={SERIES_CLASSES[item.color].text}>{item.label}</span>
          {item.unit ? <span className="font-mono text-muted">({item.unit})</span> : null}
        </li>
      ))}
    </ul>
  );
}
