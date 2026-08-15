#!/usr/bin/env node
/**
 * Pengganti typedRoutes -- dan menangkap lebih banyak darinya.
 *
 * typedRoutes hanya memeriksa href yang ditulis sebagai literal di source.
 * Skrip ini memeriksa HTML yang BENAR-BENAR terkirim, jadi ia ikut menangkap:
 *   1. href/src internal yang mati (404/500), termasuk aset,
 *   2. link internal di halaman berlocale-prefiks yang LUPA membawa prefiksnya.
 *
 * (2) adalah kegagalan yang tidak terlihat dari status HTTP: /berita di halaman
 * /en tetap menjawab 200, sambil diam-diam melempar pembaca Inggris ke versi
 * Indonesia. Tanpa pemeriksaan ini ia hanya ketahuan lewat laporan pengguna.
 *
 * Butuh server hidup:
 *   npm run build && npm run start -- --port 3100
 *   npm run check:links
 */

const BASE = (process.env.BASE_URL ?? 'http://localhost:3100').replace(/\/$/, '');

// Harus cocok dengan src/i18n/config.ts. Diduplikasi dengan sengaja: skrip ini
// berjalan di Node polos tanpa resolusi alias TypeScript, dan menambah build
// step demi dua string akan membuatnya lebih rapuh, bukan kurang.
const DEFAULT_LOCALE = 'id';
const PREFIXED_LOCALES = ['en'];

/** Titik masuk crawl: bentuk kanonik tiap locale. */
const ENTRY_POINTS = ['/', ...PREFIXED_LOCALES.map((l) => `/${l}`)];

const TAG_RE = /<(?:a|link|img|script|source|iframe|use)\b[^>]*>/gi;
const ATTR_RE = /\b(?:href|src)\s*=\s*"([^"]*)"/i;
const SRCSET_RE = /\bsrcset\s*=\s*"([^"]*)"/i;

const errors = [];
const visited = new Set();
const statusCache = new Map();

function localeOf(pathname) {
  const seg = pathname.split('/')[1] ?? '';
  return PREFIXED_LOCALES.includes(seg) ? seg : DEFAULT_LOCALE;
}

function isCrawlable(pathname) {
  // Ada titik = aset statis, bukan rute (aturan yang sama dengan matcher
  // middleware). Aset tetap dicek status-nya, hanya tidak ditelusuri isinya.
  return !pathname.split('/').pop()?.includes('.');
}

async function statusOf(url) {
  if (statusCache.has(url)) return statusCache.get(url);

  let status;
  try {
    // GET, bukan HEAD: Next menjawab sebagian rute berbeda untuk HEAD, dan
    // aset yang di-generate on-demand bisa 404 untuk HEAD sambil 200 untuk GET.
    const res = await fetch(url, { redirect: 'manual' });
    status = res.status;
  } catch (err) {
    status = `ERR ${err.message}`;
  }

  statusCache.set(url, status);
  return status;
}

/**
 * Dikumpulkan per TAG, bukan per atribut, karena aturan prefiks perlu tahu
 * atribut lain di tag yang sama: link ber-`hreflang` adalah language switcher,
 * yang memang harus menaut ke locale default tanpa prefiks.
 */
function collectRefs(html) {
  const refs = new Map();

  const add = (url, exempt) => {
    if (!url) return;
    // Sekali sebuah URL dinyatakan exempt, ia tetap exempt -- URL yang sama
    // muncul lagi sebagai link biasa tidak boleh membatalkannya.
    refs.set(url, refs.get(url) || exempt);
  };

  for (const [tag] of html.matchAll(TAG_RE)) {
    const exempt = /\bhreflang\s*=/i.test(tag);

    const attr = tag.match(ATTR_RE);
    if (attr) add(attr[1], exempt);

    const srcset = tag.match(SRCSET_RE);
    if (srcset) {
      for (const candidate of srcset[1].split(',')) {
        add(candidate.trim().split(/\s+/)[0], exempt);
      }
    }
  }

  return [...refs.entries()];
}

/** Buang entitas HTML yang umum muncul di href hasil render. */
function decode(href) {
  return href.replace(/&amp;/g, '&');
}

const queue = [...ENTRY_POINTS];

while (queue.length > 0) {
  const pathname = queue.shift();
  if (visited.has(pathname)) continue;
  visited.add(pathname);

  const pageUrl = `${BASE}${pathname}`;
  const res = await fetch(pageUrl, { redirect: 'manual' });

  if (res.status !== 200) {
    errors.push(`[${res.status}] halaman ${pathname}`);
    continue;
  }

  const html = await res.text();
  const pageLocale = localeOf(pathname);

  for (const [raw, exemptFromPrefix] of collectRefs(html)) {
    const href = decode(raw);

    // Eksternal, anchor, mailto:, tel:, data: -- bukan urusan skrip ini.
    if (!href.startsWith('/') || href.startsWith('//')) continue;

    const [pathOnly] = href.split('#');
    if (!pathOnly) continue;

    // Dua bentuk dari satu href, dan bedanya penting:
    //   `fetchable` menyimpan query, karena untuk sebagian URL query ITULAH
    //     isinya -- /_next/image?url=…&w=… tanpa query menjawab 400.
    //   `route` membuang query, karena aturan prefiks dan antrean crawl bicara
    //     tentang rute, dan satu rute dengan sepuluh query tetap satu halaman.
    const fetchable = pathOnly;
    const route = pathOnly.split('?')[0];

    // ATURAN PREFIKS. Di halaman berlocale-prefiks, setiap link internal yang
    // menuju rute (bukan aset, bukan infrastruktur Next) wajib membawa
    // prefiksnya. Inilah yang tidak bisa ditangkap status HTTP.
    if (
      pageLocale !== DEFAULT_LOCALE &&
      !exemptFromPrefix &&
      isCrawlable(route) &&
      !route.startsWith('/_next/') &&
      route !== `/${pageLocale}` &&
      !route.startsWith(`/${pageLocale}/`)
    ) {
      errors.push(`[prefiks] ${pathname} menaut ke ${route} tanpa prefiks /${pageLocale}`);
      continue;
    }

    const status = await statusOf(`${BASE}${fetchable}`);
    if (status !== 200) {
      errors.push(`[${status}] ${pathname} -> ${fetchable}`);
      continue;
    }

    // /_next/* tidak punya ekstensi tapi juga bukan halaman -- menelusurinya
    // hanya membuang waktu pada endpoint yang tidak menghasilkan HTML.
    if (isCrawlable(route) && !route.startsWith('/_next/') && !visited.has(route)) {
      queue.push(route);
    }
  }
}

console.log(`check:links — ${visited.size} halaman, ${statusCache.size} target diperiksa`);

if (errors.length > 0) {
  console.error(`\n${errors.length} masalah:`);
  for (const e of errors.sort()) console.error(`  ${e}`);
  process.exit(1);
}

console.log('Semua link dan aset internal hidup, dan prefiks locale utuh.');
