'use client';

import { useState } from 'react';
import { PdfViewerModal } from '@/components/publications/PdfViewerModal';

/**
 * Dua tombol kartu Featured Publication: Download PDF (unduhan langsung
 * lewat <a download>, BUKAN AppLink -- berkas publik seperti ini tidak boleh
 * diberi prefiks locale, sama seperti PdfViewerModal yang menunjuk pdfUrl
 * langsung ke iframe) dan Read Online (membuka PdfViewerModal yang sama
 * dengan kartu publikasi lain).
 */
export function FeaturedPublicationActions({
  pdfUrl,
  title,
  downloadFileName,
  unavailableLabel,
  closeLabel,
}: {
  pdfUrl: string;
  title: string;
  downloadFileName: string;
  unavailableLabel: string;
  closeLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PdfViewerModal
        isOpen={isOpen}
        pdfUrl={pdfUrl}
        title={title}
        unavailableLabel={unavailableLabel}
        closeLabel={closeLabel}
        onClose={() => setIsOpen(false)}
      />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a
          href={pdfUrl}
          download={downloadFileName}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-fg/15 px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary-fg hover:bg-primary-fg/25"
        >
          Download PDF &darr;
        </a>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary hover:opacity-90"
        >
          Read Online &#8599;
        </button>
      </div>
    </>
  );
}
