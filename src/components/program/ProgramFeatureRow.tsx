import Image, { type StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';

export type ProgramFeatureRowProps = {
  eyebrow: string;
  title: string;
  bullets: string[];
  image: StaticImageData;
  imageAlt?: string;
  /** Balik urutan kolom di >= lg: foto di kiri, teks di kanan -- dipakai
   *  selang-seling supaya barisnya membentuk pola zigzag, bukan semua baris
   *  berpola sama. */
  reverse?: boolean;
  /** Sub-bagian tambahan di bawah judul utama, tiap satu dengan judul dan
   *  poinnya sendiri -- dipakai saat satu kartu CURRENT PROJECT menaungi
   *  lebih dari satu program/inisiatif (mis. Ocean Accounts: OfD Programme
   *  dan Fellowship sekaligus). Eyebrow tidak diulang per bagian karena
   *  keduanya masih di bawah payung eyebrow yang sama. */
  extraSections?: { title: string; bullets: string[] }[];
};

/** Satu baris zigzag foto + teks, penuh lebar viewport (bukan dibatasi
 *  Container) -- dipanggil berulang dengan `reverse` bergantian untuk
 *  membentuk pola KEY ACTIVITIES / CURRENT PROJECT di halaman program. */
export function ProgramFeatureRow({
  eyebrow,
  title,
  bullets,
  image,
  imageAlt = '',
  reverse = false,
  extraSections = [],
}: ProgramFeatureRowProps) {
  const text = (
    // Jarak kirinya (atau kanannya, kalau reverse) mengikuti konvensi yang
    // sama dengan ProgramIntro/ProgramObjectives di atasnya -- ps-panel-gutter
    // + page-gutter di sisi yang menghadap tepi layar, supaya teksnya
    // sejajar tegak lurus dengan paragraf/heading di atas, bukan angka
    // padding sembarang. Sisi yang menghadap foto cukup jarak dalam biasa.
    <div
      className={cn(
        // gap-2/py-6 dibanding baris tanpa extraSections (gap-4/py-10-16):
        // CURRENT PROJECT bisa menaungi beberapa sub-bagian sekaligus, dan
        // jarak yang sama lapangnya dengan baris satu-bagian akan membuat
        // total tinggi teks jauh melebihi tinggi foto di sampingnya.
        extraSections.length > 0
          ? 'flex flex-col justify-center gap-2 py-6 lg:py-8'
          : 'flex flex-col justify-center gap-4 py-10 lg:py-16',
        reverse
          ? cn(
              'ps-8 pe-(--spacing-gutter) lg:ps-16',
              // Baris dengan beberapa sub-bagian (CURRENT PROJECT) butuh
              // kolom selebar mungkin supaya barisnya memanjang ke kanan,
              // bukan membungkus ke bawah -- jarak penuh panel-gutter di sini
              // cuma untuk simetri visual, dan itu kalah penting dibanding
              // tinggi teks yang melebihi foto di sampingnya.
              extraSections.length > 0 ? 'lg:pe-16' : 'lg:pe-(--spacing-panel-gutter)',
            )
          : 'ps-(--spacing-gutter) pe-8 lg:ps-panel-gutter lg:pe-16',
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">{eyebrow}</p>
      {title ? <h3 className="text-2xl font-semibold text-primary md:text-3xl">{title}</h3> : null}
      <ul className="flex list-disc flex-col gap-3 ps-5 text-base text-primary marker:text-secondary">
        {bullets.map((bullet) => (
          <li key={bullet} className='text-[#5b6360]'>{bullet}</li>
        ))}
      </ul>
      {extraSections.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-primary md:text-3xl">{section.title}</h3>
          <ul className="flex list-disc flex-col gap-3 ps-5 text-base text-primary marker:text-secondary">
            {section.bullets.map((bullet) => (
              <li key={bullet} className='text-[#5b6360]'>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  // Penuh tanpa jarak -- foto pemandangan seperti ini boleh terpotong
  // object-cover di tepinya, beda dengan poster/infografis di ProgramGallery
  // yang harus utuh karena tepinya memuat teks yang tidak boleh hilang.
  // Tinggi foto TIDAK mengikuti panjang teks -- kalau teksnya lebih panjang
  // (mis. CURRENT PROJECT dengan beberapa sub-bagian), jarak vertikal teks
  // yang dirapatkan (lihat `text` di atas), bukan fotonya yang direntangkan.
  const photo = (
    <div className="relative w-full">
      <Image
        src={image}
        alt={imageAlt}
        aria-hidden={imageAlt === '' || undefined}
        className="h-auto w-full"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {reverse ? (
        <>
          {photo}
          {text}
        </>
      ) : (
        <>
          {text}
          {photo}
        </>
      )}
    </div>
  );
}
