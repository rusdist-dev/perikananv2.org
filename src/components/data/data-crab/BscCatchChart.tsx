'use client';

import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { RankedBars } from '@/components/data/RankedBars';
import { useBscFilter } from '@/components/data/data-crab/BscFilterContext';
import type { Locale } from '@/i18n/config';
import { getFisheriesDictionary } from '@/i18n/dictionaries/fisheries';
import { formatNumber } from '@/lib/number';

/**
 * Komposisi tangkapan per spesies, tab Catch Composition.
 *
 * SATU grafik, bukan dua seperti tab Summary: endpoint tangkapan mengirim satu
 * daftar saja (bobot per spesies), tanpa deret waktu dan tanpa pecahan per
 * lokasi. Menambahkan kartu kedua di sini berarti mengarang angka yang tidak
 * dikirim siapa pun.
 *
 * Bentuknya batang mendatar berperingkat: nama Latin sepanjang "Portunus
 * sanguinolentus" tidak muat sebagai label sumbu tegak, dan yang dicari
 * pembaca adalah "spesies apa yang paling banyak" -- peringkat, bukan pola.
 *
 * Satuannya dibaca dari respons, TIDAK dikonversi: API mengirim gram, dan
 * membaginya seribu di sini berarti angka di layar tidak lagi bisa dicocokkan
 * dengan angka yang sama di tempat lain.
 */
export function BscCatchChart({ locale }: { locale: Locale }) {
  const t = getFisheriesDictionary(locale);
  const { catchChart, catchStatus, catchAppliedSummary } = useBscFilter();

  const loading = catchStatus === 'loading';
  const failed = catchStatus === 'error';

  if (!catchChart) {
    return (
      <ChartCard title={t.catchTitle}>
        <p className="text-sm leading-relaxed text-muted">{t.catchLoadFailed}</p>
      </ChartCard>
    );
  }

  const { unit, totalBobot, perSpesies } = catchChart;
  const filterSuffix = catchAppliedSummary ? ` · ${catchAppliedSummary}` : '';
  // Nol total = kombinasi filter yang memang tidak punya catatan. Dibedakan
  // dari kegagalan, sama seperti di kartu trip.
  const kosong = totalBobot === 0 || perSpesies.length === 0;

  return (
    <div aria-busy={loading} className="flex flex-col gap-5">
      {loading ? (
        <p aria-live="polite" className="text-xs text-muted">
          {t.updating}
        </p>
      ) : null}

      {failed ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-bg p-3 text-xs font-bold text-(--color-series-6)"
        >
          {t.updateFailed}
        </p>
      ) : null}

      <ChartCard
        title={t.catchTitle}
        meta={`${t.catchMeta(
          formatNumber(totalBobot, locale, { maximumFractionDigits: 0 }),
          unit,
          formatNumber(perSpesies.length, locale),
        )}${filterSuffix}`}
        note={t.crabCatchNote(unit)}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">{t.catchEmpty}</p>
        ) : (
          <RankedBars
            items={perSpesies.map((row) => ({ label: row.spesies, value: row.totalBobot }))}
            color="series-1"
            unit={unit}
            locale={locale}
            // Lebih tinggi dari daftar lokasi pendaratan: ini satu-satunya
            // kartu di tabnya, jadi ruang tegaknya tidak diperebutkan siapa
            // pun.
            maxHeight="34rem"
            emptyLabel={t.catchEmpty}
          />
        )}
      </ChartCard>
    </div>
  );
}
