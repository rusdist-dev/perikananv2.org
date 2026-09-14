import { readFile } from 'node:fs/promises';
import path from 'node:path';
import DOMPurify from 'isomorphic-dompurify';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { stripHtml } from '@/lib/html';
import { collections, type CollectionName } from './schema';
import { getProgramNameByCmsSlug } from './program-taxonomy';

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

/** Lebih dari ini, CMS Rekam diam-diam memotong ke 100 -- lebih baik eksplisit
 *  di sini daripada mengira sedang meminta lebih banyak dari yang sebenarnya
 *  didapat. */
const API_PAGE_SIZE = 100;

const EXCERPT_LENGTH = 200;

/** CMS Rekam sering mengirim excerpt kosong (null) -- daripada kartu artikel
 *  menampilkan ringkasan kosong, potong dari body (sudah teks polos lewat
 *  stripHtml) di batas kata terdekat. */
function deriveExcerpt(bodyText: string): string {
  if (bodyText.length <= EXCERPT_LENGTH) return bodyText;
  const cut = bodyText.slice(0, EXCERPT_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Entri "news" CMS -> bentuk mentah yang divalidasi articleSchema. Satu-
 *  satunya tempat yang tahu nama field asli CMS (published_at, cover_url,
 *  dst) -- schema.ts tidak pernah menyebut mereka. */
function mapNewsItem(raw: Record<string, unknown>, lang: Locale): unknown {
  const bodyHtml = typeof raw.body === 'string' ? DOMPurify.sanitize(raw.body) : '';
  const bodyText = stripHtml(bodyHtml);
  const rawExcerpt = typeof raw.excerpt === 'string' ? stripHtml(raw.excerpt) : '';

  // `related_programs` CMS Rekam adalah array slug taksonomi program mentah
  // (contoh: "konservasi-spesies"), bukan nama yang sudah diterjemahkan --
  // program-taxonomy.ts yang tahu cara melokalkannya per `lang`.
  const relatedProgramSlugs = Array.isArray(raw.related_programs)
    ? raw.related_programs.filter((slug): slug is string => typeof slug === 'string')
    : [];
  const programNames = relatedProgramSlugs
    .map((slug) => getProgramNameByCmsSlug(slug, lang))
    .filter((name): name is string => Boolean(name));

  const categoryName =
    raw.category && typeof raw.category === 'object' && 'name' in raw.category
      ? String((raw.category as { name: unknown }).name)
      : typeof raw.category === 'string'
        ? raw.category
        : null;

  const tags = [categoryName, ...programNames].filter((tag): tag is string => Boolean(tag));

  // Program pertama saja: kartu/detail berita menampilkan satu label, bukan
  // daftar -- lihat komentar `program` di schema.ts.
  const primaryProgramSlug = relatedProgramSlugs[0];
  const program = primaryProgramSlug
    ? { name: getProgramNameByCmsSlug(primaryProgramSlug, lang) ?? primaryProgramSlug, slug: primaryProgramSlug }
    : null;

  return {
    lang,
    slug: raw.slug,
    title: raw.title,
    // articleSchema.excerpt butuh minimal 1 karakter -- body kosong pun (data
    // belum lengkap di CMS) tidak boleh membuat seluruh koleksi gagal parse.
    excerpt: rawExcerpt || deriveExcerpt(bodyText) || '—',
    body: bodyHtml,
    publishedAt: typeof raw.published_at === 'string' ? raw.published_at.slice(0, 10) : raw.published_at,
    tags,
    image: typeof raw.cover_url === 'string' && raw.cover_url ? raw.cover_url : null,
    program,
    cmsId: typeof raw.id === 'string' || typeof raw.id === 'number' ? raw.id : null,
  };
}

/** Entri "publications" CMS -> bentuk mentah yang divalidasi
 *  publicationSchema. `lang` tidak dipakai -- publikasi tidak diterjemahkan
 *  per locale (lihat komentar publicationSchema) -- tapi tetap diterima
 *  supaya bentuknya sama dengan mapItem koleksi lain (ApiCollectionConfig
 *  di bawah). */
function mapPublicationItem(raw: Record<string, unknown>): unknown {
  return {
    title: raw.title,
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : null,
    pdfUrl: raw.file_url,
    image: typeof raw.cover_url === 'string' && raw.cover_url ? raw.cover_url : null,
    isFeatured: raw.is_featured === true,
  };
}

/** Satu anggota tim di dalam satu grup "team" CMS -> bentuk mentah yang
 *  divalidasi teamMemberSchema. `level` datang dari grup pembungkusnya
 *  (mapTeamGroup), bukan dari entri anggota itu sendiri. */
function mapTeamMember(raw: Record<string, unknown>, lang: Locale, level: unknown): unknown {
  const socials = (raw.socials as Record<string, unknown> | null | undefined) ?? {};

  return {
    lang,
    level,
    slug: raw.slug,
    name: raw.name,
    position: raw.position,
    bio: typeof raw.bio === 'string' ? DOMPurify.sanitize(raw.bio) : '',
    image: typeof raw.photo_url === 'string' && raw.photo_url ? raw.photo_url : null,
    email: typeof raw.email === 'string' && raw.email ? raw.email : null,
    socials: {
      linkedin: typeof socials.linkedin === 'string' && socials.linkedin ? socials.linkedin : null,
      instagram: typeof socials.instagram === 'string' && socials.instagram ? socials.instagram : null,
    },
  };
}

/** Entri "team" CMS dikelompokkan per jenjang (`{ level: {value,label},
 *  members: [...] }`), BUKAN array flat seperti "news"/"publications" --
 *  satu entri di `json.data` menghasilkan BANYAK anggota tim sekaligus.
 *  Itu sebabnya mapItem di ApiCollectionConfig mengembalikan array, bukan
 *  satu item, supaya koleksi "team" bisa lewat jalur yang sama dengan
 *  koleksi lain di fetchApi. */
function mapTeamGroup(raw: Record<string, unknown>, lang: Locale): unknown[] {
  const level = (raw.level as { value?: unknown } | null | undefined)?.value;
  const members = Array.isArray(raw.members) ? raw.members : [];
  return members.map((member) => mapTeamMember(member as Record<string, unknown>, lang, level));
}

/** Entri "milestones" CMS -> bentuk mentah yang divalidasi milestoneSchema.
 *  CMS Rekam mengirim isinya sebagai satu field teks (`body`) berbaris-baris
 *  (dipisah \r\n), bukan dua field terpisah -- baris tunggal jadi paragraf
 *  (`description`), lebih dari satu baris jadi daftar poin (`bullets`),
 *  meniru persis union Milestone yang dulu ditulis manual di
 *  achievements/page.tsx per tahun. */
function mapMilestoneItem(raw: Record<string, unknown>, lang: Locale): unknown {
  const lines =
    typeof raw.body === 'string'
      ? raw.body
          .split(/\r\n|\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

  return {
    lang,
    year: raw.year,
    title: raw.title,
    description: lines.length === 1 ? lines[0] : null,
    bullets: lines.length > 1 ? lines : [],
    image: typeof raw.cover_url === 'string' && raw.cover_url ? raw.cover_url : null,
  };
}

type ApiPage = { data?: unknown[]; meta?: { current_page: number; last_page: number } };

/** Satu koleksi kita bisa jadi nama resource yang berbeda di CMS (kita
 *  bilang "articles", CMS Rekam bilang "news"), dan tidak semua koleksi
 *  perlu diminta per-locale (lihat komentar mapPublicationItem) -- tabel ini
 *  satu-satunya tempat yang tahu bedanya per koleksi. */
type ApiCollectionConfig = {
  resource: string;
  /** true: fetch dipanggil sekali per locale (?lang=id, ?lang=en) dan
   *  hasilnya digabung -- lihat komentar mapNewsItem soal kenapa. false:
   *  fetch dipanggil sekali saja, tanpa parameter lang. */
  perLocale: boolean;
  /** Array, bukan satu item -- satu entri mentah CMS bisa memetakan ke
   *  banyak (team, lihat mapTeamGroup) atau satu (news/publications, yang
   *  cukup membungkusnya sendiri dalam array satu elemen). */
  mapItem: (raw: Record<string, unknown>, lang: Locale) => unknown[];
};

const apiCollections: Record<CollectionName, ApiCollectionConfig> = {
  articles: { resource: 'news', perLocale: true, mapItem: (raw, lang) => [mapNewsItem(raw, lang)] },
  publications: { resource: 'publications', perLocale: false, mapItem: (raw) => [mapPublicationItem(raw)] },
  team: { resource: 'team', perLocale: true, mapItem: mapTeamGroup },
  milestones: { resource: 'milestones', perLocale: true, mapItem: (raw, lang) => [mapMilestoneItem(raw, lang)] },
};

/** Menarik satu resource sampai habis, mengikuti `meta.current_page` /
 *  `meta.last_page` yang dikembalikan CMS Rekam -- `url` sudah membawa semua
 *  parameter query TETAP (lang, per_page); `page` ditambahkan/ditimpa di
 *  sini tiap putaran. */
async function fetchAllPages(
  url: URL,
  headers: HeadersInit,
  tag: string,
): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  let page = 1;

  for (;;) {
    url.searchParams.set('page', String(page));

    const res = await fetch(url, {
      headers,
      // Tag inilah alasan seam ini ada: webhook CMS memanggil
      // revalidateTag(nama koleksi) dan seluruh situs ikut segar tanpa rebuild.
      next: { tags: [tag] },
    });

    if (!res.ok) {
      throw new Error(`Gagal memuat "${url.pathname}" dari CMS (page=${page}): HTTP ${res.status}`);
    }

    const json = (await res.json()) as ApiPage;
    for (const raw of json.data ?? []) items.push(raw as Record<string, unknown>);

    const meta = json.meta;
    if (!meta || meta.current_page >= meta.last_page) break;
    page += 1;
  }

  return items;
}

async function fetchApi(name: CollectionName): Promise<unknown> {
  const base = process.env.CONTENT_API_URL;
  if (!base) {
    // Berisik, bukan diam-diam jatuh balik ke JSON lokal: deploy yang mengira
    // dirinya membaca CMS tapi menyajikan konten build-time adalah kegagalan
    // yang tidak terlihat sampai konten jadi basi berminggu-minggu.
    throw new Error('CONTENT_SOURCE=api tetapi CONTENT_API_URL tidak diisi.');
  }

  const apiKey = process.env.X_API_KEY;
  if (!apiKey) {
    throw new Error('CONTENT_SOURCE=api tetapi X_API_KEY tidak diisi.');
  }

  const config = apiCollections[name];
  const headers = { Accept: 'application/json', 'X-Api-Key': apiKey };
  // CMS-nya tidak punya "semua bahasa sekaligus" untuk koleksi yang
  // diterjemahkan -- lang jadi parameter kueri dan setiap artikel yang belum
  // diterjemahkan sudah di-fallback-kan CMS sendiri. Jadi untuk koleksi
  // perLocale, cukup memanggil sekali per locale yang kita dukung, menandai
  // setiap hasilnya dengan locale yang diminta, dan membiarkan pickForLocale
  // (lib/content/index.ts) memilih yang cocok -- sama seperti bentuk
  // src/data/articles.json yang dulu mencampur kedua bahasa. Koleksi yang
  // tidak diterjemahkan (publications) cukup satu putaran.
  const langsToFetch = config.perLocale ? locales : [defaultLocale];

  const items: unknown[] = [];
  for (const lang of langsToFetch) {
    const url = new URL(`${base.replace(/\/$/, '')}/${config.resource}`);
    if (config.perLocale) url.searchParams.set('lang', lang);
    url.searchParams.set('per_page', String(API_PAGE_SIZE));

    const raw = await fetchAllPages(url, headers, name);
    for (const item of raw) items.push(...config.mapItem(item, lang));
  }

  return items;
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
