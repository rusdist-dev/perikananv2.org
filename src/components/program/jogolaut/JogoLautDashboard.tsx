import { Container } from '@/components/layout/Container';
import { ColumnChart, DivergingBars } from './BarChart';
import { ChartCard, GroupLabel } from './ChartCard';
import {
  CorrelationMatrix,
  LevelBars,
  OutlierPanel,
  RegressionPanel,
  SensorStatus,
  StatTiles,
  WindStats,
} from './DataPanels';
import { Gauge } from './Gauge';
import { LineChart } from './LineChart';
import { WindRose } from './WindRose';
import { fmt } from './chart-theme';
import * as d from './data';

/** Dua kartu berdampingan di layar lebar, bertumpuk di ponsel. Ditulis sekali
 *  di sini, bukan diulang di tiap pasangan kartu -- kalau diulang, satu di
 *  antaranya pasti menyimpang saat jaraknya diubah. */
const PAIR = 'grid gap-5 lg:grid-cols-2';

/** Dasbor pemantauan stasiun Jogo Laut: ringkasan angka, lalu kartu grafik
 *  yang dikelompokkan per tema (karbon, kualitas air, atmosfer, statistik,
 *  status sensor).
 *
 *  Latar --color-surface, kartunya putih. Kebalikan dari section lain di
 *  halaman program (putih dengan border tipis) -- di sini kartunya banyak dan
 *  rapat, dan tanpa kontras latar, dua puluh border tipis berbaris hanya
 *  terbaca sebagai kisi, bukan sebagai kartu terpisah.
 *
 *  Seluruh angkanya statis, dari ./data.ts. Kalimat penanda itu tercetak di
 *  kepala seksi, bukan cuma di komentar kode: pembaca halaman berhak tahu
 *  bahwa yang dilihatnya contoh, bukan pembacaan sensor saat ini. */
export function JogoLautDashboard() {
  return (
    <div className="bg-surface">
      <Container className="page-gutter py-14 lg:pe-(--spacing-panel-gutter)">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
          Pemantauan Ekosistem
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-primary md:text-3xl">
          Apa yang direkam stasiun Jogo Laut
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
          Stasiun riset terpadu di Cilacap merekam karbon tanah, kualitas air, pasang surut, dan
          cuaca permukaan secara menerus. Kartu di bawah memperlihatkan bentuk data yang dihasilkan
          rangkaian sensor itu selama satu jendela pengamatan.
        </p>
        <p className="mt-3 max-w-3xl rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
          <strong className="font-bold text-primary">Catatan:</strong> seluruh angka pada halaman
          ini adalah contoh statis untuk keperluan tampilan, bukan pembacaan sensor terkini.
          Periode {d.PERIOD_LABEL} · {d.SAMPLE_COUNT} sampel · interval{' '}
          {d.SAMPLE_INTERVAL_HOURS} jam · pembaruan terakhir {d.LAST_UPDATE}.
        </p>

        <div className="mt-8">
          <StatTiles stats={d.stats} />
        </div>

        {/* --- Karbon & pasang surut ------------------------------------ */}
        <GroupLabel>Karbon &amp; pasang surut</GroupLabel>

        <ChartCard
          title="CO₂ tanah, CO₂ udara, dan pasang surut"
          meta={`${d.PERIOD_LABEL} · tiap ${d.SAMPLE_INTERVAL_HOURS} jam`}
          note={
            <>
              CO₂ tanah bergerak berlawanan dengan pasut dan tertinggal sekitar {d.LAG_MINUTES}{' '}
              menit di belakangnya: saat air surut, pori tanah terbuka dan karbon hasil respirasi
              terlepas. CO₂ udara jauh lebih datar pada skala yang sama — itu pembanding yang
              memperlihatkan ayunan tersebut berasal dari tanahnya, bukan dari sensornya.
            </>
          }
        >
          <LineChart
            labels={d.timeLabels}
            left={{ unit: 'ppm', color: 'series-1' }}
            right={{ unit: 'cm', color: 'series-2' }}
            height={260}
            ariaLabel={`Grafik garis CO₂ tanah, CO₂ udara, dan pasang surut selama ${d.PERIOD_LABEL}`}
            series={[
              { label: 'CO₂ tanah', values: d.co2Tanah, color: 'series-1', area: true },
              { label: 'CO₂ udara', values: d.co2Udara, color: 'series-3' },
              { label: 'Pasang surut', values: d.pasut, color: 'series-2', axis: 'right', dashed: true },
            ]}
          />
        </ChartCard>

        <div className={`${PAIR} mt-5`}>
          <ChartCard
            title="Fluks karbon per jam"
            meta="rata-rata harian"
            note="Batang di atas garis nol berarti karbon lepas ke atmosfer, di bawahnya berarti karbon terserap. Pola hariannya mengikuti pasut, bukan matahari — puncak emisi jatuh pada jam surut terendah."
          >
            <DivergingBars
              labels={d.hourLabels}
              values={d.fluksKarbon}
              unit="µmol/m²/s"
              positive={{ label: 'Emisi', color: 'series-4' }}
              negative={{ label: 'Serapan', color: 'series-1' }}
              ariaLabel="Grafik batang dua arah fluks karbon tiap jam dalam sehari"
            />
          </ChartCard>

          <ChartCard
            title="Respirasi tanah per jam"
            meta="rata-rata harian"
            note="Selalu positif — tanah selalu bernapas. Yang berubah adalah lajunya: tertinggi pada sore hari saat suhu tanah memuncak, terendah menjelang subuh."
          >
            <ColumnChart
              labels={d.hourLabels}
              values={d.respirasi}
              color="series-5"
              unit="µmol/m²/s"
              seriesLabel="Respirasi tanah"
              ariaLabel="Grafik batang laju respirasi tanah tiap jam dalam sehari"
            />
          </ChartCard>
        </div>

        <div className={`${PAIR} mt-5`}>
          <ChartCard
            title="Rata-rata diurnal CO₂ tanah"
            meta={`${d.SAMPLE_COUNT} sampel`}
            note={
              <>
                Tiap batang adalah rata-rata seluruh pembacaan pada jam tersebut sepanjang jendela
                pengamatan; garis tegak di ujungnya menandai ± 1 simpangan baku. Puncaknya di sekitar
                pukul {String(d.peakHour).padStart(2, '0')}:00. Tiga lonjakan yang ditandai kartu
                pencilan di bawah tidak ikut dirata-ratakan — satu pembacaan ekstrem cukup untuk
                memindahkan jam puncak ke jam kejadiannya.
              </>
            }
          >
            <ColumnChart
              labels={d.hourLabels}
              values={d.diurnalMean}
              errors={d.diurnalStd}
              color="series-4"
              unit="ppm"
              seriesLabel="Rata-rata CO₂ tanah"
              ariaLabel="Grafik batang rata-rata CO₂ tanah tiap jam beserta simpangan bakunya"
            />
          </ChartCard>

          <ChartCard
            title="Regresi CO₂ tanah terhadap pasut"
            meta="kuadrat terkecil"
            note={
              <>
                R² = {fmt(d.regression.r2, 3)} berarti sekitar{' '}
                {fmt(d.regression.r2 * 100, 0)}% ragam CO₂ tanah dapat dijelaskan oleh pasut saja.
                Proyeksi di atas memakai ramalan harmonik pasut, jadi ia melemah cepat di luar
                beberapa jam ke depan.
              </>
            }
          >
            <RegressionPanel
              slope={d.regression.slope}
              intercept={d.regression.intercept}
              r2={d.regression.r2}
              current={d.regression.current}
              steps={d.regression.steps}
            />
          </ChartCard>
        </div>

        {/* --- Kualitas air --------------------------------------------- */}
        <GroupLabel>Kualitas air</GroupLabel>

        <div className={PAIR}>
          <ChartCard
            title="Oksigen terlarut &amp; suhu air"
            meta={d.RECENT_PERIOD_LABEL}
            note="Keduanya bergerak berlawanan: kelarutan oksigen turun saat air menghangat. Turun di bawah 5 mg/L untuk waktu lama adalah tekanan nyata bagi ikan dan biota dasar."
          >
            <LineChart
              labels={d.recentTimeLabels}
              xTickCount={4}
              left={{ unit: 'mg/L', color: 'series-1' }}
              right={{ unit: '°C', color: 'series-4' }}
              ariaLabel="Grafik garis oksigen terlarut dan suhu air"
              series={[
                { label: 'Oksigen terlarut', values: d.recent(d.doAir), color: 'series-1', area: true },
                { label: 'Suhu air', values: d.recent(d.suhuAir), color: 'series-4', axis: 'right' },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Konduktivitas &amp; pasang surut"
            meta={d.RECENT_PERIOD_LABEL}
            note="Konduktivitas naik-turun mengikuti pasut hampir tanpa jeda — penanda langsung seberapa jauh air laut masuk ke perairan payau di sekitar stasiun."
          >
            <LineChart
              labels={d.recentTimeLabels}
              xTickCount={4}
              left={{ unit: 'µS/cm', color: 'series-3' }}
              right={{ unit: 'cm', color: 'series-2' }}
              ariaLabel="Grafik garis konduktivitas air dan pasang surut"
              series={[
                { label: 'Konduktivitas', values: d.recent(d.konduktivitas), color: 'series-3' },
                { label: 'Pasang surut', values: d.recent(d.pasut), color: 'series-2', axis: 'right', dashed: true },
              ]}
            />
          </ChartCard>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <ChartCard title="pH air terkini" meta={d.LAST_UPDATE} bodyClassName="flex items-center">
            <Gauge
              value={d.phGauge.value}
              min={d.phGauge.min}
              max={d.phGauge.max}
              digits={2}
              unit="pH"
              level={d.phGauge.level}
              levelLabel={d.phGauge.levelLabel}
              thresholds={[6.5, 8.5]}
              ariaLabel={`Pengukur pH air, nilai ${fmt(d.phGauge.value, 2)} dari skala 0 sampai 14`}
            />
          </ChartCard>

          <ChartCard
            className="lg:col-span-2"
            title="pH air &amp; suhu air"
            meta={d.RECENT_PERIOD_LABEL}
            note="Dua garis penanda pada pengukur di sebelah kiri adalah batas 6,5 dan 8,5 — rentang yang umum dipakai sebagai baku mutu air laut untuk biota. Siklus harian pH mengikuti fotosintesis fitoplankton: naik pada siang hari, turun pada malam hari."
          >
            <LineChart
              labels={d.recentTimeLabels}
              xTickCount={4}
              left={{ unit: 'pH', color: 'series-3' }}
              right={{ unit: '°C', color: 'series-4' }}
              ariaLabel="Grafik garis pH air dan suhu air"
              series={[
                { label: 'pH air', values: d.recent(d.phAir), color: 'series-3', area: true },
                { label: 'Suhu air', values: d.recent(d.suhuAir), color: 'series-4', axis: 'right' },
              ]}
            />
          </ChartCard>
        </div>

        <ChartCard
          className="mt-5"
          title="Ambang kualitas air"
          meta={`terkini · ${d.LAST_UPDATE}`}
          note="Skala tiap bar dicetak lengkap dengan batasnya, jadi angka terkini bisa dinilai sendiri tanpa bergantung pada warnanya."
        >
          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            <LevelBars metrics={d.waterQuality.slice(0, 2)} />
            <LevelBars metrics={d.waterQuality.slice(2)} />
          </div>
        </ChartCard>

        {/* --- Atmosfer -------------------------------------------------- */}
        <GroupLabel>Atmosfer &amp; cuaca permukaan</GroupLabel>

        <div className={PAIR}>
          <ChartCard
            title="Suhu udara &amp; kelembaban"
            meta={d.RECENT_PERIOD_LABEL}
            note="Pola cermin yang khas iklim pesisir tropis: kelembaban turun tepat saat suhu memuncak pada tengah hari, lalu pulih setelah matahari terbenam."
          >
            <LineChart
              labels={d.recentTimeLabels}
              xTickCount={4}
              left={{ unit: '°C', color: 'series-4' }}
              right={{ unit: '%', color: 'series-5' }}
              ariaLabel="Grafik garis suhu udara dan kelembaban relatif"
              series={[
                { label: 'Suhu udara', values: d.recent(d.suhuUdara), color: 'series-4' },
                { label: 'Kelembaban', values: d.recent(d.kelembaban), color: 'series-5', axis: 'right' },
              ]}
            />
          </ChartCard>

          <ChartCard
            title="Kecepatan angin &amp; curah hujan"
            meta={d.RECENT_PERIOD_LABEL}
            note="Curah hujan sengaja digambar sebagai deret yang sebagian besar bernilai nol — hujan di lokasi ini datang sebagai beberapa kejadian pendek yang deras, bukan sebagai rintik menerus."
          >
            <LineChart
              labels={d.recentTimeLabels}
              xTickCount={4}
              left={{ unit: 'm/s', color: 'series-2' }}
              right={{ unit: 'mm', color: 'series-1' }}
              ariaLabel="Grafik garis kecepatan angin dan curah hujan"
              series={[
                { label: 'Kecepatan angin', values: d.recent(d.kecAngin), color: 'series-2' },
                { label: 'Curah hujan', values: d.recent(d.curahHujan), color: 'series-1', axis: 'right', area: true },
              ]}
            />
          </ChartCard>
        </div>

        <div className={`${PAIR} mt-5`}>
          <ChartCard
            title="Mawar angin"
            meta={`${d.PERIOD_LABEL} · 16 penjuru`}
            note="Panjang tiap sektor sebanding dengan seberapa sering angin datang dari arah itu. Cincin acuan menandai seperempat, setengah, tiga perempat, dan seluruh frekuensi tertinggi."
          >
            <WindRose
              directions={d.WIND_DIRECTIONS}
              values={d.windRose}
              ariaLabel="Mawar angin 16 penjuru; arah dominan timur laut"
            />
          </ChartCard>

          <ChartCard
            title="Ringkasan angin"
            meta={d.PERIOD_LABEL}
            note="Angin timur laut yang menetap sepanjang musim kemarau ikut menentukan arah sebaran sedimen dan larva di perairan sekitar stasiun."
            bodyClassName="flex items-center"
          >
            <WindStats stats={d.windStats} />
          </ChartCard>
        </div>

        <div className={`${PAIR} mt-5`}>
          <ChartCard
            title="Indeks panas"
            meta={d.LAST_UPDATE}
            bodyClassName="flex items-center"
          >
            <Gauge
              value={d.heatIndex.value}
              min={d.heatIndex.min}
              max={d.heatIndex.max}
              unit="°C terasa"
              level={d.heatIndex.level}
              levelLabel={d.heatIndex.levelLabel}
              thresholds={[27, 32, 41]}
              ariaLabel={`Pengukur indeks panas, ${fmt(d.heatIndex.value, 1)} derajat Celsius terasa, tingkat ${d.heatIndex.levelLabel}`}
            />
          </ChartCard>

          <ChartCard title="Kondisi kerja lapangan" meta="turunan indeks panas">
            <dl className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                <dt className="text-sm text-muted">Suhu udara</dt>
                <dd className="font-mono text-sm text-primary">
                  {fmt(d.heatIndex.airTemp, 1)} °C
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
                <dt className="text-sm text-muted">Kelembaban relatif</dt>
                <dd className="font-mono text-sm text-primary">
                  {fmt(d.heatIndex.humidity, 1)} %
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                  Tingkat {d.heatIndex.levelLabel}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">
                  {d.heatIndex.description}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-muted">
                  Batas yang ditandai
                </dt>
                <dd className="mt-2 font-mono text-xs text-muted">
                  27 °C waspada · 32 °C bahaya · 41 °C bahaya ekstrem
                </dd>
              </div>
            </dl>
          </ChartCard>
        </div>

        {/* --- Statistik -------------------------------------------------- */}
        <GroupLabel>Analisis statistik</GroupLabel>

        {/* Matriks 6x6 dapat barisnya sendiri, tidak diadu dengan kartu di
            sebelahnya. Di kolom yang lebih sempit, kolom terakhirnya ("Kelembaban")
            terpotong di tepi kartu -- tabelnya memang bisa digulir ke samping,
            tapi judul kolom yang terpenggal terbaca sebagai kerusakan, bukan
            sebagai undangan menggulir. */}
        <ChartCard
          title="Matriks korelasi antar-variabel"
          meta="koefisien Pearson"
          note={
            <>
              Korelasi terkuat di luar diagonal ada pada pasangan{' '}
              <strong className="font-bold text-primary">
                {d.strongestPair.a} &amp; {d.strongestPair.b}
              </strong>{' '}
              (r = {fmt(d.strongestPair.r, 2)}). Korelasi bukan sebab-akibat: dua variabel bisa
              bergerak bersama karena sama-sama mengikuti pasut.
            </>
          }
        >
          <CorrelationMatrix variables={d.CORR_VARS} matrix={d.corrMatrix} />
        </ChartCard>

        <ChartCard
          className="mt-5"
          title="Deteksi pencilan CO₂ tanah"
          meta="metode 1,5 × IQR"
          note="Pencilan tidak otomatis berarti sensor rusak — sebagian di antaranya adalah kejadian nyata (hujan deras, surut ekstrem) yang justru paling menarik untuk ditelusuri."
        >
          <OutlierPanel
            lower={d.outliers.lower}
            upper={d.outliers.upper}
            found={d.outliers.found}
          />
        </ChartCard>

        {/* --- Sensor ----------------------------------------------------- */}
        <GroupLabel>Status rangkaian sensor</GroupLabel>
        <SensorStatus sensors={d.sensors} />
      </Container>
    </div>
  );
}
