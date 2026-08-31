import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Kartu adalah SATU-SATUNYA bingkai yang dipakai dasbor ini: kotak putih di
 *  atas latar --color-surface, border token, sudut --radius-lg. Kepala kartu
 *  memuat judul dan satuan/keterangan singkat; catatan kaki (`note`) memuat
 *  cara membacanya.
 *
 *  Kenapa `note` jadi prop, bukan sekadar <p> yang ditulis pemanggil: grafik
 *  tanpa keterangan cara baca adalah dekorasi. Menaruhnya di sini membuat
 *  setiap kartu baru punya tempat yang sudah jelas untuk kalimat itu, dan
 *  gayanya tidak menyimpang dari kartu di sebelahnya. */
export function ChartCard({
  title,
  meta,
  note,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  /** Baris kanan di kepala kartu: satuan, rentang waktu, atau jumlah sampel. */
  meta?: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        // min-w-0 wajib: kartu ini selalu jadi anak grid, dan anak grid
        // berukuran min-width:auto secara bawaan -- artinya isi yang lebar
        // (tabel matriks korelasi) MELEBARKAN selnya alih-alih menggulir di
        // dalam pembungkus overflow-x-auto-nya. Gejalanya bukan tabel yang
        // terpotong melainkan SELURUH halaman ikut bisa digeser ke samping di
        // lebar ponsel, jauh dari kartu yang menyebabkannya.
        'flex min-w-0 flex-col rounded-lg border border-border bg-bg p-5 md:p-6',
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-bold text-primary">{title}</h3>
        {meta ? <p className="font-mono text-xs text-muted">{meta}</p> : null}
      </div>

      <div className={cn('flex-1', bodyClassName)}>{children}</div>

      {note ? (
        <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </section>
  );
}

/** Label pemisah antar-kelompok kartu. Sengaja BUKAN <h2>: judul seksi
 *  dasbornya sudah satu <h2> di JogoLautDashboard, dan menaburkan <h2> per
 *  kelompok membuat garis besar halaman (yang dipakai pembaca layar untuk
 *  melompat) penuh judul sederajat yang sebenarnya bertingkat. */
export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 mt-10 text-xs font-bold uppercase tracking-wider text-secondary first:mt-0">
      {children}
    </p>
  );
}
