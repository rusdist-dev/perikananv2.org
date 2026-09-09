import Image from 'next/image';
import banner from '@/assets/nusacore/nusacore1.png';
import gallery from '@/assets/nusacore/nusacore2.png';
import iconMangrove from '@/assets/nusacore/i-mangrove.svg';
import iconCommunities from '@/assets/nusacore/i-communities.svg';
import iconStakeholder from '@/assets/nusacore/i-stakeholder.svg';
import iconRp from '@/assets/nusacore/i-rp.svg';
import iconLocation from '@/assets/nusacore/i-location.svg';
import iconPeople from '@/assets/nusacore/i-people.svg';
import iconHand from '@/assets/nusacore/i-hand.svg';
import iconAreas from '@/assets/nusacore/i-areas.svg';
import iconCrab from '@/assets/nusacore/i-crab.svg';
import iconShellfish from '@/assets/nusacore/i-shellfish.svg';
import iconMilkfish from '@/assets/nusacore/i-milkfish.svg';
import iconShrimp from '@/assets/nusacore/i-shrimp.svg';

const ABOUT_POINTS = [
  {
    icon: iconMangrove,
    lead: 'Restoring mangrove ecosystems',
    rest: 'to address erosion and climate change.',
  },
  {
    icon: iconCommunities,
    lead: 'Strengthening the capacity and self-reliance of coastal communities',
    rest: 'through training, sustainable business models, and inclusive governance grounded in GEDSI and FPIC principles.',
  },
  {
    icon: iconStakeholder,
    lead: 'Strengthening institutional capacity',
    rest: 'through coastal management standards, stakeholder capacity building, and climate-responsive planning policy.',
  },
  {
    icon: iconRp,
    lead: 'Aligning conservation with economic wellbeing,',
    rest: 'by integrating nature restoration with silvofishery-based business opportunities such as mangrove crab, milkfish, shrimp, and shellfish farming.',
  },
];

const IMPACT_STATS = [
  { icon: iconLocation, value: '17', label: 'Locations in Central Java' },
  { icon: iconPeople, value: '11', label: 'Districts reached' },
  { icon: iconHand, value: '1.700', label: 'Change agents involved' },
  { icon: iconAreas, value: '25', label: 'Areas supported' },
];

const COMMODITIES = [
  { icon: iconCrab, label: 'Mangrove Crab' },
  { icon: iconShellfish, label: 'Shellfish' },
  { icon: iconMilkfish, label: 'Milkfish' },
  { icon: iconShrimp, label: 'Shrimp' },
];

/** NUSACORE adalah satu program lintas-isu yang sama persis di keempat
 *  halaman yang menyebutnya (Ocean Accounts, Sustainable Fisheries, Marine
 *  Conservation, Blue Carbon) -- jadi kontennya sengaja ditulis tetap di
 *  sini, bukan lewat props/dictionary per halaman seperti section lain. */
export function ProgramNusacore() {
  return (
    <div className="bg-bg text-primary">
      {/* Tanpa Container/page-gutter -- section ini sengaja full-bleed sampai
          tepi kiri-kanan viewport di desktop, beda dari section teks biasa.
          Di mobile/tablet (di bawah lg, saat kolomnya sudah ditumpuk jadi
          satu), full-bleed itu justru bikin teks dan ikon menempel ke tepi
          layar -- jadi px-5 (sama besarnya dengan page-gutter) dipakai
          sampai lg, lalu dibuang lagi supaya desktop tetap full-bleed. */}
      <div className="py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 px-5 lg:grid-cols-[0.85fr_1.3fr_1fr] lg:px-0">
          {/* Lebar penuh mengikuti kolom, tinggi menyesuaikan rasio asli --
              object-cover di sini akan memaksa gambar (potret, sangat tinggi)
              diregangkan mengisi tinggi baris grid yang jauh lebih pendek,
              sehingga judul "NUSACORE" di dalam gambar terpotong. */}
          <Image
            src={banner}
            alt="Nature-based Solutions for Advancing Coastal Resilience (NUSACORE)"
            sizes="(min-width: 1024px) 320px, 100vw"
            className="h-full w-full rounded-2xl"
          />

          <div>
            <h2 className="text-2xl font-bold md:text-3xl">ABOUT NUSACORE</h2>
            <p className="mt-4 text-sm leading-relaxed text-black md:text-base">
              Coastal erosion, climate change impacts, and mangrove ecosystem loss continue to
              pressure Central Java&apos;s northern coast, while previous restoration efforts have
              often been hindered by weak program continuity and dependence on external funding.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-black md:text-base">
              Through a nature-based solutions approach, NUSACORE aims to strengthen coastal
              resilience in Central Java by:
            </p>

            <ul className="mt-6 flex flex-col gap-5">
              {ABOUT_POINTS.map((point) => (
                <li key={point.lead} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1C5A80]">
                    <Image src={point.icon} alt="" aria-hidden className="h-5 w-5" />
                  </span>
                  <p className="text-sm leading-relaxed text-black md:text-base">
                    <span className="font-bold text-black">{point.lead}</span> {point.rest}
                  </p>
                </li>
              ))}
            </ul>

            <Image
              src={gallery}
              alt="Kegiatan NUSACORE di lapangan"
              sizes="(min-width: 1024px) 500px, 100vw"
              className="mt-8 h-auto w-full rounded-lg"
            />
          </div>

          <div>
            <h3 className="text-lg font-bold tracking-wide">IMPACT & COVERAGE</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
              {IMPACT_STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#c8d1D9]">
                    <Image src={stat.icon} alt="" aria-hidden className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-[#1D6F64]">{stat.value}</p>
                    <p className="text-md text-primary/70">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-lg font-bold tracking-wide">FLAGSHIP COMMODITIES</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
              {COMMODITIES.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#c8d1D9]">
                    <Image src={item.icon} alt="" aria-hidden className="h-6 w-6" />
                  </span>
                  <p className="text-md font-semibold">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-primary p-5 text-sm leading-relaxed text-primary-fg">
              <span className="font-bold">
                Nature-based Solutions for Advancing Coastal Resilience (NUSACORE)
              </span>{' '}
              is a project implemented by REKAM Nusantara as a partner of the Foreign,
              Commonwealth &amp; Development Office (FCDO) – UK Government, funded through the
              COAST Facility Indonesia grant scheme.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
