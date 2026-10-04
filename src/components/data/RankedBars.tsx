import { SERIES_CLASSES, type SeriesColor } from '@/components/program/jogolaut/chart-theme';
import type { Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/number';

/**
 * Batang MENDATAR berurut nilai, untuk kategori bernama panjang.
 *
 * Ada di samping ColumnChart, bukan menggantikannya, karena keduanya menjawab
 * pertanyaan berbeda. Batang tegak untuk deret yang punya URUTAN ALAMI (bulan
 * demi bulan): label pendek, dan yang dibaca bentuk naik-turunnya. Bentuk ini
 * untuk daftar yang urutannya DITENTUKAN NILAINYA -- 41 lokasi pendaratan
 * bernama "PPI UJONG BAROH" -- di mana label tegak harus diputar 90 derajat
 * atau disembunyikan, dan yang dicari pembaca adalah peringkat, bukan pola.
 *
 * Angkanya dicetak di tiap baris, bukan disembunyikan di balik tooltip: di
 * grafik peringkat, nilai persisnya adalah setengah dari jawabannya, dan
 * tooltip menyembunyikannya dari papan ketik, cetakan, dan tangkapan layar.
 * Itu juga yang membuat warnanya tidak pernah jadi satu-satunya pembawa
 * informasi.
 */
export function RankedBars({
  items,
  color,
  unit,
  locale,
  /** Tinggi maksimum sebelum daftarnya digulir sendiri. Daftar 41 baris
   *  setinggi kartu penuh akan mendorong sisa halaman jauh ke bawah; yang
   *  digulir isinya, bukan halamannya. */
  maxHeight = '22rem',
  emptyLabel,
}: {
  items: { label: string; value: number }[];
  color: SeriesColor;
  unit: string;
  locale: Locale;
  maxHeight?: string;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm leading-relaxed text-muted">{emptyLabel}</p>;
  }

  // Urut menurun di SINI, bukan mengandalkan urutan kiriman API (yang datang
  // menurut abjad): bentuk ini kehilangan seluruh alasannya kalau barisnya
  // tidak berperingkat.
  const sorted = [...items].sort((a, b) => b.value - a.value);
  // Skala terhadap nilai TERBESAR, bukan terhadap total: yang dibandingkan
  // antar-baris adalah besarannya, dan batang sepanjang 0,3% (lokasi dengan 2
  // trip dari 10.619) tidak bisa dibedakan dari nol.
  const max = Math.max(...sorted.map((item) => item.value), 1);

  return (
    <ol
      className="flex list-none flex-col gap-3 overflow-y-auto p-0 pe-1"
      style={{ maxHeight }}
      // Area yang bisa digulir harus punya perhentian Tab, kalau tidak isinya
      // terjebak bagi yang tidak memakai tetikus.
      tabIndex={0}
    >
      {sorted.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-xs text-fg" title={item.label}>
              {item.label}
            </span>
            <span className="shrink-0 font-mono text-xs text-muted">
              {formatNumber(item.value, locale)} {unit}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-sm bg-surface">
            <div
              className={`h-full rounded-sm ${SERIES_CLASSES[color].swatch}`}
              // Lebar minimum 2px supaya baris bernilai kecil tetap terlihat
              // punya batang -- tanpa itu, "2 trip" terbaca sebagai baris yang
              // datanya hilang.
              style={{ width: `max(2px, ${(item.value / max) * 100}%)` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
