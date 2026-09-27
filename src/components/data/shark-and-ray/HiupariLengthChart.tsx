'use client';

import { ColumnChart, type ColumnMarker } from '@/components/program/jogolaut/BarChart';
import { ChartCard } from '@/components/program/jogolaut/ChartCard';
import type { Locale } from '@/i18n/config';
import type { HiupariLengthChart as HiupariLengthChartData } from '@/lib/content';
import { HIUPARI_SIZE_LABEL, isHiupariSizeType } from '@/lib/hiupari-filters';

/** Angka panjang: dua desimal, dan koma desimalnya mengikuti locale pembaca. */
function num(value: number | null, locale: Locale, decimals = 2): string {
  return value === null ? '—' : value.toLocaleString(locale, { maximumFractionDigits: decimals });
}

/** Berapa label sumbu-x yang dicetak. Sama alasannya dengan dua halaman data
 *  lain: jumlah kelasnya berubah drastis mengikuti selang kelas (72 batang pada
 *  5 cm, 8 pada 50 cm), jadi jarak labelnya harus ikut dihitung. */
function labelEveryFor(count: number): number {
  return Math.max(1, Math.ceil(count / 12));
}

/** Nama jenis ukuran yang bisa dibaca. Nilai asing dari API dikembalikan apa
 *  adanya alih-alih dipaksa jadi "Panjang Total": kalau CMS suatu saat
 *  menambah jenis keenam, yang tampil harus namanya sendiri, bukan nama jenis
 *  lain. */
function sizeLabel(value: string): string {
  return isHiupariSizeType(value) ? HIUPARI_SIZE_LABEL[value] : value;
}

/** Satu angka ringkasan. <dl>, bukan tabel: pasangan label-nilai yang tidak
 *  punya hubungan baris-kolom apa pun. */
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs tracking-wide text-muted uppercase">{label}</dt>
      <dd className="font-mono text-sm font-bold text-primary">{value}</dd>
    </div>
  );
}

/**
 * Histogram sebaran panjang hiu dan pari + ringkasan dan indikatornya.
 *
 * DUA kartu, dan yang kedua bukan hiasan: histogram menunjukkan bentuk
 * sebaran, sementara Lm (panjang matang) dan Linf (panjang asimtotik) itulah
 * yang menjawab pertanyaan yang membuat grafik ini dibuat -- berapa banyak yang
 * tertangkap sebelum sempat memijah, dan seberapa jauh dari ukuran maksimum
 * spesiesnya. Angka itu tidak bisa dibaca dari bentuk batangnya.
 *
 * Satu-satunya dataset di situs ini yang punya Linf: IKAN dan Data Crab tidak
 * mengirimkannya sama sekali.
 */
export function HiupariLengthChart({
  chart,
  status,
  appliedSummary,
  locale,
}: {
  chart: HiupariLengthChartData | null;
  status: 'ready' | 'loading' | 'error';
  appliedSummary: string;
  locale: Locale;
}) {
  const loading = status === 'loading';
  const failed = status === 'error';

  // Kartu tetap dirender saat gagal supaya tata letaknya tidak melompat, dan
  // supaya form filter di sebelahnya tetap punya tempat untuk "coba lagi".
  if (!chart) {
    return (
      <ChartCard title="Length Frequency">
        <p className="text-sm leading-relaxed text-muted">
          Grafik frekuensi panjang gagal dimuat. Ubah filter lalu tekan Show Chart untuk mencoba
          lagi.
        </p>
      </ChartCard>
    );
  }

  const { unit, selangKelas, kematanganMatang, ringkasan, indikator, ketersediaanUkuran, kelas } =
    chart;
  const kosong = ringkasan.jumlahIndividu === 0 || kelas.length === 0;
  const judulUkuran = sizeLabel(chart.jenisUkuran);

  // Label sumbu HARUS angka mentah ("35", bukan "35,0"): ColumnMarker
  // menghitung posisi garis acuannya dengan Number(labels[i]), dan koma desimal
  // locale membuatnya NaN -- garis Lm/Linf lalu hilang tanpa error.
  const labels = kelas.map((row) => String(row.nilaiTengah));
  const values = kelas.map((row) => row.jumlah);

  /** Garis acuan yang BISA ditempatkan dengan benar.
   *
   *  ColumnMarker menginterpolasi posisinya antara nilai tengah kelas pertama
   *  dan terakhir, jadi nilai di luar rentang itu akan digambar di luar
   *  bingkai. Untuk Linf itu bukan kasus langka melainkan KEADAAN BIASA: ia
   *  dihitung Lmax / 0,95, jadi menurut definisinya selalu lebih besar dari
   *  panjang terbesar yang pernah terukur. Garisnya karena itu hampir selalu
   *  absen dari histogram, dan angkanya tinggal di kartu indikator -- tempat ia
   *  tidak bisa salah dibaca sebagai posisi. */
  const markers: ColumnMarker[] = [];
  let linfTerlukis = false;

  if (kelas.length >= 2) {
    const min = kelas[0].nilaiTengah;
    const max = kelas[kelas.length - 1].nilaiTengah;
    const inRange = (value: number) => value >= min && value <= max;

    if (indikator.lm !== null && inRange(indikator.lm)) {
      markers.push({
        value: indikator.lm,
        label: `Lm ${num(indikator.lm, locale, 1)} ${unit}`,
        color: 'series-1',
      });
    }

    if (indikator.linf !== null && inRange(indikator.linf)) {
      markers.push({
        value: indikator.linf,
        label: `Linf ${num(indikator.linf, locale, 1)} ${unit}`,
        color: 'series-3',
      });
      linfTerlukis = true;
    }
  }

  /** Kenapa Linf tidak tergambar, kalau memang tidak. Dikatakan, bukan
   *  didiamkan: pembaca yang mencari garisnya berhak tahu bahwa ia memang di
   *  luar bingkai, bukan hilang karena grafiknya rusak. */
  const catatanLinf =
    indikator.linf !== null && !linfTerlukis
      ? ` Garis Linf tidak tergambar karena ${num(indikator.linf, locale, 1)} ${unit} berada di luar rentang histogram ini -- panjang asimtotik memang bukan panjang yang pernah terukur. Angkanya ada di kartu di bawah.`
      : '';

  /** Peringatan histogram lintas spesies. Hanya muncul saat spesiesnya memang
   *  belum dipilih: menumpuk Squalus 31 cm dengan Alopias 392 cm menghasilkan
   *  bentuk yang tidak menggambarkan satu populasi pun. */
  const catatanSpesies = chart.spesies
    ? ''
    : ' SELURUH spesies digabung di sini karena belum ada yang dipilih -- yang terlihat adalah campuran hiu dan pari dengan ukuran dewasa yang sangat berbeda, bukan sebaran satu populasi.';

  const ketersediaan = ketersediaanUkuran
    .map((row) => `${sizeLabel(row.jenisUkuran)} ${row.jumlahIndividu.toLocaleString(locale)}`)
    .join(' · ');

  return (
    // Angka yang sedang diganti tetap terlihat apa adanya, tidak diredupkan:
    // opacity sebagai penanda "sedang memuat" menjatuhkan SELURUH teks di
    // dalamnya di bawah ambang kontras WCAG selama beberapa detik. Keadaan
    // memuat disampaikan teks dan aria-busy saja.
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
        title={`Length Frequency — ${chart.spesies ?? 'Semua spesies'}`}
        meta={`${ringkasan.jumlahIndividu.toLocaleString(locale)} individu · ${judulUkuran} (${unit}) · selang ${num(selangKelas, locale, 1)} ${unit}${appliedSummary ? ` · ${appliedSummary}` : ''}`}
        note={`Sebaran ${judulUkuran.toLowerCase()} yang diukur, dikelompokkan per ${num(selangKelas, locale, 1)} ${unit}. Sumbu datar adalah nilai tengah kelasnya.${catatanSpesies}${catatanLinf}`}
      >
        {kosong ? (
          <p className="text-sm leading-relaxed text-muted">
            Tidak ada pengukuran {judulUkuran.toLowerCase()} yang tercatat untuk filter ini.
          </p>
        ) : (
          <ColumnChart
            labels={labels}
            values={values}
            color="series-2"
            unit="individu"
            seriesLabel="Jumlah Individu"
            labelEvery={labelEveryFor(labels.length)}
            markers={markers}
            tooltip={(label, value) => {
              const row = kelas.find((item) => String(item.nilaiTengah) === label);
              const rentang = row
                ? `${num(row.batasBawah, locale, 1)}–${num(row.batasAtas, locale, 1)} ${unit}`
                : `${label} ${unit}`;
              if (!row) return `${rentang} · ${value.toLocaleString(locale)} individu`;
              // Persen matang DILEWATI saat null -- itu bukan nol melainkan
              // "tidak terdefinisi": kematangan cuma terhitung untuk jantan.
              const matang =
                row.persenMatang === null
                  ? ''
                  : `, matang ${num(row.persenMatang, locale, 1)}%`;
              return `${rentang} · ${value.toLocaleString(locale)} individu (${num(row.persen, locale, 1)}%${matang})`;
            }}
            height={340}
            ariaLabel={`Histogram sebaran ${judulUkuran.toLowerCase()} untuk ${chart.spesies ?? 'seluruh spesies hiu dan pari'}, ${ringkasan.jumlahIndividu.toLocaleString(locale)} pengukuran dalam kelas selebar ${num(selangKelas, locale, 1)} ${unit}`}
          />
        )}
      </ChartCard>

      <ChartCard
        title="Ringkasan & Indikator"
        meta={ketersediaan || undefined}
        note={
          indikator.linfMetode || indikator.lmMetode
            ? `Linf: ${indikator.linfMetode ?? '—'}. Lm: ${indikator.lmMetode ?? '—'}. Keduanya hitungan API, bukan angka yang diisi sendiri. Baris meta di atas menyebut berapa individu yang punya ukuran untuk TIAP jenis ukuran -- itu yang menjelaskan kenapa sampelnya menyusut saat jenis ukurannya diganti.`
            : undefined
        }
      >
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
          <StatItem
            label="Jumlah individu"
            value={ringkasan.jumlahIndividu.toLocaleString(locale)}
          />
          <StatItem
            label="Rentang"
            value={
              ringkasan.panjangMin === null || ringkasan.panjangMaks === null
                ? '—'
                : `${num(ringkasan.panjangMin, locale, 1)}–${num(ringkasan.panjangMaks, locale, 1)} ${unit}`
            }
          />
          <StatItem label="Rata-rata" value={`${num(ringkasan.rataRata, locale)} ${unit}`} />
          <StatItem label="Median" value={`${num(ringkasan.median, locale)} ${unit}`} />
          <StatItem label="Modus" value={`${num(ringkasan.modus, locale)} ${unit}`} />
          <StatItem
            label="Linf (asimtotik)"
            value={indikator.linf === null ? '—' : `${num(indikator.linf, locale)} ${unit}`}
          />
          <StatItem
            label={`Lm (klasper ≥ ${kematanganMatang})`}
            value={indikator.lm === null ? '—' : `${num(indikator.lm, locale)} ${unit}`}
          />
          <StatItem
            label="Matang"
            value={
              indikator.persenMatang === null ? '—' : `${num(indikator.persenMatang, locale, 1)}%`
            }
          />
          {/* Individu yang tercatat tapi TIDAK punya ukuran jenis ini: mereka
              ada di dataset dan tidak ada di histogram, dan selisih itu harus
              terbaca. */}
          <StatItem
            label={`Tanpa ${judulUkuran.toLowerCase()}`}
            value={ringkasan.jumlahTanpaUkuran.toLocaleString(locale)}
          />
        </dl>

        {/* Lm yang kosong PUNYA sebab, dan sebabnya bukan data yang hilang.
            Dikatakan di tempat angkanya absen, bukan cuma di form: pembaca yang
            menemukan "—" di sini belum tentu pernah melihat keterangan di
            kolom sebelah. */}
        {indikator.lm === null ? (
          <p className="mt-4 rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
            <strong className="font-bold text-primary">Lm tidak terhitung</strong> untuk pilihan
            ini. Kematangan hiu dan pari diukur dari klasper, organ yang hanya dimiliki jantan,
            jadi angkanya hanya muncul saat jenis kelamin <strong>Jantan (M)</strong> dipilih.
            Linf tidak terpengaruh.
          </p>
        ) : null}
      </ChartCard>
    </div>
  );
}
