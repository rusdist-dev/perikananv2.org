'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { ColumnChart } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import type { SeriesColor } from '@/components/program/jogolaut/chart-theme';

/**
 * Kerangka bersama tab Summary / Catch Composition / Length Frequency untuk
 * halaman-halaman di bawah menu "Data" (IKAN, Data Crab, dst.) -- dibuat
 * generik supaya set kedua (dan seterusnya) tidak menyalin ulang seluruh
 * markup filter+tab, cuma datanya yang beda per dataset.
 */

type TabId = 'summary' | 'catch-composition' | 'length-frequency';

export type FisheriesChartData = {
  labels: string[];
  values: number[];
  unit: string;
  seriesLabel: string;
  color: SeriesColor;
  labelEvery?: number;
};

const FIELD_LABEL = 'text-xs font-bold uppercase tracking-wide text-muted';
const SELECT_CLASS =
  'rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface';

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
      <path d="M5 21V13M5 9V3M12 21V11M12 7V3M19 21V15M19 11V3" strokeLinecap="round" />
      <circle cx="5" cy="11" r="2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9" r="2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="13" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TABS: { id: TabId; label: string; icon: () => ReactElement }[] = [
  { id: 'summary', label: 'Summary', icon: GridIcon },
  { id: 'catch-composition', label: 'Catch Composition', icon: SlidersIcon },
  { id: 'length-frequency', label: 'Length Frequency', icon: SlidersIcon },
];

/** Satu opsi placeholder disabled -- sama seperti pola filter belum-tersambung
 *  di NewsHero/PublicationsExplorer sebelum keduanya diaktifkan. Field di
 *  sini TIDAK diaktifkan seperti itu karena, tidak seperti berita/publikasi,
 *  belum ada sumber data sama sekali untuk disaring -- select yang terlihat
 *  bisa dipilih tapi tidak menyaring apa pun lebih menyesatkan daripada
 *  select yang menyatakan diri statis. */
function StaticField({
  idPrefix,
  label,
  placeholder,
}: {
  idPrefix: string;
  label: string;
  placeholder: string;
}) {
  const id = `${idPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
      <select id={id} disabled defaultValue="" className={SELECT_CLASS}>
        <option value="">{placeholder}</option>
      </select>
    </div>
  );
}

function CommonFields({ idPrefix, withFishingGear }: { idPrefix: string; withFishingGear: boolean }) {
  return (
    <>
      <StaticField
        idPrefix={idPrefix}
        label="Fisheries Management Area"
        placeholder="Choose Fisheries Management Area"
      />
      <StaticField idPrefix={idPrefix} label="Region" placeholder="Choose Province/Regency" />
      <StaticField idPrefix={idPrefix} label="Landing Site" placeholder="Choose Landing Site" />
      <StaticField idPrefix={idPrefix} label="Grouping Data" placeholder="Choose Data Type" />
      {withFishingGear ? (
        <StaticField idPrefix={idPrefix} label="Fishing Gears" placeholder="Choose Fishing Gear" />
      ) : null}
      <StaticField idPrefix={idPrefix} label="Period" placeholder="Choose Yearly/Monthly" />
    </>
  );
}

export function FisheriesDataDashboard({
  breadcrumb,
  datasetName,
  description,
  trips,
  catchComposition,
  lengthFrequency,
}: {
  breadcrumb: BreadcrumbItem[];
  /** Nama diri dataset (mis. "IKAN", "Data Crab") -- proper noun, ditulis apa
   *  adanya, bukan diterjemahkan ulang per locale. */
  datasetName: string;
  description: string;
  trips: FisheriesChartData;
  catchComposition: FisheriesChartData;
  lengthFrequency: FisheriesChartData;
}) {
  const [tab, setTab] = useState<TabId>('summary');
  const idPrefix = datasetName.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="bg-surface">
      <Container className="page-gutter py-14 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb items={breadcrumb} />

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">Data</p>
        <h1 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">{datasetName}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{description}</p>
        <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="font-bold text-primary">Catatan:</strong> filter dan grafik di halaman
          ini masih data contoh untuk keperluan tampilan -- belum tersambung ke sumber data {datasetName}{' '}
          sesungguhnya.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-border">
          {TABS.map(({ id, label, icon: TabIcon }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold ${
                  isActive
                    ? 'border-secondary text-primary'
                    : 'border-transparent text-muted hover:text-primary'
                }`}
              >
                <TabIcon />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[20rem_1fr] lg:items-start">
          {tab === 'summary' ? (
            <ChartCard title="Filter">
              <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
                <CommonFields idPrefix={idPrefix} withFishingGear={false} />
                <button
                  type="submit"
                  disabled
                  className="mt-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Filter
                </button>
              </form>
            </ChartCard>
          ) : null}

          {tab === 'catch-composition' ? (
            <ChartCard title="Filter">
              <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
                <CommonFields idPrefix={idPrefix} withFishingGear />
                <button
                  type="submit"
                  disabled
                  className="mt-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Filter
                </button>
              </form>
            </ChartCard>
          ) : null}

          {tab === 'length-frequency' ? (
            <ChartCard title="Filter">
              <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
                <CommonFields idPrefix={idPrefix} withFishingGear />
                <StaticField idPrefix={idPrefix} label="Family" placeholder="Choose Family" />
                <StaticField idPrefix={idPrefix} label="Species" placeholder="Choose Species" />
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${idPrefix}-class-interval`} className={FIELD_LABEL}>
                    Selang Kelas
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id={`${idPrefix}-class-interval`}
                      type="range"
                      disabled
                      min={1}
                      max={10}
                      defaultValue={1}
                      className="w-full disabled:cursor-not-allowed"
                    />
                    <span className="font-mono text-sm text-muted">1</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled
                  className="mt-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Generate
                </button>
              </form>
            </ChartCard>
          ) : null}

          {tab === 'summary' ? (
            <ChartCard
              title="Number of Trips"
              meta="contoh · per bulan"
              note={`Data contoh untuk pratinjau tampilan grafik. Grafik akan menampilkan jumlah trip sesungguhnya setelah halaman ini tersambung ke sumber data ${datasetName}.`}
            >
              <ColumnChart
                labels={trips.labels}
                values={trips.values}
                color={trips.color}
                unit={trips.unit}
                seriesLabel={trips.seriesLabel}
                labelEvery={trips.labelEvery ?? 3}
                height={320}
                ariaLabel={`Grafik batang contoh jumlah trip per bulan untuk ${datasetName}`}
              />
            </ChartCard>
          ) : null}

          {tab === 'catch-composition' ? (
            <ChartCard
              title="Catch Composition"
              meta="contoh · per spesies"
              note={`Data contoh untuk pratinjau tampilan grafik. Grafik akan menampilkan komposisi tangkapan sesungguhnya setelah halaman ini tersambung ke sumber data ${datasetName}.`}
            >
              <ColumnChart
                labels={catchComposition.labels}
                values={catchComposition.values}
                color={catchComposition.color}
                unit={catchComposition.unit}
                seriesLabel={catchComposition.seriesLabel}
                labelEvery={catchComposition.labelEvery ?? 1}
                height={320}
                ariaLabel={`Grafik batang contoh komposisi tangkapan per spesies untuk ${datasetName}`}
              />
            </ChartCard>
          ) : null}

          {tab === 'length-frequency' ? (
            <ChartCard
              title="Length Frequency"
              meta="contoh · sebaran panjang"
              note={`Data contoh untuk pratinjau tampilan grafik. Grafik akan menampilkan sebaran panjang sesungguhnya setelah halaman ini tersambung ke sumber data ${datasetName}.`}
            >
              <ColumnChart
                labels={lengthFrequency.labels}
                values={lengthFrequency.values}
                color={lengthFrequency.color}
                unit={lengthFrequency.unit}
                seriesLabel={lengthFrequency.seriesLabel}
                labelEvery={lengthFrequency.labelEvery ?? 1}
                height={320}
                ariaLabel={`Grafik batang contoh frekuensi panjang per kelas ukuran untuk ${datasetName}`}
              />
            </ChartCard>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
