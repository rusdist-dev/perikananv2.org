import type { StaticImageData } from 'next/image';
import publication1 from '@/assets/publication1.png';
import publication2 from '@/assets/publication2.png';
import publication3 from '@/assets/publication3.png';
import publication4 from '@/assets/publication4.png';
// Sampulnya bukan foto dokumentasi yang di-import terpisah -- ini render
// halaman pertama PDF-nya sendiri (belum ada aset sampul lain untuk buku
// ini), dirender sekali lewat pdfjs-dist + @napi-rs/canvas di luar repo.
import panduanLepasPantai from '@/assets/publication/panduan-lepas-pantai.jpg';

export type Publication = {
  image: StaticImageData;
  category: string;
  /** Judul dokumen apa adanya -- nama diri, bukan frasa yang diterjemahkan
   *  ulang per locale. Poster aslinya berbahasa Indonesia; menerjemahkan
   *  judulnya untuk pembaca /en hanya membuat judul yang tercetak di
   *  dokumen dan yang tertulis di kartu ini menyimpang. */
  title: string;
  /** Path di public/documents/ ke berkas PDF asli, mis.
   *  '/documents/nama-berkas.pdf'. null selama berkasnya belum diletakkan --
   *  PdfViewerModal menampilkan pesan "belum tersedia" untuk itu alih-alih
   *  iframe yang menunjuk ke berkas yang tidak ada. */
  pdfUrl: string | null;
};

/** Judul dan kategori di bawah diambil langsung dari halaman sampul/kutipan
 *  resmi tiap PDF sungguhan di public/documents/ (bukan lagi placeholder) --
 *  lihat isi asli masing-masing berkas untuk verifikasi. */
export const publications: Publication[] = [
  {
    image: publication4,
    category: 'Guidebook',
    title: 'Panduan Pengembangan Kawasan Konservasi Ekosistem Karbon Biru',
    pdfUrl: '/documents/panduan-pengembangan-kawasan.pdf',
  },
  {
    image: publication3,
    category: 'Knowledge Management',
    title:
      'Multi-stakeholder Knowledge Management Based on Co-production Principles to Support Fisheries Resource Management in Indonesia',
    pdfUrl: '/documents/multi-stakeholder-knowledge-management.pdf',
  },
  {
    image: publication2,
    category: 'Species Documentation',
    title: 'KAKAP di Indonesia',
    pdfUrl: '/documents/kakap-field-notes.pdf',
  },
  {
    image: publication1,
    category: 'Impact Report',
    title: 'Community Resilience Through Blue Carbon Framework in Indonesia',
    pdfUrl: '/documents/bcaf-field-notes.pdf',
  },
  {
    image: panduanLepasPantai,
    category: 'Guidebook',
    title: 'Panduan Pengembangan Kawasan Konservasi Lepas Pantai',
    pdfUrl: '/documents/panduan-lepas-pantai.pdf',
  },
];
