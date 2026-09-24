'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';

/**
 * Gerbang unduhan: nama + email wajib diisi sebelum PDF benar-benar terunduh.
 * Sama pola portal-nya dengan TeamProfileModal/PdfViewerModal (lihat komentar
 * di PdfViewerModal soal kenapa harus createPortal ke document.body), dan
 * scrim-nya (bg-fg/60, kartu rounded-lg mengambang) mengikuti TeamProfileModal
 * -- popup ini menumpuk di atas halaman, bukan berpindah ke "halaman" lain
 * seperti PdfViewerModal/VideoModal.
 *
 * CMS penerima formulir ini belum siap (lihat AGENTS.md konteks proyek) --
 * submit di sini HANYA menjalankan unduhan berkasnya sendiri lewat <a
 * download> yang dibuat & diklik terprogram; nama/email TIDAK dikirim ke
 * mana pun. Begitu endpoint CMS-nya ada, handleSubmit ini satu-satunya
 * tempat yang perlu disambungkan ke pemanggilnya (fetch/POST), bukan
 * pemanggil modal (FeaturedPublicationActions/PublicationsSlider).
 */
export function DownloadGateModal({
  isOpen,
  pdfUrl,
  downloadFileName,
  title,
  downloadLabel,
  description,
  nameLabel,
  emailLabel,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  pdfUrl: string | null;
  downloadFileName?: string;
  title: string;
  downloadLabel: string;
  description: string;
  nameLabel: string;
  emailLabel: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form dikosongkan tiap kali modal dibuka lagi -- bukan cuma ditutup --
  // supaya pengunjung berikutnya (atau dokumen lain) tidak mewarisi isian
  // orang/dokumen sebelumnya.
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || !pdfUrl) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // <a download> terprogram, bukan href statis di JSX -- tombol ini
    // sekaligus tombol submit form (validasi required nama/email jalan
    // dulu), jadi unduhan berkasnya baru boleh terjadi di sini.
    const link = document.createElement('a');
    link.href = pdfUrl!;
    link.setAttribute('download', downloadFileName ?? '');
    document.body.appendChild(link);
    link.click();
    link.remove();

    onClose();
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${downloadLabel} ${title}`}
      className="fixed inset-0 z-50 isolate flex items-center justify-center overflow-y-auto bg-fg/60 p-4 sm:p-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-bg p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="pe-8 text-lg font-bold text-primary">
          {downloadLabel} {title}
        </h2>
        <p className="mt-3 text-sm text-muted">{description}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="download-gate-name"
              className="text-xs font-bold uppercase tracking-wide text-muted"
            >
              {nameLabel}
            </label>
            <input
              id="download-gate-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="download-gate-email"
              className="text-xs font-bold uppercase tracking-wide text-muted"
            >
              {emailLabel}
            </label>
            <input
              id="download-gate-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90"
          >
            {downloadLabel}
          </button>
        </form>

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
