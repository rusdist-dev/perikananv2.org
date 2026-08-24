import Image, { type StaticImageData } from 'next/image';
import { AppLink } from '@/components/ui/AppLink';

type ProgramSupportCtaProps = {
  image: StaticImageData;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Pita penutup halaman program: ajakan donasi/dukungan di atas foto penuh
 *  lebar. bg-primary + mix-blend-screen (bukan sekadar opacity) supaya biru
 *  itu benar-benar MENERANGI fotonya -- screen tidak pernah menggelapkan,
 *  hanya mencerahkan, jadi bagian gelap fotonya terangkat ke arah biru
 *  sementara ikan yang sudah terang jadi makin menyala. Pola yang sama
 *  dipakai footer_bg.png di SiteFooter, minus invert (foto ini foto warna
 *  asli, bukan coretan hitam-putih yang perlu dibalik dulu). */
export function ProgramSupportCta({
  image,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
}: ProgramSupportCtaProps) {
  return (
    <div className="relative isolate overflow-hidden bg-primary">
      <Image
        src={image}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="pointer-events-none object-cover select-none"
      />

      {/* Overlay biru tipis di atas foto */}
      <div className="absolute inset-0 bg-primary/40" />

      <div className="relative flex flex-col items-center gap-4 px-4 py-20 text-center text-white sm:py-24">
        <h2 className="max-w-4xl text-2xl font-bold md:text-3xl">{heading}</h2>
        <p className="text-sm text-white/90 md:text-base">{subheading}</p>
        <AppLink
          href={ctaHref}
          className="mt-2 inline-flex w-fit items-center rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-70"
        >
          {ctaLabel}
        </AppLink>
      </div>
    </div>
  );
}
