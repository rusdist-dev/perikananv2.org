import type { Locale } from '../config';

/** Kosakata untuk seksi menu PROGRAM: label nav-nya dan potongan UI yang
 *  dipakai berulang di semua halaman /program/* (mis. tombol "Read Story"
 *  pada ProgramRelatedStories). Narasi tiap program ada di file page.tsx
 *  masing-masing lewat key berprefiks nama programnya. */
export type ProgramDictionary = {
  navProgram: string;
  navOceanAccounts: string;
  navSustainableFisheries: string;
  navMarineConservation: string;
  navSpeciesConservation: string;
  navBlueCarbon: string;
  readStory: string;

  // Ocean Accounts
  oceanAccountsHeroTitle: string;
  oceanAccountsHeroLead: string;
  oceanAccountsIntroP1: string;
  oceanAccountsIntroP2: string;
  oceanAccountsObjectivesEyebrow: string;
  oceanAccountsObjectivesHeading: string;
  oceanAccountsObjective1Title: string;
  oceanAccountsObjective1Desc: string;
  oceanAccountsObjective2Title: string;
  oceanAccountsObjective2Desc: string;
  oceanAccountsObjective3Title: string;
  oceanAccountsObjective3Desc: string;
  oceanAccountsKeyActivitiesEyebrow: string;
  oceanAccountsKeyActivitiesTitle: string;
  oceanAccountsKeyActivityBullet1: string;
  oceanAccountsKeyActivityBullet2: string;
  oceanAccountsKeyActivityBullet3: string;
  oceanAccountsKeyActivityBullet4: string;
  oceanAccountsKeyActivityBullet5: string;
  oceanAccountsKeyActivityBullet6: string;
  oceanAccountsCurrentProjectEyebrow: string;
  oceanAccountsCurrentProjectTitle: string;
  oceanAccountsCurrentProjectBullet1: string;
  oceanAccountsCurrentProjectBullet2: string;
  oceanAccountsFellowshipTitle: string;
  oceanAccountsFellowshipBullet1: string;
  oceanAccountsOsgapTitle: string;
  oceanAccountsOsgapBullet1: string;
  oceanAccountsOsgapBullet2: string;
  oceanAccountsCrossCuttingEyebrow: string;
  oceanAccountsNusacoreDescription: string;
  oceanAccountsNusacoreActivityLabel: string;
  oceanAccountsNusacoreActivity1: string;
  oceanAccountsNusacoreActivity2: string;
  oceanAccountsNusacoreActivity3: string;
  oceanAccountsNusacoreActivity4: string;
  oceanAccountsNusacoreActivity5: string;
  oceanAccountsRelatedStoriesEyebrow: string;
  oceanAccountsRelatedStoriesHeading: string;
  oceanAccountsRelatedStory1Title: string;
  oceanAccountsRelatedStory1Excerpt: string;
  oceanAccountsRelatedStory2Title: string;
  oceanAccountsRelatedStory2Excerpt: string;
  oceanAccountsRelatedStory3Title: string;
  oceanAccountsRelatedStory3Excerpt: string;
  oceanAccountsSupportHeading: string;
  oceanAccountsSupportSubheading: string;
  oceanAccountsSupportCta: string;

  // Sustainable Fisheries
  sustainableFisheriesHeroTitle: string;
  sustainableFisheriesHeroLead: string;
  sustainableFisheriesIntroP1: string;
  sustainableFisheriesIntroP2: string;
  sustainableFisheriesIntroP3: string;
  sustainableFisheriesObjectivesEyebrow: string;
  sustainableFisheriesObjectivesHeading: string;
  sustainableFisheriesObjective1Title: string;
  sustainableFisheriesObjective1Desc: string;
  sustainableFisheriesObjective2Title: string;
  sustainableFisheriesObjective2Desc: string;
  sustainableFisheriesObjective3Title: string;
  sustainableFisheriesObjective3Desc: string;
  sustainableFisheriesKeyActivitiesEyebrow: string;
  sustainableFisheriesKeyActivitiesTitle: string;
  sustainableFisheriesKeyActivityBullet1: string;
  sustainableFisheriesKeyActivityBullet2: string;
  sustainableFisheriesKeyActivityBullet3: string;
  sustainableFisheriesKeyActivityBullet4: string;
  sustainableFisheriesKeyActivityBullet5: string;
  sustainableFisheriesCurrentProjectEyebrow: string;
  sustainableFisheriesCurrentProjectBullet1: string;
  sustainableFisheriesCrossCuttingEyebrow: string;
  sustainableFisheriesNusacoreDescription: string;
  sustainableFisheriesNusacoreActivityLabel: string;
  sustainableFisheriesNusacoreActivity1: string;
  sustainableFisheriesNusacoreActivity2: string;
  sustainableFisheriesNusacoreActivity3: string;
  sustainableFisheriesNusacoreActivity4: string;
  sustainableFisheriesNusacoreActivity5: string;
  sustainableFisheriesRelatedStoriesEyebrow: string;
  sustainableFisheriesRelatedStoriesHeading: string;
  sustainableFisheriesRelatedStory1Title: string;
  sustainableFisheriesRelatedStory1Excerpt: string;
  sustainableFisheriesRelatedStory2Title: string;
  sustainableFisheriesRelatedStory2Excerpt: string;
  sustainableFisheriesRelatedStory3Title: string;
  sustainableFisheriesRelatedStory3Excerpt: string;
  sustainableFisheriesSupportHeading: string;
  sustainableFisheriesSupportSubheading: string;
  sustainableFisheriesSupportCta: string;

  // Marine Conservation
  marineConservationHeroTitle: string;
  marineConservationHeroLead: string;
  marineConservationIntroP1: string;
  marineConservationIntroP2: string;
  marineConservationIntroP3: string;
  marineConservationIntroP4: string;
  marineConservationObjectiveEyebrow: string;
  marineConservationObjectivesHeading: string;
  marineConservationObjective1Title: string;
  marineConservationObjective2Title: string;
  marineConservationObjective3Title: string;
  marineConservationObjective4Title: string;
  marineConservationKeyActivityEyebrow: string;
  marineConservationKeyActivityBullet1: string;
  marineConservationKeyActivityBullet2: string;
  marineConservationKeyActivityBullet3: string;
  marineConservationKeyActivityBullet4: string;
  marineConservationKeyActivityBullet5: string;
  marineConservationKeyActivityBullet6: string;
  marineConservationKeyActivityBullet7: string;
  marineConservationCurrentProjectEyebrow: string;
  marineConservationCurrentProjectTitle: string;
  marineConservationCurrentProjectBullet1: string;
  marineConservationCurrentProjectBullet2: string;
  marineConservationBbnjTitle: string;
  marineConservationBbnjBullet1: string;
  marineConservationBbnjBullet2: string;
  marineConservationBbnjBullet3: string;
  marineConservationWorkAreaEyebrow: string;
  marineConservationWorkAreaHeading: string;
  marineConservationMapAriaLabel: string;
  marineConservationCrossCuttingEyebrow: string;
  marineConservationNusacoreDescription: string;
  marineConservationNusacoreActivityLabel: string;
  marineConservationNusacoreActivity1: string;
  marineConservationNusacoreActivity2: string;
  marineConservationNusacoreActivity3: string;
  marineConservationNusacoreActivity4: string;
  marineConservationNusacoreActivity5: string;
  marineConservationRelatedStoriesEyebrow: string;
  marineConservationRelatedStoriesHeading: string;
  marineConservationRelatedStory1Title: string;
  marineConservationRelatedStory1Excerpt: string;
  marineConservationRelatedStory2Title: string;
  marineConservationRelatedStory2Excerpt: string;
  marineConservationRelatedStory3Title: string;
  marineConservationRelatedStory3Excerpt: string;
  marineConservationSupportHeading: string;
  marineConservationSupportSubheading: string;
  marineConservationSupportCta: string;

  // Species Conservation
  speciesConservationHeroTitle: string;
  speciesConservationHeroLead: string;
  speciesConservationIntroP1: string;
  speciesConservationIntroP2: string;
  speciesConservationIntroP3: string;
  speciesConservationObjectivesEyebrow: string;
  speciesConservationObjectivesHeading: string;
  speciesConservationObjective1Title: string;
  speciesConservationObjective1Desc: string;
  speciesConservationObjective2Title: string;
  speciesConservationObjective2Desc: string;
  speciesConservationObjective3Title: string;
  speciesConservationObjective3Desc: string;
  speciesConservationKeyActivitiesEyebrow: string;
  speciesConservationKeyActivitiesTitle: string;
  speciesConservationKeyActivityBullet1: string;
  speciesConservationKeyActivityBullet2: string;
  speciesConservationKeyActivityBullet3: string;
  speciesConservationKeyActivityBullet4: string;
  speciesConservationKeyActivityBullet5: string;
  speciesConservationCurrentProjectEyebrow: string;
  speciesConservationCurrentProjectBullet1: string;
  speciesConservationRelatedStoriesEyebrow: string;
  speciesConservationRelatedStoriesHeading: string;
  speciesConservationRelatedStory1Title: string;
  speciesConservationRelatedStory1Excerpt: string;
  speciesConservationRelatedStory2Title: string;
  speciesConservationRelatedStory2Excerpt: string;
  speciesConservationRelatedStory3Title: string;
  speciesConservationRelatedStory3Excerpt: string;
  speciesConservationSupportHeading: string;
  speciesConservationSupportSubheading: string;
  speciesConservationSupportCta: string;

  // Blue Carbon
  blueCarbonHeroTitle: string;
  blueCarbonHeroLead: string;
  blueCarbonIntroP1: string;
  blueCarbonIntroP2: string;
  blueCarbonIntroP3: string;
  blueCarbonIntroP4: string;
  blueCarbonObjectivesEyebrow: string;
  blueCarbonObjectivesHeading: string;
  blueCarbonObjective1Title: string;
  blueCarbonObjective1Desc: string;
  blueCarbonObjective2Title: string;
  blueCarbonObjective2Desc: string;
  blueCarbonObjective3Title: string;
  blueCarbonObjective3Desc: string;
  blueCarbonKeyActivityEyebrow: string;
  blueCarbonKeyActivityTitle: string;
  blueCarbonKeyActivityBullet1: string;
  blueCarbonKeyActivityBullet2: string;
  blueCarbonKeyActivityBullet3: string;
  blueCarbonKeyActivityBullet4: string;
  blueCarbonCurrentProjectEyebrow: string;
  blueCarbonCurrentProjectBullet1: string;
  blueCarbonCrossCuttingEyebrow: string;
  blueCarbonNusacoreDescription: string;
  blueCarbonNusacoreActivityLabel: string;
  blueCarbonNusacoreActivity1: string;
  blueCarbonNusacoreActivity2: string;
  blueCarbonNusacoreActivity3: string;
  blueCarbonNusacoreActivity4: string;
  blueCarbonNusacoreActivity5: string;
  blueCarbonRelatedStoriesEyebrow: string;
  blueCarbonRelatedStoriesHeading: string;
  blueCarbonRelatedStory1Title: string;
  blueCarbonRelatedStory1Excerpt: string;
  blueCarbonRelatedStory2Title: string;
  blueCarbonRelatedStory2Excerpt: string;
  blueCarbonRelatedStory3Title: string;
  blueCarbonRelatedStory3Excerpt: string;
  blueCarbonSupportHeading: string;
  blueCarbonSupportSubheading: string;
  blueCarbonSupportCta: string;

  // IKAN
  ikanHeroTitle: string;
  ikanHeroLead: string;
  ikanIntroP1Suffix: string;
  ikanIntroP2: string;
  ikanIntroP3: string;
  ikanIntroP4: string;
  ikanObjectivesEyebrow: string;
  ikanObjectivesHeading: string;
  ikanObjective1Title: string;
  ikanObjective1Desc: string;
  ikanObjective2Title: string;
  ikanObjective2Desc: string;
  ikanObjective3Title: string;
  ikanObjective3Desc: string;
  ikanKeyActivitiesEyebrow: string;
  ikanKeyActivitiesTitle: string;
  ikanKeyActivityBullet1: string;
  ikanKeyActivityBullet2: string;
  ikanKeyActivityBullet3: string;
  ikanKeyActivityBullet4: string;
  ikanKeyActivityBullet5: string;
  ikanCurrentProjectEyebrow: string;
  ikanCrossCuttingEyebrow: string;
  ikanNusacoreDescription: string;
  ikanNusacoreActivityLabel: string;
  ikanNusacoreActivity1: string;
  ikanNusacoreActivity2: string;
  ikanNusacoreActivity3: string;
  ikanNusacoreActivity4: string;
  ikanNusacoreActivity5: string;
  ikanRelatedStoriesEyebrow: string;
  ikanRelatedStoriesHeading: string;
  ikanRelatedStory1Title: string;
  ikanRelatedStory1Excerpt: string;
  ikanRelatedStory2Title: string;
  ikanRelatedStory2Excerpt: string;
  ikanRelatedStory3Title: string;
  ikanRelatedStory3Excerpt: string;
  ikanSecondCtaHeading: string;
  ikanSecondCtaBody: string;
  ikanDownloadAppCta: string;
};

export const programDictionary: Record<Locale, ProgramDictionary> = {
  id: {
    navProgram: 'Program',
    navOceanAccounts: 'Neraca Sumber Daya Laut',
    navSustainableFisheries: 'Perikanan Berkelanjutan',
    navMarineConservation: 'Kawasan Konservasi',
    navSpeciesConservation: 'Konservasi Spesies',
    navBlueCarbon: 'Karbon Biru',
    readStory: 'Baca Kisahnya',

    oceanAccountsHeroTitle: 'Ocean Accounts: Mengukur apa yang menopang kehidupan kita',
    oceanAccountsHeroLead:
      'Kerangka akuntansi terstandar yang memungkinkan masyarakat, ilmuwan, dan pemerintah memantau kesehatan laut Indonesia dengan cara yang sama, di mana pun.',
    oceanAccountsIntroP1:
      'Data kelautan Indonesia tersebar di berbagai sistem dan sektor, membatasi pemanfaatannya dalam perumusan kebijakan. Ocean Accounts (OA), yang di Indonesia dikenal sebagai Neraca Sumber Daya Laut (NSDL), menyediakan kerangka terstandar untuk menjembatani kesenjangan ini dengan menghubungkan aset ekosistem, arus ekonomi, tekanan lingkungan, dan tata kelola dalam satu gambaran yang terintegrasi. Hal ini memperkuat perencanaan ruang laut, pengelolaan perikanan dan konservasi, serta kebijakan ekonomi kelautan.',
    oceanAccountsIntroP2:
      'Sejak 2021, REKAM merintis penerapan OA di Indonesia, sebuah inisiatif yang dipimpin oleh Kementerian Kelautan dan Perikanan, dengan REKAM sebagai mitra utama dan anggota Global Ocean Accounts Partnership (GOAP). Dimulai dari uji coba pertama di Gili Matra, program ini telah mengembangkan neraca luasan ekosistem nasional, 11 lokasi percontohan, standar nasional, modul pelatihan, dan dasbor interaktif yang terhubung dengan sistem nasional, sekaligus mendukung pengintegrasian OA ke dalam RPJMN 2025–2029. Bersama GOAP, REKAM mengelola OA Fellowship untuk 10 mahasiswa pascasarjana di IPB University. REKAM juga mengelola program Ocean for Development Indonesia–Norwegia untuk mendukung penerapan OA lintas lembaga. Untuk semakin mendukung penerapan OA, REKAM saat ini tengah menjalankan proyek riset guna menghubungkan OA dengan pengambilan keputusan menggunakan indeks kesehatan ekosistem Ocean Sustainability Gaps (OSGAP).',
    oceanAccountsObjectivesEyebrow: 'Tujuan',
    oceanAccountsObjectivesHeading: 'Perubahan yang ingin diwujudkan program ini',
    oceanAccountsObjective1Title: 'Mengukur dan menilai',
    oceanAccountsObjective1Desc:
      'Menilai aset laut dan jasa ekosistem Indonesia dari dimensi ekologi, ekonomi, dan sosial, guna menghasilkan data yang kredibel, sistematis, dan terstandar.',
    oceanAccountsObjective2Title: 'Menginformasikan kebijakan',
    oceanAccountsObjective2Desc:
      'Mengintegrasikan Ocean Accounts ke dalam kebijakan kelautan nasional dan subnasional untuk memperkuat perencanaan ruang laut, pengelolaan perikanan dan kawasan konservasi, serta investasi ekonomi biru yang berkelanjutan.',
    oceanAccountsObjective3Title: 'Membangun kapasitas',
    oceanAccountsObjective3Desc:
      'Memperkuat sumber daya manusia dan kelembagaan yang dibutuhkan untuk menerapkan Ocean Accounts di seluruh Indonesia.',
    oceanAccountsKeyActivitiesEyebrow: 'Kegiatan Utama',
    oceanAccountsKeyActivitiesTitle: 'Dari data menuju kebijakan',
    oceanAccountsKeyActivityBullet1: 'Menyusun data Ocean Accounts skala nasional dan tematik',
    oceanAccountsKeyActivityBullet2: 'Mengembangkan pedoman, metodologi, dan standar nasional',
    oceanAccountsKeyActivityBullet3: 'Membangun dasbor data dan Ocean Satellite Accounts (OSA)',
    oceanAccountsKeyActivityBullet4:
      'Mengintegrasikan Ocean Accounts ke dalam kebijakan dan kerangka regulasi',
    oceanAccountsKeyActivityBullet5:
      'Memperkuat kapasitas melalui pelatihan, beasiswa, dan pembelajaran antar-sejawat',
    oceanAccountsKeyActivityBullet6:
      'Mengarusutamakan Kesetaraan Gender, Disabilitas, dan Inklusi Sosial (GEDSI) dalam tata kelola laut',
    oceanAccountsCurrentProjectEyebrow: 'Proyek Berjalan',
    oceanAccountsCurrentProjectTitle: 'Ocean for Development (OfD) Programme',
    oceanAccountsCurrentProjectBullet1:
      'Didukung oleh Norwegian Agency for Development Cooperation (Norad).',
    oceanAccountsCurrentProjectBullet2:
      'Program ini mengembangkan Ocean Accounts melalui tiga komponen: neraca jasa ekosistem, neraca satelit laut dan PDB maritim, serta sistem informasi statistik kelautan.',
    oceanAccountsFellowshipTitle: 'Ocean Accounts Fellowship',
    oceanAccountsFellowshipBullet1:
      "Dikelola bersama GOAP, program fellowship ini mendukung 5 mahasiswa magister dan 5 mahasiswa doktoral di IPB University, mencetak generasi baru ahli akuntansi kelautan.",
    oceanAccountsOsgapTitle: 'Ocean Sustainability Gaps (OSGAP) Research Project',
    oceanAccountsOsgapBullet1: 'Didukung oleh Agence Française de Développement (AFD).',
    oceanAccountsOsgapBullet2:
      'Mengembangkan lapisan komunikasi kebijakan untuk menghubungkan OA dengan kebijakan menggunakan indeks keberlanjutan kuat berbasis modal alam.',
    oceanAccountsCrossCuttingEyebrow: 'Program Lintas Isu',
    oceanAccountsNusacoreDescription:
      'secara resmi "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — adalah inisiatif 3 tahun (2025–2028) yang dipimpin REKAM dan didanai melalui COAST Facility FCDO Inggris, menjawab semakin parahnya abrasi pesisir, dampak perubahan iklim, dan hilangnya mangrove di pesisir utara Jawa Tengah yang gagal diselesaikan upaya restorasi sebelumnya akibat lemahnya pelaksanaan dan ketergantungan pada pendanaan eksternal. Program ini membangun solusi berbasis alam (Nature-based Solutions) yang digerakkan masyarakat dan mandiri secara pembiayaan untuk memulihkan ekosistem mangrove sekaligus mengurangi kemiskinan, memadukan rehabilitasi habitat dengan akuakultur berkelanjutan — kepiting bakau, bandeng, kerang hijau, dan udang — lewat model silvofishery yang membuat konservasi dan mata pencaharian saling memperkuat. Berlandaskan prinsip GEDSI dan FPIC serta penguatan kapasitas kelembagaan, lokasi proyek NUSACORE mencakup 17 lokasi di 11 kabupaten dan menjangkau 25 kelompok masyarakat di seluruh Jawa Tengah.',
    oceanAccountsNusacoreActivityLabel: 'Kegiatan Utama',
    oceanAccountsNusacoreActivity1:
      'Rehabilitasi dan restorasi ekosistem mangrove untuk membangun kembali benteng alami pesisir dan membalikkan laju abrasi',
    oceanAccountsNusacoreActivity2:
      'Pengembangan percontohan silvofishery yang memadukan konservasi mangrove dengan akuakultur berkelanjutan kepiting bakau, bandeng, kerang, dan udang',
    oceanAccountsNusacoreActivity3:
      'Pelatihan, pendampingan, dan pengolahan hasil perikanan bernilai tambah untuk membangun mata pencaharian yang mandiri secara pembiayaan, mengurangi kemiskinan, dan tidak lagi bergantung pada pendanaan eksternal',
    oceanAccountsNusacoreActivity4:
      'Penerapan prinsip GEDSI dan FPIC untuk memastikan partisipasi yang setara bagi perempuan, generasi muda, penyandang disabilitas, dan kelompok rentan lainnya',
    oceanAccountsNusacoreActivity5:
      'Penguatan kelembagaan — standar pengelolaan pesisir, peningkatan kapasitas pemangku kepentingan, dan kebijakan perencanaan yang tanggap iklim di 25 kelompok masyarakat pada 17 lokasi di 11 kabupaten di Jawa Tengah',
    oceanAccountsRelatedStoriesEyebrow: 'Kisah Terkait',
    oceanAccountsRelatedStoriesHeading: 'Di mana Ocean Accounts membawa perubahan',
    oceanAccountsRelatedStory1Title:
      'Menyelaraskan Sains dan Kebijakan: Indonesia Memperkuat Posisinya untuk CITES AC34',
    oceanAccountsRelatedStory1Excerpt:
      'FRCI mendukung persiapan teknis pemerintah menjelang sesi Animals Committee CITES.',
    oceanAccountsRelatedStory2Title:
      'Dari Proyek Percontohan ke Kebijakan Nasional: Menyelaraskan Ocean Accounts untuk Masa Depan Indonesia',
    oceanAccountsRelatedStory2Excerpt:
      'Bagaimana bertahun-tahun pengumpulan data di lokasi percontohan membentuk kerangka neraca sumber daya laut nasional.',
    oceanAccountsRelatedStory3Title:
      'Melampaui Batas: Membangun Kesiapan Indonesia untuk Konservasi Laut Lepas',
    oceanAccountsRelatedStory3Excerpt:
      'FRCI mengkaji apa yang dibutuhkan Indonesia untuk terlibat secara efektif dalam tata kelola laut lepas.',
    oceanAccountsSupportHeading: 'Apa yang kita ukur hari ini menentukan cara kita melindungi hari esok',
    oceanAccountsSupportSubheading: 'Karena melindungi laut dimulai dari memahami nilai sesungguhnya',
    oceanAccountsSupportCta: 'DUKUNG KAMI',

    sustainableFisheriesHeroTitle:
      'Perikanan Berkelanjutan: Memajukan perikanan berkelanjutan melalui sains, data, dan kolaborasi',
    sustainableFisheriesHeroLead:
      'Model pengelolaan perikanan yang tidak sekadar melestarikan ekosistem laut.',
    sustainableFisheriesIntroP1:
      'Program Perikanan Berkelanjutan adalah inisiatif FRCI yang bertujuan memajukan pengelolaan perikanan berkelanjutan di Indonesia, khususnya pada perikanan skala kecil. Program ini menghubungkan sains, data, teknologi, pengetahuan lokal, dan kolaborasi pemangku kepentingan untuk mendukung kebijakan dan pengelolaan perikanan berbasis bukti (science–policy nexus), menjaga kelestarian sumber daya perikanan dan ekosistem laut, serta meningkatkan penghidupan masyarakat pesisir.',
    sustainableFisheriesIntroP2:
      'Program ini dikembangkan untuk menjawab tantangan utama yang dihadapi sektor perikanan, termasuk penangkapan berlebih, degradasi habitat, dan tantangan tata kelola perikanan. FRCI mendukung pengelolaan perikanan adaptif melalui riset perikanan dan kajian stok, pengelolaan perikanan berbasis ekosistem, pemantauan perikanan, serta pemodelan perikanan dan ekosistem. Di Teluk Saleh, Nusa Tenggara Barat, FRCI menginisiasi pendekatan Ecosystem-Based Fisheries Management (EBFM) untuk mengintegrasikan pertimbangan ekosistem ke dalam pengelolaan perikanan skala kecil. Bekerja sama dengan mitra, FRCI juga berperan sebagai Scientific Service Provider (SSP) untuk kajian stok kakap dan kerapu guna mendukung KOMNAS KAJISKAN.',
    sustainableFisheriesIntroP3:
      'FRCI juga melakukan pemantauan pendaratan dan survei sumber daya perikanan di berbagai lokasi, termasuk pemantauan rajungan dan kepiting bakau yang dikaitkan dengan kondisi ekosistem mangrove, survei ikan karang di KKP Liukang Tangaya, serta pemantauan hiu dan pari untuk mendukung konservasi spesies. Kegiatan-kegiatan ini didukung oleh pengumpulan data partisipatif dan pendekatan kolaboratif untuk memperkuat kualitas dan relevansi informasi perikanan. Melalui upaya ini, FRCI bertujuan menghasilkan bukti ilmiah yang kuat dan rekomendasi pengelolaan untuk mendukung pengelolaan perikanan yang efektif dan berkelanjutan.',
    sustainableFisheriesObjectivesEyebrow: 'Tujuan',
    sustainableFisheriesObjectivesHeading: 'Bagaimana program ini mendorong perubahan',
    sustainableFisheriesObjective1Title: 'Memperkuat pengelolaan perikanan berbasis sains',
    sustainableFisheriesObjective1Desc:
      'Meningkatkan informasi dan analisis ilmiah untuk mendukung pengelolaan perikanan yang efektif dan berkelanjutan.',
    sustainableFisheriesObjective2Title: 'Memperkuat sistem data dan pemantauan perikanan',
    sustainableFisheriesObjective2Desc:
      'Meningkatkan ketersediaan, kualitas, dan pemanfaatan data perikanan untuk pengambilan keputusan berbasis bukti.',
    sustainableFisheriesObjective3Title: 'Mendorong perikanan berkelanjutan dan berbasis ekosistem',
    sustainableFisheriesObjective3Desc:
      'Mendukung pengelolaan perikanan yang menjaga produktivitas sumber daya, kesehatan ekosistem, dan penghidupan masyarakat pesisir.',
    sustainableFisheriesKeyActivitiesEyebrow: 'Kegiatan Utama',
    sustainableFisheriesKeyActivitiesTitle: 'Sains, Data, dan Aksi',
    sustainableFisheriesKeyActivityBullet1:
      'Melaksanakan riset perikanan, kajian stok, dan analisis dinamika perikanan;',
    sustainableFisheriesKeyActivityBullet2:
      'Memperkuat sistem pengumpulan, pemantauan, validasi, dan pengelolaan data perikanan;',
    sustainableFisheriesKeyActivityBullet3:
      'Mengembangkan dan menerapkan model perikanan dan ekosistem untuk mendukung keputusan pengelolaan;',
    sustainableFisheriesKeyActivityBullet4:
      'Mendukung strategi pengelolaan perikanan berbasis sains, indikator, dan aturan pengendalian panen (harvest control);',
    sustainableFisheriesKeyActivityBullet5:
      'Memperkuat kolaborasi dan pertukaran pengetahuan antar pemangku kepentingan perikanan untuk mendukung pengelolaan berkelanjutan.',
    sustainableFisheriesCurrentProjectEyebrow: 'Proyek Berjalan',
    sustainableFisheriesCurrentProjectBullet1:
      'Enhancing Maritime Environmental Governance in Indonesia and the Philippines (EMERGE)',
    sustainableFisheriesCrossCuttingEyebrow: 'Program Lintas Isu',
    sustainableFisheriesNusacoreDescription:
      'secara resmi "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — adalah inisiatif 3 tahun (2025–2028) yang dipimpin REKAM dan didanai melalui COAST Facility FCDO Inggris, menjawab semakin parahnya abrasi pesisir, dampak perubahan iklim, dan hilangnya mangrove di pesisir utara Jawa Tengah yang gagal diselesaikan upaya restorasi sebelumnya akibat lemahnya pelaksanaan dan ketergantungan pada pendanaan eksternal. Program ini membangun solusi berbasis alam (Nature-based Solutions) yang digerakkan masyarakat dan mandiri secara pembiayaan untuk memulihkan ekosistem mangrove sekaligus mengurangi kemiskinan, memadukan rehabilitasi habitat dengan akuakultur berkelanjutan — kepiting bakau, bandeng, kerang hijau, dan udang — lewat model silvofishery yang membuat konservasi dan mata pencaharian saling memperkuat. Berlandaskan prinsip GEDSI dan FPIC serta penguatan kapasitas kelembagaan, lokasi proyek NUSACORE mencakup 17 lokasi di 11 kabupaten dan menjangkau 25 kelompok masyarakat di seluruh Jawa Tengah.',
    sustainableFisheriesNusacoreActivityLabel: 'Kegiatan Utama',
    sustainableFisheriesNusacoreActivity1:
      'Rehabilitasi dan restorasi ekosistem mangrove untuk membangun kembali benteng alami pesisir dan membalikkan laju abrasi',
    sustainableFisheriesNusacoreActivity2:
      'Pengembangan percontohan silvofishery yang memadukan konservasi mangrove dengan akuakultur berkelanjutan kepiting bakau, bandeng, kerang, dan udang',
    sustainableFisheriesNusacoreActivity3:
      'Pelatihan, pendampingan, dan pengolahan hasil perikanan bernilai tambah untuk membangun mata pencaharian yang mandiri secara pembiayaan, mengurangi kemiskinan, dan tidak lagi bergantung pada pendanaan eksternal',
    sustainableFisheriesNusacoreActivity4:
      'Penerapan prinsip GEDSI dan FPIC untuk memastikan partisipasi yang setara bagi perempuan, generasi muda, penyandang disabilitas, dan kelompok rentan lainnya',
    sustainableFisheriesNusacoreActivity5:
      'Penguatan kelembagaan — standar pengelolaan pesisir, peningkatan kapasitas pemangku kepentingan, dan kebijakan perencanaan yang tanggap iklim di 25 kelompok masyarakat pada 17 lokasi di 11 kabupaten di Jawa Tengah',
    sustainableFisheriesRelatedStoriesEyebrow: 'Kisah Terkait',
    sustainableFisheriesRelatedStoriesHeading: 'Di mana Perikanan Berkelanjutan membawa perubahan',
    sustainableFisheriesRelatedStory1Title:
      'Menyelaraskan Sains dan Kebijakan: Indonesia Memperkuat Posisinya untuk CITES AC34',
    sustainableFisheriesRelatedStory1Excerpt:
      'FRCI mendukung persiapan teknis pemerintah menjelang sesi Animals Committee CITES.',
    sustainableFisheriesRelatedStory2Title:
      'Dari Proyek Percontohan ke Kebijakan Nasional: Menyelaraskan Ocean Accounts untuk Masa Depan Indonesia',
    sustainableFisheriesRelatedStory2Excerpt:
      'Bagaimana bertahun-tahun pengumpulan data di lokasi percontohan membentuk kerangka neraca sumber daya laut nasional.',
    sustainableFisheriesRelatedStory3Title:
      'Melampaui Batas: Membangun Kesiapan Indonesia untuk Konservasi Laut Lepas',
    sustainableFisheriesRelatedStory3Excerpt:
      'FRCI mengkaji apa yang dibutuhkan Indonesia untuk terlibat secara efektif dalam tata kelola laut lepas.',
    sustainableFisheriesSupportHeading: 'Perikanan Sehat, Laut Sehat, Masyarakat yang Lebih Kuat',
    sustainableFisheriesSupportSubheading:
      'Menghubungkan sains, data, dan kolaborasi untuk mendukung pengelolaan perikanan berkelanjutan dan penghidupan pesisir yang lebih baik.',
    sustainableFisheriesSupportCta: 'DUKUNG KAMI',

    marineConservationHeroTitle: 'Konservasi Laut: Melindungi laut demi menjamin masa depan bersama',
    marineConservationHeroLead:
      'Melindungi kawasan laut Indonesia untuk menghentikan hilangnya keanekaragaman hayati, menjaga keberlanjutan perikanan lokal, dan melawan perubahan iklim, demi laut yang tangguh bagi generasi mendatang.',
    marineConservationIntroP1:
      'Sebagai negara kepulauan terbesar, Indonesia berada bersama 16 negara megadiversitas lainnya dan terletak tepat di jantung Segitiga Terumbu Karang (Coral Triangle) – episentrum keanekaragaman hayati laut. Indonesia menaungi 76% spesies karang dunia, menjadi rumah bagi 37% spesies ikan karang dunia, dan menempati peringkat kedua produsen perikanan terbesar di dunia. Hal ini menegaskan pentingnya konservasi ekosistem laut di Indonesia bagi kesehatan laut, ketahanan pangan, dan penghidupan, baik pada skala lokal maupun global. REKAM melalui unit Fisheries Resource Center of Indonesia (FRCI) bekerja sama dengan pemerintah, pengelola kawasan konservasi, masyarakat sipil, dan masyarakat lokal untuk memperkuat kebijakan, kapasitas, dan partisipasi yang dibutuhkan agar kawasan konservasi laut dikelola secara efektif dan berkelanjutan.',
    marineConservationIntroP2:
      'Selaras dengan target global 30x30 untuk melindungi 30% kawasan laut pada 2030 melalui Kawasan Konservasi Perairan (KKP) dan Other Effective area-based Conservation Measures (OECM), FRCI berkolaborasi dengan Pemerintah Indonesia dan pemangku kepentingan utama untuk mengembangkan MPA Vision 2030 menjadi MPA & OECM Vision 2045 (Agenda 30x45). Peta jalan yang diperbarui ini mengintegrasikan pembentukan dan perluasan KKP serta pengakuan OECM untuk memperluas kawasan konservasi hingga 30% dari wilayah pesisir dan laut Indonesia, yang totalnya mencapai 97,5 juta hektare, dan mengelolanya secara efektif pada 2045. Agenda 30x45 berfokus pada penyediaan kerangka kebijakan dan regulasi, serta pedoman pelaksanaan KKP, dan pengintegrasian OECM atau langkah berbasis kawasan lainnya di lapangan.',
    marineConservationIntroP3:
      'Di tingkat nasional, FRCI mengarahkan upayanya pada (a) penguatan kebijakan dan regulasi yang didukung oleh (b) landasan sains yang kuat, serta (c) pengembangan jalur aksi konservasi yang efektif di lapangan. Upaya ini mencakup penyusunan dan penyelarasan kerangka kebijakan dan regulasi, perencanaan strategis, serta dukungan pengelolaan efektif KKP lepas pantai nasional pertama Indonesia di Laut Sulawesi. Di tingkat provinsi, FRCI mendukung penuh pemerintah daerah dalam membentuk dan memperkuat pengelolaan konservasi berbasis kawasan yang efektif, adaptif, dan berkelanjutan di empat provinsi: Jawa Tengah, Sulawesi Selatan, Nusa Tenggara Barat, dan Maluku. Kegiatan pendukungnya meliputi pembentukan KKP provinsi, penyusunan regulasi dan protokol yang diperlukan, pelatihan dan sertifikasi bagi pengelola KKP dan kawasan, pendampingan teknis untuk pelaksanaan di lapangan, pengumpulan data deret waktu untuk mengukur dampak pengelolaan kawasan, serta upaya meningkatkan kesadaran dan memberdayakan masyarakat lokal di kawasan tersebut.',
    marineConservationIntroP4:
      'Di luar tingkat nasional, FRCI juga mendukung Pemerintah Indonesia dalam menerapkan Traktat Biodiversity Beyond National Jurisdiction (BBNJ) PBB, dengan fokus utama pada keterlibatan dalam proses pembentukan KKP Laut Lepas (High Seas MPA)—sebagai bagian dari upaya menuju 30x30.',
    marineConservationObjectiveEyebrow: 'Tujuan',
    marineConservationObjectivesHeading: 'Bagaimana program ini mendorong perubahan',
    marineConservationObjective1Title:
      'Memajukan penyelarasan kebijakan dan strategi di tingkat regional, nasional, dan provinsi.',
    marineConservationObjective2Title:
      'Memperkuat pengelolaan KKP atau langkah berbasis kawasan lainnya yang efektif, adaptif, dan berkelanjutan.',
    marineConservationObjective3Title: 'Melibatkan pemangku kepentingan dan memberdayakan masyarakat lokal.',
    marineConservationObjective4Title:
      'Mengukur dampak konservasi secara sistematis, berbasis bukti, dan inklusif.',
    marineConservationKeyActivityEyebrow: 'Kegiatan Utama',
    marineConservationKeyActivityBullet1:
      'Menyusun dan menyelaraskan kebijakan, kerangka regulasi, dan perencanaan strategis di tingkat nasional dan provinsi;',
    marineConservationKeyActivityBullet2:
      'Mendukung pengelolaan efektif KKP lepas pantai nasional pertama Indonesia di Laut Sulawesi;',
    marineConservationKeyActivityBullet3:
      'Membantu pembentukan dan tata kelola efektif KKP dan langkah berbasis kawasan lainnya di empat provinsi sasaran;',
    marineConservationKeyActivityBullet4:
      'Meningkatkan pengetahuan dan kapasitas pengelola KKP, pengelola kawasan, dan pemangku kepentingan nasional;',
    marineConservationKeyActivityBullet5: 'Mengumpulkan data deret waktu untuk mengukur dampak konservasi; dan',
    marineConservationKeyActivityBullet6:
      'Meningkatkan kesadaran serta memberdayakan masyarakat lokal dan sekitar.',
    marineConservationKeyActivityBullet7:
      'Mendukung penerapan awal Perjanjian BBNJ melalui peningkatan kapasitas, masukan analitis, dan dokumen',
    marineConservationCurrentProjectEyebrow: 'Proyek & Inisiatif Berjalan',
    marineConservationCurrentProjectTitle:
      'Scaling Effective Area-based Conservation for People & Ecosystems (SEASCAPE)',
    marineConservationCurrentProjectBullet1:
      'Mendukung Pemerintah Indonesia dalam memenuhi komitmen konservasi globalnya di bawah kerangka kebijakan "30 by 45 Vision".',
    marineConservationCurrentProjectBullet2:
      'Memperkuat pelaksanaan, mempercepat adopsi, dan menghasilkan dampak konservasi, penghidupan, dan iklim yang lebih terarah dan terukur.',
    marineConservationBbnjTitle: 'Implementasi Perjanjian BBNJ di Indonesia',
    marineConservationBbnjBullet1: 'Didukung oleh High Seas Alliance.',
    marineConservationBbnjBullet2: 'Mendukung penyusunan agenda untuk konsultasi nasional',
    marineConservationBbnjBullet3:
      'Meningkatkan kapasitas dan keterlibatan pemangku kepentingan lokal untuk penerapan Perjanjian BBNJ.',
    marineConservationWorkAreaEyebrow: 'Wilayah Kerja',
    marineConservationWorkAreaHeading: 'Kawasan Konservasi Perairan (KKP)',
    marineConservationMapAriaLabel: 'Peta interaktif kawasan konservasi laut tempat FRCI bekerja',
    marineConservationCrossCuttingEyebrow: 'Program Lintas Isu',
    marineConservationNusacoreDescription:
      'secara resmi "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — adalah inisiatif 3 tahun (2025–2028) yang dipimpin REKAM dan didanai melalui COAST Facility FCDO Inggris, menjawab semakin parahnya abrasi pesisir, dampak perubahan iklim, dan hilangnya mangrove di pesisir utara Jawa Tengah yang gagal diselesaikan upaya restorasi sebelumnya akibat lemahnya pelaksanaan dan ketergantungan pada pendanaan eksternal. Program ini membangun solusi berbasis alam (Nature-based Solutions) yang digerakkan masyarakat dan mandiri secara pembiayaan untuk memulihkan ekosistem mangrove sekaligus mengurangi kemiskinan, memadukan rehabilitasi habitat dengan akuakultur berkelanjutan — kepiting bakau, bandeng, kerang hijau, dan udang — lewat model silvofishery yang membuat konservasi dan mata pencaharian saling memperkuat. Berlandaskan prinsip GEDSI dan FPIC serta penguatan kapasitas kelembagaan, lokasi proyek NUSACORE mencakup 17 lokasi di 11 kabupaten dan menjangkau 25 kelompok masyarakat di seluruh Jawa Tengah.',
    marineConservationNusacoreActivityLabel: 'Kegiatan Utama',
    marineConservationNusacoreActivity1:
      'Rehabilitasi dan restorasi ekosistem mangrove untuk membangun kembali benteng alami pesisir dan membalikkan laju abrasi',
    marineConservationNusacoreActivity2:
      'Pengembangan percontohan silvofishery yang memadukan konservasi mangrove dengan akuakultur berkelanjutan kepiting bakau, bandeng, kerang, dan udang',
    marineConservationNusacoreActivity3:
      'Pelatihan, pendampingan, dan pengolahan hasil perikanan bernilai tambah untuk membangun mata pencaharian yang mandiri secara pembiayaan, mengurangi kemiskinan, dan tidak lagi bergantung pada pendanaan eksternal',
    marineConservationNusacoreActivity4:
      'Penerapan prinsip GEDSI dan FPIC untuk memastikan partisipasi yang setara bagi perempuan, generasi muda, penyandang disabilitas, dan kelompok rentan lainnya',
    marineConservationNusacoreActivity5:
      'Penguatan kelembagaan — standar pengelolaan pesisir, peningkatan kapasitas pemangku kepentingan, dan kebijakan perencanaan yang tanggap iklim di 25 kelompok masyarakat pada 17 lokasi di 11 kabupaten di Jawa Tengah',
    marineConservationRelatedStoriesEyebrow: 'Kisah Terkait',
    marineConservationRelatedStoriesHeading: 'Di mana Konservasi Laut membawa perubahan',
    marineConservationRelatedStory1Title:
      'Menyelaraskan Sains dan Kebijakan: Indonesia Memperkuat Posisinya untuk CITES AC34',
    marineConservationRelatedStory1Excerpt:
      'FRCI mendukung persiapan teknis pemerintah menjelang sesi Animals Committee CITES.',
    marineConservationRelatedStory2Title:
      'Dari Proyek Percontohan ke Kebijakan Nasional: Menyelaraskan Ocean Accounts untuk Masa Depan Indonesia',
    marineConservationRelatedStory2Excerpt:
      'Bagaimana bertahun-tahun pengumpulan data di lokasi percontohan membentuk kerangka neraca sumber daya laut nasional.',
    marineConservationRelatedStory3Title:
      'Melampaui Batas: Membangun Kesiapan Indonesia untuk Konservasi Laut Lepas',
    marineConservationRelatedStory3Excerpt:
      'FRCI mengkaji apa yang dibutuhkan Indonesia untuk terlibat secara efektif dalam tata kelola laut lepas.',
    marineConservationSupportHeading: 'Melindungi 97,5 juta hektare kawasan laut Indonesia pada 2045',
    marineConservationSupportSubheading:
      'Lebih dari sekadar membentuk kawasan konservasi, ini tentang membuat konservasi benar-benar berjalan.',
    marineConservationSupportCta: 'DUKUNG KAMI',

    speciesConservationHeroTitle:
      'Konservasi Spesies: Melindungi hiu dan pari, menjaga kelestarian sumber daya laut',
    speciesConservationHeroLead:
      'Memperkuat kapasitas dan tata kelola untuk pemanfaatan hiu dan pari yang berkelanjutan di Indonesia.',
    speciesConservationIntroP1:
      'Hiu merupakan salah satu kelompok hewan bertulang belakang tertua di Bumi, telah ada lebih dari 400 juta tahun. Mereka termasuk dalam kelas Chondrichthyes, yang mencakup hiu, pari, skate, dan chimaera. Lebih dari 400 spesies hiu telah dideskripsikan di seluruh dunia, mulai dari spesies laut dalam berukuran kecil hingga ikan terbesar di dunia, hiu paus (Rhincodon typus). Sebagai predator puncak dan mesopredator, hiu dan pari berperan penting dalam menjaga keseimbangan dan kesehatan ekosistem laut — mengatur populasi mangsa, menopang jaring makanan, mengangkut nutrien antar-ekosistem, dan memengaruhi perilaku spesies lain. Dengan demikian, mereka membantu menjaga keanekaragaman hayati, ketahanan ekosistem, dan produktivitas perikanan.',
    speciesConservationIntroP2:
      'Berbeda dengan sebagian besar ikan bertulang sejati, hiu umumnya tumbuh lambat, matang secara seksual pada usia lanjut, dan menghasilkan keturunan yang relatif sedikit. Karakteristik biologis ini membuat populasi hiu sangat rentan terhadap penangkapan berlebih dan lambat pulih setelah populasinya menurun. Akibatnya, penangkapan berlebih telah memangkas separuh populasi hiu dan pari dalam 50 tahun terakhir serta mendorong sekitar 37% spesiesnya ke ambang kepunahan, menjadikan chondrichthyans salah satu garis keturunan vertebrata yang paling terancam (Dulvy et al., 2021). Sebagai negara dengan pendaratan elasmobranch tertinggi di dunia, dengan tangkapan tahunan melebihi 100.000 ton dan salah satu eksportir produk hiu dan pari terbesar secara global, Indonesia menghadapi tantangan besar untuk memperbaiki pengelolaan dan perdagangan perikanannya.',
    speciesConservationIntroP3:
      'Rekam Nusantara Foundation telah aktif mendorong konservasi hiu dan pari serta praktik berkelanjutan dalam perikanan dan perdagangan di Indonesia sejak 2013 —melalui edukasi kesadaran dan riset tentang spesies hiu yang terancam. Sejak 2018, Rekam Nusantara Foundation, melalui unit Fisheries Resources Center of Indonesia (FRCI), bermitra dengan Kementerian Kelautan dan Perikanan (KKP) Republik Indonesia dalam memperkuat kapasitas dan tata kelola untuk keberlanjutan perikanan hiu dan pari di Indonesia.',
    speciesConservationObjectivesEyebrow: 'Tujuan',
    speciesConservationObjectivesHeading: 'Bagaimana program ini mendorong perubahan',
    speciesConservationObjective1Title: 'Memperkuat tata kelola dan penegakan hukum',
    speciesConservationObjective1Desc:
      'Membekali lembaga pemerintah dengan pelatihan, perangkat, dan kerangka kebijakan — termasuk penerapan CITES dan RFMO — yang dibutuhkan untuk mendeteksi, mengatur, dan mengelola perdagangan hiu dan pari secara sah.',
    speciesConservationObjective2Title: 'Membangun basis bukti ilmiah',
    speciesConservationObjective2Desc:
      'Menghasilkan data yang andal tentang spesies hiu dan pari yang terancam (metode identifikasi spesies, pemantauan perdagangan, informasi stok) untuk menginformasikan pengelolaan perikanan dan keputusan kebijakan yang tepat.',
    speciesConservationObjective3Title:
      'Melibatkan komunitas nelayan dan industri dalam praktik berkelanjutan',
    speciesConservationObjective3Desc:
      'Bekerja langsung dengan komunitas nelayan hiu, pengolah, pedagang, dan perusahaan untuk membangun dukungan serta mendorong penerapan praktik yang berkelanjutan dan patuh di sepanjang rantai pasok.',
    speciesConservationKeyActivitiesEyebrow: 'Kegiatan Utama',
    speciesConservationKeyActivitiesTitle: 'Dari Lokasi Pendaratan hingga Pencatatan Data',
    speciesConservationKeyActivityBullet1: 'Program Pelatihan Identifikasi Hiu Nasional',
    speciesConservationKeyActivityBullet2: 'Penerapan CITES dan RFMO serta panduan identifikasi',
    speciesConservationKeyActivityBullet3:
      'Terlibat dalam dialog kebijakan dan koordinasi antarlembaga dengan Kementerian Kelautan dan Perikanan mengenai langkah pengelolaan hiu/pari',
    speciesConservationKeyActivityBullet4: 'Inovasi identifikasi spesies berbasis DNA',
    speciesConservationKeyActivityBullet5:
      'Melibatkan komunitas nelayan hiu dan perusahaan untuk mendukung konservasi dan keberlanjutan',
    speciesConservationCurrentProjectEyebrow: 'Proyek Berjalan',
    speciesConservationCurrentProjectBullet1:
      'Illegal Wildlife Trade – Challenge Fund (IWTEX005) — "Penguatan kapasitas Indonesia untuk mengurangi perikanan dan perdagangan hiu ilegal"',
    speciesConservationRelatedStoriesEyebrow: 'Kisah Terkait',
    speciesConservationRelatedStoriesHeading: 'Di mana Konservasi Spesies membawa perubahan',
    speciesConservationRelatedStory1Title:
      'Menyelaraskan Sains dan Kebijakan: Indonesia Memperkuat Posisinya untuk CITES AC34',
    speciesConservationRelatedStory1Excerpt:
      'FRCI mendukung persiapan teknis pemerintah menjelang sesi Animals Committee CITES.',
    speciesConservationRelatedStory2Title:
      'Dari Proyek Percontohan ke Kebijakan Nasional: Menyelaraskan Ocean Accounts untuk Masa Depan Indonesia',
    speciesConservationRelatedStory2Excerpt:
      'Bagaimana bertahun-tahun pengumpulan data di lokasi percontohan membentuk kerangka neraca sumber daya laut nasional.',
    speciesConservationRelatedStory3Title:
      'Melampaui Batas: Membangun Kesiapan Indonesia untuk Konservasi Laut Lepas',
    speciesConservationRelatedStory3Excerpt:
      'FRCI mengkaji apa yang dibutuhkan Indonesia untuk terlibat secara efektif dalam tata kelola laut lepas.',
    speciesConservationSupportHeading: 'Hiu dan Pari Menjaga Laut Tetap Sehat',
    speciesConservationSupportSubheading:
      'Melindungi mereka berarti menjaga perikanan, ketahanan pangan, dan penghidupan pesisir',
    speciesConservationSupportCta: 'DUKUNG KAMI',

    blueCarbonHeroTitle: 'Karbon Biru: Melindungi ekosistem, menggerakkan masa depan pesisir',
    blueCarbonHeroLead:
      'Memajukan pengelolaan karbon biru berkelanjutan yang memberikan manfaat lingkungan dan ekonomi nyata bagi masyarakat pesisir.',
    blueCarbonIntroP1:
      "Program Karbon Biru berfokus pada perlindungan, rehabilitasi, dan restorasi ekosistem mangrove dan padang lamun, yang berperan penting dalam penyerapan dan penyimpanan karbon. Program ini mendorong pengelolaan karbon biru yang berkelanjutan, berbasis data, dan inklusif untuk mendukung mitigasi perubahan iklim sekaligus memperkuat ketahanan ekosistem dan masyarakat pesisir, selaras dengan strategi nasional penurunan emisi gas rumah kaca Indonesia serta komitmennya dalam Paris Agreement dan Enhanced Nationally Determined Contribution (Enhanced NDC).",
    blueCarbonIntroP2:
      'Indonesia memiliki potensi karbon biru yang besar, dengan 3,44 juta hektare ekosistem mangrove yang ada saat ini (sekitar 23% dari total luas mangrove dunia) berdasarkan Keputusan Menteri Kehutanan No. 594 Tahun 2025. Sementara itu, pemetaan nasional terbaru pada 2025 memperkirakan sekitar 660.156 hektare ekosistem padang lamun. Namun, kedua ekosistem ini menghadapi ancaman degradasi dan perubahan kondisi pesisir, yang dapat menurunkan kapasitas penyimpanan karbon, keanekaragaman hayati, perlindungan pesisir, produktivitas perikanan, dan penghidupan masyarakat. Oleh karena itu, pengelolaan karbon biru perlu memperhatikan aspek ekologi, sosial, penguasaan lahan (tenure), tata kelola, dan ekonomi.',
    blueCarbonIntroP3:
      'REKAM menjalankan proyek percontohan pengelolaan mangrove dan padang lamun di Kabupaten Demak, Jepara, Cilacap, dan Kebumen di Jawa Tengah, serta Teluk Saleh di Nusa Tenggara Barat. Melalui proyek-proyek ini, REKAM mendorong pengelolaan karbon biru berintegritas tinggi menggunakan pendekatan akuntansi laut untuk memastikan data yang terstandar, terukur, dan terstruktur guna memperkuat penyaringan proyek, pemilihan lokasi, pemantauan, verifikasi, dan pengambilan keputusan. Seluruh kegiatan menerapkan GEDSI, Free, Prior and Informed Consent (FPIC), dan pengamanan sosial (safeguards) untuk memastikan proses yang transparan dan partisipatif serta menghormati hak dan kepentingan masyarakat. Pendekatan ini bertujuan memastikan proyek karbon biru memberikan manfaat lingkungan, sosial, dan ekonomi yang berkelanjutan bagi masyarakat pesisir.',
    blueCarbonIntroP4:
      'Di tingkat nasional, REKAM bermitra dengan Kementerian Kelautan dan Perikanan (KKP) dan pemangku kepentingan terkait lainnya untuk memperkuat data, kebijakan, dan implementasi karbon biru di Indonesia.',
    blueCarbonObjectivesEyebrow: 'Tujuan',
    blueCarbonObjectivesHeading: 'Bagaimana program ini mendorong perubahan',
    blueCarbonObjective1Title: 'Membangun basis data dan bukti karbon biru yang kuat',
    blueCarbonObjective1Desc:
      'Mengembangkan data karbon biru yang terstandar, terukur, dan terstruktur melalui pendekatan akuntansi laut',
    blueCarbonObjective2Title: 'Memberdayakan masyarakat pesisir untuk pengelolaan karbon biru yang inklusif',
    blueCarbonObjective2Desc:
      'Memperkuat partisipasi, hak, kapasitas, dan manfaat bagi masyarakat melalui pengelolaan karbon biru yang inklusif dan bertanggung jawab',
    blueCarbonObjective3Title: 'Memperkuat tata kelola dan kolaborasi karbon biru',
    blueCarbonObjective3Desc:
      'Memperkuat koordinasi, kebijakan, dan kerangka kelembagaan untuk pengelolaan karbon biru yang berkelanjutan dan berintegritas tinggi di Indonesia.',
    blueCarbonKeyActivityEyebrow: 'Kegiatan Utama',
    blueCarbonKeyActivityTitle: 'Dari data menuju dampak karbon biru',
    blueCarbonKeyActivityBullet1:
      'Mengembangkan dan memperkuat data karbon biru terstandar melalui pendekatan akuntansi laut untuk karbon biru berintegritas tinggi;',
    blueCarbonKeyActivityBullet2:
      'Memperkuat kapasitas dan partisipasi bermakna masyarakat pesisir serta peluang penghidupan berkelanjutan;',
    blueCarbonKeyActivityBullet3:
      'Memperkuat koordinasi, kebijakan, dan kerangka kelembagaan untuk tata kelola karbon biru melalui kolaborasi;',
    blueCarbonKeyActivityBullet4:
      'Mendukung peningkatan kapasitas pemerintah, masyarakat, dan pemangku kepentingan lainnya untuk memajukan pengelolaan karbon biru yang berkelanjutan dan berintegritas tinggi.',
    blueCarbonCurrentProjectEyebrow: 'Proyek Berjalan',
    blueCarbonCurrentProjectBullet1:
      'Proyek Ocean Accounts untuk Karbon Biru Berintegritas Tinggi di Demak dan Jepara.',
    blueCarbonCrossCuttingEyebrow: 'Program Lintas Isu',
    blueCarbonNusacoreDescription:
      'secara resmi "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — adalah inisiatif 3 tahun (2025–2028) yang dipimpin REKAM dan didanai melalui COAST Facility FCDO Inggris, menjawab semakin parahnya abrasi pesisir, dampak perubahan iklim, dan hilangnya mangrove di pesisir utara Jawa Tengah yang gagal diselesaikan upaya restorasi sebelumnya akibat lemahnya pelaksanaan dan ketergantungan pada pendanaan eksternal. Program ini membangun solusi berbasis alam (Nature-based Solutions) yang digerakkan masyarakat dan mandiri secara pembiayaan untuk memulihkan ekosistem mangrove sekaligus mengurangi kemiskinan, memadukan rehabilitasi habitat dengan akuakultur berkelanjutan — kepiting bakau, bandeng, kerang hijau, dan udang — lewat model silvofishery yang membuat konservasi dan mata pencaharian saling memperkuat. Berlandaskan prinsip GEDSI dan FPIC serta penguatan kapasitas kelembagaan, lokasi proyek NUSACORE mencakup 17 lokasi di 11 kabupaten dan menjangkau 25 kelompok masyarakat di seluruh Jawa Tengah.',
    blueCarbonNusacoreActivityLabel: 'Kegiatan Utama',
    blueCarbonNusacoreActivity1:
      'Rehabilitasi dan restorasi ekosistem mangrove untuk membangun kembali benteng alami pesisir dan membalikkan laju abrasi',
    blueCarbonNusacoreActivity2:
      'Pengembangan percontohan silvofishery yang memadukan konservasi mangrove dengan akuakultur berkelanjutan kepiting bakau, bandeng, kerang, dan udang',
    blueCarbonNusacoreActivity3:
      'Pelatihan, pendampingan, dan pengolahan hasil perikanan bernilai tambah untuk membangun mata pencaharian yang mandiri secara pembiayaan, mengurangi kemiskinan, dan tidak lagi bergantung pada pendanaan eksternal',
    blueCarbonNusacoreActivity4:
      'Penerapan prinsip GEDSI dan FPIC untuk memastikan partisipasi yang setara bagi perempuan, generasi muda, penyandang disabilitas, dan kelompok rentan lainnya',
    blueCarbonNusacoreActivity5:
      'Penguatan kelembagaan — standar pengelolaan pesisir, peningkatan kapasitas pemangku kepentingan, dan kebijakan perencanaan yang tanggap iklim di 25 kelompok masyarakat pada 17 lokasi di 11 kabupaten di Jawa Tengah',
    blueCarbonRelatedStoriesEyebrow: 'Kisah Terkait',
    blueCarbonRelatedStoriesHeading: 'Di mana Karbon Biru membawa perubahan',
    blueCarbonRelatedStory1Title:
      'Menyelaraskan Sains dan Kebijakan: Indonesia Memperkuat Posisinya untuk CITES AC34',
    blueCarbonRelatedStory1Excerpt:
      'FRCI mendukung persiapan teknis pemerintah menjelang sesi Animals Committee CITES.',
    blueCarbonRelatedStory2Title:
      'Dari Proyek Percontohan ke Kebijakan Nasional: Menyelaraskan Ocean Accounts untuk Masa Depan Indonesia',
    blueCarbonRelatedStory2Excerpt:
      'Bagaimana bertahun-tahun pengumpulan data di lokasi percontohan membentuk kerangka neraca sumber daya laut nasional.',
    blueCarbonRelatedStory3Title:
      'Melampaui Batas: Membangun Kesiapan Indonesia untuk Konservasi Laut Lepas',
    blueCarbonRelatedStory3Excerpt:
      'FRCI mengkaji apa yang dibutuhkan Indonesia untuk terlibat secara efektif dalam tata kelola laut lepas.',
    blueCarbonSupportHeading: 'Jaga karbonnya, lindungi pesisirnya',
    blueCarbonSupportSubheading: 'Perlindungan, rehabilitasi, dan restorasi - berbasis masyarakat',
    blueCarbonSupportCta: 'Dukung Kami',

    ikanHeroTitle: 'IKAN: Kolaborasi untuk data perikanan yang lebih baik',
    ikanHeroLead:
      'Aplikasi berbasis Android dan bersifat akses terbuka yang dirancang untuk pengumpulan data perikanan secara kolaboratif.',
    ikanIntroP1Suffix:
      ') adalah inisiatif FRCI yang bertujuan memperkuat pengumpulan data perikanan melalui pendekatan kolaboratif, berbasis teknologi, dan berbasis bukti. Inisiatif ini menyatukan nelayan, pengumpul data, peneliti, lembaga pemerintah, dan pemangku kepentingan perikanan lainnya untuk menghasilkan informasi yang andal dan tepat waktu guna mendukung pengelolaan perikanan yang lebih baik.',
    ikanIntroP2:
      'IKAN menjawab tantangan yang terus berlangsung dalam pengumpulan data perikanan, termasuk cakupan yang terbatas, kualitas data yang tidak konsisten, sistem informasi yang terfragmentasi, dan kesulitan menerjemahkan pengamatan lapangan menjadi informasi yang relevan bagi pengelolaan. Dengan memadukan pengumpulan data partisipatif dan teknologi digital, IKAN berupaya meningkatkan kualitas, konsistensi, keterlacakan, dan aksesibilitas data perikanan.',
    ikanIntroP3:
      'Inisiatif ini menerapkan beragam alat dan pendekatan, termasuk aplikasi pengumpulan data berbasis Android, basis data daring yang terintegrasi, platform pemantauan digital, protokol data yang terstandar, dan kecerdasan buatan (AI) untuk identifikasi ikan. Sistem-sistem ini memungkinkan informasi perikanan dikumpulkan lebih dekat dengan sumbernya, divalidasi secara sistematis, dan tersedia untuk dianalisis serta digunakan dalam pengambilan keputusan.',
    ikanIntroP4:
      'Melalui kolaborasi dengan pemangku kepentingan perikanan, IKAN mendukung pengembangan sistem informasi perikanan yang lebih komprehensif dan responsif, mulai dari lokasi pendaratan dan komunitas nelayan hingga lembaga riset dan pengelolaan. Pada akhirnya, inisiatif ini bertujuan mengurangi kesenjangan dan ketidakpastian data, memperkuat bukti untuk pengelolaan perikanan, serta berkontribusi pada perikanan yang lebih berkelanjutan dan ekosistem laut yang lebih sehat.',
    ikanObjectivesEyebrow: 'Tujuan',
    ikanObjectivesHeading: 'Bagaimana IKAN mendorong perubahan',
    ikanObjective1Title: 'Memperkuat sistem data perikanan',
    ikanObjective1Desc: 'Meningkatkan kualitas, cakupan, konsistensi, dan aksesibilitas data perikanan',
    ikanObjective2Title: 'Mewujudkan pengumpulan data yang kolaboratif',
    ikanObjective2Desc:
      'Melibatkan pemangku kepentingan perikanan dalam menghasilkan informasi yang andal dan relevan bagi pengelolaan',
    ikanObjective3Title: 'Mengubah data menjadi bukti',
    ikanObjective3Desc:
      'Meningkatkan pemanfaatan data perikanan untuk mengurangi ketidakpastian dan mendukung keputusan pengelolaan berbasis sains.',
    ikanKeyActivitiesEyebrow: 'Kegiatan Utama',
    ikanKeyActivitiesTitle: 'Dari pengumpulan data menuju keputusan yang lebih baik',
    ikanKeyActivityBullet1:
      'Mengembangkan dan menerapkan protokol serta sistem pengumpulan data perikanan yang kolaboratif;',
    ikanKeyActivityBullet2:
      'Memperkuat platform digital untuk pengumpulan, validasi, integrasi, dan pemantauan data perikanan;',
    ikanKeyActivityBullet3:
      'Meningkatkan kualitas, cakupan, keterlacakan, dan aksesibilitas data perikanan;',
    ikanKeyActivityBullet4:
      'Menerapkan teknologi inovatif, termasuk AI, untuk pengumpulan data perikanan dan identifikasi spesies;',
    ikanKeyActivityBullet5:
      'Memfasilitasi berbagi data dan kolaborasi antara nelayan, peneliti, pemerintah, dan pemangku kepentingan perikanan.',
    ikanCurrentProjectEyebrow: 'Proyek Berjalan',
    ikanCrossCuttingEyebrow: 'Program Lintas Isu',
    ikanNusacoreDescription:
      'secara resmi "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — adalah inisiatif 3 tahun (2025–2028) yang dipimpin REKAM dan didanai melalui COAST Facility FCDO Inggris, menjawab semakin parahnya abrasi pesisir, dampak perubahan iklim, dan hilangnya mangrove di pesisir utara Jawa Tengah yang gagal diselesaikan upaya restorasi sebelumnya akibat lemahnya pelaksanaan dan ketergantungan pada pendanaan eksternal. Program ini membangun solusi berbasis alam (Nature-based Solutions) yang digerakkan masyarakat dan mandiri secara pembiayaan untuk memulihkan ekosistem mangrove sekaligus mengurangi kemiskinan, memadukan rehabilitasi habitat dengan akuakultur berkelanjutan — kepiting bakau, bandeng, kerang hijau, dan udang — lewat model silvofishery yang membuat konservasi dan mata pencaharian saling memperkuat. Berlandaskan prinsip GEDSI dan FPIC serta penguatan kapasitas kelembagaan, lokasi proyek NUSACORE mencakup 17 lokasi di 11 kabupaten dan menjangkau 25 kelompok masyarakat di seluruh Jawa Tengah.',
    ikanNusacoreActivityLabel: 'Kegiatan Utama',
    ikanNusacoreActivity1:
      'Rehabilitasi dan restorasi ekosistem mangrove untuk membangun kembali benteng alami pesisir dan membalikkan laju abrasi',
    ikanNusacoreActivity2:
      'Pengembangan percontohan silvofishery yang memadukan konservasi mangrove dengan akuakultur berkelanjutan kepiting bakau, bandeng, kerang, dan udang',
    ikanNusacoreActivity3:
      'Pelatihan, pendampingan, dan pengolahan hasil perikanan bernilai tambah untuk membangun mata pencaharian yang mandiri secara pembiayaan, mengurangi kemiskinan, dan tidak lagi bergantung pada pendanaan eksternal',
    ikanNusacoreActivity4:
      'Penerapan prinsip GEDSI dan FPIC untuk memastikan partisipasi yang setara bagi perempuan, generasi muda, penyandang disabilitas, dan kelompok rentan lainnya',
    ikanNusacoreActivity5:
      'Penguatan kelembagaan — standar pengelolaan pesisir, peningkatan kapasitas pemangku kepentingan, dan kebijakan perencanaan yang tanggap iklim di 25 kelompok masyarakat pada 17 lokasi di 11 kabupaten di Jawa Tengah',
    ikanRelatedStoriesEyebrow: 'Kisah Terkait',
    ikanRelatedStoriesHeading: 'Di mana IKAN membawa perubahan',
    ikanRelatedStory1Title:
      'Menyelaraskan Sains dan Kebijakan: Indonesia Memperkuat Posisinya untuk CITES AC34',
    ikanRelatedStory1Excerpt:
      'FRCI mendukung persiapan teknis pemerintah menjelang sesi Animals Committee CITES.',
    ikanRelatedStory2Title:
      'Dari Proyek Percontohan ke Kebijakan Nasional: Menyelaraskan Ocean Accounts untuk Masa Depan Indonesia',
    ikanRelatedStory2Excerpt:
      'Bagaimana bertahun-tahun pengumpulan data di lokasi percontohan membentuk kerangka neraca sumber daya laut nasional.',
    ikanRelatedStory3Title: 'Melampaui Batas: Membangun Kesiapan Indonesia untuk Konservasi Laut Lepas',
    ikanRelatedStory3Excerpt:
      'FRCI mengkaji apa yang dibutuhkan Indonesia untuk terlibat secara efektif dalam tata kelola laut lepas.',
    ikanSecondCtaHeading: 'Data yang lebih baik, keputusan perikanan yang lebih baik',
    ikanSecondCtaBody:
      'Menghubungkan nelayan, peneliti, pemerintah, dan teknologi untuk mengubah data lapangan menjadi bukti yang andal bagi perikanan berkelanjutan.',
    ikanDownloadAppCta: 'Unduh Aplikasi',
  },
  en: {
    navProgram: 'Program',
    navOceanAccounts: 'Ocean Accounts',
    navSustainableFisheries: 'Sustainable Fisheries',
    navMarineConservation: 'Marine Conservation',
    navSpeciesConservation: 'Species Conservation',
    navBlueCarbon: 'Blue Carbon',
    readStory: 'Read Story',

    oceanAccountsHeroTitle: 'Ocean accounts: Measuring what sustains our lives',
    oceanAccountsHeroLead:
      "A standardized accounting framework that lets communities, scientists, and government track the health of Indonesia's ocean the same way, everywhere.",
    oceanAccountsIntroP1:
      "Indonesia's marine data is scattered across multiple systems and sectors, limiting its use in policymaking. Ocean Accounts (OA), known in Indonesia as Neraca Sumber Daya Laut (NSDL), provides a standardized framework to bridge this gap by linking ecosystem assets, economic flows, environmental pressures, and governance in one integrated picture. This strengthens marine spatial planning, fisheries and conservation management, and ocean economy policy.",
    oceanAccountsIntroP2:
      'Since 2021, REKAM has pioneered OA in Indonesia, an initiative led by the Ministry of Marine Affairs and Fisheries, with REKAM as a key partner and member of the Global Ocean Accounts Partnership (GOAP). Starting with the first pilot in Gili Matra, the program has since developed national ecosystem extent accounts, 11 pilot sites, national standards, training modules, and an interactive dashboard connected to the national system, while also supporting the integration of OA into the RPJMN 2025–2029. Together with GOAP, REKAM manages the OA Fellowship for 10 graduate students at IPB University. REKAM also manages the Indonesia–Norway Ocean for Development program to support OA implementation across institutions. To further support OA implementation, REKAM is currently undertaking a research project to connect OA to decision-making using Ocean Sustainability Gaps (OSGAP) ecosystem health indices.',
    oceanAccountsObjectivesEyebrow: 'Objectives',
    oceanAccountsObjectivesHeading: 'What this program is built to change',
    oceanAccountsObjective1Title: 'Measure and value',
    oceanAccountsObjective1Desc:
      "Assess Indonesia's marine assets and ecosystem services across ecological, economic, and social dimensions, producing credible, systematic, and standardized data.",
    oceanAccountsObjective2Title: 'Inform policy',
    oceanAccountsObjective2Desc:
      'Integrate Ocean Accounts into national and sub-national ocean policy to strengthen marine spatial planning, fisheries and protected area management, and sustainable blue economy investment.',
    oceanAccountsObjective3Title: 'Build capacity',
    oceanAccountsObjective3Desc:
      'Strengthen the people and institutions needed to implement Ocean Accounts across Indonesia.',
    oceanAccountsKeyActivitiesEyebrow: 'Key Activities',
    oceanAccountsKeyActivitiesTitle: 'From data to policy',
    oceanAccountsKeyActivityBullet1: 'Compiling national-scale and thematic Ocean Accounts data',
    oceanAccountsKeyActivityBullet2: 'Developing guidelines, methodologies, and national standards',
    oceanAccountsKeyActivityBullet3: 'Building data dashboards and Ocean Satellite Accounts (OSA)',
    oceanAccountsKeyActivityBullet4: 'Integrating Ocean Accounts into policy and regulatory frameworks',
    oceanAccountsKeyActivityBullet5:
      'Strengthening capacity through training, scholarships, and peer learning',
    oceanAccountsKeyActivityBullet6:
      'Mainstreaming Gender Equality, Disability, and Social Inclusion (GEDSI) in ocean governance',
    oceanAccountsCurrentProjectEyebrow: 'Current Project',
    oceanAccountsCurrentProjectTitle: 'Ocean for Development (OfD) Programme',
    oceanAccountsCurrentProjectBullet1:
      'Supported by the Norwegian Agency for Development Cooperation (Norad).',
    oceanAccountsCurrentProjectBullet2:
      'The programme advances Ocean Accounts through three components: ecosystem services accounts, ocean satellite accounts and maritime GDP, and the ocean statistical information system.',
    oceanAccountsFellowshipTitle: 'Ocean Accounts Fellowship',
    oceanAccountsFellowshipBullet1:
      "Managed together with GOAP, the fellowship supports 5 master's and 5 PhD students at IPB University, building the next generation of ocean accounting experts.",
    oceanAccountsOsgapTitle: 'Ocean Sustainability Gaps (OSGAP) Research Project',
    oceanAccountsOsgapBullet1: 'Supported by the Agence Française de Développement (AFD).',
    oceanAccountsOsgapBullet2:
      'Develops a policy communication layer for linking OA to policy using natural capital-based strong sustainability indices.',
    oceanAccountsCrossCuttingEyebrow: 'Cross-cutting Program',
    oceanAccountsNusacoreDescription:
      'formally "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — is a 3-year initiative (2025–2028) led by REKAM and funded through the UK FCDO\'s COAST Facility, responding to worsening coastal erosion, climate change impacts, and mangrove loss along Central Java\'s northern coast that past restoration efforts failed to resolve due to weak execution and reliance on external funding. The programme builds community-led, self-financing Nature-based Solutions that restore mangrove ecosystems while reducing poverty, pairing habitat rehabilitation with sustainable aquaculture — mangrove crabs, milkfish, green mussels, and shrimp — through a silvofishery model that lets conservation and livelihoods reinforce each other. Anchored by GEDSI and FPIC principles and capacity-building at the institutional level, NUSACORE\'s project site covers 17 sites in 11 districts and reaches 25 community groups across Central Java.',
    oceanAccountsNusacoreActivityLabel: 'Key Activity',
    oceanAccountsNusacoreActivity1:
      'Mangrove ecosystem rehabilitation and restoration to rebuild natural coastal defenses and reverse erosion',
    oceanAccountsNusacoreActivity2:
      'Development of silvofishery pilots that pair mangrove conservation with sustainable aquaculture of mangrove crabs, milkfish, mussels, and shrimp',
    oceanAccountsNusacoreActivity3:
      'Training, mentoring, and value-added fisheries processing to build self-financing, poverty-reducing livelihoods less dependent on external funding',
    oceanAccountsNusacoreActivity4:
      'Application of GEDSI and FPIC principles to ensure equitable participation of women, youth, persons with disabilities, and other vulnerable groups',
    oceanAccountsNusacoreActivity5:
      'Institutional strengthening — coastal management standards, stakeholder capacity building, and climate-responsive planning policy across 25 community groups in 17 locations at 11 districts in Central Java',
    oceanAccountsRelatedStoriesEyebrow: 'Related Stories',
    oceanAccountsRelatedStoriesHeading: 'Where Ocean Accounts making a difference',
    oceanAccountsRelatedStory1Title:
      'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    oceanAccountsRelatedStory1Excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    oceanAccountsRelatedStory2Title:
      "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    oceanAccountsRelatedStory2Excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    oceanAccountsRelatedStory3Title:
      "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    oceanAccountsRelatedStory3Excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    oceanAccountsSupportHeading: 'What we measure today shapes how we protect tomorrow',
    oceanAccountsSupportSubheading: 'Because protecting the ocean starts with understanding its true worth',
    oceanAccountsSupportCta: 'SUPPORT US',

    sustainableFisheriesHeroTitle:
      'Sustainable fisheries: Advancing sustainable fisheries through science, data, and collaboration',
    sustainableFisheriesHeroLead: 'A model for fisheries management that not only preserves marine ecosystems.',
    sustainableFisheriesIntroP1:
      'The Sustainable Fisheries Program is an FRCI initiative that aims to advance sustainable fisheries management in Indonesia, particularly in small-scale fisheries. The program connects science, data, technology, local knowledge, and stakeholder collaboration to support evidence-based fisheries policy and management (science–policy nexus), sustain fishery resources and marine ecosystems, and improve coastal livelihoods.',
    sustainableFisheriesIntroP2:
      'The program was developed in response to key challenges facing the fisheries sector, including overfishing, habitat degradation, and challenges in fisheries governance. FRCI supports adaptive fisheries management through fisheries research and stock assessments, ecosystem-based fisheries management, fisheries monitoring, and fisheries and ecosystem modelling. In Saleh Bay, West Nusa Tenggara, FRCI initiated an Ecosystem-Based Fisheries Management (EBFM) approach to integrate ecosystem considerations into small-scale fisheries management. In collaboration with partners, FRCI also serves as a Scientific Service Provider (SSP) for snapper and grouper stock assessments in support of KOMNAS KAJISKAN.',
    sustainableFisheriesIntroP3:
      'FRCI also conducts landing monitoring and fisheries resource surveys across various locations, including blue swimming crab and mud crab monitoring linked to mangrove ecosystem conditions, reef fish surveys in the Liukang Tangaya MPA, and shark and ray monitoring to support species conservation. These activities are supported by participatory data collection and collaborative approaches to strengthen the quality and relevance of fisheries information. Through these efforts, FRCI aims to generate robust scientific evidence and management recommendations to support effective and sustainable fisheries management.',
    sustainableFisheriesObjectivesEyebrow: 'Objectives',
    sustainableFisheriesObjectivesHeading: 'How this program drives change',
    sustainableFisheriesObjective1Title: 'Strengthen science-based fisheries management',
    sustainableFisheriesObjective1Desc:
      'Improve scientific information and analysis to support effective and sustainable fisheries management.',
    sustainableFisheriesObjective2Title: 'Strengthen fisheries data and monitoring systems',
    sustainableFisheriesObjective2Desc:
      'Improve the availability, quality, and use of fisheries data for evidence-based decision-making.',
    sustainableFisheriesObjective3Title: 'Promote sustainable and ecosystem-based fisheries',
    sustainableFisheriesObjective3Desc:
      'Support fisheries management that maintains resource productivity, ecosystem health, and coastal community livelihoods.',
    sustainableFisheriesKeyActivitiesEyebrow: 'Key Activities',
    sustainableFisheriesKeyActivitiesTitle: 'Science, Data, and Action',
    sustainableFisheriesKeyActivityBullet1:
      'Conducting fisheries research, stock assessments, and analysis of fisheries dynamics;',
    sustainableFisheriesKeyActivityBullet2:
      'Strengthening fisheries data collection, monitoring, validation, and management systems;',
    sustainableFisheriesKeyActivityBullet3:
      'Developing and applying fisheries and ecosystem models to support management decisions;',
    sustainableFisheriesKeyActivityBullet4:
      'Supporting science-based fisheries management strategies, indicators, and harvest control measures;',
    sustainableFisheriesKeyActivityBullet5:
      'Strengthening collaboration and knowledge exchange among fisheries stakeholders to support sustainable management.',
    sustainableFisheriesCurrentProjectEyebrow: 'Current Project',
    sustainableFisheriesCurrentProjectBullet1:
      'Enhancing Maritime Environmental Governance in Indonesia and the Philippines (EMERGE)',
    sustainableFisheriesCrossCuttingEyebrow: 'Cross-cutting Program',
    sustainableFisheriesNusacoreDescription:
      'formally "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — is a 3-year initiative (2025–2028) led by REKAM and funded through the UK FCDO\'s COAST Facility, responding to worsening coastal erosion, climate change impacts, and mangrove loss along Central Java\'s northern coast that past restoration efforts failed to resolve due to weak execution and reliance on external funding. The programme builds community-led, self-financing Nature-based Solutions that restore mangrove ecosystems while reducing poverty, pairing habitat rehabilitation with sustainable aquaculture — mangrove crabs, milkfish, green mussels, and shrimp — through a silvofishery model that lets conservation and livelihoods reinforce each other. Anchored by GEDSI and FPIC principles and capacity-building at the institutional level, NUSACORE\'s project site covers 17 sites in 11 districts and reaches 25 community groups across Central Java.',
    sustainableFisheriesNusacoreActivityLabel: 'Key Activity',
    sustainableFisheriesNusacoreActivity1:
      'Mangrove ecosystem rehabilitation and restoration to rebuild natural coastal defenses and reverse erosion',
    sustainableFisheriesNusacoreActivity2:
      'Development of silvofishery pilots that pair mangrove conservation with sustainable aquaculture of mangrove crabs, milkfish, mussels, and shrimp',
    sustainableFisheriesNusacoreActivity3:
      'Training, mentoring, and value-added fisheries processing to build self-financing, poverty-reducing livelihoods less dependent on external funding',
    sustainableFisheriesNusacoreActivity4:
      'Application of GEDSI and FPIC principles to ensure equitable participation of women, youth, persons with disabilities, and other vulnerable groups',
    sustainableFisheriesNusacoreActivity5:
      'Institutional strengthening — coastal management standards, stakeholder capacity building, and climate-responsive planning policy across 25 community groups in 17 locations at 11 districts in Central Java',
    sustainableFisheriesRelatedStoriesEyebrow: 'Related Stories',
    sustainableFisheriesRelatedStoriesHeading: 'Where Sustainable Fisheries making a difference',
    sustainableFisheriesRelatedStory1Title:
      'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    sustainableFisheriesRelatedStory1Excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    sustainableFisheriesRelatedStory2Title:
      "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    sustainableFisheriesRelatedStory2Excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    sustainableFisheriesRelatedStory3Title:
      "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    sustainableFisheriesRelatedStory3Excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    sustainableFisheriesSupportHeading: 'Healthy Fisheries, Healthy Oceans, Stronger Communities',
    sustainableFisheriesSupportSubheading:
      'Connecting science, data, and collaboration to support sustainable fisheries management and better coastal livelihoods.',
    sustainableFisheriesSupportCta: 'SUPPORT US',

    marineConservationHeroTitle: 'Marine conservation: Protecting the oceans to secure our shared future',
    marineConservationHeroLead:
      'Protecting Indonesia’s marine areas to halt biodiversity loss, sustain local fisheries, and combat climate change, ensuring resilient oceans for future generations.',
    marineConservationIntroP1:
      "As the largest archipelago country, Indonesia sits together with other 16 megadiverse countries and is nested at the very heart of Coral Triangle – an epicenter of marine biodiversity. It hosts 76% of the world's coral species, provides home for 37% of the world's reef fish species, and ranks as the world's second-largest fisheries producer. Those highlight the importance of marine ecosystem conservation in Indonesia for ocean health, food security, and livelihoods, both at local and global scale. REKAM through its Fisheries Resource Center of Indonesia (FRCI) unit works with governments, conservation managers, civil society, and local communities to strengthen the policies, capacity, and participation needed for marine conservation areas to be effectively and sustainably managed.",
    marineConservationIntroP2:
      "Aligning with the global 30x30 target to protect 30% of marine areas by 2030 through MPAs and Other Effective area-based Conservation Measures (OECMs), FRCI collaborates with the Government of Indonesia (GoI) and key stakeholders to leverage the MPA Vision 2030 into the MPA & OECM Vision 2045 (30x45 Agenda). This updated roadmap integrates MPA establishment and expansion as well as OECM recognition to expand the conserved areas to 30% of Indonesia’s coastal and marine areas, totaling 97.5 million hectares, and effectively manage them by 2045. The 30x45 Agenda focuses on providing policy and regulatory framework, as well as guidelines for implementation of MPAs, and integration of OECMs or other area-based measures on the ground.",
    marineConservationIntroP3:
      "At the national level, FRCI streams the effort on (a) strengthening policy and regulatory through (b) robust science backing up, and (c) developing pathways for effective conservation actions on-site. The efforts include developing and aligning policy and regulatory frameworks, strategic planning, and supporting the effective management of Indonesia's first national offshore MPA in the Sulawesi Sea. At the provincial level, FRCI fully supports local governments in establishing and strengthening the effective, adaptive, and sustainable management of area-based conservation across four provinces: Central Java, South Sulawesi, West Nusa Tenggara, and Maluku. Supporting activities include the establishment of provincial MPAs, the development of required regulations and protocols, training and certification for MPA and area managers, technical assistance for on-site implementation, time series data collection to measure the impact of area management, and efforts to raise awareness and empower local communities within these areas.",
    marineConservationIntroP4:
      'Beyond the national level, FRCI also supports the GoI in implementing the UN Biodiversity Beyond National Jurisdiction (BBNJ) Treaty, with key focus on engagement in High Seas MPA establishment processes—as part of the effort towards 30x30.',
    marineConservationObjectiveEyebrow: 'Objective',
    marineConservationObjectivesHeading: 'How this program drives change',
    marineConservationObjective1Title:
      'Advancing policy and strategic alignment at regional, national, and provincial level.',
    marineConservationObjective2Title:
      'Strengthening effective, adaptive, and sustainable management of the MPAs or other area-based measures.',
    marineConservationObjective3Title: 'Engaging stakeholders and empowering local communities.',
    marineConservationObjective4Title:
      'Measuring systematic, evidence-based, and inclusive conservation impact.',
    marineConservationKeyActivityEyebrow: 'Key Activity',
    marineConservationKeyActivityBullet1:
      'Developing and aligning policy, regulatory frameworks, and strategic planning at the national and provincial level;',
    marineConservationKeyActivityBullet2:
      "Supporting effective management of Indonesia's first national offshore MPA in the Sulawesi Sea;",
    marineConservationKeyActivityBullet3:
      'Assisting establishment and effective governance of MPAs and other area-based measure across the four target provinces;',
    marineConservationKeyActivityBullet4:
      'Improving knowledge and capacity of the MPA, area managers, and national stakeholders;',
    marineConservationKeyActivityBullet5: 'Collecting time series data to measure conservation impact; and',
    marineConservationKeyActivityBullet6: 'Raising awareness and empowering local and nearby communities.',
    marineConservationKeyActivityBullet7:
      'Supporting the early implementation of BBNJ Agreement through capacity building, analytical inputs, and documents',
    marineConservationCurrentProjectEyebrow: 'Current Project & Initiative',
    marineConservationCurrentProjectTitle:
      'Scaling Effective Area-based Conservation for People & Ecosystems (SEASCAPE)',
    marineConservationCurrentProjectBullet1:
      'Support the Government of Indonesia in fulfilling its global conservation commitments under the "30 by 45 Vision" policy framework.',
    marineConservationCurrentProjectBullet2:
      'Strengthening implementation, accelerating uptake, and generating more streamlined and measurable conservation, livelihood, and climate impacts.',
    marineConservationBbnjTitle: 'BBNJ Agreement Implementation in Indonesia',
    marineConservationBbnjBullet1: 'Supported by the High Seas Alliance.',
    marineConservationBbnjBullet2: 'Support agenda development for national consultations',
    marineConservationBbnjBullet3:
      'Increases local stakeholder capacity and engagement for BBNJ Agreement implementation.',
    marineConservationWorkAreaEyebrow: 'Work Area',
    marineConservationWorkAreaHeading: 'Marine Protected Area (MPA)',
    marineConservationMapAriaLabel: 'Interactive map of marine conservation areas where FRCI works',
    marineConservationCrossCuttingEyebrow: 'Cross-cutting Program',
    marineConservationNusacoreDescription:
      'formally "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — is a 3-year initiative (2025–2028) led by REKAM and funded through the UK FCDO\'s COAST Facility, responding to worsening coastal erosion, climate change impacts, and mangrove loss along Central Java\'s northern coast that past restoration efforts failed to resolve due to weak execution and reliance on external funding. The programme builds community-led, self-financing Nature-based Solutions that restore mangrove ecosystems while reducing poverty, pairing habitat rehabilitation with sustainable aquaculture — mangrove crabs, milkfish, green mussels, and shrimp — through a silvofishery model that lets conservation and livelihoods reinforce each other. Anchored by GEDSI and FPIC principles and capacity-building at the institutional level, NUSACORE\'s project site covers 17 sites in 11 districts and reaches 25 community groups across Central Java.',
    marineConservationNusacoreActivityLabel: 'Key Activity',
    marineConservationNusacoreActivity1:
      'Mangrove ecosystem rehabilitation and restoration to rebuild natural coastal defenses and reverse erosion',
    marineConservationNusacoreActivity2:
      'Development of silvofishery pilots that pair mangrove conservation with sustainable aquaculture of mangrove crabs, milkfish, mussels, and shrimp',
    marineConservationNusacoreActivity3:
      'Training, mentoring, and value-added fisheries processing to build self-financing, poverty-reducing livelihoods less dependent on external funding',
    marineConservationNusacoreActivity4:
      'Application of GEDSI and FPIC principles to ensure equitable participation of women, youth, persons with disabilities, and other vulnerable groups',
    marineConservationNusacoreActivity5:
      'Institutional strengthening — coastal management standards, stakeholder capacity building, and climate-responsive planning policy across 25 community groups in 17 locations at 11 districts in Central Java',
    marineConservationRelatedStoriesEyebrow: 'Related Stories',
    marineConservationRelatedStoriesHeading: 'Where Marine Conservation making a difference',
    marineConservationRelatedStory1Title:
      'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    marineConservationRelatedStory1Excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    marineConservationRelatedStory2Title:
      "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    marineConservationRelatedStory2Excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    marineConservationRelatedStory3Title:
      "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    marineConservationRelatedStory3Excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    marineConservationSupportHeading: "Protect 97.5 million hectares of Indonesia's marine areas by 2045",
    marineConservationSupportSubheading:
      'Beyond establishing protected areas, it is about making conservation work.',
    marineConservationSupportCta: 'SUPPORT US',

    speciesConservationHeroTitle:
      'Species conservation: Protecting sharks and rays, sustaining oceans resources',
    speciesConservationHeroLead:
      'Strengthening capacity and governance for the sustainable use of sharks and rays in Indonesia.',
    speciesConservationIntroP1:
      "Sharks are among the oldest groups of vertebrate animals on Earth, having existed for more than 400 million years. They belong to the class Chondrichthyes, which includes sharks, rays, skates, and chimaeras. More than 400 shark species have been described globally, ranging from small deep-sea species to the world's largest fish, the whale shark (Rhincodon typus). As apex and mesopredators, sharks and rays play a crucial role in maintaining the balance and health of marine ecosystems — regulating prey populations, sustaining food webs, transporting nutrients across ecosystems, and influencing the behavior of other species. In doing so, they help sustain biodiversity, ecosystem resilience, and productive fisheries.",
    speciesConservationIntroP2:
      'Unlike many bony fish, sharks generally grow slowly, mature late, and produce relatively few offspring. These biological characteristics make shark populations particularly vulnerable to overfishing and slow to recover once depleted. As a result, overfishing has halved shark and ray populations over the past 50 years and driven an estimated 37% of species toward extinction, making chondrichthyans among the most threatened vertebrate lineages (Dulvy et al., 2021). As the highest elasmobranch landings in the world, with annual catches exceeding 100,000 tonnes and one of the largest exporters of shark and ray products globally, Indonesia faces significant challenges to improve its fisheries management and trades.',
    speciesConservationIntroP3:
      'Rekam Nusantara Foundation has actively promoted shark and ray conservation and sustainable practices in fisheries and trade in Indonesia since 2013 —through awareness and research on threatened shark species. Since 2018, Rekam Nusantara Foundation, through its Fisheries Resources Center of Indonesia (FRCI) unit, has been partnering with the Indonesian Ministry of Marine Affairs and Fisheries (MMAF) in strengthen capacity and governance for the sustainability of shark and ray fisheries in Indonesia.',
    speciesConservationObjectivesEyebrow: 'Objectives',
    speciesConservationObjectivesHeading: 'How this program drives change',
    speciesConservationObjective1Title: 'Strengthen governance and enforcement',
    speciesConservationObjective1Desc:
      'Equip government agencies with the training, tools, and policy frameworks, including CITES and RFMOs implementation — needed to detect, regulate, and legally manage the shark and ray trade.',
    speciesConservationObjective2Title: 'Build the scientific evidence base',
    speciesConservationObjective2Desc:
      'Generate reliable data on threatened shark and ray species (species identification methods, trade monitoring, stock information) to inform sound fisheries management and policy decisions.',
    speciesConservationObjective3Title:
      'Engage fishing communities and industry in sustainable practices',
    speciesConservationObjective3Desc:
      'Work directly with shark fishing communities, processors, traders, and companies to build buy-in and support the adoption of sustainable, compliant practices across the supply chain.',
    speciesConservationKeyActivitiesEyebrow: 'Key Activities',
    speciesConservationKeyActivitiesTitle: 'From the Landing Site to the Ledger',
    speciesConservationKeyActivityBullet1: 'National Sharks ID Training Program',
    speciesConservationKeyActivityBullet2: 'CITES and RFMOs implementation and identification guide',
    speciesConservationKeyActivityBullet3:
      'Engage in policy dialogue and inter-agency coordination with the Ministry of Marine Affairs and Fisheries on shark/ray management measures',
    speciesConservationKeyActivityBullet4: 'DNA-based species identification innovation',
    speciesConservationKeyActivityBullet5:
      'Engage with shark fishing communities and companies to support conservation and sustainability',
    speciesConservationCurrentProjectEyebrow: 'Current Project',
    speciesConservationCurrentProjectBullet1:
      'Illegal Wildlife Trade – Challenge Fund (IWTEX005) — "Strengthening Indonesia\'s capacity to reduce illegal shark fisheries and trade"',
    speciesConservationRelatedStoriesEyebrow: 'Related Stories',
    speciesConservationRelatedStoriesHeading: 'Where Species Conservation making a difference',
    speciesConservationRelatedStory1Title:
      'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    speciesConservationRelatedStory1Excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    speciesConservationRelatedStory2Title:
      "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    speciesConservationRelatedStory2Excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    speciesConservationRelatedStory3Title:
      "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    speciesConservationRelatedStory3Excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    speciesConservationSupportHeading: 'Sharks and Rays Keep The Ocean Healthy',
    speciesConservationSupportSubheading:
      'Protecting them safeguards the fisheries, food security, and coastal livelihood',
    speciesConservationSupportCta: 'SUPPORT US',

    blueCarbonHeroTitle: 'Blue Carbon : Protecting the ecosystem, powering coastal futures',
    blueCarbonHeroLead:
      'Advancing sustainable blue carbon management that delivers tangible environmental and economic benefits for coastal communities.',
    blueCarbonIntroP1:
      "The Blue Carbon Program focuses on the protection, rehabilitation, and restoration of mangrove and seagrass ecosystems, which play a critical role in carbon sequestration and storage. The program promotes sustainable, data-driven, and inclusive blue carbon management to support climate change mitigation while strengthening the resilience of coastal ecosystems and communities, in line with Indonesia’s national greenhouse gas emission reduction strategy and its commitments under the Paris Agreement and Enhanced Nationally Determined Contribution (Enhanced NDC).",
    blueCarbonIntroP2:
      "Indonesia has significant blue carbon potential, with 3.44 million hectares of existing mangrove ecosystems (approximately 23% of the world’s total mangrove area)  through Ministry of Forestry Decree No. 594 of 2025. Meanwhile, the latest national mapping in 2025 estimates approximately 660,156 hectares of seagrass ecosystems. However, both ecosystems face threats from degradation and changing coastal conditions, which can reduce carbon storage capacity, biodiversity, coastal protection, fisheries productivity, and community livelihoods. Blue carbon management therefore needs to address ecological, social, tenure, governance, and economics.",
    blueCarbonIntroP3:
      "REKAM implements pilot projects for mangrove and seagrass management in Demak, Jepara, Cilacap, and Kebumen Districts in Central Java, as well as Saleh Bay in West Nusa Tenggara. Through these projects, REKAM promotes high-integrity blue carbon management using an ocean accounting approach to ensure that data are standardized, measurable, and structured to strengthen project screening, site selection, monitoring, verification, and decision-making. All activities apply GEDSI, Free, Prior and Informed Consent (FPIC), and safeguards to ensure transparent and participatory processes that respect community rights and interests. This approach aims to ensure that blue carbon projects deliver sustainable environmental, social, and economic benefits for coastal communities.",
    blueCarbonIntroP4:
      'At the national level, REKAM partners with the Ministry of Marine Affairs and Fisheries (MMAF) and other relevant stakeholders to strengthen blue carbon data, policies, and implementation in Indonesia.',
    blueCarbonObjectivesEyebrow: 'Objectives',
    blueCarbonObjectivesHeading: 'How this program drives change',
    blueCarbonObjective1Title: 'Build a robust blue carbon data and evidence base',
    blueCarbonObjective1Desc:
      'Develop standardized, measurable, and structured blue carbon data through an ocean accounting approach',
    blueCarbonObjective2Title: 'Empower coastal communities for inclusive blue carbon management',
    blueCarbonObjective2Desc:
      'Strengthen community participation, rights, capacity, and benefits through inclusive and responsible blue carbon management',
    blueCarbonObjective3Title: 'Strengthen blue carbon governance and collaboration',
    blueCarbonObjective3Desc:
      'Strengthen coordination, policy, and institutional frameworks for sustainable and high-integrity blue carbon management in Indonesia.',
    blueCarbonKeyActivityEyebrow: 'Key Activity',
    blueCarbonKeyActivityTitle: 'From data to blue carbon impact',
    blueCarbonKeyActivityBullet1:
      'Developing and strengthening standardized blue carbon data through an ocean accounting approaches for high integrity blue carbon;',
    blueCarbonKeyActivityBullet2:
      'Strengthening the capacity and meaningful participation of coastal communities and sustainable livelihood opportunities;',
    blueCarbonKeyActivityBullet3:
      'Strengthening coordination, policy, and institutional frameworks for blue carbon governance through collaboration;',
    blueCarbonKeyActivityBullet4:
      'Supporting  capacity building among government, communities, and other stakeholders to advance sustainable and high-integrity blue carbon management.',
    blueCarbonCurrentProjectEyebrow: 'Current Project',
    blueCarbonCurrentProjectBullet1: 'Ocean Accounts for High-Integrity Blue Carbon Project in Demak and Jepara.',
    blueCarbonCrossCuttingEyebrow: 'Cross-cutting Program',
    blueCarbonNusacoreDescription:
      'formally "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — is a 3-year initiative (2025–2028) led by REKAM and funded through the UK FCDO\'s COAST Facility, responding to worsening coastal erosion, climate change impacts, and mangrove loss along Central Java\'s northern coast that past restoration efforts failed to resolve due to weak execution and reliance on external funding. The programme builds community-led, self-financing Nature-based Solutions that restore mangrove ecosystems while reducing poverty, pairing habitat rehabilitation with sustainable aquaculture — mangrove crabs, milkfish, green mussels, and shrimp — through a silvofishery model that lets conservation and livelihoods reinforce each other. Anchored by GEDSI and FPIC principles and capacity-building at the institutional level, NUSACORE\'s project site covers 17 sites in 11 districts and reaches 25 community groups across Central Java.',
    blueCarbonNusacoreActivityLabel: 'Key Activity',
    blueCarbonNusacoreActivity1:
      'Mangrove ecosystem rehabilitation and restoration to rebuild natural coastal defenses and reverse erosion',
    blueCarbonNusacoreActivity2:
      'Development of silvofishery pilots that pair mangrove conservation with sustainable aquaculture of mangrove crabs, milkfish, mussels, and shrimp',
    blueCarbonNusacoreActivity3:
      'Training, mentoring, and value-added fisheries processing to build self-financing, poverty-reducing livelihoods less dependent on external funding',
    blueCarbonNusacoreActivity4:
      'Application of GEDSI and FPIC principles to ensure equitable participation of women, youth, persons with disabilities, and other vulnerable groups',
    blueCarbonNusacoreActivity5:
      'Institutional strengthening — coastal management standards, stakeholder capacity building, and climate-responsive planning policy across 25 community groups in 17 locations at 11 districts in Central Java',
    blueCarbonRelatedStoriesEyebrow: 'Related Story',
    blueCarbonRelatedStoriesHeading: 'Where Blue Carbon making a difference',
    blueCarbonRelatedStory1Title:
      'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    blueCarbonRelatedStory1Excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    blueCarbonRelatedStory2Title:
      "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    blueCarbonRelatedStory2Excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    blueCarbonRelatedStory3Title:
      "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    blueCarbonRelatedStory3Excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    blueCarbonSupportHeading: 'Conserve the carbon, secure the coast',
    blueCarbonSupportSubheading: 'Protection, rehabilitation, and restoration - based on community',
    blueCarbonSupportCta: 'Support Us',

    ikanHeroTitle: 'IKAN: Collaboration for better fisheries data',
    ikanHeroLead: 'An android-based, open-access application designed for collaborative fisheries data collection.',
    ikanIntroP1Suffix:
      ' / Initiative on Collaborative Fisheries Data Collection) is a FRCI initiative that aims to strengthen fisheries data collection through a collaborative, technology-enabled, and evidence-based approach. The initiative brings together fishers, data collectors, researchers, government institutions, and other fisheries stakeholders to generate reliable and timely information that can support better fisheries management.',
    ikanIntroP2:
      'IKAN responds to persistent challenges in fisheries data collection, including limited coverage, inconsistent data quality, fragmented information systems, and difficulties in translating field observations into management-relevant information. By combining participatory data collection with digital technologies, IKAN seeks to improve the quality, consistency, traceability, and accessibility of fisheries data.',
    ikanIntroP3:
      'The initiative applies a range of tools and approaches, including Android-based data collection applications, integrated online databases, digital monitoring platforms, standardized data protocols, and artificial intelligence (AI) for fish identification. These systems enable fisheries information to be collected closer to the source, validated systematically, and made available for analysis and decision-making.',
    ikanIntroP4:
      'Through collaboration with fisheries stakeholders, IKAN supports the development of more comprehensive and responsive fisheries information systems, from landing sites and fishing communities to research and management institutions. The initiative ultimately aims to reduce data gaps and uncertainty, strengthen evidence for fisheries management, and contribute to more sustainable fisheries and healthier marine ecosystems.',
    ikanObjectivesEyebrow: 'Objectives',
    ikanObjectivesHeading: 'How IKAN drives change',
    ikanObjective1Title: 'Strengthen fisheries data systems',
    ikanObjective1Desc: 'Improve the quality, coverage, consistency, and accessibility of fisheries data',
    ikanObjective2Title: 'Enable collaborative data collection',
    ikanObjective2Desc:
      'Engage fisheries stakeholders in generating reliable and management-relevant information',
    ikanObjective3Title: 'Turn data into evidence',
    ikanObjective3Desc:
      'Improve the use of fisheries data to reduce uncertainty and support science-based management decisions.',
    ikanKeyActivitiesEyebrow: 'Key Activities',
    ikanKeyActivitiesTitle: 'From data collection to better decisions',
    ikanKeyActivityBullet1:
      'Developing and implementing collaborative fisheries data collection protocols and systems;',
    ikanKeyActivityBullet2:
      'Strengthening digital platforms for fisheries data collection, validation, integration, and monitoring;',
    ikanKeyActivityBullet3: 'Improving fisheries data quality, coverage, traceability, and accessibility;',
    ikanKeyActivityBullet4:
      'Applying innovative technologies, including AI, for fisheries data collection and species identification;',
    ikanKeyActivityBullet5:
      'Facilitating data sharing and collaboration among fishers, researchers, government, and fisheries stakeholders.',
    ikanCurrentProjectEyebrow: 'Current Project',
    ikanCrossCuttingEyebrow: 'Cross-cutting Program',
    ikanNusacoreDescription:
      'formally "Nature-based Solutions for Advancing Coastal Resilience in Central Java, Indonesia" — is a 3-year initiative (2025–2028) led by REKAM and funded through the UK FCDO\'s COAST Facility, responding to worsening coastal erosion, climate change impacts, and mangrove loss along Central Java\'s northern coast that past restoration efforts failed to resolve due to weak execution and reliance on external funding. The programme builds community-led, self-financing Nature-based Solutions that restore mangrove ecosystems while reducing poverty, pairing habitat rehabilitation with sustainable aquaculture — mangrove crabs, milkfish, green mussels, and shrimp — through a silvofishery model that lets conservation and livelihoods reinforce each other. Anchored by GEDSI and FPIC principles and capacity-building at the institutional level, NUSACORE\'s project site covers 17 sites in 11 districts and reaches 25 community groups across Central Java.',
    ikanNusacoreActivityLabel: 'Key Activity',
    ikanNusacoreActivity1:
      'Mangrove ecosystem rehabilitation and restoration to rebuild natural coastal defenses and reverse erosion',
    ikanNusacoreActivity2:
      'Development of silvofishery pilots that pair mangrove conservation with sustainable aquaculture of mangrove crabs, milkfish, mussels, and shrimp',
    ikanNusacoreActivity3:
      'Training, mentoring, and value-added fisheries processing to build self-financing, poverty-reducing livelihoods less dependent on external funding',
    ikanNusacoreActivity4:
      'Application of GEDSI and FPIC principles to ensure equitable participation of women, youth, persons with disabilities, and other vulnerable groups',
    ikanNusacoreActivity5:
      'Institutional strengthening — coastal management standards, stakeholder capacity building, and climate-responsive planning policy across 25 community groups in 17 locations at 11 districts in Central Java',
    ikanRelatedStoriesEyebrow: 'Related Stories',
    ikanRelatedStoriesHeading: 'Where IKAN making a difference',
    ikanRelatedStory1Title: 'Aligning Science and Policy: Indonesia Strengthens Its Position for CITES AC34',
    ikanRelatedStory1Excerpt:
      "FRCI supports the government's technical preparation ahead of the CITES Animals Committee session.",
    ikanRelatedStory2Title:
      "From Pilot Projects to National Policy: Aligning Ocean Accounts for Indonesia's Future",
    ikanRelatedStory2Excerpt:
      'How years of pilot-site data collection are shaping a national ocean accounting framework.',
    ikanRelatedStory3Title: "Beyond Borders: Building Indonesia's Readiness for High Seas Conservation",
    ikanRelatedStory3Excerpt:
      'FRCI examines what it will take for Indonesia to engage effectively in high seas governance.',
    ikanSecondCtaHeading: 'Better data, better fisheries decisions',
    ikanSecondCtaBody:
      'Connecting fishers, researchers, government, and technology to turn field data into reliable evidence for sustainable fisheries.',
    ikanDownloadAppCta: 'Download App',
  },
};
