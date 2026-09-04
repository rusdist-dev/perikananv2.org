'use client';

import { Container } from '@/components/layout/Container';
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import { FMA_CODES } from './sample-data';

/**
 * Beda dari halaman Data lain (IKAN, Data Crab, Shark and Ray): belum ada
 * grafik di sini sama sekali, hanya dropdown filter WPP + legenda warnanya --
 * itu saja yang diminta untuk bagian ini. Kerangka halaman (bg-surface,
 * Container, Breadcrumb, kotak "Catatan") tetap disamakan dengan halaman
 * Data lain supaya seksi ini terasa satu keluarga dengan yang lain.
 */
export function ProductionDataDashboard({ breadcrumb }: { breadcrumb: BreadcrumbItem[] }) {
  return (
    <div className="bg-surface">
      <Container className="page-gutter py-14 lg:pe-(--spacing-panel-gutter)">
        <Breadcrumb items={breadcrumb} />

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-secondary">Data</p>
        <h1 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">Production Data</h1>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          The data on the fish production per species group, the number of vessels, and the total
          vessel tonnage in each Fisheries Management Area of the Republic of Indonesia are sourced
          from capture fisheries statistics issued by the Ministry of Agriculture and the Ministry
          of Marine Affairs and Fisheries. Some data were constructed based on the proportions
          available in capture fisheries statistics, so it is highly likely to find biases within
          the data. Suggestions and corrections to the data are highly expected.
        </p>
        <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="font-bold text-primary">Catatan:</strong> filter di halaman ini masih
          statis untuk keperluan tampilan -- belum tersambung ke sumber data produksi sesungguhnya.
        </p>

        <div className="mt-8 max-w-md">
          <ChartCard title="Production Data">
            <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="production-data-fma"
                  className="text-xs font-bold uppercase tracking-wide text-muted"
                >
                  Fisheries Management Area
                </label>
                <select
                  id="production-data-fma"
                  disabled
                  defaultValue=""
                  className="rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface"
                >
                  <option value="">All Fisheries Management Area</option>
                  {FMA_CODES.map(({ code }) => (
                    <option key={code} value={code}>
                      FMA-RI {code}
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
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
            Wilayah Pengelolaan Perikanan (WPP-RI)
          </p>
          <div className="flex flex-wrap gap-2">
            {FMA_CODES.map(({ code, color }) => (
              <span
                key={code}
                style={{ backgroundColor: color }}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              >
                FMA-RI {code}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
