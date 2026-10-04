/* =========================================================================
   JOGO LAUT -- BENTUK RESPONS /ext/jogolaut/monitoring

   Satu respons memuat 14 section dengan tipe berbeda-beda (timeseries,
   category, polar, matrix, analysis, status, stats, table). Tiap section
   dipetakan SENDIRI-SENDIRI dan kegagalannya berhenti di section itu: satu
   section yang bentuknya berubah di CMS cukup mengosongkan kartunya, bukan
   membuang seluruh dasbor. Karena itu di sini tidak ada skema zod untuk satu
   payload utuh -- skema seperti itu gagal sebagai satu kesatuan.

   null pada level section punya tiga asal yang sengaja tidak dibedakan:
   `empty: true` (tidak ada data di jendela itu), `error: true` (section gagal
   di sisi CMS), dan bentuk yang tidak dikenali. Untuk pembaca halaman,
   ketiganya sama: kartunya tidak punya angka untuk ditampilkan.

   Waktu dari API berupa "YYYY-MM-DD HH:mm:ss" pada zona `meta.timezone`
   (+07:00, waktu stasiun) dan DIBIARKAN sebagai string -- tidak diubah jadi
   Date di sini. Mengubahnya di server lalu memformatnya di zona lain
   menggeser jam pembacaannya.
   ========================================================================= */

export type JlSeries = {
  key: string;
  label: string;
  unit: string;
  /** Jumlah desimal yang dipakai API saat membulatkan; dipakai ulang untuk
   *  menampilkan angkanya supaya "8,12" tidak tercetak "8,1" di satu kartu
   *  dan "8,120" di kartu lain. */
  dec: number;
  /** Panjangnya selalu sama dengan `x`; celah data = null. */
  data: (number | null)[];
};

export type JlTimeseries = {
  x: string[];
  series: JlSeries[];
};

export type JlDiurnal = {
  hours: number[];
  mean: JlSeries;
  std: JlSeries | null;
  peakHour: number | null;
};

export type JlWindDirection = { dir: string; deg: number; label: string; count: number };

export type JlWindrose = {
  unit: string;
  directions: JlWindDirection[];
  speedBins: { key: string; min: number; max: number | null; count: number }[];
  total: number;
  dominant: { dir: string; label: string } | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  beaufortAvg: string | null;
  beaufortMax: string | null;
};

export type JlCorrelation = {
  vars: { key: string; label: string }[];
  values: (number | null)[][];
  maxPair: { a: string; b: string; r: number } | null;
};

export type JlAnalysis = {
  unit: string;
  outliers: {
    items: { time: string | null; value: number | null }[];
    lower: number | null;
    upper: number | null;
  };
  ccf: { lag: number; r: number | null }[];
  bestLag: number | null;
  lagMinutes: number | null;
  regression: { slope: number; intercept: number; n: number | null } | null;
  estimateNow: number | null;
  predictions: { minutesAhead: number; value: number | null }[];
};

export type JlEcosystem = {
  code: string;
  color: string;
  label: string;
  description: string;
  trends: { key: string; value: number }[];
  co2Change: { delta: number; direction: string } | null;
};

export type JlKpi = {
  key: string;
  label: string;
  unit: string;
  dec: number;
  latest: number | null;
  latestAt: string | null;
  min: number | null;
  max: number | null;
  delta: number | null;
};

export type JlGauge = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  dec: number;
  level: string;
  levelLabel: string;
  color: string;
  description: string | null;
};

export type JlTable = {
  columns: { key: string; label: string; unit: string | null; dec: number | null }[];
  rows: Record<string, string | number | null>[];
  total: number;
};

export type JogoLautMonitoring = {
  meta: {
    generatedAt: string | null;
    snapshotAt: string | null;
    from: string | null;
    to: string | null;
    days: number | null;
  };
  co2: JlTimeseries | null;
  flux: JlTimeseries | null;
  do: JlTimeseries | null;
  ph: JlTimeseries | null;
  ctd: JlTimeseries | null;
  atm: JlTimeseries | null;
  diurnal: JlDiurnal | null;
  windrose: JlWindrose | null;
  correlation: JlCorrelation | null;
  analysis: JlAnalysis | null;
  ecosystem: JlEcosystem | null;
  kpi: JlKpi[] | null;
  gauges: JlGauge[] | null;
  table: JlTable | null;
};

/* --- Pembantu ------------------------------------------------------------ */

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const objs = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter(isObj) : []);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const text = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

/** Section yang ditandai kosong/gagal oleh CMS, atau yang bukan objek. */
function usable(section: unknown): Obj | null {
  if (!isObj(section) || section.empty === true || section.error === true) return null;
  return section;
}

/** Satu pemetaan section yang melempar (bentuk tak terduga yang lolos
 *  pembantu di atas) tidak boleh menjatuhkan section lain. */
function guard<T>(name: string, fn: () => T | null): T | null {
  try {
    return fn();
  } catch (error) {
    console.error(`[jogolaut] section "${name}" dibuang karena bentuknya tidak dikenali:`, error);
    return null;
  }
}

function mapSeries(raw: Obj, length: number): JlSeries | null {
  const key = text(raw.key);
  if (!key || !Array.isArray(raw.data)) return null;
  const data = raw.data.map(num);
  // Kontrak API: panjang data = panjang x. Yang menyimpang dibuang, bukan
  // dipotong -- titik yang bergeser satu indeks menggambar grafik yang salah
  // tanpa terlihat salah.
  if (data.length !== length) return null;
  return {
    key,
    label: text(raw.label) ?? key,
    unit: text(raw.unit) ?? '',
    dec: num(raw.dec) ?? 1,
    data,
  };
}

function mapTimeseries(section: unknown): JlTimeseries | null {
  const s = usable(section);
  if (!s || !Array.isArray(s.x)) return null;
  const x = s.x.map((v) => (typeof v === 'string' ? v : String(v)));
  const series = objs(s.series)
    .map((raw) => mapSeries(raw, x.length))
    .filter((v): v is JlSeries => v !== null);
  if (x.length === 0 || series.length === 0) return null;
  return { x, series };
}

function mapDiurnal(section: unknown): JlDiurnal | null {
  const s = usable(section);
  if (!s || !Array.isArray(s.x)) return null;
  const hours = s.x.map((v) => num(v) ?? 0);
  const series = objs(s.series)
    .map((raw) => mapSeries(raw, hours.length))
    .filter((v): v is JlSeries => v !== null);
  const mean = series.find((v) => v.key === 'mean');
  if (!mean) return null;
  return {
    hours,
    mean,
    std: series.find((v) => v.key === 'std') ?? null,
    peakHour: num(s.peak_hour),
  };
}

function mapWindrose(section: unknown): JlWindrose | null {
  const s = usable(section);
  if (!s) return null;
  const directions = objs(s.directions).map((d) => ({
    dir: text(d.dir) ?? '',
    deg: num(d.deg) ?? 0,
    label: text(d.label) ?? text(d.dir) ?? '',
    count: num(d.count) ?? 0,
  }));
  if (directions.length === 0) return null;
  const summary = isObj(s.summary) ? s.summary : {};
  const dominant = isObj(summary.dominant) ? summary.dominant : null;
  const label = (v: unknown) => (isObj(v) ? text(v.label) : null);
  return {
    unit: text(s.unit) ?? 'm/s',
    directions,
    speedBins: objs(s.speed_bins).map((b) => ({
      key: text(b.key) ?? '',
      min: num(b.min) ?? 0,
      max: num(b.max),
      count: num(b.count) ?? 0,
    })),
    total: num(summary.total) ?? directions.reduce((sum, d) => sum + d.count, 0),
    dominant: dominant
      ? { dir: text(dominant.dir) ?? '', label: text(dominant.label) ?? '' }
      : null,
    avgSpeed: num(summary.avg_speed),
    maxSpeed: num(summary.max_speed),
    beaufortAvg: label(summary.beaufort_avg),
    beaufortMax: label(summary.beaufort_max),
  };
}

function mapCorrelation(section: unknown): JlCorrelation | null {
  const s = usable(section);
  if (!s) return null;
  const vars = objs(s.vars).map((v) => ({
    key: text(v.key) ?? '',
    label: text(v.label) ?? text(v.key) ?? '',
  }));
  const values = Array.isArray(s.values)
    ? s.values.map((row) => (Array.isArray(row) ? row.map(num) : []))
    : [];
  // Matriks harus persegi dan selebar daftar variabelnya; selain itu label
  // baris/kolom akan menempel pada angka milik pasangan lain.
  if (vars.length < 2 || values.length !== vars.length || values.some((r) => r.length !== vars.length)) {
    return null;
  }
  const pair = isObj(s.max_pair) ? s.max_pair : null;
  const r = pair ? num(pair.r) : null;
  return {
    vars,
    values,
    maxPair: pair && r !== null ? { a: text(pair.a) ?? '', b: text(pair.b) ?? '', r } : null,
  };
}

function mapAnalysis(section: unknown): JlAnalysis | null {
  const s = usable(section);
  if (!s) return null;
  const outliers = isObj(s.outliers) ? s.outliers : {};
  const bounds = isObj(outliers.bounds) ? outliers.bounds : {};
  const reg = isObj(s.regression) ? s.regression : null;
  const slope = reg ? num(reg.slope) : null;
  const intercept = reg ? num(reg.intercept) : null;
  return {
    unit: text(s.unit) ?? 'ppm',
    outliers: {
      // Bentuk satu item pencilan belum pernah terlihat (contoh respons yang
      // diperiksa selalu berisi daftar kosong), jadi beberapa nama field
      // yang lazim dicoba berurutan.
      items: objs(outliers.items).map((item) => ({
        time: text(item.waktu) ?? text(item.time) ?? text(item.x),
        value: num(item.value) ?? num(item.co2_tanah) ?? num(item.y),
      })),
      lower: num(bounds.lower),
      upper: num(bounds.upper),
    },
    ccf: objs(s.ccf).map((c) => ({ lag: num(c.lag) ?? 0, r: num(c.r) })),
    bestLag: num(s.best_lag),
    lagMinutes: num(s.lag_minutes),
    regression:
      slope !== null && intercept !== null ? { slope, intercept, n: num(reg?.n) } : null,
    estimateNow: num(s.estimate_now),
    predictions: objs(s.predictions).map((p) => ({
      minutesAhead: num(p.minutes_ahead) ?? 0,
      value: num(p.value),
    })),
  };
}

function mapEcosystem(section: unknown): JlEcosystem | null {
  const s = usable(section);
  const label = s ? text(s.label) : null;
  if (!s || !label) return null;
  const change = isObj(s.co2_change) ? s.co2_change : null;
  const delta = change ? num(change.delta) : null;
  return {
    code: text(s.code) ?? '',
    color: text(s.color) ?? '',
    label,
    description: text(s.description) ?? '',
    trends: isObj(s.trends)
      ? Object.entries(s.trends).flatMap(([key, v]) => {
          const value = num(v);
          return value === null ? [] : [{ key, value }];
        })
      : [],
    co2Change:
      change && delta !== null ? { delta, direction: text(change.direction) ?? '' } : null,
  };
}

function mapKpi(section: unknown): JlKpi[] | null {
  const s = usable(section);
  if (!s) return null;
  const items = objs(s.items).flatMap((i) => {
    const key = text(i.key);
    if (!key) return [];
    return [
      {
        key,
        label: text(i.label) ?? key,
        unit: text(i.unit) ?? '',
        dec: num(i.dec) ?? 1,
        latest: num(i.latest),
        latestAt: text(i.latest_at),
        min: num(i.min),
        max: num(i.max),
        delta: num(i.delta),
      },
    ];
  });
  return items.length > 0 ? items : null;
}

function mapGauges(section: unknown): JlGauge[] | null {
  const s = usable(section);
  if (!s) return null;
  const items = objs(s.items).flatMap((i) => {
    const key = text(i.key);
    if (!key) return [];
    return [
      {
        key,
        label: text(i.label) ?? key,
        value: num(i.value),
        unit: text(i.unit) ?? '',
        dec: num(i.dec) ?? 1,
        level: text(i.level) ?? '',
        levelLabel: text(i.level_label) ?? '',
        color: text(i.color) ?? '',
        description: text(i.description),
      },
    ];
  });
  return items.length > 0 ? items : null;
}

function mapTable(section: unknown): JlTable | null {
  const s = usable(section);
  if (!s) return null;
  const columns = objs(s.columns).flatMap((c) => {
    const key = text(c.key);
    return key ? [{ key, label: text(c.label) ?? key, unit: text(c.unit), dec: num(c.dec) }] : [];
  });
  const rows = objs(s.rows).map((row) =>
    Object.fromEntries(
      columns.map((c) => {
        const v = row[c.key];
        return [c.key, typeof v === 'string' ? v : num(v)];
      }),
    ),
  );
  if (columns.length === 0 || rows.length === 0) return null;
  const pagination = isObj(s.pagination) ? s.pagination : {};
  return { columns, rows, total: num(pagination.total) ?? rows.length };
}

/** `raw` = isi `data` dari amplop respons. null = bukan bentuk respons
 *  monitoring sama sekali (tidak ada `sections`). */
export function parseJogoLautMonitoring(raw: unknown): JogoLautMonitoring | null {
  if (!isObj(raw) || !isObj(raw.sections)) return null;
  const sections = raw.sections;
  const meta = isObj(raw.meta) ? raw.meta : {};
  const params = isObj(meta.params) ? meta.params : {};

  return {
    meta: {
      generatedAt: text(meta.generated_at),
      snapshotAt: text(meta.snapshot_at),
      from: text(meta.from),
      to: text(meta.to),
      days: num(params.days),
    },
    co2: guard('co2', () => mapTimeseries(sections.co2)),
    flux: guard('flux', () => mapTimeseries(sections.flux)),
    do: guard('do', () => mapTimeseries(sections.do)),
    ph: guard('ph', () => mapTimeseries(sections.ph)),
    ctd: guard('ctd', () => mapTimeseries(sections.ctd)),
    atm: guard('atm', () => mapTimeseries(sections.atm)),
    diurnal: guard('diurnal', () => mapDiurnal(sections.diurnal)),
    windrose: guard('windrose', () => mapWindrose(sections.windrose)),
    correlation: guard('correlation', () => mapCorrelation(sections.correlation)),
    analysis: guard('analysis', () => mapAnalysis(sections.analysis)),
    ecosystem: guard('ecosystem', () => mapEcosystem(sections.ecosystem)),
    kpi: guard('kpi', () => mapKpi(sections.kpi)),
    gauges: guard('gauges', () => mapGauges(sections.gauges)),
    table: guard('table', () => mapTable(sections.table)),
  };
}
