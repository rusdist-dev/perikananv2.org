'use client';

import Image, { type StaticImageData } from 'next/image';
import { useState } from 'react';
import { AppLink } from '@/components/ui/AppLink';
import { DownloadGateModal, type DownloadGateLabels } from '@/components/publications/DownloadGateModal';

type Publication = {
  // Sama seperti PublicationSlide di PublicationsSlider.tsx.
  image: StaticImageData | string | null;
  category: string | null;
  title: string;
  pdfUrl: string | null;
  cmsId: number | null;
};

/**
 * Sama seperti PublicationsSlider di /discover/publications: "Download"
 * membuka DownloadGateModal -- nama/email wajib diisi dulu, lalu CMS mengirim
 * tautan unduhannya ke email pengunjung (lihat komentar di modalnya).
 */
export function HomePublicationsGrid({
  publications,
  downloadLabel,
  closeLabel,
  downloadGateLabels,
}: {
  publications: Publication[];
  downloadLabel: string;
  closeLabel: string;
  downloadGateLabels: DownloadGateLabels;
}) {
  const [downloadIndex, setDownloadIndex] = useState<number | null>(null);
  const downloadPublication = downloadIndex !== null ? publications[downloadIndex] : null;

  return (
    <>
      <DownloadGateModal
        isOpen={downloadPublication !== null}
        publicationId={downloadPublication?.cmsId ?? null}
        pdfUrl={downloadPublication?.pdfUrl ?? null}
        title={downloadPublication?.title ?? ''}
        downloadLabel={downloadLabel}
        labels={downloadGateLabels}
        closeLabel={closeLabel}
        onClose={() => setDownloadIndex(null)}
      />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {publications.map((publication, index) => (
          <article key={index} className="flex flex-col border border-border">
            {publication.image ? (
              <div className="relative aspect-[3/4]">
                <Image
                  src={publication.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary">{publication.category}</p>
              <h3 className="text-base font-semibold text-primary">{publication.title}</h3>
              {/* Download membuka DownloadGateModal (nama/email wajib diisi
                  dulu, tautannya dikirim CMS lewat email -- lihat komentar di
                  modalnya), BUKAN <a> langsung ke pdfUrl seperti
                  sebelumnya. §4j: publikasi yang `pdfUrl`-nya masih null
                  tetap href="#" apa adanya. */}
              <div className="mt-auto flex gap-2 pt-2">
                {publication.pdfUrl ? (
                  <button
                    type="button"
                    onClick={() => setDownloadIndex(index)}
                    className="min-w-0 flex-1 truncate rounded-md border border-primary px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary hover:text-primary-fg"
                  >
                    {downloadLabel}
                  </button>
                ) : (
                  <AppLink
                    href="#"
                    className="min-w-0 flex-1 truncate rounded-md border border-primary px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary hover:text-primary-fg"
                  >
                    {downloadLabel}
                  </AppLink>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
