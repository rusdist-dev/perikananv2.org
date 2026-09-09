import type { Locale } from '../config';

/** Kosakata untuk seksi menu DATA: hanya label nav-nya. Label dasbor,
 *  deskripsi dataset, dan nama seri chart tiap halaman (/data/*) ada di file
 *  page.tsx masing-masing lewat key berprefiks nama datasetnya. */
export type DataDictionary = {
  navData: string;
  navDataCrab: string;
  navSharkAndRay: string;
  navProductionData: string;
  navVesselData: string;
  dataCrabDescription: string;
  dataCrabTripsSeriesLabel: string;
  dataCrabTripsUnit: string;
  dataCrabCatchSeriesLabel: string;
  dataCrabCatchUnit: string;
  dataCrabLengthSeriesLabel: string;
  dataCrabLengthUnit: string;
  dataIkanDescription: string;
  dataIkanTripsSeriesLabel: string;
  dataIkanTripsUnit: string;
  dataIkanCatchSeriesLabel: string;
  dataIkanCatchUnit: string;
  dataIkanLengthSeriesLabel: string;
  dataIkanLengthUnit: string;
};

export const dataDictionary: Record<Locale, DataDictionary> = {
  id: {
    navData: 'Data',
    navDataCrab: 'Data Kepiting',
    navSharkAndRay: 'Hiu dan Pari',
    navProductionData: 'Data Produksi',
    navVesselData: 'Data Kapal',
    dataCrabDescription:
      'Ringkasan trip, komposisi tangkapan, dan sebaran ukuran karapas kepiting/rajungan dari data yang dikumpulkan di lapangan.',
    dataCrabTripsSeriesLabel: 'Jumlah Trip',
    dataCrabTripsUnit: 'trip',
    dataCrabCatchSeriesLabel: 'Berat Tangkapan',
    dataCrabCatchUnit: 'kg',
    dataCrabLengthSeriesLabel: 'Frekuensi',
    dataCrabLengthUnit: 'individu',
    dataIkanDescription:
      'Ringkasan trip, komposisi tangkapan, dan sebaran panjang dari data yang dikumpulkan lewat aplikasi IKAN.',
    dataIkanTripsSeriesLabel: 'Jumlah Trip',
    dataIkanTripsUnit: 'trip',
    dataIkanCatchSeriesLabel: 'Berat Tangkapan',
    dataIkanCatchUnit: 'kg',
    dataIkanLengthSeriesLabel: 'Frekuensi',
    dataIkanLengthUnit: 'individu',
  },
  en: {
    navData: 'Data',
    navDataCrab: 'Data Crab',
    navSharkAndRay: 'Shark and Ray',
    navProductionData: 'Production Data',
    navVesselData: 'Vessel Data',
    dataCrabDescription:
      'Summary of trips, catch composition, and carapace size distribution of crab/swimming crab from field-collected data.',
    dataCrabTripsSeriesLabel: 'Number of Trips',
    dataCrabTripsUnit: 'trip',
    dataCrabCatchSeriesLabel: 'Catch Weight',
    dataCrabCatchUnit: 'kg',
    dataCrabLengthSeriesLabel: 'Frequency',
    dataCrabLengthUnit: 'individual',
    dataIkanDescription:
      'Summary of trips, catch composition, and length distribution from data collected through the IKAN app.',
    dataIkanTripsSeriesLabel: 'Number of Trips',
    dataIkanTripsUnit: 'trip',
    dataIkanCatchSeriesLabel: 'Catch Weight',
    dataIkanCatchUnit: 'kg',
    dataIkanLengthSeriesLabel: 'Frequency',
    dataIkanLengthUnit: 'individual',
  },
};
