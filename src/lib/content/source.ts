import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { collections, type CollectionName } from './schema';

/**
 * Satu-satunya tempat yang tahu DARI MANA konten datang.
 *
 * Halaman tidak pernah mengimpor file ini; ia mengimpor lib/content (barrel).
 * Rantainya source -> schema -> index, dan pindah dari JSON lokal ke CMS adalah
 * perubahan satu file di sini plus webhook yang memanggil revalidateTag(nama
 * koleksi). Tanpa seam ini, alamat sumber data tersebar ke setiap halaman dan
 * migrasi berubah jadi cari-ganti lintas repo.
 *
 * File ini server-only lewat impor node:fs -- menariknya ke komponen klien
 * menggagalkan build alih-alih membocorkan pembacaan filesystem ke browser.
 * Kalau mode 'api' suatu saat jadi satu-satunya jalur dan impor fs hilang,
 * pasang paket `server-only` dan impor di sini sebagai gantinya.
 */

type Mode = 'local' | 'api';

const mode: Mode = process.env.CONTENT_SOURCE === 'api' ? 'api' : 'local';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

async function fetchLocal(name: CollectionName): Promise<unknown> {
  const file = path.join(DATA_DIR, `${name}.json`);
  const raw = await readFile(file, 'utf8');
  return JSON.parse(raw);
}

async function fetchApi(name: CollectionName): Promise<unknown> {
  const base = process.env.CONTENT_API_URL;
  if (!base) {
    // Berisik, bukan diam-diam jatuh balik ke JSON lokal: deploy yang mengira
    // dirinya membaca CMS tapi menyajikan konten build-time adalah kegagalan
    // yang tidak terlihat sampai konten jadi basi berminggu-minggu.
    throw new Error('CONTENT_SOURCE=api tetapi CONTENT_API_URL tidak diisi.');
  }

  const res = await fetch(`${base.replace(/\/$/, '')}/${name}`, {
    // Tag inilah alasan seam ini ada: webhook CMS memanggil
    // revalidateTag('articles') dan seluruh situs ikut segar tanpa rebuild.
    next: { tags: [name] },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat koleksi "${name}": HTTP ${res.status}`);
  }

  return res.json();
}

/** Ambil + validasi satu koleksi. Melempar kalau bentuknya tidak sesuai skema. */
export async function loadCollection<K extends CollectionName>(
  name: K,
): Promise<ReturnType<(typeof collections)[K]['parse']>> {
  const raw = mode === 'api' ? await fetchApi(name) : await fetchLocal(name);
  const parsed = collections[name].safeParse(raw);

  if (!parsed.success) {
    throw new Error(
      `Koleksi "${name}" tidak lolos validasi (${mode}):\n` +
        JSON.stringify(parsed.error.issues, null, 2),
    );
  }

  return parsed.data as ReturnType<(typeof collections)[K]['parse']>;
}
