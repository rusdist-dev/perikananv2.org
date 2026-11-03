'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { submitDownloadLead, submitPublicationDownload } from '@/app/[locale]/actions';
import { Icon } from '@/components/ui/Icon';
import type { ContactFailure } from '@/lib/contact';

/** Teks gerbang unduhan, dikumpulkan jadi satu objek supaya pemanggil
 *  (HomePublicationsGrid/PublicationsSlider/FeaturedPublicationActions) cukup
 *  meneruskan satu props, bukan tujuh. */
export type DownloadGateLabels = {
  description: string;
  name: string;
  email: string;
  /** Ditampilkan setelah CMS menerima permintaan -- tautan dikirim ke email. */
  success: string;
  errorInvalid: string;
  errorRateLimit: string;
  errorUnavailable: string;
};

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; reason: ContactFailure };

/**
 * Gerbang unduhan: nama + email wajib diisi sebelum PDF didapat.
 * Sama pola portal-nya dengan TeamProfileModal/PdfViewerModal (lihat komentar
 * di PdfViewerModal soal kenapa harus createPortal ke document.body), dan
 * scrim-nya (bg-fg/60, kartu rounded-lg mengambang) mengikuti TeamProfileModal
 * -- popup ini menumpuk di atas halaman, bukan berpindah ke "halaman" lain
 * seperti PdfViewerModal/VideoModal.
 *
 * Dua jalur, ditentukan `publicationId`:
 *
 * - Ada (publikasi dari CMS): Server Action `submitPublicationDownload`
 *   (`POST /api/v1/publications/download`). CMS mengirim tautan berkasnya ke
 *   email pengunjung -- TIDAK ada unduhan di browser. Modal tetap terbuka
 *   dan menampilkan pesan sukses/galat dari CMS.
 * - null (dokumen statis seperti Featured Publication, atau mode lokal yang
 *   tidak punya ID CMS): jalur lama -- lead dicatat sebagai pesan kontak lewat
 *   `submitDownloadLead`, lalu berkasnya diunduh langsung.
 *
 * Server Action, bukan fetch langsung, karena kunci API CMS tidak boleh
 * sampai ke browser.
 */
export function DownloadGateModal({
  isOpen,
  publicationId,
  pdfUrl,
  downloadFileName,
  title,
  downloadLabel,
  labels,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  publicationId: number | null;
  pdfUrl: string | null;
  downloadFileName?: string;
  title: string;
  downloadLabel: string;
  labels: DownloadGateLabels;
  closeLabel: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const sending = status.kind === 'sending';

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
      setStatus({ kind: 'idle' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sending) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, sending]);

  if (!isOpen || !mounted || !pdfUrl) return null;

  function closeIfIdle() {
    if (!sending) onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    setStatus({ kind: 'sending' });

    if (publicationId !== null) {
      const website = new FormData(event.currentTarget).get('website');
      let result: Awaited<ReturnType<typeof submitPublicationDownload>>;
      try {
        result = await submitPublicationDownload({
          publicationId,
          name,
          email,
          website: typeof website === 'string' ? website : '',
        });
      } catch (error) {
        console.error('[gerbang unduhan] gagal meminta tautan unduhan:', error);
        result = { ok: false, reason: 'unavailable' };
      }
      setStatus(result.ok ? { kind: 'sent' } : { kind: 'error', reason: result.reason });
      return;
    }

    // Jalur tanpa ID CMS. Lead DIKIRIM DULU, unduhannya menyusul -- urutannya
    // penting: kalau `pdfUrl` lintas-origin, atribut `download` diabaikan dan
    // klik di bawah membuat halaman berpindah, ikut membatalkan Server Action
    // yang masih terbang. Kegagalannya sengaja TIDAK menghalangi unduhan: CMS
    // yang sedang mati bukan alasan menahan berkas yang jadi hak pengunjung.
    try {
      await submitDownloadLead({ name, email, title });
    } catch (error) {
      console.error('[gerbang unduhan] gagal mengirim data pengunjung:', error);
    }

    const link = document.createElement('a');
    link.href = pdfUrl!;
    link.setAttribute('download', downloadFileName ?? '');
    document.body.appendChild(link);
    link.click();
    link.remove();

    onClose();
  }

  const errorMessage =
    status.kind === 'error'
      ? {
          invalid: labels.errorInvalid,
          'rate-limit': labels.errorRateLimit,
          unavailable: labels.errorUnavailable,
        }[status.reason]
      : null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${downloadLabel} ${title}`}
      className="fixed inset-0 z-50 isolate flex items-center justify-center overflow-y-auto bg-fg/60 p-4 sm:p-10"
      onClick={closeIfIdle}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-bg p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="pe-8 text-lg font-bold text-primary">
          {downloadLabel} {title}
        </h2>

        {status.kind === 'sent' ? (
          <>
            <p role="status" className="mt-3 text-sm text-fg">
              {labels.success}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90"
            >
              {closeLabel}
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted">{labels.description}</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              {/* Honeypot -- pola yang sama dengan ContactForm: tersembunyi
                  dari pengunjung, bot yang mengisi semua field tertangkap di
                  CMS (tetap dijawab 201). */}
              <div aria-hidden className="hidden">
                <label htmlFor="download-gate-website">Website</label>
                <input id="download-gate-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="download-gate-name"
                  className="text-xs font-bold uppercase tracking-wide text-muted"
                >
                  {labels.name}
                </label>
                <input
                  id="download-gate-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
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
                  {labels.email}
                </label>
                <input
                  id="download-gate-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg"
                />
              </div>

              {errorMessage ? (
                <p role="alert" className="rounded-md border border-border px-4 py-3 text-sm text-fg">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={sending}
                aria-busy={sending}
                className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloadLabel}
              </button>
            </form>
          </>
        )}

        <button
          type="button"
          onClick={closeIfIdle}
          disabled={sending}
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
