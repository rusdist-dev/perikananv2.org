import { panelNav } from '@/lib/nav';
import { getDictionary } from '@/i18n/dictionary';
import { programMeta } from '@/data/programs';
import { getPublications, searchArticles, NEWS_SEARCH_LIMIT } from '@/lib/content';
import type { Locale } from '@/i18n/config';

/**
 * Pencarian nyata di atas data yang benar-benar ada: program (panelNav +
 * programMeta), publikasi (lib/content, koleksi CMS), dan berita
 * (lib/content). TIDAK ada kategori "Dataset" -- rute /data/* di panelNav
 * belum punya halaman maupun data sungguhan di baliknya (lihat §4j di
 * site.ts), jadi mengarang hasil dataset di sini akan melanggar aturan yang
 * sama.
 */

export type SearchResultType = 'program' | 'publication' | 'news';

export type SearchResult = {
  type: SearchResultType;
  title: string;
  description: string;
  /** Path tanpa prefiks locale -- AppLink yang menambahkannya. */
  href: string;
  /** Kategori/publisher untuk publikasi, tag pertama untuk berita, null untuk program. */
  meta: string | null;
  hasPdf: boolean;
  publishedAt: string | null;
  year: number | null;
  tags: string[];
};

/** Membuang diakritik dan menyeragamkan kapital, sama seperti SearchableSelect. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '');
}

function queryTerms(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

function matchesAllTerms(haystack: string, terms: string[]): boolean {
  const normalized = normalize(haystack);
  return terms.every((term) => normalized.includes(term));
}

/**
 * Nama program yang bisa dicari, dengan `labelKey` diterjemahkan.
 *
 * Versi sebelumnya menyaring `typeof item.label === 'string'` dan diam-diam
 * menghasilkan daftar KOSONG: seluruh item program di panelNav memakai
 * `labelKey`, bukan `label` (lihat komentar NavItem di lib/nav.ts). Akibatnya
 * /cari tidak pernah sekali pun mengembalikan hasil bertipe program, dan
 * koreksi ejaan untuk nama program tidak pernah menyala -- keduanya gagal
 * tanpa galat, persis jenis kegagalan yang tidak terlihat sampai ada yang
 * mencarinya.
 */
function programLabels(locale: Locale): { href: string; label: string }[] {
  const section = panelNav.find((s) => s.id === 'nav-program');
  if (!section) return [];

  const t = getDictionary(locale);
  return section.items.map((item) => ({
    href: item.href,
    label: item.labelKey ? t[item.labelKey] : item.label,
  }));
}

export async function searchContent(locale: Locale, query: string): Promise<SearchResult[]> {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];

  for (const { href, label } of programLabels(locale)) {
    const description = programMeta[href]?.description ?? '';
    if (matchesAllTerms(`${label} ${description}`, terms)) {
      results.push({
        type: 'program',
        title: label,
        description,
        href,
        meta: null,
        hasPdf: false,
        publishedAt: null,
        year: null,
        tags: [label],
      });
    }
  }

  const publications = await getPublications();
  for (const pub of publications) {
    if (matchesAllTerms(`${pub.title} ${pub.category ?? ''}`, terms)) {
      results.push({
        type: 'publication',
        title: pub.title,
        description: pub.category ?? '',
        href: '/discover/publications',
        meta: pub.category,
        hasPdf: pub.pdfUrl !== null,
        publishedAt: null,
        year: null,
        tags: pub.category ? [pub.category] : [],
      });
    }
  }

  // Berita disaring CMS, bukan di sini: pencocokan lokal cuma melihat judul,
  // excerpt, dan tag, sementara CMS ikut mencari isi artikel dan kedua bahasa
  // -- lihat komentar searchArticles di lib/content. Program dan publikasi di
  // atas tetap lokal: keduanya korpus kecil yang memang tidak ada di CMS
  // (program) atau belum punya parameter pencarian (publikasi).
  const articles = await searchArticles(locale, query, NEWS_SEARCH_LIMIT);
  for (const article of articles) {
    results.push({
      type: 'news',
      title: article.title,
      description: article.excerpt,
      href: `/berita/${article.slug}`,
      meta: article.category,
      hasPdf: false,
      publishedAt: article.publishedAt,
      year: new Date(article.publishedAt).getFullYear(),
      tags: article.tags,
    });
  }

  return results;
}

/** Levenshtein klasik -- cukup untuk korpus beberapa lusin frasa, tidak perlu dioptimalkan. */
function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, (_, i) => [
    i,
    ...Array<number>(cols - 1).fill(0),
  ]);
  for (let j = 1; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[rows - 1][cols - 1];
}

/**
 * Korpus koreksi ejaan: nama program (nama diri, penting saat query salah
 * ketik seperti "bluecarbn") dan kategori publikasi yang benar-benar ada.
 * Tag berita tidak ditambahkan terpisah -- semuanya sudah persis nama
 * program yang sama.
 */
async function suggestionCorpus(locale: Locale): Promise<string[]> {
  const phrases = new Set<string>();
  for (const { label } of programLabels(locale)) phrases.add(label);
  const publications = await getPublications();
  for (const pub of publications) {
    if (pub.category) phrases.add(pub.category);
  }
  return [...phrases];
}

/** null kalau tidak ada frasa yang cukup dekat -- UI lalu menampilkan pesan generik, bukan saran karangan. */
export async function suggestCorrection(locale: Locale, query: string): Promise<string | null> {
  const q = normalize(query).replace(/\s+/g, '');
  if (!q) return null;

  let best: { phrase: string; distance: number } | null = null;
  for (const phrase of await suggestionCorpus(locale)) {
    const normalizedPhrase = normalize(phrase).replace(/\s+/g, '');
    const distance = levenshtein(q, normalizedPhrase);
    if (!best || distance < best.distance) best = { phrase, distance };
  }

  if (!best || best.distance === 0) return null;
  const threshold = Math.max(2, Math.ceil(best.phrase.length * 0.34));
  return best.distance <= threshold ? best.phrase : null;
}
