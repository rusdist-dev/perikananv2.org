'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

export type SearchableOption = {
  /** Yang disimpan sebagai state pemanggil. Bukan `label` -- label berubah saat
   *  ejaannya diperbaiki, dan pilihan yang tersimpan tidak boleh ikut lepas. */
  value: string;
  /** Baris pertama: yang dicari orang. */
  label: string;
  /** Baris kedua: konteks yang membedakan dua label bernama mirip. */
  description: string;
};

type SearchableSelectProps = {
  /** Teks <label>. WAJIB: input tanpa label terkait hanya dibacakan pembaca
   *  layar sebagai "combobox", tanpa petunjuk isinya apa. */
  label: string;
  options: readonly SearchableOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Muncul di bawah input dan ikut dibacakan lewat aria-describedby. */
  hint?: string;
  emptyLabel?: string;
  clearLabel?: string;
  /** Cetakan pengumuman jumlah hasil untuk pembaca layar. */
  resultsLabel?: (count: number) => string;
  className?: string;
};

/** Membuang diakritik dan menyeragamkan kapital, supaya "Bali" cocok dengan
 *  "bali" dan nama berdiakritik tetap ketemu saat diketik polos. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Combobox dengan penyaringan teks, mengikuti pola ARIA 1.2 "combobox with
 * listbox popup".
 *
 * Kenapa bukan `<select>`: `<select>` tidak bisa disaring, dan `<option>`-nya
 * cuma boleh berisi teks datar -- sementara tiap opsi di sini dua baris (nama +
 * wilayahnya), dan baris kedua itulah yang membedakan nama-nama yang mirip.
 *
 * Kenapa tanpa pustaka: satu-satunya paket headless yang sudah ada di proyek
 * ini adalah @radix-ui/react-dialog; combobox-nya paket lain lagi. Pola di
 * bawah -- fokus TETAP di input, baris aktif ditunjuk aria-activedescendant --
 * muat dalam satu berkas dan tidak menambah bundle.
 */
export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  hint,
  emptyLabel = 'Tidak ada hasil',
  clearLabel = 'Hapus pilihan',
  resultsLabel = (count) => `${count} pilihan tersedia`,
  className,
}: SearchableSelectProps) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const listId = `${reactId}-list`;
  const hintId = `${reactId}-hint`;
  const optionId = (index: number) => `${reactId}-opt-${index}`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  // Isi input mengikuti pilihan yang datang dari LUAR juga -- misalnya saat
  // induknya mereset pilihan -- bukan cuma dari klik di daftar ini.
  useEffect(() => {
    setQuery(selected ? selected.label : '');
  }, [selected]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());

    // Setelah memilih, isi input SAMA PERSIS dengan label pilihan. Kalau itu
    // ikut menyaring, membuka daftar lagi cuma memperlihatkan satu baris --
    // pilihan yang sedang aktif -- dan menggantinya jadi mustahil tanpa
    // mengosongkan teksnya lebih dulu.
    if (!q || (selected && normalize(selected.label) === q)) return options;

    // Dipecah per kata, bukan dicocokkan utuh: "les bali" harus menemukan Desa
    // Les di Bali, padahal kedua kata itu tidak pernah berdampingan di data.
    const terms = q.split(/\s+/);
    return options.filter((option) => {
      const haystack = normalize(`${option.label} ${option.description}`);
      return terms.every((term) => haystack.includes(term));
    });
  }, [options, query, selected]);

  // Daftar yang menyusut membuat indeks lama menunjuk baris yang sudah hilang,
  // dan aria-activedescendant ikut menunjuk id yang tak ada lagi di DOM.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const close = () => {
    setOpen(false);
    setQuery(selected ? selected.label : '');
  };

  const commit = (option: SearchableOption) => {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
    inputRef.current?.focus();
  };

  const clear = () => {
    onChange(null);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (filtered.length === 0) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((index) => (index + step + filtered.length) % filtered.length);
        return;
      }
      case 'Home':
      case 'End': {
        if (!open || filtered.length === 0) return;
        event.preventDefault();
        setActiveIndex(event.key === 'Home' ? 0 : filtered.length - 1);
        return;
      }
      case 'Enter': {
        if (!open) return;
        const option = filtered[activeIndex];
        if (!option) return;
        // preventDefault baru dipanggil SETELAH ada opsi yang benar-benar
        // dipilih; kalau tidak, Enter di dalam form tidak pernah bisa
        // mengirimkan form itu.
        event.preventDefault();
        commit(option);
        return;
      }
      case 'Escape': {
        if (!open) return;
        event.preventDefault();
        close();
        return;
      }
      default:
    }
  };

  return (
    <div
      className={cn('relative', className)}
      // Ditutup saat fokus benar-benar KELUAR dari komponen. Pendeteksi
      // klik-di-luar pada document akan meleset untuk navigasi keyboard: Tab
      // memindahkan fokus tanpa pernah menghasilkan klik.
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        close();
      }}
    >
      <label
        htmlFor={inputId}
        className="block text-xs font-bold uppercase tracking-wider text-muted"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <Icon
          id="search"
          className="pointer-events-none absolute inset-y-0 start-3 my-auto text-base text-muted"
        />

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={hint ? hintId : undefined}
          aria-activedescendant={open && filtered[activeIndex] ? optionId(activeIndex) : undefined}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          // Fokus pada input yang sudah berisi pilihan menyorot teksnya, jadi
          // mengetik langsung MENGGANTI -- bukan menyambung jadi "LesArborek".
          onFocus={(event) => event.target.select()}
          onClick={() => setOpen(true)}
          className="w-full rounded-md border border-border bg-bg py-2.5 ps-10 pe-11 text-sm text-fg placeholder:text-muted"
        />

        {selected ? (
          <button
            type="button"
            onClick={clear}
            aria-label={clearLabel}
            className="absolute inset-y-0 end-1 my-auto grid size-9 place-items-center rounded-md text-muted hover:text-fg"
          >
            <Icon id="close" className="text-sm" />
          </button>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="mt-2 text-xs text-muted">
          {hint}
        </p>
      ) : null}

      {/* Menyusutnya daftar adalah umpan balik yang murni visual. Baris ini
          yang menyampaikan hasil pencarian ke pembaca layar. */}
      <p role="status" aria-live="polite" className="sr-only">
        {open ? resultsLabel(filtered.length) : ''}
      </p>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={label}
        hidden={!open}
        // Mousedown pada daftar MEMBUANG fokus dari input lebih dulu, yang
        // memicu onBlur di atas dan menutup daftar sebelum click sempat
        // terjadi -- opsinya jadi tidak bisa diklik sama sekali.
        onMouseDown={(event) => event.preventDefault()}
        className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-bg py-1 shadow-lg"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-2.5 text-sm text-muted">{emptyLabel}</li>
        ) : (
          filtered.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={option.value === value}
              data-active={index === activeIndex || undefined}
              onClick={() => commit(option)}
              onMouseMove={() => setActiveIndex(index)}
              className="cursor-pointer px-3 py-2 data-[active]:bg-surface"
            >
              {/* Nama desa satu-satunya yang tebal dan gelap: itu yang dicari,
                  sisanya cuma pembeda saat ada nama yang mirip. */}
              <span className="block text-sm font-semibold text-primary">{option.label}</span>
              <span className="mt-0.5 block text-xs text-muted">{option.description}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
