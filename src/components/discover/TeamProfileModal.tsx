'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';
import { getBodyParagraphs } from '@/lib/article-body';

/**
 * Sama pola portal-nya dengan PdfViewerModal/VideoModal (lihat komentar di
 * PdfViewerModal soal kenapa harus createPortal ke document.body).
 *
 * Beda dari kedua modal itu: overlay-nya scrim tipis transparan (bukan
 * bg-primary solid + pola ikan) supaya halaman di baliknya tetap kelihatan --
 * popup ini cuma menumpuk di atas halaman, bukan berpindah ke "halaman" lain.
 *
 * Dua kolom: foto di kiri, teks (nama/jabatan/deskripsi) di kanan. Kotak
 * foto mengikuti rasio foto tim dari CMS (2/3) dan lebarnya diturunkan dari
 * tinggi modal (`h-full` + `aspect-[2/3]`), jadi bingkainya pas dengan
 * foto. `object-cover` (bukan contain) supaya foto selalu mengisi penuh
 * bingkai tanpa celah kosong di sisi kiri/kanan; untuk foto 2/3 tidak ada
 * yang terpotong, foto dengan rasio lain cuma terpotong sedikit di
 * tepinya (ditambat ke atas supaya wajah aman). Karena itu modalnya diberi
 * tinggi tetap di lg+ (bukan tinggi mengikuti isi). Kalau deskripsinya
 * panjang, yang scroll HANYA kolom teks (overflow-y-auto di kolom itu,
 * bukan di seluruh modal) -- foto tetap diam di tempatnya. Di bawah lg
 * kolomnya ditumpuk (dua kolom terlalu sempit untuk teks): foto setinggi
 * tetap di atas, teks yang scroll di bawahnya.
 *
 * Kotak foto + `fill` itu wajib, bukan pilihan gaya: `member.image`
 * datang sebagai URL absolut CMS (string), dan next/image tidak tahu
 * dimensi intrinsik gambar remote -- tanpa `fill` (atau width/height
 * eksplisit) render-nya gagal dengan "missing required width property".
 * Pola yang sama dipakai kartu tim dan MilestoneCard.
 */
export function TeamProfileModal({
  isOpen,
  member,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  // Sama seperti TeamProfileButton: image URL absolut dari CMS (photo_url),
  // null kalau anggota itu belum punya foto -- kartu profil lewat blok foto
  // (§4j), bukan menampilkan kotak next/image kosong.
  member: { image: StaticImageData | string | null; name: string; position: string; description: string };
  closeLabel: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={member.name}
      className="fixed inset-0 z-50 isolate flex items-center justify-center overflow-y-auto bg-fg/60 p-4 sm:p-10"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-lg bg-bg shadow-2xl lg:h-[min(36rem,100%)] lg:max-w-5xl lg:flex-row"
        onClick={(event) => event.stopPropagation()}
      >
        {member.image ? (
          <div className="relative mx-auto aspect-[2/3] h-72 shrink-0 lg:mx-0 lg:h-full">
            <Image
              src={member.image}
              alt=""
              aria-hidden
              fill
              // Sengaja 2x lebar tampil (24rem/12rem): dengan ukuran pas,
              // browser memilih varian ~384px yang terlihat lembek untuk foto
              // close-up wajah. quality 90 (bukan default 75) karena kompresi
              // AVIF/WebP menghaluskan detail rambut/dedaunan -- nilai ini
              // harus ada di images.qualities next.config.ts.
              sizes="(min-width: 1024px) 48rem, 24rem"
              quality={90}
              className="object-cover object-top"
            />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-6 lg:px-10 lg:py-10">
          <p className="pe-10 text-xl font-bold text-primary md:text-2xl">{member.name}</p>
          <p className="text-base font-semibold text-secondary md:text-lg">{member.position}</p>
          {/* description = bio CMS (HTML tersanitasi di lib/content/source.ts)
              atau jabatan sebagai fallback lama -- getBodyParagraphs
              menangani keduanya sama seperti body artikel di
              /berita/[slug]. */}
          {getBodyParagraphs(member.description).map((paragraph, index) => (
            <p
              key={index}
              className="mt-2 text-justify text-sm leading-relaxed text-muted md:text-base"
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="tap-target absolute end-3 top-3 z-10 flex items-center justify-center rounded-full bg-bg text-fg shadow-md hover:opacity-80"
        >
          <Icon id="close" />
          <span className="sr-only">{closeLabel}</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
