import type { Locale } from '@/i18n/config';
import type { VillageMetric } from '@/lib/content';
import { formatNumber } from '@/lib/number';
import { lookupMetricLabel, translateMetricUnit } from '@/i18n/dictionaries/impact-metrics';

/**
 * Pemformatan angka metrik pendataan pesisir.
 *
 * Dipakai DUA tampilan yang memperlihatkan metrik yang sama: tabel per-desa di
 * VillageDetailPanel dan kartu totalan berjalan di ImpactStatsMarquee. Aturannya
 * tinggal di sini, bukan disalin di keduanya, supaya "Rp 3,1 M" di kartu dan
 * "3,1 M" di tabel tidak pernah berbeda dalam hal pembulatan atau jumlah
 * desimal -- keduanya angka yang sama, cuma beda tempat.
 */

/** Ambang pindah ke notasi ringkas ("3,1 M" alih-alih "3.095.072.240").
 *
 *  Ada karena metrik rupiah mencapai 13 digit (Rp 4.579.749.078.393 pada
 *  totalan nasional): angka penuh memaksa kartu melebar atau teksnya terpotong,
 *  dan tidak ada yang membaca digit ke-11 sebuah nilai valuasi. Di bawah ambang
 *  ini angkanya ditulis utuh, karena di sanalah ketelitian memang berarti --
 *  "12,45 ha" bukan "12 ha". */
const COMPACT_THRESHOLD = 1_000_000;

/** Angka metrik -> teks, memakai `decimals` yang dikirim CMS.
 *
 *  `decimals` dipakai apa adanya dan bukan ditebak dari nilainya: CMS
 *  mengirim 2 untuk luas dan rupiah, 0 untuk cacah orang, dan "29,00 orang"
 *  salah dengan cara yang halus. */
export function formatMetricValue(value: number, decimals: number, locale: Locale): string {
  if (Math.abs(value) >= COMPACT_THRESHOLD) {
    return formatNumber(value, locale, { notation: 'compact', maximumFractionDigits: 2 });
  }

  return formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Satu sel angka. "—" untuk null: metrik itu memang tidak punya nilai di tahun
 *  itu, yang tidak sama dengan nol. */
export function formatMetricCell(
  value: number | null,
  decimals: number,
  locale: Locale,
): string {
  return value === null ? '—' : formatMetricValue(value, decimals, locale);
}

/** Satuannya menempel pada LABEL ("Total Nilai Ekonomi (Rp)"), bukan pada tiap
 *  angka.
 *
 *  Kedua tampilan memasangkan dua tahun berdampingan, jadi satuan yang sama
 *  akan tercetak dua kali setiap kali -- dan satuan yang berulang justru
 *  membuat dua angka yang seharusnya dibandingkan jadi sulit disejajarkan mata.
 *  null (nilai_stok_karbon per-desa) berarti labelnya berdiri sendiri, tanpa
 *  satuan karangan.
 *
 *  Labelnya dicari lewat `key` di kamus (i18n/dictionaries/impact-metrics.ts),
 *  bukan diambil dari `metric.label`: CMS hanya mengirim label bahasa
 *  Indonesia. Key yang belum ada di kamus jatuh ke label CMS, jadi kategori
 *  isian baru tetap tampil -- hanya belum diterjemahkan.
 *
 *  `nested` = metrik ini tampil sebagai rincian di bawah induknya, yang
 *  memakai label pendek bila kamus menyediakannya ("Mangrove", bukan "Luas
 *  Ekosistem Mangrove" di bawah "Total Luas Ekosistem"). */
export function metricLabel(
  metric: Pick<VillageMetric, 'key' | 'label' | 'unit'>,
  locale: Locale,
  nested = false,
): string {
  const label = lookupMetricLabel(metric.key, locale, nested) ?? metric.label;
  return metric.unit ? `${label} (${translateMetricUnit(metric.unit, locale)})` : label;
}
