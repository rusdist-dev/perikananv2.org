import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import wave2 from '@/assets/banner/wave2.png';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/cn';

export type ProgramObjective = {
  eyebrow: string;
  title: string;
  description: string;
};

type ProgramObjectivesProps = {
  icon: StaticImageData;
  eyebrow: string;
  heading: string;
  /** Konten penuh lebar (mis. ProgramGallery) dirender DI LUAR Container tapi
   *  MASIH di dalam latar biru/wave2 yang sama, supaya sambungan antara teks
   *  objectives dan galeri di bawahnya terlihat menyatu -- bukan dua kotak
   *  bg-primary terpisah yang jahitannya kelihatan. */
  children?: ReactNode;
} & (
  | { objectives: ProgramObjective[]; intro?: never; listItems?: never }
  /** Varian daftar bernomor (mis. Marine Conservation): satu kalimat
   *  pengantar diikuti poin-poin bernomor, dipakai saat tujuan program tidak
   *  natural dipecah jadi tiga kartu eyebrow/title/description. */
  | { intro: string; listItems: string[]; objectives?: never }
);

/** Pita biru di bawah ProgramIntro: ikon program + judul, lalu tiga (atau
 *  lebih) tujuan berdampingan dengan garis pemisah di antaranya.
 *
 *  wave2.png + bg-primary adalah kombinasi yang sama persis dengan seksi
 *  "Our Impact" di beranda (lihat src/app/[locale]/page.tsx) -- disatukan di
 *  sini supaya tiap halaman /program/* tidak menulis ulang trik blend yang
 *  sama. */
export function ProgramObjectives({
  icon,
  eyebrow,
  heading,
  objectives,
  intro,
  listItems,
  children,
}: ProgramObjectivesProps) {
  return (
    <div className="relative isolate overflow-hidden bg-primary text-primary-fg">
      {/* Lebar penuh mengikuti kontainer, tinggi menyesuaikan rasio asli
          (bukan fill + object-cover) -- object-cover memaksa gambar
          diregangkan mengisi tinggi kontainer yang tingginya berubah-ubah
          mengikuti panjang konten, sehingga sering di-zoom melebihi resolusi
          aslinya dan tampak buram. Sisa area di bawah gambar (jika konten
          lebih tinggi dari gambar) tetap solid bg-primary, jadi tidak ada
          jahitan warna yang mencolok. */}
      <Image
        src={wave2}
        alt=""
        aria-hidden
        sizes="100vw"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-auto w-full select-none scale-y-[1.4] origin-top"
      />

      <Container className="page-gutter pt-10 lg:pe-40">
        <div className="flex items-center gap-4">
          {/* Ikon programnya sendiri (mis. ocean-account.svg) sudah memuat
              lingkaran latar putihnya -- tidak perlu dibungkus lagi di sini. */}
          <Image src={icon} alt="" aria-hidden className="h-16 w-16 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-fg/70">{eyebrow}</p>
            <h2 className="mt-1 text-2xl md:text-3xl">{heading}</h2>
          </div>
        </div>

        {objectives ? (
          <div
            className={cn(
              'mt-8 grid grid-cols-1 gap-10 lg:gap-12',
              // Kolom ke-3 sengaja dilebarkan (1.3fr) untuk kasus 3 kolom:
              // dipakai pertama kali oleh Species Conservation, yang judul
              // objective terakhirnya jauh lebih panjang dari dua lainnya --
              // rata 3 kolom sama besar membuatnya patah ke 3-4 baris di
              // lebar laptop biasa, alih-alih 2 baris rapi seperti objective
              // 01/02. Kasus 4 kolom (mis. Marine Conservation) rata semua,
              // panjang judulnya sudah sebanding.
              objectives.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-[1fr_1fr_1.3fr]',
            )}
          >
            {objectives.map((objective, index) => (
              <div key={objective.eyebrow} className="relative">
                {/* Garis pendek dipusatkan vertikal, sama seperti pola divider
                    di seksi IMPACT_STATS beranda -- bukan divide-x, supaya
                    panjangnya tidak ikut meregang mengikuti kolom terpanjang. */}
                {index > 0 ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 -start-5 my-auto hidden h-20 w-1 bg-primary-fg lg:block"
                  />
                ) : null}
                <p className="text-xs font-bold uppercase tracking-wide text-primary-fg/70">
                  {objective.eyebrow}
                </p>
                <h3 className="mt-2 text-lg text-balance">{objective.title}</h3>
                {objective.description ? (
                  <p className="mt-2 text-sm text-primary-fg/85">{objective.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm">{intro}</p>
            <ol className="mt-3 space-y-2 text-sm text-primary-fg/85">
              {listItems!.map((item, index) => (
                <li key={item} className="flex gap-2">
                  <span className="font-bold">{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Container>

      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  );
}
