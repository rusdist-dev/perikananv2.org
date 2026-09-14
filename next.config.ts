import type { NextConfig } from 'next';

// §4j lagi: host CMS diturunkan dari CONTENT_API_URL, bukan ditulis ulang di
// sini sebagai string terpisah -- kalau CONTENT_SOURCE balik ke 'local' dan
// env itu dilepas, remotePatterns ikut kosong daripada mengizinkan host yang
// sudah tidak dipakai. `lib/content/source.ts` yang menghasilkan cover_url
// CMS sebagai URL absolut ke host yang sama ini.
const cmsImageHost = (() => {
  try {
    return new URL(process.env.CONTENT_API_URL ?? '').hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: cmsImageHost
      ? [{ protocol: 'https', hostname: cmsImageHost, pathname: '/media/**' }]
      : [],
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
