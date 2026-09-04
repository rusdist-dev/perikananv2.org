/**
 * Data contoh murni untuk pratinjau tata letak -- BUKAN data Data Crab
 * sungguhan. Belum ada sumber data/API yang tersambung ke halaman ini (lihat
 * catatan di FisheriesDataDashboard.tsx), jadi ketiga dataset di bawah
 * dibangun dengan rumus, bukan diambil dari mana pun yang mengaku nyata.
 * Bentuknya sengaja beda dari sample-data IKAN supaya tidak terlihat seperti
 * salinan dataset yang sama.
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

/** Label bulan-tahun dari Januari 2021 sampai Juni 2026. */
export function monthlyLabels(): string[] {
  const labels: string[] = [];
  let year = 2021;
  let month = 0; // Januari

  // 66 bulan: Jan-2021 s/d Jun-2026.
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

/** Jumlah trip contoh: naik-turun musiman ringan lalu melandai naik --
 *  bentuknya beda dari kurva IKAN (yang punya satu lonjakan tajam), sekadar
 *  supaya kedua dasbor tidak tampak memakai data yang sama. */
export function sampleTripCounts(): number[] {
  return monthlyLabels().map((_, i) => {
    const seasonal = 40 + 25 * Math.sin(i / 2);
    const trend = i * 3.2;
    return Math.max(10, Math.round(seasonal + trend));
  });
}

export const SAMPLE_CATCH_COMPOSITION = {
  labels: ['Rajungan', 'Kepiting Bakau', 'Kepiting Batu', 'Kepiting Kenari', 'Kepiting Hijau'],
  values: [1860, 1420, 780, 340, 260],
};

export const SAMPLE_LENGTH_FREQUENCY = {
  labels: ['6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18-20'],
  values: [12, 34, 58, 47, 26, 11, 4],
};
