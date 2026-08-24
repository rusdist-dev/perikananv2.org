import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/cn';

export type ProgramCrossCuttingProps = {
  eyebrow: string;
  title: string;
  description: string;
  activityLabel: string;
  activities: string[];
  /** 'blue' (default): latar bg-primary, teks putih -- dipakai saat section
   *  ini berdiri sendiri di antara section putih lain (mis. Ocean Accounts,
   *  Sustainable Fisheries). 'white': latar putih, teks biru -- dipakai saat
   *  section sebelumnya (mis. Work Area di Marine Conservation) sudah
   *  berlatar biru, supaya dua section biru tidak menumpuk tanpa jahitan. */
  variant?: 'blue' | 'white';
};

/** Pita penuh untuk program lintas-isu yang disebut di beberapa halaman
 *  /program/* sekaligus (mis. NUSACORE) -- lebih sederhana dari
 *  ProgramObjectives karena hanya satu paragraf pengantar + satu daftar KEY
 *  ACTIVITY, tanpa ikon atau kartu objectives. */
export function ProgramCrossCutting({
  eyebrow,
  title,
  description,
  activityLabel,
  activities,
  variant = 'blue',
}: ProgramCrossCuttingProps) {
  const isWhite = variant === 'white';

  return (
    <div className={isWhite ? 'bg-bg text-primary' : 'bg-primary text-primary-fg'}>
      <Container className="page-gutter py-12 lg:py-16 lg:pe-(--spacing-panel-gutter)">
        <p
          className={cn(
            'mb-3 text-xs font-bold uppercase tracking-wider',
            isWhite ? 'text-secondary' : 'text-primary-fg/70',
          )}
        >
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{title}</h2>
        <p
          className={cn(
            'mt-4 max-w-4xl text-justify text-sm leading-relaxed md:text-base',
            isWhite ? 'text-primary/85' : 'text-primary-fg/90',
          )}
        >
          {description}
        </p>
        <p
          className={cn(
            'mt-8 text-xs font-bold uppercase tracking-wider',
            isWhite ? 'text-secondary' : 'text-primary-fg/70',
          )}
        >
          {activityLabel}
        </p>
        <ul
          className={cn(
            'mt-3 flex max-w-4xl list-disc flex-col gap-2 ps-5 text-sm leading-relaxed md:text-base',
            isWhite
              ? 'text-primary/85 marker:text-secondary'
              : 'text-primary-fg/90 marker:text-primary-fg/70',
          )}
        >
          {activities.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
