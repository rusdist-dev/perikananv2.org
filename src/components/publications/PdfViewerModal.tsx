'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ikanBg2 from '@/assets/banner/ornament4.png';
import { Icon } from '@/components/ui/Icon';

/**
 * Bukan pdf.js atau viewer buatan sendiri -- `pdfUrl` diserahkan begitu saja
 * ke <iframe>. Chrome dan Firefox sudah merender toolbar PDF-nya sendiri di
 * dalam iframe (nomor halaman, zoom, download, print, menu titik tiga), jadi
 * membangunnya ulang di sini hanya menduplikasi sesuatu yang browser berikan
 * gratis. Bagian yang benar-benar kita kendalikan cuma bingkai di sekitarnya:
 * backdrop dan tombol tutup.
 *
 * `pdfUrl` sengaja bertipe `string | null` -- belum ada satu pun berkas PDF
 * sungguhan di proyek ini (lihat komentar §4j di kartu publikasi). Modal ini
 * dibangun supaya siap dipasang begitu berkasnya ada; tombol "Read" pemanggil
 * TIDAK disambungkan ke sini dulu, tetap href="#" mengikuti pola yang sama.
 *
 * Portal ke document.body, bukan dirender di tempat pemanggilnya berada.
 * Setiap halaman di situs ini membungkus kontennya dengan
 * `relative isolate` (lihat AchievementsPage, PublicationsPage, dst) supaya
 * ornamen dekoratifnya tidak bocor ke section lain -- tapi `isolate` itu
 * membuat stacking context baru, dan `position: fixed` TIDAK melompati
 * stacking context leluhurnya walau ia melompati containing block-nya.
 * Modal yang dirender di dalam salah satu div itu akan terjebak z-index-nya
 * di BAWAH panel navigasi (z-40, fixed langsung di body), tak peduli
 * `z-50`-nya sendiri. Portal ke body menaruhnya sebagai saudara panel
 * navigasi, bukan cucu jauhnya, jadi z-50 akhirnya benar-benar dibandingkan
 * melawan z-40 milik panel.
 */
export function PdfViewerModal({
  isOpen,
  pdfUrl,
  title,
  unavailableLabel,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  pdfUrl: string | null;
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 isolate flex items-center justify-center overflow-hidden bg-primary p-4 sm:p-10"
      onClick={onClose}
    >
      {/* Pola ikan yang sama dengan hero /berita (NewsHero): abu-abu di atas
          putih, dibalik lewat invert + mix-blend-screen jadi guratan putih di
          atas biru -- dipakai lagi di sini alih-alih mengarang tekstur baru. */}
      <Image
        src={ikanBg2}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="pointer-events-none -z-10 object-cover invert mix-blend-screen select-none"
      />

      <div
        className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-bg shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {pdfUrl ? (
          <iframe src={pdfUrl} title={title} className="h-full w-full border-0" />
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
