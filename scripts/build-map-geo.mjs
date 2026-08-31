#!/usr/bin/env node
/**
 * Menghasilkan dua artefak peta:
 *   public/geo/indonesia-region.json    -- bentuk daratan, dari Natural Earth
 *   public/geo/conservation-areas.json  -- kawasan konservasi, dari data/
 *
 * Kenapa build step, bukan `import` langsung:
 *  - Sumbernya 13 MB (10m) + 3 MB (50m). Yang benar-benar dibutuhkan cuma
 *    ~470 KB, dan sisanya adalah negara di benua lain plus 168 properti per
 *    feature yang tak satu pun dipakai untuk menggambar.
 *  - Keluarannya DI-COMMIT. Build dan CI tidak boleh bergantung pada jaringan
 *    atau pada GitHub raw yang sedang hidup.
 *
 * Kenapa dua tingkat resolusi: Indonesia dari 10m (subjek halaman, harus tajam
 * -- 264 pulau), tetangganya dari 50m (cuma konteks di tepi bingkai). Semua-10m
 * menghasilkan 1.2 MB tanpa manfaat visual; semua-50m memangkas Indonesia
 * sampai 133 pulau saja.
 *
 * Natural Earth berada di domain publik (CC0), jadi aman dipakai komersial.
 *
 * Sumber kawasan konservasi ada di data/, BUKAN di public/: berkas mentahnya
 * 6.6 MB dan apa pun di public/ ikut terkirim ke pengunjung serta membengkakkan
 * setiap deploy. Yang terbit ke public/ hanya hasil pemangkasannya.
 *
 * Jalankan: npm run geo
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LAND_OUT = path.join(ROOT, 'public', 'geo', 'indonesia-region.json');

const KK_SRC = path.join(ROOT, 'data', 'kk2025_simplified.json');
const KK_OUT = path.join(ROOT, 'public', 'geo', 'conservation-areas.json');

/** Toleransi Douglas-Peucker untuk kawasan konservasi, dalam derajat.
 *  0.002 derajat ~= 222 m di ekuator, dan pada maxZoom 9 milik komponen satu
 *  piksel ~= 305 m -- jadi penyederhanaan ini di bawah satu piksel: tak terlihat
 *  di zoom mana pun yang diizinkan, tapi membuang ~91% titik.
 *
 *  Berkas sumbernya SUDAH bernama "simplified", tapi disederhanakan untuk zoom
 *  yang jauh lebih dalam: 362.436 titik untuk 554 kawasan. Membulatkan koordinat
 *  saja hanya menurunkannya ke 749 KB gzip; yang dibutuhkan pengurangan titik.
 *
 *  Ini BATAS ATAS, bukan nilai tetap -- lihat toleranceFor(). */
const KK_TOLERANCE = 0.002;

/** Toleransi dihitung sebagai fraksi dari bentangan kawasan, lalu dijepit.
 *
 *  Toleransi absolut adalah cacat kualitas yang halus: 222 m memang di bawah
 *  satu piksel untuk kawasan seluas 800.000 ha, tapi untuk kawasan berukuran
 *  2 km ia 10% dari lebarnya -- lengkung pantainya jadi segitiga, dan kawasan
 *  kecil tampak seperti kotak bersudut yang terlihat seperti artefak render,
 *  bukan seperti batas kawasan.
 *
 *  Kawasan kecil punya sedikit titik, jadi toleransi halus untuknya nyaris
 *  gratis; kawasan besarlah yang membawa hampir semua byte, dan ia tetap
 *  disederhanakan sekasar mungkin. */
const KK_TOLERANCE_FRACTION = 0.02;
const KK_TOLERANCE_MIN = KK_TOLERANCE / 16;

function toleranceFor(ring) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const extent = Math.max(maxX - minX, maxY - minY);
  return Math.min(KK_TOLERANCE, Math.max(extent * KK_TOLERANCE_FRACTION, KK_TOLERANCE_MIN));
}

const NE_BASE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson';

/** Kotak yang menentukan apa yang ikut terbit: [barat, selatan, timur, utara].
 *  Sengaja lebih longgar dari bingkai peta supaya daratan tetangga masih masuk
 *  sampai ke luar tepi, bukan terpotong rata persis di batas viewport. */
const REGION = [90, -15, 146, 10];

/** Pembulatan koordinat. 3 desimal ~= 110 m di ekuator -- jauh di bawah
 *  akurasi posisi sumber 10m itu sendiri (~1 km), jadi ini TIDAK menurunkan
 *  detail yang benar-benar ada, ia cuma berhenti menyimpan digit yang isinya
 *  sudah derau. Menaikkannya ke 4 desimal membengkakkan berkas ~12% tanpa satu
 *  piksel pun berubah pada maxZoom yang dipakai komponen. */
const DECIMALS = 3;

async function fetchGeojson(name) {
  const url = `${NE_BASE}/${name}.geojson`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengunduh ${name}: HTTP ${res.status} dari ${url}`);
  }
  return res.json();
}

/** Apakah titik berada di dalam REGION. */
function inRegion([x, y]) {
  return x >= REGION[0] && x <= REGION[2] && y >= REGION[1] && y <= REGION[3];
}

/**
 * Menyeragamkan Polygon dan MultiPolygon menjadi satu bentuk: array of polygon,
 * di mana polygon = [cincin luar, lubang...]. Semua langkah di bawah cuma perlu
 * memikirkan satu bentuk.
 */
function toPolygons(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  throw new Error(`Tipe geometri tak terduga: ${geometry.type}`);
}

/**
 * Menyaring per POLIGON (bukan per feature, bukan per cincin).
 *
 * Per-feature memakai bbox adalah jebakan: pulau-pulau New Zealand, Fiji, dan
 * Kiribati melintasi antimeridian, sehingga bbox mereka membentang -180..180
 * dan "berpotongan" dengan Indonesia. Ketiganya lolos filter bbox padahal tidak
 * punya satu pun daratan di kawasan ini. Filter di sini melihat vertex yang
 * benar-benar ada, jadi kebetulan bbox tidak bisa menipunya.
 *
 * Disaring per poligon, bukan per cincin, supaya lubang (danau, teluk tertutup)
 * tetap menempel pada pulau induknya alih-alih jadi cincin yatim yang dirender
 * sebagai bentuk padat.
 */
function polygonsInRegion(geometry) {
  return toPolygons(geometry).filter((polygon) => polygon[0].some(inRegion));
}

/**
 * Membulatkan koordinat lalu membuang titik kembar yang berurutan.
 *
 * Pembulatan ITU SENDIRI yang menciptakan titik kembar: dua vertex berjarak
 * 20 m menjadi koordinat yang identik. Tanpa pembuangan ini, berkasnya membawa
 * ribuan segmen berpanjang nol -- byte terbuang, dan `stroke-linejoin` bisa
 * menghasilkan artefak di sudutnya.
 */
function roundRing(ring, decimals = DECIMALS) {
  const f = 10 ** decimals;
  const out = [];

  for (const [x, y] of ring) {
    const point = [Math.round(x * f) / f, Math.round(y * f) / f];
    const prev = out[out.length - 1];
    if (!prev || prev[0] !== point[0] || prev[1] !== point[1]) out.push(point);
  }

  // Cincin GeoJSON wajib tertutup. Titik penutup bisa ikut terbuang di atas
  // kalau ia membulat sama dengan tetangganya, jadi ia dipasang kembali di sini.
  const [first] = out;
  const last = out[out.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) out.push([...first]);

  return out;
}

/** Cincin dengan < 4 titik (3 titik berbeda + penutup) bukan poligon; ia hanya
 *  menghasilkan path degenerate. Ini terjadi pada pulau yang lebih kecil dari
 *  presisi pembulatan -- pulau seukuran itu memang tak terlihat di zoom mana
 *  pun yang diizinkan komponen. */
const isDrawable = (ring) => ring.length >= 4;

function simplifyPolygons(polygons) {
  return polygons
    // `polygon.map(roundRing)` -- tanpa lambda -- adalah bug: Array.map
    // meneruskan INDEKS sebagai argumen kedua, jadi cincin luar (indeks 0)
    // dibulatkan ke `decimals: 0`, yaitu derajat bulat. Gejalanya bukan error
    // melainkan Indonesia menyusut dari 264 pulau jadi 43.
    .map((polygon) => polygon.map((ring) => roundRing(ring)).filter(isDrawable))
    .filter((polygon) => polygon.length > 0);
}

/** Menyusun feature ramping: hanya `name` dan `subject`, dari 168 properti
 *  Natural Earth. Properti Indonesia saja berukuran 3171 byte -- lebih besar
 *  dari geometrinya di resolusi 110m. */
function slimFeature(source, { subject }) {
  const polygons = simplifyPolygons(polygonsInRegion(source.geometry));
  if (polygons.length === 0) return null;

  return {
    type: 'Feature',
    properties: { name: source.properties.ADMIN, subject },
    geometry: { type: 'MultiPolygon', coordinates: polygons },
  };
}

/* ---------------------------------------------------------------------------
   KAWASAN KONSERVASI
   --------------------------------------------------------------------------- */

/**
 * Douglas-Peucker: buang titik yang jaraknya dari garis penyederhana di bawah
 * toleransi. Ditulis iteratif dengan stack, BUKAN rekursif -- cincin terpanjang
 * di berkas ini punya ribuan titik, dan versi rekursif meledak di stack pada
 * bentuk memanjang (kasus terburuknya O(n) kedalaman).
 *
 * Jarak diukur ke SEGMEN, bukan ke garis tak berhingga: memakai garis tak
 * berhingga membuat titik jauh di luar segmen tampak "dekat" dan ikut terbuang,
 * yang memotong ujung-ujung teluk.
 */
function douglasPeucker(points, tolerance) {
  if (points.length < 3) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const tol2 = tolerance * tolerance;
  const stack = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop();
    const [x1, y1] = points[start];
    const [x2, y2] = points[end];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    let farthest = -1;
    let farthestDist = -1;

    for (let i = start + 1; i < end; i++) {
      const [x, y] = points[i];
      let dist;
      if (lengthSq === 0) {
        dist = (x - x1) ** 2 + (y - y1) ** 2;
      } else {
        let t = ((x - x1) * dx + (y - y1) * dy) / lengthSq;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        dist = (x - (x1 + t * dx)) ** 2 + (y - (y1 + t * dy)) ** 2;
      }
      if (dist > farthestDist) {
        farthestDist = dist;
        farthest = i;
      }
    }

    if (farthestDist > tol2) {
      keep[farthest] = 1;
      stack.push([start, farthest], [farthest, end]);
    }
  }

  return points.filter((_, i) => keep[i] === 1);
}

/**
 * Menyederhanakan satu cincin dengan toleransi DAN presisi yang MENGALAH.
 *
 * Nilai tetap adalah kehilangan data, bukan kompresi. Toleransi 0.002 saja
 * mengolapskan 16 kawasan sampai hilang (0.005 sebanyak 79 dari 554), dan yang
 * hilang justru kawasan kecil -- yang paling butuh perlakuan halus sekaligus
 * paling murah disimpan utuh.
 *
 * Presisi juga harus mengalah, bukan hanya toleransi: "PKK-078 Sumenep" luasnya
 * 0,48 ha (166 m x 55 m), jadi rentang lintangnya lebih kecil dari satu langkah
 * pembulatan 3 desimal (~111 m) dan kolaps SEBELUM Douglas-Peucker ikut bicara.
 * Ada 15 kawasan di bawah ~330 m seperti itu.
 *
 * Diurutkan dari paling kasar ke paling halus, jadi yang dikembalikan selalu
 * versi termurah yang masih selamat -- ke-15 kawasan itu saja yang membayar
 * digit tambahan, bukan seluruh 554.
 */
function simplifyRing(ring, tolerance) {
  for (let tol = tolerance; tol >= tolerance / 64; tol /= 4) {
    const reduced = douglasPeucker(ring, tol);
    for (let decimals = DECIMALS; decimals <= DECIMALS + 3; decimals++) {
      const candidate = roundRing(reduced, decimals);
      if (isDrawable(candidate)) return candidate;
    }
  }
  return null;
}

/** WPP di sumbernya tidak konsisten: "WPP 712" bersanding dengan "WPP712", dan
 *  satu baris berisi "-". Dinormalkan di sini supaya konsumen di sisi klien
 *  tidak perlu tahu soal itu. */
function normaliseWpp(raw) {
  if (!raw || raw === '-') return null;
  const match = String(raw).match(/(\d{3})/);
  return match ? `WPP ${match[1]}` : null;
}

async function buildConservationAreas() {
  let source;
  try {
    source = JSON.parse(await readFile(KK_SRC, 'utf8'));
  } catch (error) {
    throw new Error(
      `Gagal membaca ${path.relative(ROOT, KK_SRC)}: ${error.message}
` +
        'Berkas ini sumber yang di-commit, bukan hasil unduhan -- kalau ia ' +
        'hilang, ambil kembali dari riwayat git.',
    );
  }

  let droppedRings = 0;
  let rescued = 0;
  const features = [];

  for (const feature of source.features) {
    const sourcePolygons = toPolygons(feature.geometry);

    // Langkah biasa: toleransi TETAP, dan cincin yang kolaps dibuang. Cincin
    // yang kolaps pada 222 m adalah pulau kecil atau lubang berukuran
    // sub-piksel pada maxZoom 9 -- mempertahankannya dengan presisi lebih
    // tinggi memakan 120 KB gzip demi bentuk yang tak pernah terlihat.
    let polygons = sourcePolygons
      .map((polygon) => {
        // Toleransi diambil dari cincin LUAR lalu dipakai untuk lubangnya juga:
        // lubang yang disederhanakan lebih kasar dari induknya bisa menyeruak
        // keluar dari tepi induknya.
        const tolerance = toleranceFor(polygon[0]);

        return polygon
          .map((ring) => {
            const simplified = roundRing(douglasPeucker(ring, tolerance));
            if (!isDrawable(simplified)) droppedRings++;
            return isDrawable(simplified) ? simplified : null;
          })
          .filter(Boolean);
      })
      .filter((polygon) => polygon.length > 0);

    // Yang WAJIB selamat adalah KAWASANNYA, bukan tiap cincinnya. Kalau seluruh
    // poligonnya kolaps, poligon terbesarnya diselamatkan dengan toleransi dan
    // presisi yang mengalah -- hanya 15 kawasan yang sampai ke jalur ini, jadi
    // digit tambahannya tidak ditanggung oleh 554 kawasan lainnya.
    if (polygons.length === 0) {
      const largest = sourcePolygons.reduce((a, b) => (b[0].length > a[0].length ? b : a));
      const outer = simplifyRing(largest[0], toleranceFor(largest[0]));
      if (!outer) {
        throw new Error(
          `Kawasan "${feature.properties.nama_kk}" (${feature.properties.luas_kk_ha} ha) ` +
            'kosong bahkan setelah simplifyRing mengalah sampai batas. ' +
            'Geometrinya mungkin rusak -- periksa berkas sumber.',
        );
      }
      polygons = [[outer]];
      rescued++;
    }

    features.push({
      type: 'Feature',
      properties: {
        name: feature.properties.nama_kk,
        wpp: normaliseWpp(feature.properties.wpp),
        ha: feature.properties.luas_kk_ha ?? null,
      },
      geometry: { type: 'MultiPolygon', coordinates: polygons },
    });
  }

  if (features.length !== source.features.length) {
    throw new Error(
      `${source.features.length - features.length} kawasan hilang -- tidak boleh ada yang hilang.`,
    );
  }

  const json = JSON.stringify({ type: 'FeatureCollection', features });
  await writeFile(KK_OUT, json, 'utf8');

  const points = features.reduce(
    (total, f) => total + f.geometry.coordinates.flat(2).length,
    0,
  );
  return { count: features.length, points, json, droppedRings, rescued };
}

const countRings = (features) =>
  features.reduce((total, f) => total + f.geometry.coordinates.length, 0);

async function main() {
  const [detailed, coarse] = await Promise.all([
    fetchGeojson('ne_10m_admin_0_countries'),
    fetchGeojson('ne_50m_admin_0_countries'),
  ]);

  const source = detailed.features.find((f) => f.properties.ADMIN === 'Indonesia');
  if (!source) {
    throw new Error(
      'Indonesia tidak ada di ne_10m_admin_0_countries. Natural Earth mungkin ' +
        'mengganti nama properti ADMIN -- periksa skema sumbernya.',
    );
  }

  const indonesia = slimFeature(source, { subject: true });
  if (!indonesia) {
    throw new Error('Geometri Indonesia kosong setelah disaring. REGION salah?');
  }

  const neighbours = coarse.features
    .filter((f) => f.properties.ADMIN !== 'Indonesia')
    .map((f) => slimFeature(f, { subject: false }))
    .filter(Boolean)
    // Diurutkan supaya keluarannya deterministik: urutan feature Natural Earth
    // boleh berubah antar rilis, dan diff 470 KB yang isinya cuma pengurutan
    // ulang tidak bisa ditinjau.
    .sort((a, b) => a.properties.name.localeCompare(b.properties.name));

  if (neighbours.length === 0) {
    throw new Error('Nol negara tetangga lolos filter. REGION salah?');
  }

  const collection = {
    type: 'FeatureCollection',
    features: [indonesia, ...neighbours],
  };

  const json = JSON.stringify(collection);
  await mkdir(path.dirname(LAND_OUT), { recursive: true });
  await writeFile(LAND_OUT, json, 'utf8');

  const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
  const size = (text) => `${kb(text.length)} raw, ${kb(gzipSync(text).length)} gzip`;

  console.log(`Indonesia   : ${indonesia.geometry.coordinates.length} pulau (10m)`);
  console.log(
    `Tetangga    : ${neighbours.length} negara, ${countRings(neighbours)} pulau (50m)`,
  );
  console.log(`              ${neighbours.map((f) => f.properties.name).join(', ')}`);
  console.log(`  -> indonesia-region.json    ${size(json)}`);

  const kk = await buildConservationAreas();
  const withWpp = JSON.parse(kk.json).features.filter((f) => f.properties.wpp).length;
  console.log(
    `
Kawasan     : ${kk.count} kawasan konservasi, ${kk.points} titik` +
      ` (dari 362.436 di sumbernya)`,
  );
  console.log(
    `              ${withWpp}/${kk.count} punya WPP` +
      ` | ${kk.droppedRings} cincin sub-piksel dibuang` +
      ` | ${kk.rescued} kawasan diselamatkan dengan presisi lebih tinggi`,
  );
  console.log(`  -> conservation-areas.json  ${size(kk.json)}`);
}

await main();
