import type { GalleryImage } from '@/components/program/ProgramGallery';
import { resolveArticleImage } from '@/data/article-images';
import type { ArticleListItem } from '@/lib/content';

/** Batas foto yang tampil di carousel tiap program -- permintaan manajemen,
 *  bukan batas teknis. */
export const PROGRAM_GALLERY_COUNT = 5;

/**
 * Foto carousel program diambil dari berita program itu sendiri (cover_url
 * CMS) dan diurutkan dari yang terbaru, supaya ikut ter-update begitu tim
 * menerbitkan berita baru -- tidak lagi empat PNG yang di-commit per program
 * lalu harus diganti manual.
 *
 * `fallback` (set kurasi lama) dipakai untuk MENAMBAL, bukan sekadar
 * cadangan kalau kosong. Alasannya keadaan data hari ini: dari 240 berita di
 * CMS, hanya dua per program yang `related_programs`-nya terisi, sementara
 * galeri ini menampilkan tiga slide sekaligus di layar lebar. Kalau cuma
 * mengambil apa adanya, barisnya tampil bolong. Jadi foto berita mengisi
 * slot terdepan dan sisanya ditambal foto kurasi sampai genap lima --
 * seiring makin banyak berita yang ditandai programnya, foto kurasi
 * terdorong keluar dengan sendirinya tanpa perlu ganti kode.
 */
export function toProgramGallery(
  articles: ArticleListItem[],
  fallback: GalleryImage[],
): GalleryImage[] {
  // Diurutkan di sini, bukan menitip pada urutan CMS: yang dijanjikan ke
  // pembaca adalah "lima dokumentasi terbaru", dan itu tidak boleh bergantung
  // pada perilaku endpoint yang bisa berubah.
  const newestFirst = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const seen = new Set<string>();
  const images: GalleryImage[] = [];

  for (const article of newestFirst) {
    if (images.length === PROGRAM_GALLERY_COUNT) break;

    const src = resolveArticleImage(article.image);
    if (!src) continue; // artikel tanpa cover dilewati, bukan jadi kotak kosong

    // Satu foto bisa dipakai beberapa artikel (mis. liputan acara yang sama
    // dipecah jadi beberapa tulisan). Tanpa penyaring ini slide yang sama
    // muncul dua kali dan carousel-nya terlihat macet.
    const key = typeof src === 'string' ? src : src.src;
    if (seen.has(key)) continue;
    seen.add(key);

    // alt diisi judul beritanya, bukan '' seperti set kurasi lama: foto ini
    // sekarang membawa informasi (dokumentasi kegiatan yang mana), jadi ia
    // bukan lagi ornamen yang pantas disembunyikan dari pembaca layar.
    images.push({ src, alt: article.title });
  }

  for (const image of fallback) {
    if (images.length === PROGRAM_GALLERY_COUNT) break;
    images.push(image);
  }

  return images;
}
