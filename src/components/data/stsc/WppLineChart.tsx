'use client';

import { ChartFrame, xPercent } from '@/components/program/jogolaut/ChartFrame';
import { niceDomain } from '@/components/program/jogolaut/scale';
import { wppColor } from '@/components/data/stsc/wpp-colors';

/** Satu deret: satu WPP, satu nilai per tahun pada sumbu-x bersama.
 *
 *  `nilai` boleh null untuk tahun yang tidak punya catatan -- garisnya
 *  TERPUTUS di sana alih-alih turun ke nol. Bedanya penting: nol berarti
 *  "tidak ada produksi tahun itu", putus berarti "tidak ada datanya", dan
 *  menggambar keduanya sebagai lembah yang sama mengarang penurunan yang tidak
 *  pernah tercatat. */
export type WppSeries = {
  wpp: string;
  nilai: (number | null)[];
};

/**
 * Grafik garis banyak deret, satu warna per WPP.
 *
 * Ada di samping LineChart milik jogolaut, bukan menggantikannya, karena
 * keduanya dibatasi hal yang berbeda: LineChart mewarnai deretnya dengan token
 * `SeriesColor`, dan tokennya cuma ENAM. Halaman ini menggambar sebelas WPP
 * sekaligus, jadi warnanya datang dari WPP_COLORS sebagai hex -- lewat atribut
 * `stroke`, bukan kelas Tailwind.
 *
 * Bagian yang sulit tidak ditulis ulang: bingkai, sumbu, garis kisi, dan
 * penempatan label sumbu-x semuanya dipinjam dari ChartFrame/xPercent/
 * niceDomain yang sama dengan grafik lain di situs ini. Yang baru cuma
 * pewarnaan dan penanganan titik kosong.
 *
 * Geometrinya di SVG dengan viewBox 0..100 dan preserveAspectRatio="none",
 * seluruh teksnya HTML -- pola yang sama dengan LineChart, dan alasannya juga
 * sama (lihat kepala LineChart.tsx). `vector-effect="non-scaling-stroke"`
 * menahan tebal garis tetap 1,5 px berapa pun lebar kartunya.
 */
export function WppLineChart({
  years,
  series,
  unit,
  height = 300,
  ariaLabel,
}: {
  /** Sumbu-x bersama seluruh deret. Datang dari API sebagai satu daftar, bukan
   *  diturunkan dari titik tiap deret: itulah yang menjamin kesebelas garis
   *  memakai skala mendatar yang sama. */
  years: number[];
  series: WppSeries[];
  unit: string;
  height?: number;
  ariaLabel: string;
}) {
  const semua = series.flatMap((s) => s.nilai).filter((v): v is number => v !== null);

  if (years.length < 2 || semua.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Tidak ada data yang bisa digambar untuk pilihan ini.
      </p>
    );
  }

  // Selalu mulai dari NOL, tidak dari nilai terkecil: ini besaran cacah
  // (jumlah kapal, ton produksi), dan sumbu yang dipotong melebih-lebihkan
  // naik-turunnya -- kenaikan 3% terlihat seperti kenaikan dua kali lipat.
  const domain = niceDomain(0, Math.max(...semua));

  const project = (value: number) =>
    100 - ((value - domain.min) / (domain.max - domain.min)) * 100;

  const n = years.length;

  /** Path satu deret, DIPUTUS di titik yang null.
   *
   *  Tiap ruas yang punya data dimulai ulang dengan "M": tanpa itu, path
   *  menyambung dua titik yang terpisah tahun-tahun kosong jadi satu garis
   *  lurus yang menyiratkan pengukuran yang tidak ada. */
  const path = (s: WppSeries) => {
    let d = '';
    let menyambung = false;

    s.nilai.forEach((value, i) => {
      if (value === null) {
        menyambung = false;
        return;
      }
      const x = xPercent(i, n).toFixed(3);
      const y = project(value).toFixed(3);
      d += `${menyambung ? 'L' : 'M'}${x},${y} `;
      menyambung = true;
    });

    return d.trim();
  };

  return (
    <figure className="m-0">
      <figcaption>
        {/* Legenda sendiri, bukan ChartLegend milik jogolaut: yang itu
            mewarnai contohnya dengan kelas Tailwind dari SeriesColor, dan
            sebelas warna WPP tidak punya kelasnya. Bentuknya tetap disamakan
            -- contoh warna berbentuk GARIS, bukan kotak, supaya legendanya
            terlihat seperti benda yang diwakilinya. */}
        <ul className="mb-4 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
          {series.map((s) => (
            <li key={s.wpp} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden
                style={{ backgroundColor: wppColor(s.wpp) }}
                className="h-0.5 w-5 shrink-0 rounded-sm"
              />
              <span className="text-fg">WPP {s.wpp}</span>
            </li>
          ))}
        </ul>
      </figcaption>

      <ChartFrame
        height={height}
        // Warna sumbunya tetap token seri -- ia menandai SATUAN, bukan salah
        // satu WPP, jadi meminjam warna WPP mana pun untuknya akan salah baca.
        left={{ unit, color: 'series-1', domain }}
        labels={years.map(String)}
        xTickCount={Math.min(8, n)}
        ariaLabel={ariaLabel}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          focusable="false"
        >
          {series.map((s) => (
            <path
              key={s.wpp}
              d={path(s)}
              stroke={wppColor(s.wpp)}
              fill="none"
              strokeWidth={1.5}
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
