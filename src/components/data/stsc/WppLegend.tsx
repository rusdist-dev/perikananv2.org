import { WPP_COLORS } from '@/components/data/stsc/wpp-colors';

/**
 * Legenda kesebelas WPP-RI beserta warnanya.
 *
 * Tetap ada meski tiap grafik sudah membawa legendanya sendiri, dan keduanya
 * tidak saling menggantikan: legenda grafik hanya memuat WPP yang benar-benar
 * digambar kartu itu (satu saja, kalau pengunjung menyaring), sementara yang
 * ini adalah kunci warna LENGKAP -- ia menjawab "warna ini milik WPP mana"
 * untuk seluruh halaman sekaligus, termasuk saat pembaca membandingkan dua
 * kartu yang penyaringnya berbeda.
 *
 * Di BAWAH grafik, bukan di atas: yang di atas tiap kartu sudah cukup untuk
 * membaca kartu itu sendiri, dan kunci lengkap sebelas kode di puncak halaman
 * cuma menunda grafik pertamanya.
 */
export function WppLegend() {
  return (
    <div className="mt-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
        Wilayah Pengelolaan Perikanan (WPP-RI)
      </p>
      <ul className="flex list-none flex-wrap gap-2 p-0">
        {WPP_COLORS.map(({ code, color }) => (
          <li
            key={code}
            style={{ backgroundColor: color }}
            className="rounded-md px-4 py-2 text-sm font-semibold text-white"
          >
            FMA-RI {code}
          </li>
        ))}
      </ul>
    </div>
  );
}
