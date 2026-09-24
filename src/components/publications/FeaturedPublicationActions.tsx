'use client';

import { useState } from 'react';
import { DownloadGateModal } from '@/components/publications/DownloadGateModal';
import { PdfViewerModal } from '@/components/publications/PdfViewerModal';

/**
 * Dua tombol kartu Featured Publication: Download PDF (membuka
 * DownloadGateModal -- nama/email wajib diisi dulu sebelum <a download>
 * yang sesungguhnya dijalankan di sana, lihat komentar di modalnya) dan Read
 * Online (membuka PdfViewerModal yang sama dengan kartu publikasi lain).
 */
export function FeaturedPublicationActions({
  pdfUrl,
  title,
  downloadFileName,
  downloadLabel,
  readLabel,
  unavailableLabel,
  closeLabel,
  downloadGateDescription,
  downloadGateNameLabel,
  downloadGateEmailLabel,
}: {
  pdfUrl: string;
  title: string;
  downloadFileName: string;
  downloadLabel: string;
  readLabel: string;
  unavailableLabel: string;
  closeLabel: string;
  downloadGateDescription: string;
  downloadGateNameLabel: string;
  downloadGateEmailLabel: string;
}) {
  const [isReadOpen, setIsReadOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  return (
    <>
      <PdfViewerModal
        isOpen={isReadOpen}
        pdfUrl={pdfUrl}
        title={title}
        unavailableLabel={unavailableLabel}
        closeLabel={closeLabel}
        onClose={() => setIsReadOpen(false)}
      />
      <DownloadGateModal
        isOpen={isDownloadOpen}
        pdfUrl={pdfUrl}
        downloadFileName={downloadFileName}
        title={title}
        downloadLabel={downloadLabel}
        description={downloadGateDescription}
        nameLabel={downloadGateNameLabel}
        emailLabel={downloadGateEmailLabel}
        closeLabel={closeLabel}
        onClose={() => setIsDownloadOpen(false)}
      />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setIsDownloadOpen(true)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-fg/15 px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:bg-primary-fg/25"
        >
          {downloadLabel} &darr;
        </button>
        <button
          type="button"
          onClick={() => setIsReadOpen(true)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-90"
        >
          {readLabel} &#8599;
        </button>
      </div>
    </>
  );
}
