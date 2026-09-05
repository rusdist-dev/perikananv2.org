/**
 * Kode WPP-RI (Wilayah Pengelolaan Perikanan Republik Indonesia) yang benar-
 * benar ada -- sama dengan daftar 8 kode yang dipakai statistik "FMAs
 * Covered" di halaman Publications (571, 572, 573, 712, 713, 714, 715, 718),
 * ditambah 711, 716, 717 supaya lengkap sebelas WPP laut RI. Warnanya
 * dekoratif untuk legenda, dipilih manual supaya sebelas kode tetap
 * terbedakan -- bukan token seri grafik (--color-series-*) karena tokennya
 * cuma enam sementara WPP-nya sebelas.
 */
export const FMA_CODES: { code: string; color: string }[] = [
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
