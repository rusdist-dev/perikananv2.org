/**
 * Kode WPP-RI (Wilayah Pengelolaan Perikanan Republik Indonesia) dan warnanya.
 *
 * SATU daftar untuk `/data/production-data` dan `/data/vessel-data`. Sebelumnya
 * ada dua salinan identik (satu per halaman) dengan komentar yang saling
 * menjanjikan tetap sinkron -- janji yang tidak bisa ditegakkan siapa pun. Kode
 * dan warna yang sama harus berarti WPP yang sama di seluruh situs, dan itu
 * cuma bisa dijamin kalau daftarnya satu.
 *
 * Warnanya hex mentah, BUKAN token seri grafik (--color-series-*): tokennya
 * cuma enam sementara WPP-nya sebelas. Itu juga alasan halaman ini memakai
 * WppLineChart alih-alih LineChart bawaan, yang tipe warnanya terbatas pada
 * keenam token itu.
 *
 * Konsekuensi yang disengaja: warna-warna ini TIDAK ikut berubah di mode
 * gelap. Sebelas rona yang saling terbedakan sudah sempit ruangnya; memberi
 * masing-masing varian gelap berarti dua palet yang harus sama-sama lolos
 * kontras, dan salah satunya pasti menyimpang lebih dulu. Karena itu legenda
 * dan garisnya selalu digambar di atas permukaan kartu yang terang.
 */
export const WPP_COLORS: { code: string; color: string }[] = [
  { code: '571', color: '#64748b' },
  { code: '572', color: '#16a34a' },
  { code: '573', color: '#65a30d' },
  { code: '711', color: '#d97706' },
  { code: '712', color: '#c2410c' },
  { code: '713', color: '#dc2626' },
  { code: '714', color: '#4338ca' },
  { code: '715', color: '#7c3aed' },
  { code: '716', color: '#c026d3' },
  { code: '717', color: '#0d9488' },
  { code: '718', color: '#ca8a04' },
];

const BY_CODE = new Map(WPP_COLORS.map(({ code, color }) => [code, color]));

/** Warna satu WPP. Kode yang tidak dikenal dapat abu-abu netral alih-alih
 *  melempar: kalau CMS suatu saat menambah WPP kedua belas, garisnya tetap
 *  tergambar -- tanpa warna khas, tapi tergambar. Halaman yang jatuh karena
 *  satu kode baru jauh lebih buruk. */
export function wppColor(code: string): string {
  return BY_CODE.get(code) ?? '#94a3b8';
}
