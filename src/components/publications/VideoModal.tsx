'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ikanBg2 from '@/assets/banner/ornament4.png';
import { Icon } from '@/components/ui/Icon';

/**
 * Sama pola portal-nya dengan PdfViewerModal (lihat komentar di sana soal
 * kenapa harus createPortal ke document.body, bukan dirender di tempat
 * pemanggilnya berada -- singkatnya: `isolate` di pembungkus tiap halaman
 * membuat stacking context baru yang menjebak z-index modal di bawah panel
 * navigasi kalau tidak diportalkan).
 *
 * `videoUrl` berupa URL YouTube apa adanya (mis. dari VIDEOS di
 * /discover/publications), bukan URL embed -- diubah ke bentuk embed di sini
 * lewat toEmbedUrl. Video yang href-nya belum berupa link YouTube nyata
 * (masih "#", ikuti §4j) mendapat null dan modal menampilkan pesan "belum
 * tersedia", sama seperti PdfViewerModal untuk pdfUrl null.
 */
function toEmbedUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.hostname === 'youtu.be') {
      const videoId = url.pathname.slice(1);
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }
    if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
      const videoId = url.searchParams.get('v');
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoModal({
  isOpen,
  videoUrl,
  title,
  unavailableLabel,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  videoUrl: string | null;
  title: string;
  unavailableLabel: string;
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

  const embedUrl = videoUrl ? toEmbedUrl(videoUrl) : null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 isolate flex items-center justify-center overflow-hidden bg-primary p-4 sm:p-10"
      onClick={onClose}
    >
      <Image
        src={ikanBg2}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="pointer-events-none -z-10 object-cover invert mix-blend-screen select-none"
      />

      <div
        className="relative flex aspect-video w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-bg shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-1 p-10 text-center">
            <p className="text-sm text-muted">{unavailableLabel}</p>
          </div>
        )}

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
