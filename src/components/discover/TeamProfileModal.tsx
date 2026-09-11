'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';

/**
 * Sama pola portal-nya dengan PdfViewerModal/VideoModal (lihat komentar di
 * PdfViewerModal soal kenapa harus createPortal ke document.body).
 *
 * Beda dari kedua modal itu: overlay-nya scrim tipis transparan (bukan
 * bg-primary solid + pola ikan) supaya halaman di baliknya tetap kelihatan --
 * popup ini cuma menumpuk di atas halaman, bukan berpindah ke "halaman" lain.
 *
 * Foto di kolom kiri, teks (nama/jabatan/deskripsi) di kolom kanan -- BUKAN
 * `object-cover` (yang memotong foto supaya pas mengisi kotak) tapi
 * `object-contain` di dalam kotak beraspek [2/3] (rasio umum foto tim di
 * proyek ini) supaya foto selalu tampil utuh tanpa terpotong. Kalau
 * deskripsinya panjang, yang scroll cuma kolom teksnya sendiri
 * (overflow-y-auto) -- ukuran foto tidak ikut berubah.
 */
export function TeamProfileModal({
  isOpen,
  member,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  member: { image: StaticImageData; name: string; role: string; description: string };
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
        <Image
          src={member.image}
          alt=""
          aria-hidden
          sizes="(min-width: 640px) 28rem, 100vw"
          className="h-auto w-full"
        />

        <div className="flex flex-col gap-2 p-6">
          <p className="text-lg font-bold text-primary">{member.name}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">{member.role}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{member.description}</p>
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
