import { notFound } from 'next/navigation';
import { SharkAndRayDashboard } from '@/components/data/shark-and-ray/SharkAndRayDashboard';
import { HiupariExplorer } from '@/components/data/shark-and-ray/HiupariExplorer';
import { getHiupariLengthChart, getHiupariOptions } from '@/lib/content';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/data/shark-and-ray', title: getDictionary(locale).navSharkAndRay });
}

export default async function SharkAndRayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  // Dua permintaan saja -- jauh lebih murah dari /data/ikan (delapan tingkat
  // opsi) dan /data/data-crab (tujuh): dataset ini tidak punya hierarki
  // wilayah, jadi satu-satunya daftar opsinya adalah spesies.
  //
  // Grafiknya ikut diambil di sini untuk filter BAWAAN (seluruh spesies, kedua
  // jenis kelamin, panjang total, selang 10 cm, ambang klasper 3), berbarengan
  // dengan daftar spesiesnya: kartu grafik sudah berisi angka sungguhan di HTML
  // pertama, bukan kosong sampai ada yang menekan tombol Show Chart.
  const [species, initialChart] = await Promise.all([
    getHiupariOptions(),
    getHiupariLengthChart({
      spesies: null,
      jenisKelamin: null,
      jenisUkuran: 'panjang_total',
      selangKelas: 10,
      kematanganMatang: 3,
    }),
  ]);

  return (
    <SharkAndRayDashboard
      locale={locale}
      title={t.navSharkAndRay}
      breadcrumb={[
        { label: t.home, href: '/' },
        // Belum ada halaman indeks /data -- "#" menyatakan itu apa adanya,
        // pola yang sama dengan breadcrumb Program/Connect yang juga belum
        // punya indeks.
        { label: t.navData, href: '#' },
        { label: t.navSharkAndRay, href: '/data/shark-and-ray' },
      ]}
    >
      <HiupariExplorer species={species} initialChart={initialChart} locale={locale} />
    </SharkAndRayDashboard>
  );
}
