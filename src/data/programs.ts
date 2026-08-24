import type { StaticImageData } from 'next/image';
import blueCarbonIcon from '@/assets/blue-carbon.svg';
import ikanIcon from '@/assets/ikan-application.svg';
import marineConservationIcon from '@/assets/marine-conservation.svg';
import oceanAccountIcon from '@/assets/ocean-account.svg';
import speciesConservationIcon from '@/assets/species-conservation.svg';
import sustainableFisheriesIcon from '@/assets/sustainable-fisheries.svg';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

/**
 * Ikon + deskripsi untuk slider program di beranda, dikunci per `href`.
 *
 * `href` di sini HARUS sama persis dengan yang ada di `panelNav` seksi
 * 'nav-program' (lib/nav.ts) -- itu satu-satunya sumber kebenaran untuk rute
 * dan label program. File ini cuma menambahkan bagian yang tidak dimiliki
 * navigasi: ikon dan narasi.
 *
 * Deskripsinya masih Lorem Ipsum untuk semua program KECUALI Ocean Accounts,
 * yang narasinya sudah ada. Ganti begitu tim konten menuliskan narasi
 * program lain -- jangan mengarang isi sebelum itu.
 */
export const programMeta: Record<string, { icon: StaticImageData; description: string }> = {
  '/program/ocean-accounts': {
    icon: oceanAccountIcon,
    description:
      "Ocean Accounts (OA) serve as a multidimensional measurement tool that covers environmental, economic and social aspects. At the global level, initiatives such as the Convention on Biological Diversity (CBD) and Sustainable Development Goals (SDGs) have encouraged the implementation of OA as part of national ocean governance.",
  },
  '/program/sustainable-fisheries': { icon: sustainableFisheriesIcon, description: LOREM },
  '/program/marine-conservation': { icon: marineConservationIcon, description: LOREM },
  '/program/species-conservation': { icon: speciesConservationIcon, description: LOREM },
  '/program/blue-carbon': { icon: blueCarbonIcon, description: LOREM },
  '/program/ikan': { icon: ikanIcon, description: LOREM },
};
