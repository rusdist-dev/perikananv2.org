# perikanan

Scaffold Next 16.3 / React 19.2 / Tailwind v4. Sistem desainnya **belum ada** —
`src/app/globals.css` berisi token placeholder bertanda TODO.

```bash
npm install
npm run dev          # http://localhost:3000
```

## Skrip

| Skrip | Kegunaan |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Produksi |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run icons` | Regenerate `src/icons/generated.tsx` dari `src/icons/*.svg` |
| `npm run test:e2e` | Playwright: 1440 dan 390, axe di semua locale |
| `npm run check:links` | Telusuri HTML hasil build; butuh server hidup |

Tidak ada skrip `lint`. ESLint sengaja tidak dipasang — lebih baik tidak ada
linter daripada skrip yang memanggil `next lint` yang sudah deprecated dan
gagal karena tidak ada `eslint.config.*`. Kalau mau linter: pasang
`eslint` + `eslint-config-next`, buat `eslint.config.mjs`, lalu skripnya `eslint .`.

`check:links` butuh server yang sudah jalan:

```bash
npm run build && npm run start -- --port 3100
npm run check:links
```

## Warna merek

Ada di `@theme` dalam [globals.css](src/app/globals.css):

| Token | Nilai | Kontras di atas `bg` |
|---|---|---|
| `--color-primary` | `#224275` | 9.98:1 |
| `--color-secondary` | `#1b77aa` | 4.92:1 |
| `--color-breadcrumb` | `#6e6759` | 5.60:1 |

Ketiganya lolos WCAG AA untuk teks normal, dan putih di atas ketiganya juga
lolos. Dua catatan:

- **`secondary` marginnya tipis.** 4.92:1 di atas putih, 4.52:1 di atas
  `surface` — target AA-nya 4.5. Menggelapkan `--color-bg` sedikit saja, atau
  memakainya di atas permukaan yang lebih terang dari `surface`, akan
  menjatuhkannya di bawah ambang. Ukur ulang sebelum memakainya untuk teks
  kecil di latar non-putih.
- **`secondary` vs `primary` = 2.03:1.** Kalau dua kontrol hanya dibedakan oleh
  kedua warna itu (mis. tombol primer vs sekunder yang bentuknya identik),
  perbedaannya di bawah 3:1 dan tidak akan terbaca oleh sebagian pengguna.
  Beri pembeda kedua: border, bobot huruf, atau ikon.

`--color-focus` memakai `primary` (9.98:1, jauh di atas syarat 3:1 untuk
indikator non-teks).

`breadcrumb` dinamai per komponen, bukan per peran — belum ada komponen
breadcrumb di scaffold ini, tokennya menunggu. Kalau warna itu nanti dipakai di
luar breadcrumb, ganti namanya jadi peran supaya tidak menyesatkan.

## Font

Sementara **Montserrat** lewat `next/font/google`; tujuan akhirnya **Proxima
Nova**.

Proxima Nova berlisensi komersial dan tidak ada di Google Fonts, jadi
`next/font/google` tidak bisa mengambilnya. Montserrat dipakai karena sama-sama
geometric sans — karakternya paling dekat, meski hurufnya lebih lebar sehingga
baris teks akan sedikit memendek saat nanti ditukar.

`'Proxima Nova'` **sengaja tidak ada** di rantai fallback. Kalau ia ada di sana,
pengunjung yang kebetulan memasangnya secara lokal — perancang, tim internal —
melihat situs yang berbeda dari pengunjung lain, dan justru merekalah yang
menilai hasilnya.

Menukarnya setelah file lisensi ada: taruh `.woff2` di `src/fonts/`, ganti
impor di [layout.tsx](src/app/[locale]/layout.tsx) dengan `next/font/local`.
Tidak ada yang lain perlu berubah — `@theme` membaca `--font-app-sans`.

## Yang masih menunggu Anda

1. **Netral di `@theme`** — `bg`, `surface`, `fg`, `muted`, `border` masih
   placeholder abu-abu, belum diselaraskan dengan warna merek. Skala tipografi,
   spacing, dan radius juga masih TODO.
2. **`src/lib/site.ts`** — `description`, dan isi `social` / `contact` /
   `analytics` saat datanya sudah ada. Nilai `null` di sana **disengaja**: UI
   membacanya dan menampilkan "belum dikonfigurasi" alih-alih data karangan.

### Palet ditutup secara sengaja

`@theme` memuat `--color-*: initial`, yang mematikan seluruh palet bawaan
Tailwind. Alasannya: `@theme` **menambah** ke tema default, bukan
menggantinya — tanpa baris itu `bg-yellow-500` tetap merender kuning stok
walau kuning tidak pernah jadi bagian dari sistem desain, dan warna asing lolos
ke produksi tanpa satu pun error.

Konsekuensinya: kelas warna di luar token Anda tidak menghasilkan CSS apa pun.
Itu memang tujuannya. Hapus baris itu kalau Anda ingin palet bawaan tersedia.

**`white` dan `black` dikembalikan.** `--color-*: initial` ikut membuang
keduanya, sehingga `bg-white` / `text-white` / `bg-black` mati diam-diam —
kelasnya tidak menghasilkan CSS dan elemennya sekadar tidak berwarna, tanpa
error. Keduanya kini didefinisikan ulang secara eksplisit di `@theme`. Itu tidak
membuka kembali lubang yang `initial` tutup: `bg-yellow-500` dan seluruh palet
bawaan lain tetap mati.

Untuk permukaan, `bg-bg` dan `bg-surface` lebih tepat daripada `bg-white` —
keduanya ikut berubah saat sistem desain berganti (mis. mode gelap), sementara
`bg-white` selamanya putih.

### `@theme static`, bukan `@theme`

Blok tema ditulis `@theme static`. Tanpa `static`, Tailwind v4 memangkas
variabel yang belum tersentuh utility mana pun — dan itu sudah terjadi di sini:
`--color-secondary` dan `--color-breadcrumb` tidak terbit sama sekali ke CSS
sampai ada komponen yang memakainya. Akibatnya `var(--color-secondary)` di CSS
mentah atau di style inline resolve ke nilai kosong, tanpa error; elemennya
hanya kehilangan warna.

`static` memaksa semua token terbit. Ongkosnya 184 byte pada build ini, dan
palet bawaan Tailwind tetap tidak ikut karena sudah dibuang `--color-*: initial`.

## Arsitektur — yang perlu diketahui sebelum menambah halaman

**Locale.** `id` default tanpa prefiks, `en` berprefiks. `src/proxy.ts`
me-*rewrite* `/berita` → `/id/berita` (address bar tetap `/berita`) dan
me-*redirect 308* `/id/berita` → `/berita`. Matcher-nya berbasis ekstensi
(`/((?!_next/|api/|.*\..*).*)`) — jangan diganti jadi daftar kecualian per
file; versi itu diam-diam me-rewrite `/logo.svg` jadi `/id/logo.svg` lalu 404.

> Berkas ini bernama `proxy.ts`, bukan `middleware.ts`: Next 16.3 men-deprecate
> konvensi `middleware` dan membangun proyek dengannya memunculkan peringatan.
> Perannya identik.

**Link internal.** Selalu lewat `components/ui/AppLink`, dan `href` yang dioper
selalu **tanpa** prefiks locale (`/berita`, bukan `/en/berita`). AppLink membaca
locale dari URL-nya sendiri. Link yang lupa prefiks tetap menjawab 200 sambil
melempar pembaca `/en` ke versi Indonesia — `check:links` yang menangkapnya.

**Konten.** Halaman hanya boleh `import { ... } from '@/lib/content'`. Tidak
pernah dari `src/data/*.json` maupun `lib/content/source` langsung. Rantainya
`source.ts` (bytes) → `schema.ts` (zod) → `index.ts` (kueri). Pindah ke CMS =
set `CONTENT_SOURCE=api` + `CONTENT_API_URL`; webhook memanggil
`revalidateTag('articles')`.

**Ikon.** Taruh `.svg` di `src/icons/`, jalankan `npm run icons`.
`src/icons/generated.tsx` bertanda GENERATED — jangan disunting tangan.
`IconId` diturunkan dari file yang ada, jadi typo nama ikon gagal saat typecheck.

**Terjemahan.** Hanya chrome, di `src/i18n/dictionary.ts`, bertipe
`Record<Locale, ...>` supaya locale baru gagal saat typecheck. Konten editorial
memakai field `lang` pada koleksi + fallback di `lib/content/index.ts`.

## Navigasi

Header digantikan `SiteNav` — card mengambang di sisi kiri.

- **≥1024px** — card tetap di kiri, lebar `--spacing-panel`, jarak dari tepi
  `--spacing-panel-inset`. Tombol × meminimalkan: seksi selain PROGRAM
  disembunyikan dan **tinggi card menyusut mengikuti isinya**.
- **<1024px** — bilah tipis di atas (logo + hamburger); card yang sama dibuka
  sebagai Radix Dialog dan menutup sendiri saat sebuah link dipilih.

Konten diberi `lg:ps-panel-gutter`, dan nilai itu **diturunkan** dari
`calc(--spacing-panel + --spacing-panel-inset * 2)`. Jangan ganti dengan angka
literal: begitu lebar atau jarak panel berubah, konten akan tertimpa panel di
lebar layar tertentu saja — kegagalan yang paling sulit dilihat.

Garis bawah pada item menu adalah keadaan **hover**, dan `focus-visible` ikut
disertakan. Kalau hanya hover, seluruh afordansi itu hilang bagi pengguna
keyboard.

## Status verifikasi

Semuanya sudah dijalankan pada scaffold ini:

- `npm run typecheck` — bersih
- `npm run build` — 13 halaman ter-prerender, tanpa peringatan
- `npm run test:e2e` — **43 lolos, 0 dilewati**
- `npm run check:links` — **merah, dan itu benar**: 17 rute yang ditaut panel
  belum punya halaman (`/program/*`, `/data/*`, `/tentang`, `/tim`,
  `/pencapaian`, `/dampak`, `/publikasi`, `/jogo-laut`, `/kontak`). Aset dan
  seluruh rute yang ada tetap hidup, prefiks locale utuh.
- Token merek terbukti terbit ke CSS terkirim (`#224275`, `#1b77aa`, `#6e6759`
  semuanya hadir; `--color-red-500` tidak)
- Font Montserrat di-host sendiri — 6 `@font-face`, `.woff2` terkirim 200 dari
  `/_next/static/media/`, nol permintaan ke `fonts.googleapis.com` atau
  `fonts.gstatic.com`
- Kontras, diukur bukan dikira:

  | Pasangan | Rasio | Target |
  |---|---|---|
  | `primary` / `bg` | 9.98:1 | 4.5 |
  | `secondary` / `bg` | 4.92:1 | 4.5 |
  | `secondary` / `surface` | 4.52:1 | 4.5 |
  | `breadcrumb` / `bg` | 5.60:1 | 4.5 |
  | putih / `primary` | 9.98:1 | 4.5 |
  | putih / `secondary` | 4.92:1 | 4.5 |
  | putih / `breadcrumb` | 5.60:1 | 4.5 |
  | `fg` / `bg` | 17.93:1 | 4.5 |
  | `muted` / `bg` | 6.69:1 | 4.5 |
  | `fg` / `surface` | 16.44:1 | 4.5 |
  | `muted` / `surface` | 6.13:1 | 4.5 |
  | `focus` / `bg` | 9.98:1 | 3.0 |

  `secondary` / `primary` = 2.03:1 — di bawah 3:1. Lihat catatan di bagian
  Warna merek sebelum memakai keduanya sebagai satu-satunya pembeda dua kontrol.

  `border` / `bg` = 1.48:1. Aman selama border hanya dekoratif (garis pemisah).
  **Kalau border nanti jadi satu-satunya penanda batas kontrol** — bingkai input,
  outline tombol sekunder — ia perlu ≥3:1 (WCAG 1.4.11). Ukur ulang saat palet
  asli masuk.

  Untuk teks di atas latar bergambar atau berpola nanti: ukur pada **petak
  tergelap di bawah glyph**, bukan rata-rata baris. Rata-rata menyembunyikan
  detail gelap yang justru menabrak teks.
