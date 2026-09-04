import { notFound } from 'next/navigation';
import jogoLautHero from '@/assets/jogo-laut.png';
import { isLocale } from '@/i18n/config';
import { JogoLautDashboard } from '@/components/program/jogolaut/JogoLautDashboard';
import { ProgramHero } from '@/components/program/ProgramHero';
import { getDictionary } from '@/i18n/dictionary';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  return (
    <>
      <ProgramHero
        breadcrumb={[
          { label: t.home, href: '/' },
          // Belum ada halaman indeks /program -- "#" menyatakan itu apa
          // adanya, sama seperti tombol placeholder lain di beranda, alih-alih
          // menautkan ke rute yang belum dibangun.
          { label: 'Jogo Laut', href: '#' },
          // { label: programLabel, href: NAV_ITEM.href },
        ]}
        title="Jogo Laut: Stasiun riset terpadu - Cilacap, Jawa Tengah"
        lead="Platform pemantauan ekosistem pesisir secara real-time yang dikembangkan oleh Rekam Nusantara Foundation bersama IPB University, Kementerian Kelautan dan Perikanan, BRIN, Pemerintah Provinsi Jawa Tengah, dan Kelompok Masyarakat"
        image={jogoLautHero}
        imageEdgeShadow
      />

      {/* Kartu grafiknya berdiri sendiri sebagai satu komponen, bukan ditulis
          di sini: halaman program lain merangkai seksi editorial yang isinya
          diketik di page.tsx-nya, sementara yang ini merangkai dua puluh kartu
          yang datanya saling terkait. Menaruhnya di sini akan membuat berkas
          rute ini didominasi angka dan tata letak grafik. */}
      <JogoLautDashboard />
    </>
  );
}
