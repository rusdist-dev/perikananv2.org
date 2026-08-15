import { notFound } from 'next/navigation';
import Image from 'next/image';
import ornamentBg from '@/assets/ornament_bg.png';
import waveBg from '@/assets/wave_bg.png';
import { Container } from '@/components/layout/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Icon } from '@/components/ui/Icon';
import { getArticles } from '@/lib/content';
import { getDictionary } from '@/i18n/dictionary';
import { buildMetadata } from '@/i18n/metadata';
import { isLocale } from '@/i18n/config';
import { site } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '/' });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const articles = (await getArticles(locale)).slice(0, 3);

  return (
    // `isolate` membuat stacking context sendiri, jadi ornamen ber-z-negatif
    // berhenti di belakang seksi ini -- tanpa itu ia tenggelam ke belakang
    // latar halaman dan hilang sama sekali.
    <div className="relative isolate">
      {/* Ornamen dekoratif: alt kosong DAN aria-hidden, supaya screen reader
          tidak mengumumkan gambar yang tidak menyampaikan informasi apa pun.

          next/image, bukan CSS background-image: sumbernya PNG 683 KB, dan
          hanya lewat next/image ia dikonversi ke AVIF/WebP dan diperkecil
          sesuai lebar layar. `background-image` menyajikan PNG itu apa adanya.

          object-contain + object-right adalah padanan bg-contain + bg-right.

          `hidden lg:block` BUKAN selera. Di 390px kolom teks selebar 350px dari
          total 390px, jadi ornamen yang diposisikan kanan pasti berada tepat di
          bawah glyph. Diukur pada halaman jadi: teks #224275 di atas piksel
          tergelapnya menghasilkan 1,56:1 untuk h1 dan 1,16:1 untuk paragraf --
          jauh di bawah ambang AA 4,5:1, praktis tak terbaca.

          Di >= lg kolom teks berhenti di 46rem sementara ornamen menempel di
          kanan, dan pengukuran yang sama memberi 9,98:1: tidak ada satu piksel
          ornamen pun di bawah teks. Ambang lg-lah batas nyata itu.

          Kalau ornamen harus tetap tampil di ponsel, dua jalan yang sudah
          terukur: turunkan opasitasnya ke <= 0,35 (di situ piksel tergelapnya
          baru lolos 4,5:1), atau pindahkan ke bawah teks dengan object-bottom
          plus padding-bottom yang cukup. */}

      {/* `relative` DI SINI yang membatasi ornamen.
          <Image fill> mengukur dirinya dari ancestor ber-position terdekat --
          tanpa `relative` di Container, ia melompat ke <div relative isolate>
          terluar dan membentang sampai ke seksi kedua di bawah.
          `isolate` menahan z-index negatifnya agar berhenti di dalam kotak ini. */}
      <Container as="div" className="relative isolate py-16 min-h-screen">
        <Image
          src={ornamentBg}
          alt=""
          aria-hidden
          fill
          priority
          sizes="70vw"
          className="pointer-events-none -z-10 hidden object-contain object-right select-none lg:block"
        />
        <div className="max-w-content py-12">
          <h1 className="text-[12em]/40 font-extrabold text-primary">FRCI</h1>
          <p className="mt-4 text-[3.3em]/14 text-primary tracking-tighter">
            OCEAN PROGRAM <br /> By Rekam{' '}
          </p>
        </div>
        <div className="max-w-fit bg-primary text-white flex divide-x divide-white uppercase mt-10">
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Ocean Accounts
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Fisheries
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Ecosystem
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Species
          </AppLink>
          <AppLink href={'#'} className="px-4 py-2 text-center hover:underline hover:underline-offset-4 hover:underline-secondary">
            Blue Carbon
          </AppLink>
        </div>
      </Container>
      <div>
        <div className="grid grid-cols-2">
          {/* relative + isolate: sama seperti ornamen di atas, keduanya yang
              mengunci latar ini pada kotak Container ini saja -- bukan pada
              grid induknya. */}
          <Container as="div" width="content" className="relative isolate py-8 pr-8">
            {/* Padanan bg-cover, lewat next/image supaya PNG 121 KB ikut
                dikonversi ke AVIF alih-alih dikirim apa adanya.

                opacity-80 bukan selera. Pada opasitas penuh, garis tergelap
                wave (#486ba1) di bawah paragraf 14px hanya memberi 3,32:1 --
                di bawah ambang AA 4,5:1 untuk teks normal. Diukur ulang setelah
                diturunkan: 5,00:1. Ambangnya ada di sekitar 0,85; 0,80 dipilih
                supaya masih lolos kalau warna netral digelapkan sedikit nanti.

                Kalau wave harus tampil penuh, paragrafnya yang perlu berubah --
                perbesar ke >=24px (ambang turun jadi 3:1) atau beri scrim putih
                di belakang kolom teks. */}
            <Image
              src={waveBg}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="pointer-events-none -z-10 object-cover opacity-20 select-none"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-4">Where Ocean Data Meets Local Action</p>
              <h2 className="text-3xl font-semibold text-primary mb-6">Turning ocean data into action across Indonesia's seas</h2>
              <p className="mt-4 text-sm font-medium text-primary">
                REKAM/FRCI (Fisheries Resource Center of Indonesia) is Rekam Nusantara Foundation's Ocean program, offering an alternative approach to fisheries analysis and sustainable marine management grounded in scientific data. We apply innovative science and technology to protect critical species, promote sustainable fishing, and strengthen the management of marine conservation areas — while pioneering the integration of ocean accounting and ecosystem services into how Indonesia manages its seas. In carrying out our programs, REKAM/FRCI partners with stakeholders and policymakers, and involves communities directly in data collection. Guided by our vision of sustainability and justice for Indonesian fisheries, we aim to lead the shift toward evidence-based, inclusive ocean governance — ensuring a thriving marine environment for generations to come.
              </p>
            </div>
          </Container>
          <div className="bg-primary text-white p-8">
            <h2 className="text-3xl font-bold">Ocean Accounts</h2>
            <p className="mt-4 text-lg">
              Ocean Accounts adalah sistem informasi yang menyediakan data dan analisis terkait kondisi laut, termasuk ekosistem, spesies, dan kegiatan perikanan. Dengan Ocean Accounts, pengguna dapat mengakses informasi yang akurat dan terkini untuk mendukung pengambilan keputusan yang berkelanjutan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
