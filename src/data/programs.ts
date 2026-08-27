import type { StaticImageData } from 'next/image';
import blueCarbonIcon from '@/assets/blue-carbon.svg';
import ikanIcon from '@/assets/ikan-application.svg';
import marineConservationIcon from '@/assets/marine-conservation.svg';
import oceanAccountIcon from '@/assets/ocean-account.svg';
import speciesConservationIcon from '@/assets/species-conservation.svg';
import sustainableFisheriesIcon from '@/assets/sustainable-fisheries.svg';

/**
 * Ikon + deskripsi untuk slider program di beranda, dikunci per `href`.
 *
 * `href` di sini HARUS sama persis dengan yang ada di `panelNav` seksi
 * 'nav-program' (lib/nav.ts) -- itu satu-satunya sumber kebenaran untuk rute
 * dan label program. File ini cuma menambahkan bagian yang tidak dimiliki
 * navigasi: ikon dan narasi.
 *
 * Deskripsinya adalah ringkasan pendek dari paragraf pembuka (ProgramIntro)
 * di masing-masing halaman /program/*. Kalau tim konten mengubah narasi
 * program, sinkronkan ringkasan di sini juga.
 */
export const programMeta: Record<string, { icon: StaticImageData; description: string }> = {
  '/program/ocean-accounts': {
    icon: oceanAccountIcon,
    description:
      "Indonesia’s marine data is scattered across multiple systems and sectors, limiting its use in policymaking. Ocean Accounts (OA), known in Indonesia as Neraca Sumber Daya Laut (NSDL), provides a standardized framework to bridge this gap by linking ecosystem assets, economic flows, environmental pressures, and governance in one integrated picture.",
  },
  '/program/sustainable-fisheries': {
    icon: sustainableFisheriesIcon,
    description:
      'The Sustainable Fisheries Program is an FRCI initiative that aims to advance sustainable fisheries management in Indonesia, particularly in small-scale fisheries. The program connects science, data, technology, local knowledge, and stakeholder collaboration to support evidence-based fisheries policy and management (science–policy nexus), sustain fishery resources and marine ecosystems, and improve coastal livelihoods.',
  },
  '/program/marine-conservation': {
    icon: marineConservationIcon,
    description:
      "As the largest archipelago country, Indonesia sits together with other 16 megadiverse countries and is nested at the very heart of Coral Triangle – an epicenter of marine biodiversity. It hosts 76% of the world's coral species, provides home for 37% of the world's reef fish species, and ranks as the world's second-largest fisheries producer. Those highlight the importance of marine ecosystem conservation in Indonesia for ocean health, food security, and livelihoods, both at local and global scale.",
  },
  '/program/species-conservation': {
    icon: speciesConservationIcon,
    description:
      'Sharks are among the oldest groups of vertebrate animals on Earth, having existed for more than 400 million years. They belong to the class Chondrichthyes, which includes sharks, rays, skates, and chimaeras. More than 400 shark species have been described globally, ranging from small deep-sea species to the world largest fish, the whale shark (Rhincodon typus).',
  },
  '/program/blue-carbon': {
    icon: blueCarbonIcon,
    description:
      'The Blue Carbon Program focuses on the protection, rehabilitation, and restoration of mangrove and seagrass ecosystems, which play a critical role in carbon sequestration and storage.',
  },
  '/program/ikan': {
    icon: ikanIcon,
    description:
      'IKAN (Initiative on Collaborative Fisheries Data Collection) is an FRCI initiative that aims to strengthen fisheries data collection through a collaborative, technology-enabled, and evidence-based approach.',
  },
};
