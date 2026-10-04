'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/number';
import { SERIES_CLASSES, type SeriesColor } from './chart-theme';

export type TooltipSeries = {
  label: string;
  color: SeriesColor;
  unit: string;
  /** Desimal tampilan, sama dengan yang dipakai API saat membulatkan. */
  dec: number;
  values: (number | null)[];
  /** Rentang sumbu deret ini (untuk menaruh titik penanda). Tanpa domain =
   *  baris tooltip saja, tanpa titik di plot -- dipakai untuk nilai
   *  pendamping yang tidak digambar sebagai garis (fluks karbon). */
  domain?: { min: number; max: number };
  dashed?: boolean;
  /** Deret jarang (diselaraskan dari linimasa lain): bila titik terdekatnya
   *  null, pakai pembacaan terdekat dalam beberapa langkah di sekitarnya. */
  sparse?: boolean;
};

/** Seberapa jauh (dalam indeks) deret jarang boleh mencari pembacaan
 *  terdekat. Pasut MA di linimasa DO punya ~1 nilai per 6 titik; 6 langkah ke
 *  tiap sisi cukup untuk selalu menemukannya tanpa meminjam nilai dari jam
 *  yang jauh -- apalagi melintasi celah data berhari-hari. */
const SPARSE_REACH = 6;

/**
 * Tooltip grafik garis: garis tegak di titik terdekat kursor, penanda di tiap
 * garis, dan kotak berisi waktu serta nilai semua deret.
 *
 * Satu-satunya bagian grafik yang berjalan di browser. LineChart tetap server
 * component (path SVG-nya dihitung di server); lapisan ini ditumpuk di atas
 * area plot dan hanya menerima angka mentah + posisi x, lalu memformatnya
 * sendiri dengan locale yang sama (lib/number.ts) supaya angka di tooltip
 * persis sama gayanya dengan angka sumbu.
 *
 * aria-hidden: area plot di ChartFrame ber-role="img" dengan aria-label
 * ringkasannya, jadi isi di dalamnya memang tidak dibacakan. Tooltip ini
 * lapisan visual untuk pointer; nilai-nilainya untuk pembaca layar tersedia
 * di ubin KPI dan tabel pembacaan.
 *
 * Pointer events, bukan mouse events: satu jalur untuk tetikus, pena, dan
 * sentuhan -- di ponsel, tap atau geser jari di atas plot memunculkannya.
 */
export function LineTooltip({
  xs,
  labels,
  series,
  locale,
}: {
  /** Posisi x tiap titik dalam persen (0-100), sejajar dengan path-nya. */
  xs: number[];
  /** Label waktu tiap titik, sudah diformat ("27 Sep 23:40"). */
  labels: string[];
  series: TooltipSeries[];
  locale: Locale;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  /** Posisi kiri kotak dalam px, dihitung SETELAH kotaknya terukur. null =
   *  belum terukur; kotak dirender tak terlihat dulu supaya tidak berkedip
   *  di posisi yang salah. */
  const [tipLeft, setTipLeft] = useState<number | null>(null);

  // Sentuhan tidak punya "kursor yang pergi": browser mengirim pointerleave
  // tepat saat jari diangkat, jadi tooltip hasil tap akan hilang seketika.
  // Untuk sentuhan ia dibiarkan tampil, dan ditutup saat pengguna menyentuh
  // di LUAR grafik ini.
  useEffect(() => {
    if (index === null) return;
    const close = (event: globalThis.PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setIndex(null);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [index]);

  /** Titik dengan x terdekat -- pencarian biner, karena xs urut naik dan
   *  bisa berisi ratusan titik yang diperiksa di tiap gerakan pointer. */
  const nearest = (pct: number) => {
    let lo = 0;
    let hi = xs.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] < pct) lo = mid;
      else hi = mid;
    }
    return Math.abs(xs[lo] - pct) <= Math.abs(xs[hi] - pct) ? lo : hi;
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || box.width === 0 || xs.length === 0) return;
    const pct = ((event.clientX - box.left) / box.width) * 100;
    setIndex(nearest(Math.min(100, Math.max(0, pct))));
  };

  const valueAt = (s: TooltipSeries, i: number): { value: number; at: number } | null => {
    const v = s.values[i];
    if (v !== null && v !== undefined) return { value: v, at: i };
    if (!s.sparse) return null;
    for (let d = 1; d <= SPARSE_REACH; d += 1) {
      const before = s.values[i - d];
      if (before !== null && before !== undefined) return { value: before, at: i - d };
      const after = s.values[i + d];
      if (after !== null && after !== undefined) return { value: after, at: i + d };
    }
    return null;
  };

  const x = index === null ? 0 : xs[index];
  const rows = index === null ? [] : series.map((s) => ({ s, hit: valueAt(s, index) }));

  // Kotak di kanan garis kalau muat, di kiri kalau tidak, lalu dijepit ke
  // dalam area plot. Aturan "pindah sisi setelah separuh lebar" saja tidak
  // cukup: di ponsel plotnya ~200 px dan kotaknya ~190 px, jadi di tengah
  // plot kedua sisi sama-sama tidak muat dan kotaknya keluar layar.
  useLayoutEffect(() => {
    if (index === null) {
      setTipLeft(null);
      return;
    }
    const plot = ref.current?.getBoundingClientRect().width ?? 0;
    const tip = tipRef.current?.offsetWidth ?? 0;
    const gap = 12;
    const at = (x / 100) * plot;
    const preferred = at + gap + tip <= plot ? at + gap : at - gap - tip;
    setTipLeft(Math.max(0, Math.min(preferred, plot - tip)));
  }, [index, x]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute inset-0 z-10 touch-pan-y"
      onPointerMove={onMove}
      onPointerDown={onMove}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') setIndex(null);
      }}
    >
      {index !== null ? (
        <>
          <span
            className="pointer-events-none absolute inset-y-0 w-px bg-muted/60"
            style={{ left: `${x}%` }}
          />

          {rows.map(({ s, hit }) =>
            hit && s.domain && s.domain.max > s.domain.min ? (
              <span
                key={s.label}
                className={`pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg ${SERIES_CLASSES[s.color].swatch}`}
                style={{
                  left: `${xs[hit.at]}%`,
                  top: `${100 - ((hit.value - s.domain.min) / (s.domain.max - s.domain.min)) * 100}%`,
                }}
              />
            ) : null,
          )}

          <div
            className="pointer-events-none absolute top-2 min-w-40 rounded-md border border-border bg-bg px-3 py-2 shadow-sm"
            ref={tipRef}
            style={
              tipLeft === null ? { left: 0, visibility: 'hidden' } : { left: `${tipLeft}px` }
            }
          >
            <p className="whitespace-nowrap font-mono text-xs font-bold text-primary">
              {labels[index]}
            </p>
            <ul className="mt-1.5 flex list-none flex-col gap-1 p-0">
              {rows.map(({ s, hit }) => (
                <li key={s.label} className="flex items-center gap-2 whitespace-nowrap text-xs">
                  <span
                    className={`h-0.5 w-3 shrink-0 rounded-sm ${SERIES_CLASSES[s.color].swatch} ${
                      s.dashed ? 'opacity-55' : ''
                    }`}
                  />
                  <span className="text-muted">{s.label}</span>
                  <span className="ms-auto ps-3 font-mono text-primary">
                    {hit
                      ? `${formatNumber(hit.value, locale, {
                          minimumFractionDigits: s.dec,
                          maximumFractionDigits: s.dec,
                        })} ${s.unit}`
                      : '–'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
