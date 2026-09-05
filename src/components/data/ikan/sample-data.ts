/**
 * Data contoh murni untuk pratinjau tata letak -- BUKAN data IKAN sungguhan.
 * Belum ada sumber data/API yang tersambung ke halaman ini (lihat catatan
 * §4j di IkanDashboard.tsx), jadi ketiga dataset di bawah dibangun dengan
 * rumus, bukan diambil dari mana pun yang mengaku nyata.
 */

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Label bulan-tahun dari Desember 2020 sampai Mei 2026, meniru rentang di
 *  rancangan acuan. */
export function monthlyLabels(): string[] {
  const labels: string[] = [];
  let year = 2020;
  let month = 11; // Desember (indeks 0 = Januari)

  // 66 bulan: Des-2020 s/d Mei-2026.
  for (let i = 0; i < 66; i += 1) {
    labels.push(`${MONTH_NAMES[month]}-${year}`);
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return labels;
}

/** Jumlah trip contoh: rendah dan datar di awal, naik tajam pertengahan
 *  2024-2025, lalu turun kembali -- bentuknya saja yang meniru rancangan
 *  acuan, angkanya dihitung dari rumus, bukan dicatat dari trip sungguhan. */
export function sampleTripCounts(): number[] {
  return monthlyLabels().map((_, i) => {
    if (i < 34) return Math.round(30 + 25 * Math.abs(Math.sin(i / 2.3)));
    if (i < 38) return Math.round(90 + (i - 34) * 45);
    if (i < 41) return Math.round(260 - (i - 38) * 45);
    if (i < 44) return Math.round(130 + (i - 41) * 110);
    if (i < 54) return Math.round(450 + (i - 44) * 35);
    if (i < 58) return Math.round(800 - (i - 54) * 115);
    return Math.round(80 + 20 * Math.abs(Math.sin(i)));
  });
}

export const SAMPLE_CATCH_COMPOSITION = {
  labels: ['Tuna', 'Cakalang', 'Tongkol', 'Tenggiri', 'Cumi-cumi', 'Udang'],
  values: [1240, 2860, 1980, 940, 610, 430],
};

export const SAMPLE_LENGTH_FREQUENCY = {
  labels: ['10-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55'],
  values: [8, 22, 46, 68, 51, 33, 19, 9, 3],
};
