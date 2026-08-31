export type Domain = { min: number; max: number; step: number };

/** Jumlah selang antar-tick. Empat selang = lima tick, dan lima garis kisi di
 *  ChartFrame -- ketiganya harus tetap sejalan, jadi angkanya tinggal di sini
 *  dan bukan diketik ulang di masing-masing tempat. */
const INTERVALS = 4;

/** Faktor langkah yang boleh dipakai, dari yang terapat. Cuma angka yang
 *  mudah dijumlahkan di kepala: 1, 2, 2,5, dan 5 dikali pangkat sepuluh. */
const STEP_FACTORS = [1, 2, 2.5, 5];

/**
 * Rentang sumbu yang "bulat", dengan lebar TEPAT empat langkah.
 *
 * Dua syarat yang harus dipenuhi bersamaan, dan gagal kalau salah satunya
 * dikerjakan sendirian:
 *
 * 1. Langkahnya bulat. Memakai min/max mentah menghasilkan tick 6,83 / 7,41 /
 *    7,99 -- benar secara aritmetika, tapi tidak ada pembaca yang bisa
 *    memperkirakan nilai di antara dua garis kisi dari angka seperti itu.
 *
 * 2. Rentangnya kelipatan langkah. Membulatkan batas bawah dan atas
 *    sendiri-sendiri (floor untuk min, ceil untuk max) memenuhi syarat
 *    pertama tapi bukan yang kedua: rentang 5,5-8,0 dengan langkah 0,5 berisi
 *    lima selang, sementara sumbunya menggambar empat. Tick di antaranya lalu
 *    jatuh di 6,125 dan 7,375 -- bulat di kedua ujung, berantakan di
 *    tengahnya, yang justru bagian yang dipakai membaca grafik.
 *
 * Karena itu batas bawah dibulatkan ke bawah lebih dulu, lalu langkah
 *    diperbesar sampai empat selang benar-benar menutupi datanya.
 */
export function niceDomain(rawMin: number, rawMax: number): Domain {
  let min = rawMin;
  let max = rawMax;

  // Deret datar (semua nilainya sama) akan membuat pembagi nol di proyeksi.
  // Dibuka jadi rentang selebar 1 supaya garisnya jatuh di tengah kartu,
  // bukan hilang.
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  }

  const magnitude = Math.floor(Math.log10((max - min) / INTERVALS));

  // Naik dari langkah terapat sampai yang pertama muat. Tiga magnitudo sudah
  // jauh lebih dari cukup: tiap magnitudo mengalikan jangkauan sepuluh kali.
  for (let mag = magnitude; mag <= magnitude + 3; mag += 1) {
    for (const factor of STEP_FACTORS) {
      const step = factor * 10 ** mag;
      const start = Math.floor(min / step) * step;
      // Toleransi kecil: start + n*step sering meleset beberapa ulp dari max
      // karena aritmetika titik-mengambang, dan tanpa toleransi ini langkahnya
      // naik satu tingkat tanpa alasan.
      if (start + INTERVALS * step >= max - Math.abs(step) * 1e-9) {
        return { min: roundish(start), max: roundish(start + INTERVALS * step), step };
      }
    }
  }

  // Tidak terjangkau untuk data berhingga; ada supaya fungsinya selalu
  // mengembalikan Domain, bukan undefined.
  const step = (max - min) / INTERVALS;
  return { min: roundish(min), max: roundish(max), step };
}

/** Nilai tick, dari batas bawah ke batas atas.
 *
 *  Dihitung sebagai interpolasi min..max, BUKAN penambahan step berulang:
 *  penambahan berulang menumpuk galat titik-mengambang (0,1 + 0,1 + 0,1 =
 *  0,30000000000000004) dan menghasilkan tick terakhir yang meleset dari batas
 *  atas -- persis angka yang paling diperhatikan pembaca. */
export function tickValues(domain: Domain): number[] {
  return Array.from({ length: INTERVALS + 1 }, (_, i) =>
    roundish(domain.min + ((domain.max - domain.min) * i) / INTERVALS),
  );
}

/** Rasio posisi tiap garis kisi, dari atas. Diturunkan dari INTERVALS yang
 *  sama dengan tick-nya, jadi garis dan angkanya tidak bisa berbeda jumlah. */
export const GRID_RATIOS = Array.from({ length: INTERVALS + 1 }, (_, i) => i / INTERVALS);

/** Membuang ekor galat titik-mengambang tanpa mengubah nilai yang memang perlu
 *  banyak desimal. */
function roundish(value: number): number {
  return Number(value.toPrecision(12));
}
