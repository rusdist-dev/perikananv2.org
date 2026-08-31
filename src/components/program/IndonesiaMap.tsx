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

/** Cukup dekat untuk menunjukkan "di pesisir mana", masih cukup jauh untuk
 *  memperlihatkan pulau tempat desa itu berada. */
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
 *  pasti berbentuk "WPP 712" atau null. */
type MpaProperties = { name: string; wpp: string | null; ha: number | null };

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
function mpaTooltip({ name, wpp, ha }: MpaProperties): HTMLElement {
  const root = document.createElement('div');

  const title = document.createElement('span');
  title.className = 'map-tooltip-name';
  title.textContent = name;
  root.append(title);

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
  mpaNames = null,
  markers = null,
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
  /** Daftar putih kawasan konservasi, berisi `nama_kk` persis seperti di data
   *  sumber (lihat src/data/frci-conservation-areas.ts). `null` -- bawaannya --
   *  berarti gambar semuanya.
   *
   *  DIBACA SEKALI saat peta dibuat, sama seperti opsi Leaflet lain di effect
   *  itu: ini konfigurasi per halaman, bukan filter yang bisa diubah pengunjung.
   *  Mengubah nilainya setelah peta jadi tidak menggambar ulang lapisan. */
  mpaNames?: readonly string[] | null;
  /** Penanda yang tampil sejak awal, digerombolkan otomatis. `null` -- bawaannya
   *  -- berarti peta tanpa penanda sama sekali; halaman yang tidak memakainya
   *  juga tidak ikut mengunduh plugin gerombolnya.
   *
   *  DIBACA SEKALI saat peta dibuat, sama seperti `mpaNames`: ini isi peta per
   *  halaman, bukan daftar yang berubah karena interaksi. Susun di scope modul
   *  atau useMemo. */
  markers?: readonly MapMarker[] | null;
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
        // Tanpa tile tidak ada batas grid, tapi sumber Natural Earth 10m
        // menggeneralisasi garis pantai sampai ~1 km. Zoom lebih dalam dari ini
        // hanya memperbesar penyederhanaan itu, bukan menambah detail.
        maxZoom: 9,
        // Peta selebar viewport yang menelan scroll roda tetikus membuat
        // halaman tidak bisa dilewati. Zoom tetap tersedia via tombol +/-,
        // dobel-klik, dan pinch di layar sentuh.
        scrollWheelZoom: false,
        // Di ponsel, drag satu jari milik Leaflet merampas scroll vertikal
        // halaman sehingga pengunjung terjebak di peta. Panning dimatikan di
        // sana; zoom pinch dan tombol +/- masih jalan.
        dragging: !L.Browser.mobile,
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

      map.attributionControl.addAttribution(
        'Batas wilayah: <a href="https://www.naturalearthdata.com/">Natural Earth</a>',
      );

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
      if (mpa) {
        L.geoJSON<MpaProperties>(mpa, {
          // Menyaring di sini, bukan di build step: berkas yang sama dipakai
          // halaman lain yang memang butuh seluruh 554 kawasan, dan daftar
          // putihnya jadi bisa direvisi dengan mengedit satu berkas TypeScript
          // -- tanpa menjalankan ulang `npm run geo` dan meng-commit artefak
          // kedua. Yang dibayar: berkasnya tetap terunduh utuh.
          filter: allowedMpa ? (feature) => allowedMpa.has(feature.properties.name) : undefined,
          style: () => ({ className: 'map-mpa' }),
          onEachFeature: (feature, layer) => {
            layer.bindTooltip(mpaTooltip(feature.properties), {
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
