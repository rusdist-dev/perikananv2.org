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
 * Foto di atas, teks (nama/jabatan/deskripsi) di bawahnya -- BUKAN
 * `object-cover` (yang memotong foto supaya pas mengisi kotak) tapi
 * `object-contain` di dalam kotak beraspek [3/4] (rasio kartu tim di
 * halaman our-team/about-us) supaya foto selalu tampil utuh tanpa
 * terpotong. Kalau deskripsinya panjang, yang scroll cuma isi modalnya
 * (overflow-y-auto) -- ukuran foto tidak ikut berubah.
 *
 * Kotak beraspek + `fill` itu wajib, bukan pilihan gaya: `member.image`
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
        className="relative flex max-h-full w-full max-w-md flex-col overflow-y-auto rounded-lg bg-bg shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {member.image ? (
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={member.image}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 640px) 28rem, 100vw"
              className="object-contain"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2 p-6">
          <p className="text-lg font-bold text-primary">{member.name}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">{member.position}</p>
          {/* description = bio CMS (HTML tersanitasi di lib/content/source.ts)
              atau jabatan sebagai fallback lama -- getBodyParagraphs
              menangani keduanya sama seperti body artikel di
              /berita/[slug]. */}
          {getBodyParagraphs(member.description).map((paragraph, index) => (
            <p
              key={index}
              className="mt-2 text-sm leading-relaxed text-muted"
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
