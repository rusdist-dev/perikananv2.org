'use client';

import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { ColumnChart } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { LENGTH_CLASS_LABELS, SAMPLE_LENGTH_FREQUENCY, SAMPLE_MARKERS, SAMPLE_SPECIES } from './sample-data';

/**
 * Beda dari FisheriesDataDashboard (IKAN, Data Crab): halaman ini hanya
 * punya satu bagian, Length Frequency -- tidak ada tab Summary/Catch
 * Composition di rancangan acuannya, jadi tidak dipaksakan ke kerangka tab
 * yang dibuat untuk tiga bagian.
 */
export function SharkAndRayDashboard({ breadcrumb }: { breadcrumb: BreadcrumbItem[] }) {
  return (
    <div className="bg-surface">
      <Container className="page-gutter py-14 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb items={breadcrumb} />

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">Data</p>
        <h1 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">Shark and Ray</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          Sebaran frekuensi panjang hiu dan pari per spesies dari data yang dikumpulkan di lapangan.
        </p>
        <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="font-bold text-primary">Catatan:</strong> filter dan grafik di halaman
          ini masih data contoh untuk keperluan tampilan -- belum tersambung ke sumber data Shark
          and Ray sesungguhnya.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-[20rem_1fr] lg:items-start">
          <ChartCard title="Filter">
            <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="shark-ray-species" className="text-xs font-bold uppercase tracking-wide text-muted">
                  Species
                </label>
                <select
                  id="shark-ray-species"
                  disabled
                  defaultValue={SAMPLE_SPECIES[0]}
                  className="rounded-md border border-border bg-bg px-3 py-2 text-sm italic disabled:cursor-not-allowed disabled:bg-surface"
                >
                  {SAMPLE_SPECIES.map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled
                className="mt-2 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Show Chart
              </button>
            </form>
          </ChartCard>

          <ChartCard
            title={`Length Frequency — ${SAMPLE_SPECIES[0]}`}
            meta="contoh · Total Length (cm)"
            note="Data contoh untuk pratinjau tampilan grafik. Grafik akan menampilkan sebaran panjang sesungguhnya per spesies setelah halaman ini tersambung ke sumber data Shark and Ray. Lm menandai perkiraan panjang saat matang gonad, Linf menandai perkiraan panjang asimtotik -- keduanya juga masih nilai contoh."
          >
            <ColumnChart
              labels={LENGTH_CLASS_LABELS}
              values={SAMPLE_LENGTH_FREQUENCY}
              markers={SAMPLE_MARKERS}
              color="series-2"
              unit="individu"
              seriesLabel="Frequency"
              labelEvery={1}
              height={340}
              ariaLabel={`Grafik batang contoh frekuensi panjang total untuk ${SAMPLE_SPECIES[0]}, dengan garis acuan Lm dan Linf`}
            />
          </ChartCard>
        </div>
      </Container>
    </div>
  );
}
