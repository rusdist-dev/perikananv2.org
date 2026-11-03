'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import {
  OSGAP_ECON,
  OSGAP_INDICATORS,
  OSGAP_STRESS,
  OSGAP_TALLY_IDS,
  type OsgapEconId,
  type OsgapIndicatorId,
  type OsgapTrend,
} from '@/data/osgap-saleh-bay';
import type { Locale } from '@/i18n/config';
import { getOsgapDictionary, type OsgapDictionary } from '@/i18n/dictionaries/osgap';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/number';

/**
 * Dua tampilan dasbor OSGAP -- kartu rapor dan risiko ekonomi -- beserta
 * tooltip rinciannya. Satu-satunya bagian halaman yang butuh JavaScript;
 * pembuka, lokasi studi, dan mitra dirender server di page.tsx.
 *
 * Kartu rapor sengaja mempertahankan bentuk matriks laporan aslinya: BARIS =
 * fungsi modal alam, KOLOM = jenis gap. Simetri itulah cara membacanya
 * ("baca satu baris untuk satu fungsi, satu kolom untuk satu gap"), jadi di
 * layar lebar sel-selnya tetap sejajar per baris; baru di ponsel matriksnya
 * dilipat jadi satu kolom berlabel.
 */

type SespiKind = 'up' | 'diag' | 'right' | 'down' | 'nc';
type ArrowKind = SespiKind | OsgapTrend;

/** Kelas literal, bukan disusun dari string: Tailwind hanya membangkitkan
 *  kelas yang tertulis utuh di sumber. Pita 0-1 gelap -> teks putih. */
const SESI_CLASS = [
  'bg-osgap-sesi-0 text-white',
  'bg-osgap-sesi-1 text-white',
  'bg-osgap-sesi-2 text-fg',
  'bg-osgap-sesi-3 text-fg',
  'bg-osgap-sesi-4 text-fg',
];

const ARROW_CLASS: Record<Exclude<ArrowKind, 'nc'>, string> = {
  up: 'text-osgap-trend-up',
  diag: 'text-osgap-trend-diag',
  right: 'text-osgap-trend-flat',
  down: 'text-osgap-trend-down',
  gup: 'text-osgap-trend-good',
  kup: 'text-fg',
};

function band(score: number): number {
  return score >= 80 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : score >= 20 ? 1 : 0;
}

function sespiKind(score: number | null): SespiKind {
  if (score === null) return 'nc';
  return score >= 95 ? 'up' : score >= 55 ? 'diag' : score >= 45 ? 'right' : 'down';
}

function Arrow({ kind, size = 24 }: { kind: Exclude<ArrowKind, 'nc'>; size?: number }) {
  const path =
    kind === 'diag' ? (
      <path d="M5 19L19 5M9 5h10v10" />
    ) : kind === 'right' ? (
      <path d="M3 12h17M14 5l7 7-7 7" />
    ) : kind === 'down' ? (
      <path d="M12 3v17M5 14l7 7 7-7" />
    ) : (
      <path d="M12 21V4M5 10l7-7 7 7" />
    );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('block shrink-0', ARROW_CLASS[kind])}
    >
      {path}
    </svg>
  );
}

function SespiIcon({ score, size, t }: { score: number | null; size?: number; t: OsgapDictionary }) {
  const kind = sespiKind(score);
  return kind === 'nc' ? (
    <span className="rounded-sm border-[1.5px] border-muted px-1 text-[0.625rem] leading-tight text-muted">
      {t.nc}
    </span>
  ) : (
    <Arrow kind={kind} size={size} />
  );
}

function ScoreSquare({ score, small }: { score: number; small?: boolean }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center font-semibold tabular-nums',
        small ? 'size-[2.125rem] rounded-sm text-xs' : 'size-11 rounded-md text-sm',
        SESI_CLASS[band(score)],
      )}
    >
      {Math.round(score)}
    </span>
  );
}

/* ---------------------------------------------------------------- tooltip */

type TipTarget = { kind: 'indicator'; id: OsgapIndicatorId } | { kind: 'econ'; id: OsgapEconId };

type TipState = { target: TipTarget; anchor: HTMLElement; pinned: boolean };

function useTip() {
  const [tip, setTip] = useState<TipState | null>(null);

  const open = useCallback((target: TipTarget, anchor: HTMLElement, pinned = false) => {
    setTip({ target, anchor, pinned });
  }, []);
  const close = useCallback(() => setTip(null), []);

  // Escape menutup; klik di luar pemicu menutup tooltip yang dipasak; gulir
  // menutup tooltip hover (posisinya sudah tidak menempel pemicunya lagi).
  useEffect(() => {
    if (!tip) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTip(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (!tip.anchor.contains(event.target as Node)) setTip(null);
    };
    const onScroll = () => {
      if (!tip.pinned) setTip(null);
      else setTip((current) => (current ? { ...current } : current));
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [tip]);

  /** Props pemicu: hover untuk tetikus, fokus untuk keyboard, ketuk untuk
   *  sentuh (dan memasak tooltip supaya tidak hilang saat jari diangkat). */
  const triggerProps = (target: TipTarget) => ({
    onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && !tip?.pinned) open(target, event.currentTarget);
    },
    onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && !tip?.pinned) close();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (!tip?.pinned) open(target, event.currentTarget);
    },
    onBlur: () => {
      if (!tip?.pinned) close();
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      const same = tip?.pinned && tip.anchor === event.currentTarget;
      if (same) close();
      else open(target, event.currentTarget, true);
    },
    'aria-describedby': tip && tip.target.id === target.id && tip.target.kind === target.kind ? 'osgap-tip' : undefined,
  });

  return { tip, triggerProps };
}

function Tooltip({ tip, t }: { tip: TipState; t: OsgapDictionary }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = tip.anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tw = el.offsetWidth;
    const th = el.offsetHeight;
    let x = r.right + 12;
    let y = r.top;
    if (x + tw > vw - 12) x = r.left - tw - 12;
    if (x < 12) {
      x = Math.max(12, Math.min(vw - tw - 12, r.left));
      y = r.bottom + 10;
      if (y + th > vh - 12) y = r.top - th - 10;
    }
    y = Math.max(12, Math.min(y, vh - th - 12));
    setPos({ x, y });
  }, [tip]);

  return (
    <div
      ref={ref}
      id="osgap-tip"
      role="tooltip"
      style={{ left: pos?.x ?? 0, top: pos?.y ?? 0, visibility: pos ? 'visible' : 'hidden' }}
      className="pointer-events-none fixed z-50 w-[calc(100vw-2rem)] max-w-sm rounded-lg bg-primary p-4 text-sm leading-snug text-primary-fg shadow-xl"
    >
      {tip.target.kind === 'indicator' ? (
        <IndicatorTip id={tip.target.id} t={t} />
      ) : (
        <EconTip id={tip.target.id} t={t} />
      )}
    </div>
  );
}

function TipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-xs text-primary-fg/70">{label}</dt>
      <dd className="m-0">{children}</dd>
    </>
  );
}

const TIP_DL = 'grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 gap-y-1.5';
const TIP_SEP = <div className="col-span-full my-0.5 border-t border-primary-fg/20" />;

function Pill({ score }: { score: number }) {
  return (
    <span className={cn('me-1.5 inline-block rounded-sm px-1.5 text-xs font-semibold', SESI_CLASS[band(score)])}>
      {Math.round(score)}
    </span>
  );
}

function IndicatorTip({ id, t }: { id: OsgapIndicatorId; t: OsgapDictionary }) {
  const d = OSGAP_INDICATORS[id];
  const text: OsgapDictionary['indicators'][OsgapIndicatorId] & { title?: string } = t.indicators[id];
  const kind = sespiKind(d.sespi);
  return (
    <>
      <h4 className="text-base font-bold leading-tight">{text.title ?? text.name}</h4>
      <p className="mb-3 mt-1 text-primary-fg/75">{text.desc}</p>
      <dl className={TIP_DL}>
        <TipRow label={t.tipRef}>{text.ref}</TipRow>
        <TipRow label={t.tipTargetYear}>{d.targetYear}</TipRow>
        <TipRow label={t.tipTrend}>{text.trend}</TipRow>
        {TIP_SEP}
        <TipRow label={t.tipSesi(d.year)}>
          <Pill score={d.sesi} />
          {t.tipOf100}
        </TipRow>
        <TipRow label={t.tipSespi}>
          {d.sespi !== null ? (
            <span className="me-1.5 inline-block rounded-sm bg-primary-fg/20 px-1.5 text-xs font-semibold">
              {Math.round(d.sespi)}
            </span>
          ) : null}
          <b>{t.sespiLabel[kind]}</b>
          <br />
          {text.interp}
        </TipRow>
        {TIP_SEP}
        <TipRow label={t.tipInstitutions}>
          <span className="flex flex-wrap gap-1">
            {d.institutions.map((inst) => (
              <span key={inst} className="rounded-full border border-primary-fg/30 px-2 text-xs">
                {t.institutions[inst]}
              </span>
            ))}
          </span>
        </TipRow>
        <TipRow label={t.tipSource}>{d.source}</TipRow>
      </dl>
    </>
  );
}

function EconTip({ id, t }: { id: OsgapEconId; t: OsgapDictionary }) {
  const d = OSGAP_ECON[id];
  const text: OsgapDictionary['econ'][OsgapEconId] & { ref?: string } = t.econ[id];
  return (
    <>
      <h4 className="mb-2 text-base font-bold leading-tight">{text.name}</h4>
      <dl className={TIP_DL}>
        <TipRow label={t.tip2024}>
          <b>{text.v24}</b>
        </TipRow>
        <TipRow label={t.tip2025}>
          <b>{text.v25}</b> <span className="text-primary-fg/70">({text.change})</span>
        </TipRow>
        <TipRow label={t.tipStatus}>{text.status}</TipRow>
        {d.sesi !== null ? (
          <TipRow label={t.tipSesi2025}>
            <Pill score={d.sesi} />
            {t.tipReference} {text.ref}
          </TipRow>
        ) : null}
        {TIP_SEP}
        <TipRow label={t.tipRisk}>{text.risk}</TipRow>
      </dl>
      {d.projected ? <p className="mt-2 text-xs text-primary-fg/70">{t.tipProjected}</p> : null}
    </>
  );
}

/* ------------------------------------------------------------ report card */

type Trigger = ReturnType<typeof useTip>['triggerProps'];

function Tile({ id, t, trigger }: { id: OsgapIndicatorId; t: OsgapDictionary; trigger: Trigger }) {
  const d = OSGAP_INDICATORS[id];
  const text: { name: string; std?: string } = t.indicators[id];
  return (
    <button
      type="button"
      {...trigger({ kind: 'indicator', id })}
      className="grid w-full cursor-help grid-cols-[2.75rem_minmax(0,1fr)_1.875rem] items-center gap-2.5 rounded-md border border-border bg-bg px-2.5 py-2 text-start transition hover:-translate-y-px hover:border-fg"
    >
      <ScoreSquare score={d.sesi} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight text-fg">{text.name}</span>
        {text.std ? <span className="block text-xs italic leading-snug text-muted">{text.std}</span> : null}
        <span className="block text-[0.6875rem] text-muted">{d.year}</span>
      </span>
      <span className="grid place-items-center">
        <SespiIcon score={d.sespi} size={26} t={t} />
      </span>
    </button>
  );
}

function Group({
  title,
  std,
  ids,
  t,
  trigger,
}: {
  title: string;
  std: string;
  ids: OsgapIndicatorId[];
  t: OsgapDictionary;
  trigger: Trigger;
}) {
  return (
    <div className="rounded-md border border-border bg-bg px-2.5 pb-1.5 pt-2.5">
      <p className="text-sm font-semibold leading-tight text-fg">{title}</p>
      <p className="mb-1.5 text-xs italic text-muted">{std}</p>
      {ids.map((id) => {
        const d = OSGAP_INDICATORS[id];
        return (
          <button
            key={id}
            type="button"
            {...trigger({ kind: 'indicator', id })}
            className="grid w-full cursor-help grid-cols-[2.125rem_minmax(0,1fr)_1.625rem] items-center gap-2 rounded-sm border-t border-border px-1 py-1.5 text-start hover:bg-surface"
          >
            <ScoreSquare score={d.sesi} small />
            <span className="min-w-0">
              <span className="block text-xs leading-tight text-fg md:text-sm">{t.indicators[id].name}</span>
              <span className="block text-[0.6875rem] text-muted">{d.year}</span>
            </span>
            <span className="grid place-items-center">
              <SespiIcon score={d.sespi} size={22} t={t} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Label kolom yang hanya tampil di ponsel, saat kepala kolom disembunyikan. */
function MobileTag({ children, tone }: { children: ReactNode; tone: 'env' | 'soc' | 'gov' }) {
  return (
    <span
      className={cn(
        'text-[0.6875rem] font-semibold uppercase tracking-wider md:hidden',
        tone === 'env' ? 'text-osgap-env-ink' : tone === 'soc' ? 'text-osgap-soc-ink' : 'text-osgap-gov-ink',
      )}
    >
      {children}
    </span>
  );
}

const CELL = 'relative z-10 flex min-w-0 flex-col justify-center gap-2.5 p-3.5 max-md:mt-2 max-md:rounded-lg max-md:border';
const ENV = 'bg-osgap-env md:border-x md:border-osgap-env-line max-md:border-osgap-env-line';
const SOC = 'bg-osgap-soc md:border-x md:border-osgap-soc-line max-md:border-osgap-soc-line';
const GOV = 'bg-osgap-gov md:border-x md:border-osgap-gov-line max-md:border-osgap-gov-line';
const FN = 'relative z-10 flex items-center text-base font-bold leading-tight text-primary max-md:mt-4 max-md:border-t max-md:border-dashed max-md:border-border max-md:pt-4 md:col-start-1 md:ps-3.5';
const BAND = 'pointer-events-none z-20 col-span-3 col-start-1 -mx-1.5 my-1.5 hidden rounded-xl border-[1.5px] border-dashed border-muted/55 md:block';

function ReportCard({ t, trigger }: { t: OsgapDictionary; trigger: Trigger }) {
  const tile = (id: OsgapIndicatorId) => <Tile id={id} t={t} trigger={trigger} />;

  const tally = { up: 0, diag: 0, right: 0, down: 0, nc: 0 } satisfies Record<SespiKind, number>;
  OSGAP_TALLY_IDS.forEach((id) => tally[sespiKind(OSGAP_INDICATORS[id].sespi)]++);

  return (
    <section aria-labelledby="osgap-card-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="osgap-card-heading" className="text-xl font-semibold text-primary md:text-2xl">
            {t.cardHeading}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t.cardBody}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {(['up', 'diag', 'right', 'down', 'nc'] as const).map((kind) => (
            <li
              key={kind}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg py-1 pe-3 ps-2 text-xs"
            >
              {kind === 'nc' ? <SespiIcon score={null} t={t} /> : <Arrow kind={kind} size={16} />}
              <b className="tabular-nums">{tally[kind]}</b> {t.sespiLabel[kind].toLowerCase()}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="relative grid grid-cols-1 md:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1.25fr)] md:gap-x-3.5">
          {/* Kepala kolom */}
          <div className="hidden md:block" />
          <div className="hidden rounded-t-xl border-x border-t border-osgap-env-line bg-osgap-env px-4 pb-1.5 pt-3.5 text-center text-base font-bold text-osgap-env-ink md:block">
            {t.colEnv}
            <small className="block text-xs font-normal text-muted">{t.colEnvSub}</small>
          </div>
          <div className="hidden rounded-t-xl border-x border-t border-osgap-soc-line bg-osgap-soc px-4 pb-1.5 pt-3.5 text-center text-base font-bold text-osgap-soc-ink md:block">
            {t.colSoc}
            <small className="block text-xs font-normal text-muted">{t.colSocSub}</small>
          </div>

          {/* Baris 1: Sumber */}
          <div className={cn(FN, 'md:row-start-2')}>{t.rowSource}</div>
          <div className={cn(BAND, 'md:row-start-2')} />
          <div className={cn(CELL, ENV, 'md:col-start-2 md:row-start-2')}>
            <MobileTag tone="env">{t.tagEnv}</MobileTag>
            {tile('grouper')}
            {tile('snapper')}
          </div>
          <div className={cn(CELL, SOC, 'md:col-start-3 md:row-start-2')}>
            <MobileTag tone="soc">{t.tagSoc}</MobileTag>
            {tile('gva')}
          </div>

          {/* Baris 2: Kesejahteraan */}
          <div className={cn(FN, 'md:row-start-3')}>{t.rowWelfare}</div>
          <div className={cn(BAND, 'md:row-start-3')} />
          <div className={cn(CELL, ENV, 'max-md:hidden md:col-start-2 md:row-start-3')}>
            <p className="text-center text-sm italic text-muted">{t.notApplicable}</p>
          </div>
          <div className={cn(CELL, SOC, 'md:col-start-3 md:row-start-3 md:rounded-b-xl md:border-b')}>
            <MobileTag tone="soc">{t.tagSoc}</MobileTag>
            {tile('sra1')}
            {tile('sra2')}
            {tile('sra3')}
          </div>

          {/* Baris 3: Penunjang kehidupan */}
          <div className={cn(FN, 'md:row-start-4')}>{t.rowLife}</div>
          <div className={cn(BAND, 'md:row-start-4')} />
          <div className={cn(CELL, ENV, 'md:col-start-2 md:row-start-4')}>
            <MobileTag tone="env">{t.tagEnv}</MobileTag>
            {tile('coral')}
            {tile('seagrass')}
            <Group title={t.groupMangrove} std={t.groupMangroveStd} ids={['mgcan', 'mgden']} t={t} trigger={trigger} />
          </div>
          <div className={cn(CELL, GOV, 'md:col-start-3 md:row-start-4 md:mt-3 md:rounded-t-xl md:border-t')}>
            <p className="hidden text-center text-base font-bold text-osgap-gov-ink md:block">{t.colGov}</p>
            <MobileTag tone="gov">{t.tagGov}</MobileTag>
            <Group title={t.groupMpa} std={t.groupMpaStd} ids={['evika', 'liang', 'rakit']} t={t} trigger={trigger} />
            {tile('bomb')}
            {tile('comp')}
          </div>

          {/* Baris 4: Penyerap */}
          <div className={cn(FN, 'md:row-start-5')}>{t.rowSink}</div>
          <div className={cn(BAND, 'md:row-start-5')} />
          <div className={cn(CELL, ENV, 'md:col-start-2 md:row-start-5 md:rounded-b-xl md:border-b')}>
            <MobileTag tone="env">{t.tagEnv}</MobileTag>
            <Group title={t.groupWater} std={t.groupWaterStd} ids={['ph', 'sst', 'tss']} t={t} trigger={trigger} />
          </div>
          <div className={cn(CELL, GOV, 'md:col-start-3 md:row-start-5 md:rounded-b-xl md:border-b')}>
            <MobileTag tone="gov">{t.tagGov}</MobileTag>
            {tile('plastic')}
          </div>
        </div>

        <Legend t={t} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Box title={t.noteFunctionsTitle}>{t.noteFunctionsBody}</Box>
        <Box title={t.noteProxyTitle}>{t.noteProxyBody}</Box>
      </div>
    </section>
  );
}

function Legend({ t }: { t: OsgapDictionary }) {
  return (
    <aside className="grid gap-4 rounded-lg border border-border bg-bg p-4 text-sm max-lg:sm:grid-cols-2 lg:sticky lg:top-6">
      <div>
        <h3 className="text-sm font-bold text-primary">{t.legendSesiTitle}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t.legendSesiBody}</p>
        <div className="mt-2 grid grid-cols-5 overflow-hidden rounded-sm">
          {SESI_CLASS.map((cls) => (
            <span key={cls} className={cn('h-5', cls)} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[0.6875rem] tabular-nums text-muted">
          {[0, 20, 40, 60, 80, 100].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <div className="flex justify-between text-[0.6875rem] text-muted">
          <span>{t.legendFar}</span>
          <span>{t.legendMet}</span>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-primary">{t.legendSespiTitle}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t.legendSespiBody}</p>
        <ul className="mt-2 grid gap-1.5">
          {(['up', 'diag', 'right', 'down', 'nc'] as const).map((kind) => (
            <li key={kind} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 text-xs">
              <span className="grid place-items-center">
                {kind === 'nc' ? <SespiIcon score={null} t={t} /> : <Arrow kind={kind} size={22} />}
              </span>
              <span>
                <b className="font-semibold text-fg">{t.sespiLabel[kind]}</b>{' '}
                <span className="text-muted">{t.legendRows[kind]}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted sm:col-span-full">{t.legendHint}</p>
    </aside>
  );
}

function Box({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-bg p-5', className)}>
      <h3 className="text-base font-bold text-primary">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

/* --------------------------------------------------------- economic view */

function EconItem({ id, t, trigger }: { id: OsgapEconId; t: OsgapDictionary; trigger: Trigger }) {
  const d = OSGAP_ECON[id];
  const text = t.econ[id];
  return (
    <button
      type="button"
      {...trigger({ kind: 'econ', id })}
      className={cn(
        'grid w-full cursor-help grid-cols-[minmax(0,1fr)_1.75rem] items-center gap-2 rounded-md border border-transparent px-2.5 py-2 text-start transition hover:-translate-y-px hover:border-fg',
        d.sesi === null ? 'bg-osgap-neutral text-osgap-neutral-ink' : SESI_CLASS[band(d.sesi)],
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight">{text.name}</span>
        <span className="block text-xs tabular-nums opacity-85">
          {text.v24} → {text.v25}
        </span>
      </span>
      <span className="grid size-[1.625rem] place-items-center rounded-full bg-white/85">
        <Arrow kind={d.trend} size={18} />
      </span>
    </button>
  );
}

function Flow() {
  return (
    <div className="grid place-items-center text-secondary max-md:h-7" aria-hidden>
      <svg viewBox="0 0 22 40" className="h-10 w-[1.375rem] max-md:rotate-90">
        <path d="M4 6l12 14-12 14" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Stage({
  index,
  tone,
  t,
  children,
}: {
  index: number;
  tone: 'env' | 'soc';
  t: OsgapDictionary;
  children: ReactNode;
}) {
  const stage = t.stages[index];
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-lg border p-3',
        tone === 'env' ? 'border-osgap-env-line bg-osgap-env' : 'border-osgap-soc-line bg-osgap-soc',
      )}
    >
      <p className="flex items-center gap-2.5 text-lg font-bold leading-tight text-fg">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm text-primary-fg">
          {index + 1}
        </span>
        {stage.step}
      </p>
      <h3 className="text-sm font-semibold text-muted">{stage.sub}</h3>
      {children}
    </div>
  );
}

function EconView({ t, trigger, locale }: { t: OsgapDictionary; trigger: Trigger; locale: Locale }) {
  const item = (id: OsgapEconId) => <EconItem key={id} id={id} t={t} trigger={trigger} />;
  const [drop, setDrop] = useState(20);

  const s = OSGAP_STRESS;
  const d = drop / 100;
  const varF = d * s.fishersIncome * (1 - s.fishersCostRatio);
  const varC = d * s.collectorsIncome * (1 - s.collectorsCostRatio);
  const fixF = d * s.fishersIncome;
  const fixC = d * s.collectorsIncome;
  const bn = (x: number) => t.idrBn(formatNumber(x / 1e9, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  const pct = (x: number) => formatNumber((x / s.valueChainGva) * 100, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const barWidth = (x: number) => `${Math.min(100, (x / s.valueChainGva) * 100 * 2.5)}%`;

  const scenario = (
    title: string,
    why: string,
    f: number,
    c: number,
    accent: 'border-t-osgap-trend-flat' | 'border-t-osgap-trend-down',
    bar: 'bg-osgap-trend-flat' | 'bg-osgap-trend-down',
  ) => (
    <div className={cn('flex flex-col gap-2 rounded-md border border-t-4 border-border p-4', accent)}>
      <h4 className="text-base font-bold text-primary">{title}</h4>
      <p className="text-xs leading-relaxed text-muted">{why}</p>
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted">{t.stressFishers}</dt>
        <dd className="text-end tabular-nums">{bn(f)}</dd>
        <dt className="text-muted">{t.stressCollectors}</dt>
        <dd className="text-end tabular-nums">{bn(c)}</dd>
      </dl>
      <div className="flex items-baseline justify-between gap-2 border-t border-border pt-2">
        <span className="text-sm">{t.stressTotal}</span>
        <b className="text-xl tabular-nums text-primary">{bn(f + c)}</b>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-osgap-neutral">
        <span className={cn('block h-full rounded-sm transition-[width]', bar)} style={{ width: barWidth(f + c) }} />
      </div>
      <p className="text-xs tabular-nums text-muted">{t.stressShare(pct(f + c))}</p>
    </div>
  );

  const down = (
    <svg width="18" height="22" viewBox="0 0 18 22" aria-hidden className="mx-auto text-muted">
      <path d="M9 1v17M3 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );

  return (
    <section aria-labelledby="osgap-econ-heading" className="grid gap-4">
      <div>
        <h2 id="osgap-econ-heading" className="text-xl font-semibold text-primary md:text-2xl">
          {t.econHeading}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">{t.econBody}</p>
      </div>
      <Box title={t.scopeTitle}>{t.scopeBody}</Box>

      <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-bg px-4 py-3 text-xs">
        <li className="flex items-center gap-2">
          <span className="flex overflow-hidden rounded-sm">
            {SESI_CLASS.map((cls) => (
              <span key={cls} className={cn('h-3.5 w-4.5', cls)} />
            ))}
          </span>
          {t.econLegendShade}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-5.5 rounded-sm bg-osgap-neutral" />
          {t.econLegendNoRef}
        </li>
        {(['gup', 'right', 'down'] as const).map((k) => (
          <li key={k} className="flex items-center gap-1.5">
            <Arrow kind={k} size={18} />
            {t.trendLabel[k]}
          </li>
        ))}
        <li>
          <b>*</b> {t.econLegendProjected}
        </li>
      </ul>

      <div className="rounded-lg border border-osgap-gov-line bg-osgap-gov p-3.5">
        <p className="mb-2 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-fg">{t.pressuresTitle}</span>
          <span className="text-xs text-muted">{t.pressuresSub}</span>
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{(['comp', 'bomb', 'plastic', 'evika'] as const).map(item)}</div>
      </div>
      <div className="-my-1 hidden grid-cols-4 gap-6 md:grid">
        {down}
        {down}
        {down}
        {down}
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_1.375rem_minmax(0,1fr)_1.375rem_minmax(0,0.9fr)_1.375rem_minmax(0,1.3fr)]">
        <Stage index={0} tone="env" t={t}>
          {(['coral', 'seagrass', 'mangrove', 'sst'] as const).map(item)}
        </Stage>
        <Flow />
        <Stage index={1} tone="env" t={t}>
          {(['grouper', 'snapper'] as const).map(item)}
        </Stage>
        <Flow />
        <Stage index={2} tone="soc" t={t}>
          {(['land', 'sharefish', 'shareall'] as const).map(item)}
        </Stage>
        <Flow />
        <Stage index={3} tone="soc" t={t}>
          {(['income', 'dep', 'gva', 'coll', 'trade', 'food'] as const).map(item)}
        </Stage>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-bg p-5">
          <h3 className="text-lg font-bold text-primary">{t.stressTitle}</h3>
          <p className="mb-3 mt-1 text-sm text-muted">{t.stressBody}</p>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="osgap-drop" className="text-sm font-semibold">
              {t.stressSlider}
            </label>
            <input
              id="osgap-drop"
              type="range"
              min={5}
              max={50}
              step={5}
              value={drop}
              onChange={(event) => setDrop(Number(event.target.value))}
              className="min-w-40 flex-1 accent-secondary"
            />
            <output htmlFor="osgap-drop" className="min-w-[4ch] text-lg font-semibold tabular-nums">
              {drop}%
            </output>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {scenario(t.stressVarTitle, t.stressVarWhy, varF, varC, 'border-t-osgap-trend-flat', 'bg-osgap-trend-flat')}
            {scenario(t.stressFixTitle, t.stressFixWhy, fixF, fixC, 'border-t-osgap-trend-down', 'bg-osgap-trend-down')}
          </div>
          <p className="mt-3 text-xs text-muted">{t.stressNote}</p>
        </div>
        <Box title={t.insightsTitle}>
          <ol className="mt-1 grid gap-2.5">
            {t.insights.map((text, i) => (
              <li key={i} className="grid grid-cols-[1.375rem_minmax(0,1fr)] gap-2">
                <span className="font-semibold text-secondary">{i + 1}</span>
                <span className="text-fg">{text}</span>
              </li>
            ))}
          </ol>
        </Box>
      </div>

      <Box title={t.interventionsTitle}>
        <ol className="mt-1 grid gap-x-7 gap-y-3 md:grid-cols-2">
          {t.interventions.map((entry, i) => (
            <li key={i} className="grid grid-cols-[1.375rem_minmax(0,1fr)] gap-2">
              <span className="font-semibold text-secondary">{i + 1}</span>
              <span className="text-fg">
                <b>{entry.title}</b> {entry.body}
              </span>
            </li>
          ))}
        </ol>
      </Box>
    </section>
  );
}

/* ------------------------------------------------------------------ root */

type View = 'card' | 'econ';

export function OsgapViews({ locale }: { locale: Locale }) {
  const t = getOsgapDictionary(locale);
  const [view, setView] = useState<View>('card');
  const { tip, triggerProps } = useTip();

  // Tautan langsung ke tampilan ekonomi, sama seperti #economic-risk di
  // laporan aslinya.
  useEffect(() => {
    if (window.location.hash === '#economic-risk') setView('econ');
  }, []);

  const tabs: { id: View; label: string }[] = [
    { id: 'card', label: t.tabCard },
    { id: 'econ', label: t.tabEcon },
  ];

  return (
    <div>
      <div role="tablist" aria-label={t.tabsAria} className="flex flex-wrap items-center gap-6 border-b border-border">
        {tabs.map(({ id, label }) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`osgap-tab-${id}`}
              aria-selected={active}
              aria-controls={`osgap-panel-${id}`}
              onClick={() => setView(id)}
              className={cn(
                'border-b-2 pb-3 text-sm font-semibold',
                active ? 'border-secondary text-primary' : 'border-transparent text-muted hover:text-primary',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div id="osgap-panel-card" role="tabpanel" aria-labelledby="osgap-tab-card" hidden={view !== 'card'} className="mt-8">
        <ReportCard t={t} trigger={triggerProps} />
      </div>
      <div id="osgap-panel-econ" role="tabpanel" aria-labelledby="osgap-tab-econ" hidden={view !== 'econ'} className="mt-8">
        <EconView t={t} trigger={triggerProps} locale={locale} />
      </div>

      {tip ? <Tooltip tip={tip} t={t} /> : null}
    </div>
  );
}
