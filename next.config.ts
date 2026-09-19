import type { NextConfig } from 'next';

// §4j lagi: host CMS diturunkan dari CONTENT_API_URL, bukan ditulis ulang di
// sini sebagai string terpisah -- kalau CONTENT_SOURCE balik ke 'local' dan
// env itu dilepas, remotePatterns ikut kosong daripada mengizinkan host yang
// sudah tidak dipakai. `lib/content/source.ts` yang menghasilkan cover_url
// CMS sebagai URL absolut ke host yang sama ini.
//
// Protokol dan port ikut diturunkan dari URL yang sama, bukan dipatok
// 'https' + port default: CMS lokal dijalankan sebagai http://localhost:8000,
// jadi pola yang mematok https tanpa port menolak setiap cover_url-nya dengan
// "hostname is not configured" -- padahal host-nya justru sudah cocok. Port
// sengaja diisi eksplisit ('' untuk port default) karena port yang dibiarkan
// kosong berarti wildcard '**' di Next 16, yang akan mengizinkan port mana pun
// pada host itu.
const cmsImagePattern = (() => {
  try {
    const { protocol, hostname, port } = new URL(process.env.CONTENT_API_URL ?? '');
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    return {
      protocol: protocol === 'http:' ? ('http' as const) : ('https' as const),
      hostname,
      port,
      pathname: '/media/**',
    };
  } catch {
    return null;
  }
})();

/** Foto desa pada panel /discover/our-impact TIDAK dilayani host CMS.
 *
 *  `/ext/coast/desa/{kode}` mengirim `gambar[].url` sebagai URL absolut ke
 *  layanan pendataan pesisir, dan host itu sama persis baik CMS-nya lokal
 *  maupun produksi (sudah diverifikasi: CMS di localhost pun mengembalikan URL
 *  host ini). Karena itu ia ditulis tetap di sini, bukan diturunkan dari
 *  CONTENT_API_URL seperti pola di atas -- menurunkannya dari env yang salah
 *  justru akan memblokir seluruh foto desa setiap kali CMS dijalankan lokal.
 *
 *  Tanpa entri ini next/image menolak setiap foto desa dengan "hostname is not
 *  configured", bukan sekadar menampilkannya tanpa optimasi. */
const coastImagePattern = {
  protocol: 'https' as const,
  hostname: 'ourimpact.ikan-frci.id',
  port: '',
  pathname: '/desa-images/**',
};

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: cmsImagePattern ? [cmsImagePattern, coastImagePattern] : [coastImagePattern],
  },

  // typedRoutes mengetik rute dinamis sebagai Route<T> yang menuntut path
  // literal, jadi ia tidak bisa memeriksa href yang dibangun dari data (slug
  // artikel, entri nav dari array config) -- justru mayoritas link di sini.
  // Penggantinya scripts/check-links.mjs, yang menelusuri HTML hasil build.
  typedRoutes: false,

  // Tanpa ini Next 16 menjawab 403 untuk setiap chunk /_next/static yang
  // diminta dari origin LAN dan menolak websocket HMR, sehingga halaman sampai
  // sebagai markup tanpa hydration. Gejalanya terlihat seperti CSS rusak, bukan
  // seperti origin diblokir -- itu sebabnya ia mahal untuk didiagnosis.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*', '*.local'],
};

export default nextConfig;
