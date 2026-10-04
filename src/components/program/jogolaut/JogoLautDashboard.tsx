import { Container } from '@/components/layout/Container';
import { getJogoLautDictionary } from '@/i18n/dictionaries/jogolaut';
import type { Locale } from '@/i18n/config';
import type { JlGauge, JlSeries, JlTimeseries, JogoLautMonitoring } from '@/lib/content/jogolaut';
import { DivergingBars } from './BarChart';
import { ChartCard, GroupLabel } from './ChartCard';
import {
  CorrelationMatrix,
  DataTable,
  EcosystemPanel,
  LevelBars,
  OutlierPanel,
  RegressionPanel,
  StatTiles,
  WindStats,
  type LevelBarItem,
} from './DataPanels';
import { Gauge } from './Gauge';
import { LineChart } from './LineChart';
import { WindRose } from './WindRose';
import { SERIES_CLASSES, apiColor, fmt, type SeriesColor } from './chart-theme';
import { dateTimeLabel, rangeLabel, stamp } from './time';

/** Dua kartu berdampingan di layar lebar, bertumpuk di ponsel. Ditulis sekali
 *  di sini, bukan diulang di tiap pasangan kartu -- kalau diulang, satu di
 *  antaranya pasti menyimpang saat jaraknya diubah. */
const PAIR = 'grid gap-5 lg:grid-cols-2';

/** Skala pengukur dan bar per key `gauges[]`. API mengirim nilai dan tingkatnya,
 *  tapi bukan rentang skalanya -- dan skala yang tidak tetap tidak bisa
 *  dibandingkan dari hari ke hari. Ambang hanya ditandai bila batasnya baku
 *  dan tidak bergantung pada stasiun: baku mutu pH air laut 6,5-8,5 dan batas
 *  indeks panas NOAA. Key yang tidak tercantum (mis. konduktivitas, yang
 *  rentang wajarnya bergantung pada kalibrasi sensor) memakai rentang
 *  jendela pengamatan dari `kpi` sebagai skalanya, dan bar-nya mengatakan
 *  begitu. */
const HEAT_INDEX_KEY = 'heat_index';

const GAUGE_SCALES: Record<string, { min: number; max: number; thresholds?: number[] }> = {
  heat_index: { min: 20, max: 50, thresholds: [27, 32, 41] },
  do: { min: 0, max: 10 },
  ph_air: { min: 0, max: 14, thresholds: [6.5, 8.5] },
  water_temp: { min: 20, max: 40 },
};

/* --- Pembantu deret ------------------------------------------------------ */

type Pick = {
  key: string;
  color: SeriesColor;
  area?: boolean;
  dashed?: boolean;
  connectGaps?: boolean;
  /** Batas bawah sumbu, untuk besaran yang tidak pernah negatif (hujan). */
  min?: number;
};

/** Deret dengan key itu, asal ADA dan tidak seluruhnya null. Deret yang
 *  kosong dibuang dari kartu, bukan digambar sebagai garis yang tidak ada --
 *  legenda yang menjanjikan garis yang tidak terlihat lebih membingungkan
 *  daripada kartu dengan satu garis lebih sedikit. */
function seriesOf(section: JlTimeseries | null, key: string): JlSeries | null {
  const s = section?.series.find((v) => v.key === key);
  return s && s.data.some((v) => v !== null) ? s : null;
}

/** Grafik garis untuk satu section timeseries: deret `left` berbagi sumbu
 *  kiri, `right` sumbu kanan, `right2` sumbu kanan kedua. Satuan sumbunya
 *  diambil dari deret pertama di tiap sisi. Sisi yang kosong diisi sisi
 *  sesudahnya, jadi satu deret yang hilang tidak meninggalkan sumbu kosong. */
function SectionLines({
  section,
  left,
  right = [],
  right2 = [],
  locale,
  height,
  tickColumnWidth,
  showXAxis,
  ariaLabel,
}: {
  section: JlTimeseries | null;
  left: Pick[];
  right?: Pick[];
  right2?: Pick[];
  locale: Locale;
  height?: number;
  tickColumnWidth?: string;
  showXAxis?: boolean;
  ariaLabel: string;
}) {
  if (!section) return <Unavailable locale={locale} />;

  const resolve = (picks: Pick[]) =>
    picks.flatMap((p) => {
      const s = seriesOf(section, p.key);
      return s ? [{ pick: p, series: s }] : [];
    });

  // Sisi yang kosong dibuang, lalu sisi yang tersisa diberi sumbu berurutan:
  // kiri kosong tapi kanan ada berarti kanan pindah ke kiri, bukan kartunya
  // dikosongkan.
  const sides = [resolve(left), resolve(right), resolve(right2)].filter((side) => side.length > 0);
  if (sides.length === 0) return <Unavailable locale={locale} />;

  const AXES = ['left', 'right', 'right2'] as const;
  const [leftSide, rightSide = [], right2Side = []] = sides;
  const all = sides.flatMap((side, i) => side.map((r) => ({ ...r, axis: AXES[i] })));
  const axisOf = (side: typeof leftSide) => ({
    unit: side[0].series.unit,
    color: side[0].pick.color,
    min: side[0].pick.min,
  });

  return (
    <LineChart
      labels={section.x}
      times={section.x.map(stamp)}
      locale={locale}
      height={height}
      tickColumnWidth={tickColumnWidth}
      showXAxis={showXAxis}
      left={axisOf(leftSide)}
      right={rightSide.length > 0 ? axisOf(rightSide) : undefined}
      right2={right2Side.length > 0 ? axisOf(right2Side) : undefined}
      tooltipLabels={section.x.map((x) => dateTimeLabel(x, locale))}
      ariaLabel={ariaLabel}
      series={all.map(({ pick, series, axis }) => ({
        label: series.label,
        values: series.data,
        color: pick.color,
        axis,
        area: pick.area,
        dashed: pick.dashed,
        connectGaps: pick.connectGaps,
        dec: series.dec,
      }))}
    />
  );
}

function Unavailable({ locale }: { locale: Locale }) {
  return (
    <p className="flex h-full min-h-32 items-center justify-center rounded-md bg-surface p-6 text-center text-sm text-muted">
      {getJogoLautDictionary(locale).noReadings}
    </p>
  );
}

/** Rata-rata CO2 tanah per jam dengan pita ± 1 simpangan baku.
 *
 *  Garis, bukan batang: rata-rata per jamnya berayun di kisaran 440-475 ppm,
 *  dan grafik batang (yang dasarnya selalu nol, lihat ColumnChart) menggambar
 *  24 batang yang tampak sama tinggi. Garis boleh memotong sumbunya, jadi
 *  ayunan hariannya -- yang justru ingin diperlihatkan -- terlihat. */
function DiurnalLines({
  diurnal,
  locale,
}: {
  diurnal: NonNullable<JogoLautMonitoring['diurnal']>;
  locale: Locale;
}) {
  const t = getJogoLautDictionary(locale);
  const { mean, std } = diurnal;
  const labels = diurnal.hours.map((h) => `${String(h).padStart(2, '0')}:00`);
  const band = (sign: 1 | -1) =>
    mean.data.map((m, i) => {
      const sd = std?.data[i];
      return m === null || sd === null || sd === undefined ? null : m + sign * sd;
    });

  return (
    <LineChart
      labels={labels}
      locale={locale}
      left={{ unit: mean.unit, color: 'series-4' }}
      tooltipLabels={labels}
      ariaLabel={t.diurnalAria}
      series={[
        { label: mean.label, values: mean.data, color: 'series-4', dec: mean.dec },
        ...(std
          ? [
              { label: t.sdPlus, values: band(1), color: 'series-6' as const, dashed: true, dec: mean.dec },
              { label: t.sdMinus, values: band(-1), color: 'series-6' as const, dashed: true, dec: mean.dec },
            ]
          : []),
      ]}
    />
  );
}

/** Pengukur satu nilai terkini. Tanpa skala tetap (lihat GAUGE_SCALES) ia
 *  jatuh ke angka + tingkat saja, dengan tinggi yang sejajar dengan pengukur
 *  di sebelahnya. */
function GaugeCard({ gauge, locale }: { gauge: JlGauge; locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  const scale = GAUGE_SCALES[gauge.key];
  const color = apiColor(gauge.color);

  return (
    <ChartCard title={gauge.label} bodyClassName="flex items-center" note={gauge.description}>
      {gauge.value === null ? (
        <Unavailable locale={locale} />
      ) : scale ? (
        <Gauge
          value={gauge.value}
          min={scale.min}
          max={scale.max}
          digits={gauge.dec}
          unit={gauge.unit}
          color={color}
          levelLabel={gauge.levelLabel}
          thresholds={scale.thresholds}
          locale={locale}
          scaleLabel={t.gaugeScale}
          ariaLabel={t.gaugeAria(gauge.label, fmt(gauge.value, gauge.dec, locale), gauge.unit, gauge.levelLabel)}
        />
      ) : (
        <div className="mx-auto text-center">
          <p className="break-all font-mono text-2xl leading-none text-primary">{fmt(gauge.value, gauge.dec, locale)}</p>
          <p className="mt-1 font-mono text-xs text-muted">{gauge.unit}</p>
          <p className={`mt-3 text-sm font-bold ${SERIES_CLASSES[color].text}`}>{gauge.levelLabel}</p>
        </div>
      )}
    </ChartCard>
  );
}

/* =========================================================================
   DASBOR

   Pemantauan stasiun Jogo Laut: ringkasan angka, pengukur kondisi terkini,
   lalu kartu grafik yang dikelompokkan per tema (karbon, kualitas air,
   atmosfer, statistik), dan pembacaan mentah terbaru.

   Isinya dari /ext/jogolaut/monitoring (lib/content/source.ts), satu
   section API per kartu atau sepasang kartu. Catatan di tiap kartu menjelaskan
   CARA MEMBACA grafiknya, bukan apa yang sedang diperlihatkannya: datanya
   berganti tiap lima menit, dan kalimat seperti "CO2 bergerak berlawanan
   dengan pasut" bisa saja keliru untuk jendela yang sedang tampil. Kalimat
   yang menyebut angka hanya memakai angka yang dikirim API sendiri (jam
   puncak, jeda, pasangan korelasi terkuat).

   Latar --color-surface, kartunya putih. Kebalikan dari section lain di
   halaman program (putih dengan border tipis) -- di sini kartunya banyak dan
   rapat, dan tanpa kontras latar, dua puluh border tipis berbaris hanya
   terbaca sebagai kisi, bukan sebagai kartu terpisah.
   ========================================================================= */
export function JogoLautDashboard({
  data,
  locale,
}: {
  /** null = API tidak bisa dihubungi atau belum dikonfigurasi. */
  data: JogoLautMonitoring | null;
  locale: Locale;
}) {
  const t = getJogoLautDictionary(locale);
  return (
    <div className="bg-surface">
      {/* Tanpa lg:pe-(--spacing-panel-gutter) yang dipakai section lain:
          padding kanan selebar panel nav itu menyimetriskan teks editorial,
          tapi di sini ia cuma menyempitkan grafik -- dua kartu berdampingan
          kehilangan ~17rem lebar plot. Dasbornya karena itu memanjang sampai
          gutter kanan halaman. */}
      <Container className="page-gutter py-14">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">{t.eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">{t.heading}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{t.intro}</p>

        {data ? <Dashboard data={data} locale={locale} /> : <DashboardUnavailable locale={locale} />}
      </Container>
    </div>
  );
}

function DashboardUnavailable({ locale }: { locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  return (
    <p className="mt-8 max-w-3xl rounded-md border border-border bg-bg p-4 text-sm leading-relaxed text-muted">
      <strong className="font-bold text-primary">{t.unavailableTitle}</strong> {t.unavailableBody}
    </p>
  );
}

function Dashboard({ data, locale }: { data: JogoLautMonitoring; locale: Locale }) {
  const t = getJogoLautDictionary(locale);
  const { meta } = data;
  const period = rangeLabel(meta.from, meta.to, locale) ?? t.periodFallback;
  const windowLabel = meta.days ? t.lastDays(fmt(meta.days, 0, locale)) : period;
  const updated = meta.snapshotAt ? `${dateTimeLabel(meta.snapshotAt, locale)} ${t.timezone}` : '–';

  /** Nama dan satuan deret menurut key -- dikumpulkan dari seluruh section
   *  timeseries, dipakai panel yang cuma membawa key (tren ekosistem,
   *  pasangan korelasi terkuat). */
  const allSeries = [data.co2, data.do, data.ph, data.ctd, data.atm].flatMap(
    (s) => s?.series ?? [],
  );
  const labelFor = (key: string) =>
    data.correlation?.vars.find((v) => v.key === key)?.label ??
    allSeries.find((s) => s.key === key)?.label ??
    key;
  const unitFor = (key: string) => allSeries.find((s) => s.key === key)?.unit ?? '';

  const flux = data.flux;
  const carbonFlux = seriesOf(flux, 'carbon_flux');
  const respirasi = seriesOf(flux, 'respirasi');
  /** Faktor respirasi -> fluks karbon, dihitung dari datanya sendiri
   *  (kuadrat terkecil lewat titik nol), bukan diketik 12/44: kalau CMS suatu
   *  saat mengubah rumusnya, sumbu kanan ikut benar tanpa perubahan kode. */
  const fluxScale = (() => {
    if (!respirasi || !carbonFlux) return null;
    let num = 0;
    let den = 0;
    respirasi.data.forEach((r, i) => {
      const c = carbonFlux.data[i];
      if (r === null || c === null || c === undefined) return;
      num += r * c;
      den += r * r;
    });
    return den > 0 ? num / den : null;
  })();

  const analysis = data.analysis;
  const ccf = analysis?.ccf.filter((c) => c.r !== null) ?? [];
  const minutesPerLag =
    analysis?.bestLag && analysis.lagMinutes !== null ? analysis.lagMinutes / analysis.bestLag : null;
  const lagText = (lag: number) =>
    minutesPerLag !== null
      ? `${fmt(lag * minutesPerLag, 0, locale)} ${t.minutesShort}`
      : t.ccfLag(fmt(lag, 0, locale));

  /** Indeks panas tetap jadi pengukur sendiri -- satu-satunya nilai
   *  atmosfer di antara `gauges`. Sisanya parameter air, digabung jadi satu
   *  daftar bar supaya bisa dibandingkan sekilas. */
  const heatIndex = data.gauges?.find((g) => g.key === HEAT_INDEX_KEY && g.value !== null) ?? null;
  const waterLevels: LevelBarItem[] = (data.gauges ?? []).flatMap((g) => {
    if (g.key === HEAT_INDEX_KEY || g.value === null) return [];
    const fixed = GAUGE_SCALES[g.key];
    const kpi = data.kpi?.find((k) => k.key === g.key);
    const scale = fixed
      ? { min: fixed.min, max: fixed.max, note: t.scaleFixed }
      : kpi && kpi.min !== null && kpi.max !== null && kpi.max > kpi.min
        ? { min: kpi.min, max: kpi.max, note: t.scaleWindow(windowLabel) }
        : null;
    if (!scale) return [];
    return [
      {
        key: g.key,
        label: g.label,
        value: g.value,
        unit: g.unit,
        dec: g.dec,
        levelLabel: g.levelLabel,
        color: apiColor(g.color),
        min: scale.min,
        max: scale.max,
        thresholds: fixed?.thresholds,
        scaleNote: scale.note,
      },
    ];
  });

  const windrose = data.windrose;
  const roseDirections = windrose ? [...windrose.directions].sort((a, b) => a.deg - b.deg) : [];
  const roseTotal = roseDirections.reduce((sum, d) => sum + d.count, 0);

  return (
    <>
      <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
        <strong className="font-bold text-primary">{t.liveLead}</strong>
        {t.liveRest(period, updated)}
      </p>

      <div className={`${PAIR} mt-5`}>
        <ChartCard
          title={t.windRoseTitle}
          meta={t.windRoseMeta(windowLabel)}
          note={t.windRoseNote}
        >
          {windrose && roseTotal > 0 ? (
            <WindRose
              directions={roseDirections.map((d) => d.dir)}
              values={roseDirections.map((d) => (d.count / roseTotal) * 100)}
              locale={locale}
              outerRingLabel={t.windRoseOuterRing}
              ariaLabel={t.windRoseAria(windrose.dominant?.label ?? null)}
            />
          ) : (
            <Unavailable locale={locale} />
          )}
        </ChartCard>

        <ChartCard title={t.windSummaryTitle} meta={windowLabel} bodyClassName="flex items-center">
          {windrose ? <WindStats windrose={windrose} locale={locale} /> : <Unavailable locale={locale} />}
        </ChartCard>
      </div>

      {/* --- Kondisi terkini ---------------------------------------------- */}
      {heatIndex || waterLevels.length > 0 ? (
        <>
          <GroupLabel>{t.groupCurrent}</GroupLabel>
          <div className="grid gap-5 lg:grid-cols-3">
            {heatIndex ? <GaugeCard gauge={heatIndex} locale={locale} /> : null}
            {waterLevels.length > 0 ? (
              <ChartCard
                className={heatIndex ? 'lg:col-span-2' : 'lg:col-span-3'}
                title={t.waterNowTitle}
                meta={meta.snapshotAt ? updated : undefined}
                note={t.waterNowNote}
              >
                <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                  <LevelBars
                    items={waterLevels.slice(0, Math.ceil(waterLevels.length / 2))}
                    locale={locale}
                  />
                  <LevelBars
                    items={waterLevels.slice(Math.ceil(waterLevels.length / 2))}
                    locale={locale}
                  />
                </div>
              </ChartCard>
            ) : null}
          </div>
        </>
      ) : null}

      {/* --- Atmosfer -------------------------------------------------- */}
      <GroupLabel>{t.groupAtmosphere}</GroupLabel>

      <ChartCard
        title={t.atmTitle}
        meta={windowLabel}
        note={t.atmNote}
      >
        <SectionLines
          section={data.atm}
          locale={locale}
          height={280}
          left={[{ key: 'suhu_udara', color: 'series-4' }]}
          right={[{ key: 'kelembaban', color: 'series-5' }]}
          right2={[{ key: 'kec_angin', color: 'series-2', min: 0 }]}
          ariaLabel={t.atmAria}
        />
      </ChartCard>

      {/* --- Kualitas air --------------------------------------------- */}
      <GroupLabel>{t.groupWater}</GroupLabel>

      <ChartCard
        title={t.doTitle}
        meta={windowLabel}
        note={t.doNote}
      >
        {/* Lebar penuh, bukan berpasangan: tiga kolom angka sumbu di kartu
            setengah lebar menyisakan area plot yang terlalu sempit. Curah
            hujan di section ini diselaraskan ke linimasa DO yang lebih rapat,
            jadi sebagian besar titiknya null -- connectGaps menyambungnya. */}
        <SectionLines
          section={data.do}
          locale={locale}
          height={260}
          left={[{ key: 'do', color: 'series-1' }]}
          right={[{ key: 'suhu_air', color: 'series-4' }]}
          right2={[{ key: 'curah_hujan', color: 'series-2', area: true, min: 0, connectGaps: true }]}
          ariaLabel={t.doAria}
        />
      </ChartCard>

      {/* --- Karbon & pasang surut ------------------------------------ */}
      <GroupLabel>{t.groupCarbon}</GroupLabel>

      <ChartCard
        title={t.co2Title}
        meta={windowLabel}
        note={t.co2Note}
      >
        <SectionLines
          section={data.co2}
          locale={locale}
          height={260}
          left={[
            { key: 'co2_tanah', color: 'series-1', area: true },
            { key: 'co2_udara', color: 'series-3' },
          ]}
          right={[{ key: 'pasut_ma', color: 'series-2', dashed: true }]}
          ariaLabel={t.co2Aria(period)}
        />
      </ChartCard>

      <ChartCard
        className="mt-5"
        title={t.phTitle}
        meta={windowLabel}
        note={t.phNote}
      >
        <SectionLines
          section={data.ph}
          locale={locale}
          height={260}
          left={[{ key: 'ph', color: 'series-3', area: true }]}
          right={[{ key: 'suhu_air', color: 'series-4' }]}
          right2={[{ key: 'pasut_ma', color: 'series-2', dashed: true, connectGaps: true }]}
          ariaLabel={t.phAria}
        />
      </ChartCard>

      <ChartCard
        className="mt-5"
        title={t.ctdTempTitle}
        meta={windowLabel}
        note={t.ctdTempNote}
      >
        <SectionLines
          section={data.ctd}
          locale={locale}
          height={260}
          left={[{ key: 'conductivity', color: 'series-3' }]}
          right={[{ key: 'suhu_air', color: 'series-4' }]}
          right2={[{ key: 'pasut_ma', color: 'series-2', dashed: true, connectGaps: true }]}
          ariaLabel={t.ctdTempAria}
        />
      </ChartCard>

      <ChartCard
        className="mt-5"
        title={t.fluxTitle}
        meta={t.fluxMeta}
        note={t.fluxNote}
      >
        {respirasi && flux ? (
          <LineChart
            labels={flux.x}
            times={flux.x.map(stamp)}
            locale={locale}
            height={260}
            left={{ unit: respirasi.unit, color: 'series-4' }}
            right={
              carbonFlux && fluxScale !== null
                ? { unit: carbonFlux.unit, color: 'series-4', mirror: fluxScale }
                : undefined
            }
            // Tanpa area: isinya akan diwarnai dari dasar grafik, bukan dari
            // garis nol, dan untuk deret yang bisa negatif itu terbaca
            // seolah-olah seluruhnya emisi.
            series={[
              { label: respirasi.label, values: respirasi.data, color: 'series-4', dec: respirasi.dec },
            ]}
            tooltipLabels={flux.x.map((x) => dateTimeLabel(x, locale))}
            // Fluks karbon tidak digambar (garisnya akan menumpuk persis di atas
            // respirasi), tapi nilainya dari API tetap dicetak di tooltip.
            tooltipExtra={
              carbonFlux
                ? [
                    {
                      label: carbonFlux.label,
                      color: 'series-4',
                      unit: carbonFlux.unit,
                      dec: carbonFlux.dec,
                      values: carbonFlux.data,
                      dashed: true,
                    },
                  ]
                : []
            }
            ariaLabel={t.fluxAria}
          />
        ) : (
          <Unavailable locale={locale} />
        )}
      </ChartCard>

      <div className={`${PAIR} mt-5`}>
        <ChartCard
          title={t.diurnalTitle}
          meta={windowLabel}
          note={
            data.diurnal?.peakHour != null
              ? `${t.diurnalNote} ${t.diurnalPeak(`${String(data.diurnal.peakHour).padStart(2, '0')}:00`)}`
              : t.diurnalNote
          }
        >
          {data.diurnal ? (
            <DiurnalLines diurnal={data.diurnal} locale={locale} />
          ) : (
            <Unavailable locale={locale} />
          )}
        </ChartCard>

        <ChartCard
          title={t.regressionTitle}
          meta={t.regressionMeta}
          note={t.regressionNote}
        >
          {analysis ? (
            <RegressionPanel analysis={analysis} locale={locale} />
          ) : (
            <Unavailable locale={locale} />
          )}
        </ChartCard>
      </div>

      <div className={`${PAIR} mt-5`}>
        <ChartCard
          title={t.ccfTitle}
          meta={t.ccfMeta}
          note={`${t.ccfNote}${
            analysis?.lagMinutes != null ? t.ccfNoteLag(fmt(analysis.lagMinutes, 0, locale)) : ''
          }.`}
        >
          {ccf.length > 0 ? (
            <DivergingBars
              labels={ccf.map((c) => String(c.lag))}
              values={ccf.map((c) => c.r)}
              unit="r"
              positive={{ label: t.ccfPositive, color: 'series-2' }}
              negative={{ label: t.ccfNegative, color: 'series-6' }}
              locale={locale}
              labelEvery={5}
              formatLabel={(label) => lagText(Number(label))}
              tooltip={(label, value) => `${lagText(Number(label))} — r = ${fmt(value, 3, locale)}`}
              ariaLabel={t.ccfAria}
            />
          ) : (
            <Unavailable locale={locale} />
          )}
        </ChartCard>

        <ChartCard
          title={t.ecoTitle}
          meta={windowLabel}
          note={t.ecoNote}
        >
          {data.ecosystem ? (
            <EcosystemPanel
              ecosystem={data.ecosystem}
              labelFor={labelFor}
              unitFor={unitFor}
              locale={locale}
            />
          ) : (
            <Unavailable locale={locale} />
          )}
        </ChartCard>
      </div>

      <ChartCard
        className="mt-5"
        title={t.ctdLevelTitle}
        meta={windowLabel}
        note={t.ctdLevelNote}
      >
        <SectionLines
          section={data.ctd}
          locale={locale}
          height={260}
          left={[{ key: 'conductivity', color: 'series-3' }]}
          right={[
            { key: 'level_air', color: 'series-1' },
            { key: 'pasut_ma', color: 'series-2', dashed: true, connectGaps: true },
          ]}
          ariaLabel={t.ctdLevelAria}
        />
      </ChartCard>

      {/* --- Statistik -------------------------------------------------- */}
      <GroupLabel>{t.groupStats}</GroupLabel>

      {/* Matriks dapat barisnya sendiri, tidak diadu dengan kartu di
          sebelahnya. Di kolom yang lebih sempit, kolom terakhirnya terpotong
          di tepi kartu -- tabelnya memang bisa digulir ke samping, tapi judul
          kolom yang terpenggal terbaca sebagai kerusakan, bukan sebagai
          undangan menggulir. */}
      <ChartCard
        title={t.corrTitle}
        meta={t.corrMeta}
        note={
          <>
            {data.correlation?.maxPair ? (
              <>
                {t.corrStrongest}{' '}
                <strong className="font-bold text-primary">
                  {labelFor(data.correlation.maxPair.a)} &amp; {labelFor(data.correlation.maxPair.b)}
                </strong>{' '}
                (r = {fmt(data.correlation.maxPair.r, 2, locale)}).{' '}
              </>
            ) : null}
            {t.corrCausation}
          </>
        }
      >
        {data.correlation ? (
          <CorrelationMatrix
            variables={data.correlation.vars.map((v) => v.label)}
            matrix={data.correlation.values}
            locale={locale}
          />
        ) : (
          <Unavailable locale={locale} />
        )}
      </ChartCard>

      <ChartCard
        className="mt-5"
        title={t.outlierTitle}
        meta={t.outlierMeta}
        note={t.outlierNote}
      >
        {analysis ? <OutlierPanel analysis={analysis} locale={locale} /> : <Unavailable locale={locale} />}
      </ChartCard>

      {/* --- Tabel ------------------------------------------------------ */}
      <GroupLabel>{t.groupLatest}</GroupLabel>

      <ChartCard
        title={t.tableTitle}
        meta={
          data.table
            ? t.tableMeta(fmt(data.table.rows.length, 0, locale), fmt(data.table.total, 0, locale))
            : undefined
        }
      >
        {data.table ? <DataTable table={data.table} locale={locale} /> : <Unavailable locale={locale} />}
      </ChartCard>
      
      {data.kpi ? (
        <div className="mt-8">
          <StatTiles items={data.kpi} locale={locale} />
          <p className="mt-2 text-xs text-muted">{t.kpiCaption(windowLabel)}</p>
        </div>
      ) : null}
    </>
  );
}
