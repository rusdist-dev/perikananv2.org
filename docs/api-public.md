# API Publik — cms.rekam.org

API baca-saja untuk website company profile (compro). Tidak ada sesi/login — setiap
permintaan diautentikasi lewat header `X-Api-Key`, yang sekaligus menentukan company
(tenant) mana yang datanya dibaca.

## Autentikasi

```
X-Api-Key: rekam_AbCdEf1234...
```

- Key didapat dari **Pengaturan Situs › API Key** di dashboard CMS (super admin saja),
  ditampilkan **hanya sekali** saat pertama dibuat atau diputar (rotate).
- Key tidak valid, tidak dikirim, atau milik company yang sedang nonaktif → `401`:
  ```json
  { "message": "API key tidak valid atau tidak ditemukan." }
  ```
- Satu key hanya berlaku untuk satu company — tidak ada cara membaca data company lain
  lewat key ini.

## Bahasa (`?lang=`)

Semua field yang bisa diterjemahkan (judul, isi, deskripsi, dst.) dikembalikan sebagai
string tunggal sesuai `?lang=id` (default) atau `?lang=en`. Bila terjemahan Inggris
kosong, otomatis jatuh ke bahasa Indonesia — field tidak pernah kosong begitu saja
selama salah satu bahasa terisi.

```
GET /api/v1/news?lang=en
```

## Amplop respons

**Daftar** (list):
```json
{
  "data": [ ... ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42 }
}
```

**Satu record / data gabungan** (detail, `team`, `programs`, `settings`, dst.):
```json
{ "data": { ... } }
```

## Query parameter yang berlaku umum

| Parameter | Keterangan |
|---|---|
| `lang` | `id` (default) atau `en`. |
| `fields` | Daftar field dipisah koma, mis. `?fields=id,title` — hanya field itu yang dikembalikan per item. |
| `page`, `per_page` | Hanya untuk endpoint daftar. `per_page` dibatasi oleh `cms.max_per_page`. |

## Cache

Respons di-cache per company selama beberapa menit (`Cache-Control`, `ETag` — kirim
`If-None-Match` untuk mendapat `304` bila belum berubah). Permintaan tanpa filter/halaman
(kondisi paling umum) langsung diperbarui begitu konten disimpan di dashboard; kombinasi
filter/halaman lain mengikuti masa berlaku cache tersebut.

## Endpoint

Setiap endpoint di bawah **tidak terdaftar sama sekali** (404, bukan daftar kosong) bila
modulnya nonaktif untuk company tersebut.

### Berita

```
GET /api/v1/news
GET /api/v1/news?program=<slug>
GET /api/v1/news?category=<slug-kategori>
GET /api/v1/news?search=<kata-kunci>
GET /api/v1/news?year=<tahun>
GET /api/v1/news?sort=asc
GET /api/v1/news/{slug}
GET /api/v1/news-categories
```
`{slug}` boleh slug bahasa Indonesia maupun Inggris. Hanya artikel berstatus terbit
(dan sudah melewati jadwal terbitnya) yang muncul.

| Parameter | Keterangan |
|---|---|
| `program` | Slug program (lihat `GET /api/v1/programs`). |
| `category` | Slug kategori, boleh versi ID maupun EN. |
| `search` | Kata kunci; dicocokkan pada **judul, ringkasan, dan isi artikel** di kedua bahasa (cocok sebagian, tidak peka huruf besar/kecil). Kosong atau hanya spasi = filter diabaikan. |
| `year` | Tahun terbit 4 digit, mis. `2024` — menyaring berdasarkan `published_at`. Nilai yang bukan 4 digit angka diabaikan (daftar tetap tampil penuh, bukan error). |
| `sort` | Urutan waktu terbit: `desc` (default, terbaru dulu) atau `asc` (terlama dulu). Nilai lain diperlakukan sebagai `desc`. |

Semua filter di atas boleh digabung, mis.
`GET /api/v1/news?search=mangrove&year=2024&category=lingkungan`.

### Program (khusus tenant dengan modul `news_programs`)

```
GET /api/v1/programs
```
Daftar `{value, label}` — dipakai untuk memfilter `news?program=`.

### Events

```
GET /api/v1/events
GET /api/v1/events?upcoming=1
GET /api/v1/events?category=<slug>
GET /api/v1/events/{slug}
```
Detail event menyertakan `rundowns` bila modul rundown aktif untuk company tersebut;
bila tidak, field `rundowns` tidak ada sama sekali di respons.

### Tim

```
GET /api/v1/team
```
Dikelompokkan per level sesuai urutan yang diatur di Pengaturan › Taksonomi:
```json
{
  "data": [
    { "level": { "value": "director", "label": "Direktur" }, "members": [ ... ] },
    { "level": { "value": "manager", "label": "Manajer" }, "members": [ ... ] }
  ]
}
```

### Publikasi (khusus tenant dengan modul `publications`)

```
GET /api/v1/publications
GET /api/v1/publications?category=<slug>
```

### Partner

```
GET /api/v1/partners
```

### Milestone (khusus tenant dengan modul `milestones`)

```
GET /api/v1/milestones
```

### Unit (khusus tenant dengan modul `units`)

```
GET /api/v1/units
```

### Pengaturan Situs

```
GET /api/v1/settings
```
Gabungan identitas situs, sosial media, SEO bawaan, sematan peta, dan informasi kontak —
sekali panggil untuk header/footer/halaman kontak compro.

### Pendataan pesisir (`ext/`, khusus tenant dengan modul pendataan desa)

Dipakai halaman `/discover/our-impact`. Perhatikan awalan **`ext/`** — endpoint ini
tidak sejajar dengan `/news` dan kawan-kawan.

```
GET /api/v1/ext/coast/desa
GET /api/v1/ext/coast/desa/{desa_kode}
```

Daftar desa yang punya pendataan terverifikasi, beserta titik markernya:

```json
{
  "data": [
    {
      "desa_kode": "33.21.12.2011",
      "desa": "Purworejo",
      "kecamatan_kode": "33.21.12",
      "kecamatan": "Bonang",
      "kabupaten_kode": "33.21",
      "kabupaten_kota": "Kabupaten Demak",
      "provinsi_kode": "33",
      "provinsi": "Jawa Tengah",
      "koordinat": { "lat": -6.8201893594804, "lng": 110.56238796756 },
      "jumlah_form": 5,
      "pendataan_terakhir": "2026-07-19"
    }
  ]
}
```

- **Tidak dipaginasi** dan **tidak ber-`meta`**: peta butuh semua marker sekaligus.
- **Tidak menerima `?lang=`** — isinya nama wilayah administratif.
- `koordinat` bisa `null` bila desa itu belum punya baris di `wilayah_boundaries`.
  Sengaja `null`, bukan `0,0`, karena marker di lepas pantai Afrika terlihat seperti
  data.

Endpoint kedua mengembalikan summary satu desa (`404` bila desa itu tidak punya form
terverifikasi), dengan bentuk bersarang `wilayah` / `peta` / `pendataan` /
`statistik` / `gambar` / `rehabilitasi` / `pelatihan`. Yang perlu diketahui sebelum
memakainya:

- `statistik.metrik[]` membawa `label`, `unit`, dan `decimals` sendiri — daftar
  metriknya ditentukan formulir pendataan di CMS (9 metrik puncak per 19 September
  2026), jadi jangan menyalinnya jadi tabel padanan di frontend.
- `statistik` membandingkan dua tahun: `tahun_baru` vs `tahun_lama`, dengan nilai
  `baru` dan `lama` per metrik.
- **`statistik.metrik[]` berbentuk pohon**, tidak rata: metrik yang punya rincian
  membawa `children[]` berisi metrik dengan bentuk yang sama, dan anaknya bisa
  beranak lagi (`Dampak Ekonomi (Produksi)` → `Perikanan Tangkap` → `Lainnya`,
  tiga tingkat pada data 19 September 2026). Metrik tanpa rincian tidak mengirim
  `children` sama sekali, atau mengirimnya kosong — keduanya berarti baris tunggal.
  Sebelumnya seluruh metrik dikirim rata dengan label panjang
  (`luas_ekosistem_mangrove` berlabel "Luas Ekosistem Mangrove"); dalam bentuk pohon
  labelnya dipendekkan relatif terhadap induknya ("Mangrove").
- `children_sum_to_total` (hanya pada metrik beranak) menyatakan apakah `children[]`
  benar-benar menjumlah ke angka induknya. `false` untuk rincian yang **tumpang
  tindih**: "Total Orang Terlibat" 29 orang dengan rincian 19 pria + 10 wanita + 4
  remaja + 1 lansia, karena seorang remaja juga terhitung pria. Tampilkan
  keterangannya, jangan mencoba merekonsiliasi angkanya.
- `gambar[].url` menunjuk host **lain** (`ourimpact.ikan-frci.id`), bukan host CMS —
  termasuk saat CMS-nya dijalankan lokal. Host itu karena itu terdaftar tetap di
  `next.config.ts`. `gambar[].keterangan` bukan caption pendek, melainkan paragraf
  profil desa.
- `peta.path` **tidak konsisten bentuknya** antar desa: sebagian mengirim array cincin
  (kedalaman 3 — Depok), sebagian array poligon berisi cincin (kedalaman 4 —
  Ujungalang 13 bidang, Kapoposang Bali 7). Frontend menyeragamkannya di
  `mapVillageBoundary()` (`src/lib/content/source.ts`) menjadi selalu kedalaman 4, lalu
  menggambarnya sebagai batas desa di peta. Tingkat cincin **tidak boleh** diratakan:
  Leaflet membaca cincin kedua dan seterusnya dalam satu poligon sebagai lubang, jadi
  desa kepulauan akan berubah jadi lubang menganga. Koordinatnya juga dibulatkan ke 6
  desimal di sana — API mengirim 14-15 desimal, yang sisa perhitungan floating point,
  bukan presisi survei.
- `peta.luas` dan `peta.penduduk` saat ini selalu `null` untuk seluruh desa.

Dua endpoint pendataan pesisir lainnya:

```
GET /api/v1/ext/coast/kawasan-konservasi
GET /api/v1/ext/coast/statistik
```

`kawasan-konservasi` adalah kawasan tempat program benar-benar bekerja — 11 baris per
19 September 2026, bukan 554 kawasan konservasi nasional:

```json
{
  "data": [
    {
      "id": 2,
      "nama_kawasan": "Kawasan Konservasi Pesisir dan Pulau-Pulau Kecil Ujungnegoro-Roban Kabupaten Batang di Provinsi Jawa Tengah",
      "id_mpa": "T244",
      "luas_area_dikonservasi": 4015.2,
      "pelaksana_konservasi": "Cabang Dinas Kelautan Wilayah Barat"
    }
  ]
}
```

- **Tidak dipaginasi**, **tidak ber-`meta`**, **tidak menerima `?lang=`** — sama seperti
  `ext/coast/desa`.
- **Tidak membawa geometri.** Poligonnya tetap datang dari
  `public/geo/conservation-areas.json`, dan `id_mpa` ("T244") yang menjodohkan keduanya —
  properti `idMpa` di berkas geo, dipasang `scripts/build-map-geo.mjs` dari `id_mpa` data
  KKP. Cocokkan lewat **id_mpa**, jangan lewat nama: `nama_kawasan` di sini diketik ulang
  dengan huruf besar-kecil bebas dan sesekali salah eja ("Periaran"), sementara `nama_kk`
  di data KKP kapital semua. Peta Our Impact memakainya untuk mewarnai kawasan intervensi
  berbeda dari kawasan lain.
- `luas_area_dikonservasi` adalah luas menurut pendataan, **bukan** luas SK kawasan
  (`luas_kk_ha` di data KKP). Keduanya memang berbeda.

`statistik` adalah totalan seluruh desa — sumber kartu berjalan di bawah peta Our Impact:

```json
{
  "data": {
    "pendataan": { "jumlah_form": 81, "jumlah_desa": 19, "terakhir": "2026-07-25" },
    "statistik": {
      "tahun_baru": 2026,
      "tahun_lama": 2025,
      "metrik": [
        { "key": "luas_ekosistem_mangrove", "label": "Luas Ekosistem Mangrove",
          "unit": "ha", "decimals": 2, "baru": 6931.84, "lama": 6913.53 }
      ]
    }
  }
}
```

- `data` adalah **objek tunggal**, bukan array.
- `statistik.metrik[]` di sini **rata** (12 metrik, tanpa `children` dan tanpa
  `children_sum_to_total`) — beda dari endpoint per-desa yang berbentuk pohon. Totalan
  lintas desa memang tidak punya rincian per komoditas. Bentuk satu entrinya identik,
  jadi frontend memakai skema metrik yang sama untuk keduanya.
- Metriknya juga **tidak sama persis** dengan daftar per-desa: di sini ada
  `nilai_stok_karbon` bersatuan `Mg C` (per-desa dikirim tanpa satuan) dan tidak ada
  metrik puncak seperti `luas_ekosistem_total`.

### Kontak (`POST`, satu-satunya endpoint tulis)

```
POST /api/v1/contact
Content-Type: application/json

{
  "name": "Nama Pengirim",
  "email": "pengirim@example.com",
  "phone": "081234567890",
  "subject": "Subjek Pesan",
  "message": "Isi pesan.",
  "website": ""
}
```
- `website` adalah honeypot — sembunyikan lewat CSS di form, jangan pernah diisi
  pengunjung asli. Jika terisi, permintaan tetap dibalas `201` (agar bot tidak tahu
  ditangkap) tapi pesan **tidak** benar-benar disimpan.
- Dibatasi laju permintaan lebih ketat dari endpoint baca lainnya — permintaan berlebih
  dibalas `429`.
- `status` dan `ip` selalu ditentukan server, tidak bisa dikirim dari form.

## CORS

Hanya domain compro resmi tiap company (mis. `rekam.org`, `www.rekam.org`) yang
diizinkan memanggil API ini langsung dari browser. Pemanggilan dari server (server-side
rendering, cron, dsb.) tidak terkena batasan CORS.
