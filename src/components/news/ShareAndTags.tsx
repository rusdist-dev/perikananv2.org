'use client';

import { useState } from 'react';

/**
 * Salin tautan benar-benar berfungsi (Clipboard API, dibaca dari
 * `window.location.href` saat diklik -- bukan URL yang dirakit di server,
 * supaya selalu sama dengan alamat yang sedang dibuka pembaca). Bagikan
 * memakai Web Share API kalau tersedia (kebanyakan browser mobile), dan
 * jatuh ke salin tautan kalau tidak -- desktop Chrome/Firefox belum
 * mengimplementasikannya.
 */
export function ShareAndTags({
  heading,
  shareLabel,
  copyLabel,
  copiedLabel,
  sortLabels,
  tags,
}: {
  heading: string;
  shareLabel: string;
  copyLabel: string;
  copiedLabel: string;
  /** Sama seperti tombol urutkan di /berita (disabled + alasan yang sama):
   *  belum ada backend yang benar-benar mengurutkan komentar/artikel terkait
   *  di halaman ini, jadi kontrolnya menyatakan diri belum aktif alih-alih
   *  berpura-pura bisa mengurutkan. */
  sortLabels: { newest: string; oldest: string; mostRead: string };
  tags: string[];
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch {
        // Pengguna membatalkan dialog berbagi -- bukan kegagalan yang perlu ditangani.
      }
      return;
    }
    await copyLink();
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6">
      <h2 className="text-lg font-bold text-primary">{heading}</h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={share}
          className="rounded-full border border-primary px-5 py-1.5 text-xs font-bold tracking-wide text-primary uppercase hover:bg-primary hover:text-primary-fg"
        >
          {shareLabel}
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full border border-primary px-5 py-1.5 text-xs font-bold tracking-wide text-primary uppercase hover:bg-primary hover:text-primary-fg"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[sortLabels.newest, sortLabels.oldest, sortLabels.mostRead].map((label) => (
          <button
            key={label}
            type="button"
            disabled
            className="rounded-full border border-secondary px-5 py-1.5 text-sm font-medium text-secondary disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
