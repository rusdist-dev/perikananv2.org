'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import type { FeatureCollection, MultiPolygon } from 'geojson';

import 'leaflet/dist/leaflet.css';
// HANYA MarkerCluster.css (transisi animasi gerombol + kaki spiderfy).
// MarkerCluster.Default.css sengaja TIDAK diimpor: isinya lingkaran hijau/
// kuning/biru bawaan plugin -- warna di luar palet yang tak pernah diukur
// terhadap tema mana pun. Rupa gerombolnya dipasang di IndonesiaMap.css lewat
// iconCreateFunction di bawah.
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './IndonesiaMap.css';

/** Tema harus berupa union literal, bukan `string`: nama tema yang salah ketik
 *  gagal saat typecheck, bukan merender peta tak berwarna. Setiap nama di sini
 *  wajib punya blok `[data-map-theme='...']` di IndonesiaMap.css. */
export type MapTheme = 'brand' | 'light' | 'dark';

/** Satu titik yang harus disorot peta. `null` berarti "tidak ada yang dipilih",
 *  dan peta kembali ke bingkai seluruh Indonesia -- itulah satu-satunya jalan
 *  keluar dari keadaan ter-zoom di ponsel, tempat panning Leaflet dimatikan. */
export type MapFocus = {
  lat: number;
  lng: number;
  /** Dipasang sebagai tooltip permanen di penanda; tanpa basemap, titik tanpa
   *  nama di tengah laut tidak memberi tahu apa pun. */
  label: string;
  /** Dibatasi maxZoom peta. Bawaannya sengaja bukan zoom paling dalam: sumber
   *  Natural Earth 10m tidak punya detail untuk dibuka lebih jauh, jadi yang
   *  bertambah cuma perbesaran garis pantai yang sama. */
  zoom?: number;
};

/** Satu penanda yang selalu tampil di peta (beda dari `focus`, yang cuma satu
 *  dan hanya ada saat sesuatu dipilih). `id` dikembalikan apa adanya lewat
 *  `onMarkerSelect` supaya pemanggil tidak perlu mencocokkan koordinat. */
export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
};

/** Batas wilayah yang digambar di atas peta: daftar POLIGON -> daftar CINCIN
 *  -> daftar titik [lat, lng].
 *
 *  Tiga tingkat, karena satu wilayah bisa terdiri dari beberapa bidang
 *  terpisah (desa kepulauan). Bentuk ini sama persis dengan yang diterima
 *  L.polygon untuk multipoligon, jadi tidak ada penerjemahan lagi di effect --
 *  dan tingkat cincin tetap ada supaya bidang terpisah tidak salah dibaca
 *  sebagai lubang. Sumbernya VillageDetail.batas, yang sudah dinormalkan di
 *  lib/content/source.ts. */
export type MapShape = [number, number][][][];

/** Cukup dekat untuk menunjukkan "di pesisir mana", masih cukup jauh untuk
 *  memperlihatkan pulau tempat desa itu berada. Dipakai saat yang diketahui
 *  cuma satu TITIK; kalau batas wilayahnya ikut dikirim, bingkainya diambil
 *  dari poligon itu (lihat effect `shape`). */
const FOCUS_ZOOM = 8;

/** Kedua berkas dihasilkan `npm run geo` (scripts/build-map-geo.mjs) dan
 *  di-commit. Keduanya diletakkan di public/, bukan diimpor, supaya 384 KB +
 *  630 KB-nya tidak masuk bundle JS -- mereka diminta sebagai request terpisah
 *  yang bisa di-cache. */
const REGION_URL = '/geo/indonesia-region.json';
const MPA_URL = '/geo/conservation-areas.json';

/** `subject` menandai Indonesia; sisanya negara tetangga yang cuma jadi
 *  konteks di tepi bingkai. Keduanya diwarnai berbeda lewat kelas CSS. */
type RegionProperties = { name: string; subject: boolean };

/** Kawasan konservasi. `wpp` sudah dinormalkan di build step (sumbernya
 *  mencampur "WPP 712" dengan "WPP712" dan satu "-"), jadi di sini ia sudah
 *  pasti berbentuk "WPP 712" atau null.
 *
 *  `idMpa` ("T244") adalah pengenal KKP yang juga dikirim CMS lewat
 *  `/ext/coast/kawasan-konservasi` -- lihat prop `interventionMpaIds`. null
 *  untuk dua kawasan yang memang tidak punya id di data sumber; keduanya
 *  karena itu tidak akan pernah cocok, dan itu jawaban yang benar. */
type MpaProperties = {
  name: string;
  idMpa: string | null;
  wpp: string | null;
  ha: number | null;
};

/** Lihat komentar prop `maxZoom` soal kenapa angkanya serendah ini secara
 *  bawaan. */
const DEFAULT_MAX_ZOOM = 9;

/** Atribusi lapisan batas wilayah, sebagai konstanta karena ia DIPASANG dan
 *  DILEPAS: begitu basemap raster menyala, daratan Natural Earth disembunyikan
 *  (lihat IndonesiaMap.css), dan atribusi untuk sesuatu yang tidak digambar
 *  adalah keterangan yang keliru. */
const NE_ATTRIBUTION =
  'Batas wilayah: <a href="https://www.naturalearthdata.com/">Natural Earth</a>';

export type BasemapId = 'imagery' | 'light';

/**
 * Basemap raster opsional.
 *
 * Keduanya dari Esri dan dipilih karena BISA DIPAKAI TANPA KUNCI API: peta ini
 * tidak punya tempat menyimpan kredensial yang tidak ikut terkirim ke browser,
 * dan menambah satu kunci berarti menambah satu hal yang bisa bocor atau
 * kedaluwarsa diam-diam.
 *
 * `{z}/{y}/{x}` -- urutan y sebelum x -- memang begitu skema ArcGIS, berbeda
 * dari kebanyakan penyedia lain. Tertukar berarti ubin kosong tanpa pesan galat.
 *
 * maxZoom 16, bukan 19 yang sebenarnya disediakan Esri: kawasan konservasi
 * digambar dari data yang disederhanakan sampai ~222 m (lihat KK_TOLERANCE di
 * scripts/build-map-geo.mjs), jadi di luar zoom itu batas kawasan mulai
 * terlihat kasar di atas citra yang tajam -- persis masalah yang basemap ini
 * datang untuk menyelesaikan.
 */
const BASEMAPS: Record<BasemapId, { url: string; attribution: string; maxZoom: number }> = {
  imagery: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Citra: <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
    maxZoom: 16,
  },
  light: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Peta dasar: <a href="https://www.esri.com/">Esri</a>, HERE, Garmin',
    maxZoom: 16,
  },
};

/** Kotak yang memuat seluruh wilayah Indonesia: Sabang di barat laut sampai
 *  perbatasan Papua di timur dan Rote di selatan. Dipakai untuk `fitBounds`
 *  supaya bingkai awal peta tidak bergantung pada center+zoom yang harus
 *  ditebak ulang setiap kali tinggi kontainer berubah.
 *
 *  Ini BUKAN diturunkan dari bounds data: datanya memuat Australia dan India,
 *  jadi `fitBounds(layer.getBounds())` akan menarik peta keluar sampai
 *  Indonesia mengecil. */
const INDONESIA_BOUNDS: Leaflet.LatLngBoundsLiteral = [
  [-11.2, 94.7],
  [6.3, 141.2],
];

/** Sengaja lebih longgar dari INDONESIA_BOUNDS -- peta masih bisa digeser
 *  sedikit keluar bingkai (terasa hidup, bukan terkunci) tapi tidak bisa
 *  dibawa ke belahan bumi lain sampai tersesat. */
const PAN_LIMIT: Leaflet.LatLngBoundsLiteral = [
  [-15, 90],
  [10, 146],
];

/**
 * Menyusun isi tooltip sebagai ELEMEN, bukan string HTML.
 *
 * `bindTooltip` menyisipkan string apa pun sebagai HTML, dan `name` datang dari
 * berkas data. Membangun node dan memakai `textContent` membuat pertanyaan
 * "apakah nama kawasan perlu di-escape" tidak pernah perlu dijawab -- termasuk
 * saat berkas datanya nanti diperbarui oleh orang lain.
 */
function mpaTooltip({ name, wpp, ha }: MpaProperties, intervention: boolean): HTMLElement {
  const root = document.createElement('div');

  const title = document.createElement('span');
  title.className = 'map-tooltip-name';
  title.textContent = name;
  root.append(title);

  // Warna poligon saja tidak cukup untuk membedakan kawasan intervensi (WCAG
  // 1.4.1): keterangannya harus ada dalam teks juga, dan tooltip adalah satu-
  // satunya tempat tiap poligon bisa memperkenalkan dirinya sendiri.
  if (intervention) {
    const badge = document.createElement('span');
    badge.className = 'map-tooltip-badge';
    badge.textContent = 'Kawasan intervensi';
    root.append(badge);
  }

  // Luas diformat id-ID (856.649 ha) menyusul ariaLabel komponen yang juga
  // berbahasa Indonesia. Kalau nanti tooltip ini harus ikut locale halaman,
  // locale-nya diteruskan sebagai prop -- jangan dibaca dari navigator, itu
  // membuat dua pengunjung di halaman /en melihat format berbeda.
  const facts = [wpp, ha === null ? null : `${Math.round(ha).toLocaleString('id-ID')} ha`]
    .filter(Boolean)
    .join(' · ');

  if (facts) {
    const meta = document.createElement('span');
    meta.className = 'map-tooltip-meta';
    meta.textContent = facts;
    root.append(meta);
  }

  return root;
}

/**
 * Isi ikon penanda desa: NAMA desa yang tersembunyi secara visual.
 *
 * Bentuk bulatnya digambar CSS (lihat .map-village-marker), jadi elemen ini
 * tidak menyumbang apa pun ke tampilan -- ia ada supaya penanda punya nama yang
 * terbaca. Leaflet memberi ikon penanda `role="button"` dan `tabindex="0"`
 * (opsi `keyboard`, menyala secara bawaan), dan tombol tanpa teks tidak punya
 * nama aksesibel sama sekali: pembaca layar cuma mengumumkan "tombol" sepuluh
 * kali.
 *
 * `textContent`, bukan string HTML, dengan alasan yang sama seperti mpaTooltip.
 */
function markerLabel(label: string): HTMLElement {
  const name = document.createElement('span');
  name.className = 'map-marker-name';
  name.textContent = label;
  return name;
}

/** Apakah satu kawasan termasuk yang diintervensi. Dipakai dua kali per feature
 *  (warna dan tooltip), jadi ia satu fungsi -- bukan dua tempat yang bisa
 *  menjawab berbeda. */
function isIntervention(ids: Set<string> | null, { idMpa }: MpaProperties): boolean {
  return ids !== null && idMpa !== null && ids.has(idMpa);
}

/** Isi gelembung gerombol: jumlah penanda di dalamnya. */
function clusterLabel(count: number): HTMLElement {
  const root = document.createElement('span');
  root.className = 'map-cluster-count';
  root.textContent = String(count);
  return root;
}

/**
 * Memuat plugin gerombol dan melaporkan apakah ia benar-benar terpasang.
 *
 * Plugin ini UMD lawas: pembungkusnya cuma menerima `exports`, lalu isinya
 * menulis ke `L` GLOBAL (`L.MarkerClusterGroup = L.FeatureGroup.extend(...)` di
 * dist-nya). Tanpa `window.L` yang sudah terisi, modulnya melempar
 * ReferenceError saat dievaluasi -- bukan sekadar gagal menambah metode.
 *
 * Nilai baliknya diperiksa, bukan diasumsikan: yang dititipkan ke window harus
 * objek L yang SAMA dengan yang dipakai komponen ini, dan itu bergantung pada
 * cara bundler membungkus modul CJS milik Leaflet. Kalau suatu saat pembungkus
 * itu berubah, gejalanya harus "penanda tampil tanpa digerombolkan", bukan
 * "seluruh desa hilang dari peta tanpa error".
 */
async function loadMarkerCluster(L: typeof Leaflet): Promise<boolean> {
  (window as unknown as { L?: typeof Leaflet }).L = L;
  await import('leaflet.markercluster');
  return typeof L.markerClusterGroup === 'function';
}

/**
 * Peta Indonesia interaktif berbasis Leaflet, pengganti peta statis (PNG).
 *
 * TIDAK ada basemap pihak ketiga: bentuk daratan digambar dari GeoJSON Natural
 * Earth dan diwarnai penuh dari token merek. Leaflet berbasis raster tile dan
 * tak punya style JSON seperti MapLibre, jadi ini satu-satunya cara warnanya
 * bisa mengikuti sistem desain, bukan mengikuti palet penyedia tile. Efek
 * sampingnya juga diinginkan: nol request ke CDN luar, nol API key, nol kuota.
 *
 * Leaflet menyentuh `document` saat modulnya dievaluasi, jadi ia TIDAK boleh
 * diimpor di puncak file: komponen client tetap diprerender di server, dan
 * import statis akan meledak di sana. `import type` di atas aman karena
 * dihapus saat kompilasi; runtime-nya masuk lewat `import()` di dalam effect.
 * Itu juga alasan komponen ini tidak memakai react-leaflet -- pustaka itu
 * menarik Leaflet secara statis dan butuh pembungkus `ssr: false` tersendiri.
 */
export function IndonesiaMap({
  theme = 'brand',
  className = 'h-[380px] md:h-[520px] lg:h-[620px]',
  ariaLabel = 'Peta interaktif wilayah kerja di Indonesia',
  focus = null,
  shape = null,
  basemap = null,
  mpaNames = null,
  interventionMpaIds = null,
  markers = null,
  maxZoom = DEFAULT_MAX_ZOOM,
  onMarkerSelect,
}: {
  /** Palet peta. Warnanya didefinisikan di IndonesiaMap.css, bukan di sini --
   *  lihat komentar di berkas itu soal presentation attribute. */
  theme?: MapTheme;
  /** Kelas tinggi kontainer. Leaflet butuh tinggi nyata saat inisialisasi --
   *  kontainer setinggi 0 menghasilkan peta kosong tanpa error. */
  className?: string;
  ariaLabel?: string;
  /** Titik yang disorot. Peta bergerak setiap kali NILAI ini berganti, jadi
   *  pemanggil sebaiknya menyusunnya di useMemo -- objek literal baru di tiap
   *  render akan membuat peta terbang ulang ke tempat yang sama terus. */
  focus?: MapFocus | null;
  /** Batas wilayah yang digambar dan dijadikan bingkai. `null` (bawaan) =
   *  tidak ada poligon.
   *
   *  Berdampingan dengan `focus`, bukan menggantikannya: keduanya datang pada
   *  waktu berbeda di Our Impact -- titiknya sudah ada di klien begitu desa
   *  dipilih, batasnya menyusul setelah permintaan detail selesai. Sama seperti
   *  `focus`, peta bergerak tiap kali IDENTITAS nilai ini berganti, jadi
   *  susunlah di useMemo. */
  shape?: MapShape | null;
  /** Basemap raster yang menyala di ATAS ketiadaan basemap, bukan menggantinya
   *  sebagian. `null` (bawaan) = peta tanpa raster sama sekali, seperti semula.
   *
   *  Saat menyala, daratan Natural Earth ikut disembunyikan (aturan
   *  `[data-basemap]` di IndonesiaMap.css): garis pantai 1:10 juta yang
   *  digambar DI ATAS citra beresolusi meter bukan cuma mubazir, ia menutupi
   *  yang akurat dengan yang kasar. Kawasan konservasi tetap digambar --
   *  justru itu yang jadi masuk akal begitu ada citra di bawahnya.
   *
   *  Ubinnya baru diminta saat nilai ini berubah dari null, jadi kunjungan
   *  yang tidak memilih desa tidak menghubungi pihak ketiga sama sekali. */
  basemap?: BasemapId | null;
  /** Daftar putih kawasan konservasi, berisi `nama_kk` persis seperti di data
   *  sumber (lihat src/data/frci-conservation-areas.ts). `null` -- bawaannya --
   *  berarti gambar semuanya.
   *
   *  DIBACA SEKALI saat peta dibuat, sama seperti opsi Leaflet lain di effect
   *  itu: ini konfigurasi per halaman, bukan filter yang bisa diubah pengunjung.
   *  Mengubah nilainya setelah peta jadi tidak menggambar ulang lapisan. */
  mpaNames?: readonly string[] | null;
  /** `id_mpa` kawasan yang digambar dengan warna BERBEDA -- kawasan tempat
   *  program benar-benar bekerja, bukan sekadar kawasan konservasi yang ada di
   *  peta. Daftarnya datang dari CMS (`/ext/coast/kawasan-konservasi`).
   *
   *  Ini PENANDA, bukan penyaring: kawasan di luar daftar tetap digambar
   *  seperti biasa. Justru itu gunanya -- yang diintervensi hanya terbaca
   *  sebagai "diintervensi" kalau yang tidak ikut terlihat di sebelahnya.
   *
   *  Dicocokkan lewat `id_mpa`, bukan nama: nama kawasan di CMS diketik ulang
   *  dengan huruf besar-kecil bebas dan sesekali salah eja, jadi pencocokan
   *  nama akan gagal diam-diam pada kawasan yang justru ingin ditonjolkan.
   *
   *  DIBACA SEKALI saat peta dibuat, sama seperti `mpaNames`. */
  interventionMpaIds?: readonly string[] | null;
  /** Penanda yang tampil sejak awal, digerombolkan otomatis. `null` -- bawaannya
   *  -- berarti peta tanpa penanda sama sekali; halaman yang tidak memakainya
   *  juga tidak ikut mengunduh plugin gerombolnya.
   *
   *  DIBACA SEKALI saat peta dibuat, sama seperti `mpaNames`: ini isi peta per
   *  halaman, bukan daftar yang berubah karena interaksi. Susun di scope modul
   *  atau useMemo. */
  markers?: readonly MapMarker[] | null;
  /** Batas zoom terdalam. DIBACA SEKALI saat peta dibuat, seperti `mpaNames`.
   *
   *  Bawaannya 9 karena tanpa `shape` satu-satunya yang bisa diperbesar adalah
   *  garis pantai Natural Earth 10m, yang digeneralisasi sampai ~1 km -- zoom
   *  lebih dalam cuma memperbesar penyederhanaannya. Halaman yang MENGGAMBAR
   *  batas wilayah punya alasan untuk menaikkannya: poligon desa itu presisi,
   *  dan pada zoom 9 satu desa cuma selebar beberapa piksel. */
  maxZoom?: number;
  /** Dipanggil dengan `id` penanda yang diklik. Pemanggil yang memutuskan
   *  artinya -- di Our Impact ia menyetel desa terpilih, jadi klik pada peta
   *  bermuara ke alur yang sama persis dengan memilih lewat dropdown.
   *
   *  Boleh berganti identitas tiap render: ia dibaca lewat ref, bukan ditangkap
   *  closure, supaya peta tidak perlu dibangun ulang. */
  onMarkerSelect?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Instance Leaflet dibuat di dalam effect yang ASINKRON (modulnya di-import
  // dinamis), jadi effect sorot di bawah tidak bisa sekadar membacanya dari
  // closure -- ia butuh ref + satu penanda "peta sudah jadi" untuk dijalankan
  // ulang setelah peta siap.
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const markerRef = useRef<Leaflet.CircleMarker | null>(null);
  const shapeRef = useRef<Leaflet.Polygon | null>(null);
  const basemapRef = useRef<Leaflet.TileLayer | null>(null);
  /** Apakah atribusi Natural Earth sedang DILEPAS. Dilacak, bukan dihitung
   *  ulang, karena AttributionControl menyimpan pencacah per teks: memanggil
   *  addAttribution dua kali lalu removeAttribution sekali menyisakan
   *  atribusinya tetap tampil. */
  const neHiddenRef = useRef(false);
  const hadFocusRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  // Handler klik penanda disimpan di ref, bukan dibaca dari closure effect
  // inisialisasi: pemanggil biasanya mengoper fungsi baru tiap render (mis.
  // `setVillageId` yang dibungkus), dan menaruhnya di dependensi berarti peta
  // dibangun ulang -- 1 MB GeoJSON diunduh dan digambar ulang -- setiap kali
  // induknya me-render.
  const onMarkerSelectRef = useRef(onMarkerSelect);
  useEffect(() => {
    onMarkerSelectRef.current = onMarkerSelect;
  }, [onMarkerSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: Leaflet.Map | undefined;
    let observer: ResizeObserver | undefined;
    const abort = new AbortController();

    /** Peta yang gagal memuat bentuknya tetap menampilkan warna lautnya (itu
     *  latar CSS kontainer, bukan hasil render Leaflet), jadi kegagalan di sini
     *  tidak boleh melempar dan merobohkan halaman. Kedua lapisan juga gagal
     *  secara MANDIRI: kawasan konservasi yang tidak termuat menyisakan peta
     *  daratan yang utuh, bukan section kosong. */
    const fetchLayer = async <P,>(
      url: string,
    ): Promise<FeatureCollection<MultiPolygon, P> | null> => {
      try {
        const res = await fetch(url, { signal: abort.signal });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    };

    // Leaflet dan data batas wilayah tidak saling bergantung, jadi keduanya
    // diminta berbarengan: total tunggu jadi sebesar yang paling lambat, bukan
    // jumlah keduanya.
    void Promise.all([
      import('leaflet'),
      fetchLayer<RegionProperties>(REGION_URL),
      fetchLayer<MpaProperties>(MPA_URL),
    ]).then(async ([leafletModule, region, mpa]) => {
      // Effect di React strict mode dijalankan dua kali; tanpa penjaga ini
      // instance kedua menabrak "Map container is already initialized".
      if (cancelled) return;

      // Leaflet hanya mengapalkan CJS (package.json-nya cuma punya `main`),
      // jadi `import()` mengembalikan pembungkus namespace dan objek L yang
      // sesungguhnya ada di `.default`. Yang dipakai HARUS objek itu, bukan
      // pembungkusnya: plugin gerombol menambahkan properti ke L, dan namespace
      // modul tidak bisa ditambahi. `??` menjaga kalau bundler suatu saat
      // menyerahkan L-nya langsung.
      const L = ((leafletModule as { default?: typeof Leaflet }).default ??
        leafletModule) as typeof Leaflet;

      // Plugin gerombol hanya diunduh oleh halaman yang benar-benar memasang
      // penanda: peta kawasan konservasi tidak ikut membayar 33 KB itu.
      const clustered = markers && markers.length > 0 ? await loadMarkerCluster(L) : false;
      if (cancelled) return;

      map = L.map(container, {
        attributionControl: true,
        maxBounds: PAN_LIMIT,
        maxBoundsViscosity: 0.8,
        minZoom: 4,
        // Lihat komentar prop `maxZoom`: bawaannya 9 karena garis pantai
        // Natural Earth 10m tidak punya detail lebih dari itu, dan halaman yang
        // menggambar batas wilayah presisi yang menaikkannya.
        maxZoom,
        // Peta selebar viewport yang menelan scroll roda tetikus membuat
        // halaman tidak bisa dilewati. Zoom tetap tersedia via tombol +/-,
        // dobel-klik, dan pinch di layar sentuh.
        scrollWheelZoom: false,
        // Panning menyala di SEMUA perangkat, termasuk ponsel.
        //
        // Sebelumnya `!L.Browser.mobile`, dengan alasan drag satu jari merampas
        // scroll vertikal halaman. Alasan itu benar, tapi harganya ternyata
        // lebih mahal: di ponsel peta jadi tidak bisa digeser sama sekali, dan
        // justru DI SITU ia paling perlu digeser -- layar 390px cuma memuat
        // Indonesia seutuhnya pada zoom paling jauh, jadi begitu pengunjung
        // memperbesar untuk melihat satu kawasan, ia terkunci di sana.
        //
        // Yang menahan efek sampingnya: peta tidak pernah setinggi layar di
        // ponsel (380px dari ~844px, lihat className bawaan komponen), jadi
        // selalu ada area halaman di atas/bawahnya untuk memulai gulir. Kalau
        // suatu saat peta dibuat setinggi layar penuh di ponsel, pola dua jari
        // (satu jari menggulir halaman, dua jari menggeser peta) harus dipasang
        // -- BUKAN mematikan panning lagi.
        dragging: true,
        // Posisi bawaan tombol zoom adalah kiri-atas -- tepat di bawah panel
        // navigasi yang mengambang di sudut itu, jadi tombolnya tak terlihat
        // dan tak bisa diklik. Ia dipasang ulang di kanan-atas di bawah ini.
        zoomControl: false,
        // preferCanvas SENGAJA dibiarkan mati. Opsi `className` di bawah hanya
        // didukung SVG renderer -- canvas renderer mengabaikannya, dan seluruh
        // pewarnaan berbasis token ikut hilang tanpa error. Perf-nya bukan
        // masalah: L.geoJSON membuat satu <path> per feature, jadi 264 pulau
        // Indonesia jadi SATU path bersubpath, total ~16 elemen untuk peta ini.
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      map.fitBounds(INDONESIA_BOUNDS);

      map.attributionControl.addAttribution(NE_ATTRIBUTION);

      if (region) {
        L.geoJSON<RegionProperties>(region, {
          // Bentuknya dekoratif: tanpa ini Leaflet memasang penanganan pointer
          // dan kelas leaflet-interactive di tiap path tanpa ada yang memakainya.
          interactive: false,
          // Yang ditentukan di sini HANYA kelasnya. Warna sengaja tidak disebut:
          // SVG renderer memasang fill/stroke sebagai presentation attribute,
          // di mana `var(--token)` tidak resolve -- jadi warna diambil alih
          // aturan CSS di IndonesiaMap.css, yang mengalahkan atribut itu.
          style: (feature) => ({
            className: feature?.properties.subject ? 'map-land' : 'map-context',
          }),
        }).addTo(map);
      }

      // Set, bukan Array.includes: penyaringnya dipanggil sekali per feature,
      // jadi daftar sepanjang 24 nama berarti ~13.000 perbandingan string
      // sepanjang 100 karakter tepat di jalur render pertama peta.
      const allowedMpa = mpaNames ? new Set(mpaNames) : null;
      const interventionMpa = interventionMpaIds ? new Set(interventionMpaIds) : null;

      // Nama yang tidak cocok GAGAL DIAM-DIAM -- kawasannya sekadar tidak
      // tergambar, dan tidak ada yang tahu sampai seseorang menghitung poligon
      // di layar. Ejaan resmi KKP ikut berubah setiap kali data sumber
      // diperbarui, jadi ketidakcocokan itu perkara waktu, bukan perkara typo
      // saat menulis daftarnya.
      if (process.env.NODE_ENV !== 'production' && allowedMpa && mpa) {
        const available = new Set(mpa.features.map((feature) => feature.properties.name));
        const missing = [...allowedMpa].filter((name) => !available.has(name));
        if (missing.length > 0) {
          console.warn(
            `IndonesiaMap: ${missing.length} nama di mpaNames tidak ada di ${MPA_URL} ` +
              'dan tidak tergambar. Salin ulang nama_kk dari data sumber:\n' +
              missing.map((name) => `  - ${name}`).join('\n'),
          );
        }
      }

      // Ditambahkan SETELAH daratan: pane overlay Leaflet menggambar mengikuti
      // urutan penambahan, dan kawasan konservasi harus berada di atas daratan
      // -- sebagian besar kawasan menempel pantai, jadi kalau tertimbun
      // daratan separuhnya hilang.
      // Sama seperti mpaNames di atas, tapi kegagalannya lebih halus: kawasan
      // yang id-nya tidak ketemu tetap TERGAMBAR, cuma dengan warna kawasan
      // biasa -- jadi tidak ada yang terlihat hilang, yang hilang cuma
      // penandanya. Gejala itu tidak akan pernah dilaporkan siapa pun.
      if (process.env.NODE_ENV !== 'production' && interventionMpa && mpa) {
        const available = new Set(
          mpa.features
            .map((feature) => feature.properties.idMpa)
            .filter((id): id is string => id !== null),
        );
        const missing = [...interventionMpa].filter((id) => !available.has(id));
        if (missing.length > 0) {
          console.warn(
            `IndonesiaMap: ${missing.length} id_mpa dari CMS tidak ada di ${MPA_URL} ` +
              'dan kawasannya tidak ditandai sebagai kawasan intervensi: ' +
              `${missing.join(', ')}. Berkas geo dibangun dari data KKP yang ` +
              'di-commit (npm run geo) -- kawasan yang baru ditetapkan bisa saja ' +
              'belum ada di sana.',
          );
        }
      }

      if (mpa) {
        L.geoJSON<MpaProperties>(mpa, {
          // Menyaring di sini, bukan di build step: berkas yang sama dipakai
          // halaman lain yang memang butuh seluruh 554 kawasan, dan daftar
          // putihnya jadi bisa direvisi dengan mengedit satu berkas TypeScript
          // -- tanpa menjalankan ulang `npm run geo` dan meng-commit artefak
          // kedua. Yang dibayar: berkasnya tetap terunduh utuh.
          filter: allowedMpa ? (feature) => allowedMpa.has(feature.properties.name) : undefined,
          // Dua kelas, bukan satu kelas yang diganti: .map-mpa tetap memegang
          // ketebalan garis dan opasitas, dan .map-mpa-intervention hanya
          // menimpa warnanya (lihat IndonesiaMap.css).
          style: (feature) => ({
            className:
              feature && isIntervention(interventionMpa, feature.properties)
                ? 'map-mpa map-mpa-intervention'
                : 'map-mpa',
          }),
          onEachFeature: (feature, layer) => {
            layer.bindTooltip(mpaTooltip(feature.properties, isIntervention(interventionMpa, feature.properties)), {
              // Tanpa sticky, tooltip muncul di centroid poligon -- untuk
              // kawasan seluas 856.000 ha itu bisa jauh dari kursor, bahkan di
              // luar layar.
              sticky: true,
              direction: 'top',
              className: 'map-tooltip',
            });
          },
        }).addTo(map);
      }

      // Penanda desa. Selalu tampil sejak awal -- itu yang membuat peta ini
      // bercerita "FRCI bekerja di sini" tanpa pengunjung harus menebak-nebak
      // lewat dropdown lebih dulu.
      if (markers && markers.length > 0) {
        if (process.env.NODE_ENV !== 'production' && !clustered) {
          console.warn(
            'IndonesiaMap: leaflet.markercluster tidak terpasang pada instance ' +
              'Leaflet yang dipakai komponen ini. Penanda tetap digambar, tapi ' +
              'tanpa digerombolkan -- periksa interop CJS bundler-nya.',
          );
        }

        // maxClusterRadius dalam piksel layar, bukan derajat: yang menentukan
        // "dua penanda bertabrakan" adalah jaraknya di layar pada zoom saat itu.
        // 48 px kira-kira tiga kali diameter penanda, jadi gerombol terbentuk
        // tepat sebelum bulatannya saling menindih.
        const group = clustered
          ? L.markerClusterGroup({
              maxClusterRadius: 48,
              // Poligon jangkauan bawaan plugin digambar dengan warna stok
              // Leaflet (#3388ff) yang tidak ada di palet mana pun.
              showCoverageOnHover: false,
              iconCreateFunction: (cluster) =>
                L.divIcon({
                  className: 'map-cluster',
                  html: clusterLabel(cluster.getChildCount()),
                  iconSize: [34, 34],
                  iconAnchor: [17, 17],
                }),
            })
          : L.layerGroup();

        for (const marker of markers) {
          L.marker([marker.lat, marker.lng], {
            icon: L.divIcon({
              className: 'map-village-marker',
              html: markerLabel(marker.label),
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            }),
          })
            .bindTooltip(marker.label, { direction: 'top', className: 'map-tooltip' })
            // Penanda TIDAK menyimpan apa pun selain id-nya: pemanggil yang
            // memutuskan arti klik, dan di Our Impact artinya sama persis
            // dengan memilih desa lewat dropdown -- satu alur, bukan dua.
            .on('click', () => onMarkerSelectRef.current?.(marker.id))
            .addTo(group);
        }

        group.addTo(map);
      }

      // Kontainer bisa berubah lebar setelah peta jadi (font selesai dimuat,
      // panel navigasi buka/tutup, layar diputar). Tanpa invalidateSize,
      // Leaflet menahan ukuran lama dan menggambar di area yang salah.
      observer = new ResizeObserver(() => map?.invalidateSize());
      observer.observe(container);

      mapRef.current = map;
      leafletRef.current = L;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      abort.abort();
      observer?.disconnect();
      map?.remove();

      // Penanda dilepas bersama petanya, jadi ref-nya harus ikut dikosongkan --
      // kalau tidak, effect sorot berikutnya memanggil .remove() pada layer
      // milik peta yang sudah tidak ada.
      markerRef.current = null;
      shapeRef.current = null;
      basemapRef.current = null;
      neHiddenRef.current = false;
      mapRef.current = null;
      leafletRef.current = null;
      setMapReady(false);
    };
  }, []);

  /**
   * Menekan cincin fokus peta ketika fokusnya datang dari klik, bukan keyboard.
   *
   * Leaflet memberi kontainer `tabindex="0"` supaya peta bisa digeser pakai
   * panah, dan mengklik lapisan mana pun memindahkan fokus ke kontainer itu.
   * Chrome tetap menganggap fokus [tabindex] hasil klik cocok dengan
   * :focus-visible, jadi cincin setebal 2px muncul mengelilingi SELURUH peta
   * hanya karena satu kawasan kecil di dalamnya diklik.
   *
   * Leaflet punya penambalnya sendiri (`preventOutline`: memasang
   * `outline-style: none` inline saat mousedown), tapi ia menyusuri parentNode
   * sampai menemukan `tabIndex !== -1` -- di browser yang tidak memberi
   * SVGElement properti tabIndex, penyusuran itu berhenti di <path> yang
   * diklik, atribut inline-nya mendarat di sana, dan cincin kontainernya tetap
   * tergambar. Jadi modalitas masukan dilacak sendiri di sini, bukan
   * dititipkan ke penambal itu.
   *
   * Fokusnya sengaja TIDAK di-blur: kontainer harus tetap memegang fokus
   * supaya panah keyboard tetap menggeser peta sesudah diklik. Yang dimatikan
   * hanya cincin visualnya -- lihat aturan [data-pointer-focus] di
   * IndonesiaMap.css.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const abort = new AbortController();
    const { signal } = abort;

    // capture: klik mendarat di <path> milik Leaflet, jadi penandanya harus
    // dipasang saat peristiwa turun ke kontainer -- sebelum Leaflet sempat
    // menghentikan perambatannya di lapisan.
    container.addEventListener(
      'pointerdown',
      () => {
        container.dataset.pointerFocus = 'true';
      },
      { capture: true, signal },
    );

    // Tombol keyboard pertama berarti pengunjung berpindah ke navigasi
    // keyboard: cincinnya harus kembali SEBELUM ia menggeser peta pakai panah,
    // bukan sesudahnya.
    container.addEventListener(
      'keydown',
      () => {
        delete container.dataset.pointerFocus;
      },
      { signal },
    );

    // Tanpa ini, fokus berikutnya yang datang lewat Tab mewarisi penanda dari
    // klik terakhir dan muncul tanpa cincin sama sekali.
    container.addEventListener(
      'blur',
      () => {
        delete container.dataset.pointerFocus;
      },
      { signal },
    );

    return () => abort.abort();
  }, []);

  /**
   * Menggerakkan peta ke `focus`. Dipisah dari effect inisialisasi supaya
   * pergantian pilihan TIDAK membangun ulang peta: rebuild berarti mengunduh
   * dan menggambar ulang 1 MB GeoJSON setiap kali orang memilih desa lain.
   */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    markerRef.current?.remove();
    markerRef.current = null;

    // Animasi zoom-pan Leaflet adalah gerak besar yang dipicu perubahan
    // kontrol -- persis yang dimaksud WCAG 2.3.3. Pengguna yang meminta
    // gerakan minimal tetap sampai ke tujuannya, hanya tanpa perjalanannya.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!focus) {
      // Hanya saat SEBELUMNYA ada pilihan. Tanpa penjaga ini, render pertama
      // (focus masih null) akan memanggil fitBounds kedua kalinya di atas
      // bingkai yang baru saja dipasang effect inisialisasi.
      if (hadFocusRef.current) map.flyToBounds(INDONESIA_BOUNDS, { animate: !still });
      hadFocusRef.current = false;
      return;
    }

    hadFocusRef.current = true;

    const target: Leaflet.LatLngExpression = [focus.lat, focus.lng];
    const zoom = Math.min(focus.zoom ?? FOCUS_ZOOM, map.getMaxZoom());

    if (still) map.setView(target, zoom, { animate: false });
    else map.flyTo(target, zoom, { duration: 1.1 });

    markerRef.current = L.circleMarker(target, {
      radius: 7,
      // Sama seperti lapisan lain: kelas saja, warnanya urusan
      // IndonesiaMap.css. Tidak interaktif karena namanya sudah dipasang
      // sebagai tooltip permanen -- tidak ada yang perlu di-hover.
      className: 'map-focus-pin',
      interactive: false,
    })
      .bindTooltip(focus.label, {
        permanent: true,
        direction: 'top',
        offset: [0, -9],
        className: 'map-tooltip map-tooltip-focus',
      })
      .addTo(map);
  }, [focus, mapReady]);

  /**
   * Menggambar `shape` dan membingkai peta ke batasnya.
   *
   * Effect TERSENDIRI, bukan disatukan dengan effect `focus` di atas, karena
   * keduanya berubah pada waktu yang berbeda: di Our Impact titik fokus sudah
   * diketahui begitu desa dipilih (datanya ada di daftar yang sudah di klien),
   * sedangkan batas wilayahnya baru tiba setelah permintaan detail selesai.
   * Menyatukan keduanya berarti effect fokus ikut berjalan ulang -- dan peta
   * terbang ulang -- setiap kali detail mendarat.
   *
   * Urutannya memang dua gerakan untuk satu pilihan: effect fokus lebih dulu
   * membawa peta ke desanya pada zoom 8, lalu effect ini mengetatkan bingkai ke
   * batas wilayahnya begitu batas itu tiba. Itu disengaja -- gerakan pertama
   * memberi konteks "di pesisir mana", gerakan kedua memperlihatkan desanya.
   * Untuk desa yang detailnya sudah di-cache, keduanya terjadi dalam satu
   * render dan hanya gerakan kedua yang terlihat.
   */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    shapeRef.current?.remove();
    shapeRef.current = null;

    if (!shape || shape.length === 0) return;

    const layer = L.polygon(shape, {
      // Sama seperti lapisan lain: kelas saja, warnanya urusan
      // IndonesiaMap.css. Tidak interaktif supaya ia tidak mencuri hover
      // tooltip kawasan konservasi di bawahnya -- poligon ini penanda lokasi,
      // bukan sesuatu yang perlu ditanyai.
      className: 'map-village-shape',
      interactive: false,
    }).addTo(map);
    shapeRef.current = layer;

    const bounds = layer.getBounds();
    // Poligon yang seluruh titiknya terbuang (lihat mapRing) menyisakan bounds
    // tak sah; fitBounds atasnya melempar dan merobohkan render.
    if (!bounds.isValid()) return;

    // Alasan yang sama dengan effect fokus: gerak besar yang dipicu perubahan
    // kontrol adalah WCAG 2.3.3.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Padding supaya batas desa tidak menempel persis di tepi kanvas -- dan
    // supaya desa yang sangat kecil tidak diperbesar sampai menyentuh maxZoom,
    // yang membuat garis pantai di sekitarnya terlihat kasar.
    const padding: [number, number] = [32, 32];

    if (still) map.fitBounds(bounds, { padding, animate: false });
    else map.flyToBounds(bounds, { padding, duration: 1.1 });
  }, [shape, mapReady]);

  /**
   * Menyalakan/mematikan basemap raster.
   *
   * Ubinnya mendarat di `tilePane` (z-index 200) sementara seluruh GeoJSON ada
   * di `overlayPane` (z-index 400), jadi urutan tumpukannya sudah benar tanpa
   * diatur: batas desa dan kawasan konservasi otomatis di atas citra.
   *
   * Yang TIDAK otomatis dan diurus di sini ada tiga: daratan Natural Earth
   * harus disembunyikan (lewat data-basemap, aturannya di IndonesiaMap.css),
   * atribusinya harus ikut dilepas karena bentuknya tidak lagi digambar, dan
   * batas zoom harus dinaikkan -- percuma memasang citra beresolusi meter
   * kalau petanya berhenti di zoom 13.
   */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const container = containerRef.current;
    if (!L || !map || !container) return;

    basemapRef.current?.remove();
    basemapRef.current = null;

    if (!basemap) {
      delete container.dataset.basemap;
      if (neHiddenRef.current) {
        map.attributionControl.addAttribution(NE_ATTRIBUTION);
        neHiddenRef.current = false;
      }
      // Leaflet menjepit sendiri zoom yang sedang berlaku kalau ia melebihi
      // batas baru, jadi tidak perlu setView manual di sini.
      map.setMaxZoom(maxZoom);
      return;
    }

    const preset = BASEMAPS[basemap];
    basemapRef.current = L.tileLayer(preset.url, {
      attribution: preset.attribution,
      maxZoom: preset.maxZoom,
    }).addTo(map);

    // Nilainya id basemap, bukan sekadar 'on': gaya batas desa berbeda di atas
    // citra satelit (garis putih) dan di atas peta dasar terang (garis navy).
    container.dataset.basemap = basemap;

    if (!neHiddenRef.current) {
      map.attributionControl.removeAttribution(NE_ATTRIBUTION);
      neHiddenRef.current = true;
    }
    map.setMaxZoom(preset.maxZoom);
  }, [basemap, maxZoom, mapReady]);

  return (
    // `isolate` bukan hiasan: pane Leaflet ber-z-index 200-700 dan
    // `.leaflet-container` hanya `position: relative` tanpa z-index, jadi pane
    // itu ikut diperbandingkan di stacking context akar -- artinya isi peta
    // menutupi panel navigasi (fixed, z-40). `isolation: isolate` membuat
    // stacking context di sini sehingga seluruh z-index Leaflet tetap di dalam.
    //
    // Warna latar TIDAK dipasang di sini: `data-map-theme` yang memilih palet,
    // dan IndonesiaMap.css yang memasang lautnya sebagai background kontainer.
    <div
      ref={containerRef}
      data-map-theme={theme}
      role="region"
      aria-label={ariaLabel}
      className={`isolate w-full ${className}`}
    />
  );
}
