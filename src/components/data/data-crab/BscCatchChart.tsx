'use client';

import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { RankedBars } from '@/components/data/RankedBars';
import { useBscFilter } from '@/components/data/data-crab/BscFilterContext';
import type { Locale } from '@/i18n/config';

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
  const { catchChart, catchStatus, catchAppliedSummary } = useBscFilter();

  const loading = catchStatus === 'loading';
  const failed = catchStatus === 'error';

  if (!catchChart) {
    return (
      <ChartCard title="Catch Composition">
        <p className="text-sm leading-relaxed text-muted">
          Grafik komposisi tangkapan gagal dimuat. Ubah filter lalu tekan Filter untuk mencoba
          lagi.
        </p>
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
          Memperbarui grafik… angka di bawah masih hasil filter sebelumnya.
        </p>
      ) : null}

      {failed ? (
        <p
          role="alert"
          className="rounded-md border border-border bg-bg p-3 text-xs font-bold text-(--color-series-6)"
        >
          Grafik gagal diperbarui. Yang tampil di bawah masih hasil filter sebelumnya.
        </p>
      ) : null}

      <ChartCard
        title="Catch Composition"
        meta={`${totalBobot.toLocaleString(locale, { maximumFractionDigits: 0 })} ${unit} · ${perSpesies.length} spesies${filterSuffix}`}
        note={`Bobot tangkapan per spesies dalam ${unit} (satuan dari sumber datanya, tidak dikonversi), diurutkan dari yang terbesar. Panjang batang dibandingkan terhadap spesies teratas, bukan terhadap total.`}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">
            Tidak ada tangkapan yang tercatat untuk filter ini.
          </p>
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
            emptyLabel="Tidak ada tangkapan yang tercatat untuk filter ini."
          />
        )}
      </ChartCard>
    </div>
  );
}
