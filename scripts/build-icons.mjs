#!/usr/bin/env node
/**
 * Generate src/icons/generated.tsx dari setiap *.svg di src/icons/.
 *
 * Kenapa pipeline, bukan komponen SVG tulisan tangan:
 *  - `IconId` jadi union yang diturunkan dari file yang benar-benar ada, jadi
 *    typo nama ikon gagal saat typecheck, bukan merender kotak kosong.
 *  - Markup-nya terbit satu kali sebagai <symbol> dalam satu sprite, bukan
 *    disalin ulang di tiap tempat pemakaian.
 *
 * Namanya build-, bukan extract-: ia menghasilkan artefak dari sumber di repo
 * ini, bukan menarik aset dari situs lama.
 *
 * Jalankan: npm run icons
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ICON_DIR = path.join(ROOT, 'src', 'icons');
const OUT_FILE = path.join(ICON_DIR, 'generated.tsx');

const svgoConfig = {
  multipass: true,
  plugins: [
    // svgo v4 sudah mengeluarkan removeViewBox dari preset-default, jadi viewBox
    // aman tanpa override. Kalau versi svgo naik dan viewBox mulai hilang,
    // <symbol> berhenti bisa diskalakan oleh <use> -- viewBoxOf() di bawah
    // menangkapnya sebagai error, bukan sebagai ikon yang ukurannya kacau.
    { name: 'preset-default' },
    // currentColor harus lolos utuh supaya ikon mewarisi warna teks induknya.
    { name: 'convertColors', params: { currentColor: false } },
  ],
};

/** `menu.svg` -> `menu`; tolak nama yang tidak aman jadi id DOM. */
function toId(filename) {
  const id = path.basename(filename, '.svg');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Nama ikon "${filename}" harus kebab-case huruf kecil.`);
  }
  return id;
}

function innerMarkup(svg) {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!match) throw new Error('Bukan dokumen SVG yang valid.');
  return match[1].trim();
}

/**
 * Atribut presentasi di elemen <svg> akar HARUS ikut pindah ke <symbol>.
 *
 * Anak-anak SVG mewarisi `stroke`, `fill`, dan `stroke-width` dari induknya.
 * Mengambil isi <svg> saja dan membuang atribut akarnya menghasilkan <path>
 * tanpa stroke sama sekali -- dan path terbuka tanpa stroke tidak menggambar
 * apa pun. Ikonnya hilang tanpa satu pun error: elemennya ada di DOM, ukurannya
 * benar, warnanya benar, hanya tidak terlihat.
 *
 * Yang TIDAK ikut: xmlns/version (milik dokumen, bukan simbol), width/height
 * (ukuran ditentukan pemakai lewat CSS), viewBox (ditulis terpisah), serta
 * id/class yang akan bertabrakan antar simbol.
 */
const DROP_ATTRS = new Set([
  'xmlns',
  'xmlns:xlink',
  'version',
  'width',
  'height',
  'viewbox',
  'id',
  'class',
  'role',
  'aria-hidden',
  'aria-label',
]);

function rootAttrs(svg) {
  const open = svg.match(/<svg([^>]*)>/i);
  if (!open) return '';
  const attrs = [...open[1].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].filter(
    ([, name]) => !DROP_ATTRS.has(name.toLowerCase()),
  );
  return attrs.map(([, name, value]) => ` ${name}="${value}"`).join('');
}

function viewBoxOf(svg, file) {
  const match = svg.match(/viewBox="([^"]+)"/i);
  if (!match) throw new Error(`${file} tidak punya viewBox.`);
  return match[1];
}

const files = (await readdir(ICON_DIR)).filter((f) => f.endsWith('.svg')).sort();

if (files.length === 0) {
  console.error(`Tidak ada .svg di ${ICON_DIR}`);
  process.exit(1);
}

const icons = [];
for (const file of files) {
  const raw = await readFile(path.join(ICON_DIR, file), 'utf8');
  const { data } = optimize(raw, { ...svgoConfig, path: file });
  const icon = {
    id: toId(file),
    viewBox: viewBoxOf(data, file),
    attrs: rootAttrs(data),
    inner: innerMarkup(data),
  };

  // Penjaga untuk kegagalan paling mahal di pipeline ini: ikon yang ada di DOM,
  // ukurannya benar, warnanya benar, tapi tidak menggambar apa pun. Terjadinya
  // saat `fill="none"` bertahan tapi stroke-nya hilang -- tidak ada error di
  // mana pun, dan baru ketahuan lewat mata. Kalau `fill` tidak disebut sama
  // sekali, SVG memakai fill hitam bawaan, jadi ikonnya tetap terlihat.
  const markup = `${icon.attrs} ${icon.inner}`;
  if (/fill="none"/i.test(markup) && !/stroke="(?!none)[^"]+"/i.test(markup)) {
    throw new Error(
      `${file}: fill="none" tanpa stroke -- ikon ini akan tak terlihat sama sekali.`,
    );
  }

  icons.push(icon);
}

const symbols = icons
  .map((i) => `<symbol id="i-${i.id}" viewBox="${i.viewBox}"${i.attrs}>${i.inner}</symbol>`)
  .join('');

const union = icons.map((i) => `  | '${i.id}'`).join('\n');

const out = `/* GENERATED — do not edit by hand.
 * Sumber: src/icons/*.svg · Regenerate: npm run icons
 */

export type IconId =
${union};

export const iconIds = [
${icons.map((i) => `  '${i.id}',`).join('\n')}
] as const;

/**
 * Sprite ditulis sebagai string, bukan JSX.
 *
 * Markup SVG memakai atribut ber-tanda-hubung (stroke-width, stroke-linecap)
 * yang bukan properti React; ditempel sebagai JSX ia akan memicu peringatan
 * "Invalid DOM property" dan diam-diam menghilangkan atributnya. Menerjemahkan
 * tiap atribut ke camelCase di generator berarti memelihara daftar padanan
 * selamanya. String + dangerouslySetInnerHTML melewati keduanya, dan isinya
 * berasal dari file di repo ini pada waktu build -- bukan dari input pengguna.
 */
const SPRITE = ${JSON.stringify(symbols)};

/**
 * Dirender SEKALI per dokumen (SiteShell menaruhnya tepat di dalam <body>),
 * lalu <Icon> merujuknya lewat <use href="#i-...">. aria-hidden dan ukuran nol
 * menjaganya keluar dari accessibility tree dan dari layout.
 */
export function IconSprite() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: SPRITE }}
    />
  );
}
`;

await writeFile(OUT_FILE, out, 'utf8');
console.log(`icons: ${icons.length} → ${path.relative(ROOT, OUT_FILE)}`);
