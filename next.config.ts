import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
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
