import type { Locale } from '../config';

/** Kosakata untuk seksi menu DISCOVER: label nav-nya, plus narasi tiap
 *  halaman (About Us, Our Team, Achievements, Our Impact, Publications,
 *  Jogo Laut) lewat key berprefiks nama halamannya. */
export type DiscoverDictionary = {
  navDiscover: string;
  navAboutUs: string;
  navOurTeam: string;
  navAchievements: string;
  navOurImpact: string;
  navPublications: string;
  ourImpactHeading: string;
  ourImpactBody: string;

  // --- about-us ---
  aboutUsHeroHeading: string;
  aboutUsIntroBody1: string;
  aboutUsIntroBody2: string;
  aboutUsIntroBody3: string;
  aboutUsMissionHeading: string;
  aboutUsMissionEyebrow: string;
  aboutUsMissionTitle: string;
  aboutUsMissionBody: string;
  aboutUsApproachEyebrow: string;
  aboutUsApproachTitle: string;
  aboutUsApproachBody: string;
  aboutUsTeamEyebrow: string;
  aboutUsTeamHeading: string;
  aboutUsTeamMemberTag: string;
  aboutUsProfileCta: string;

  // --- achievements ---
  achievementsHeroHeading: string;
  achievementsHeroBody: string;
  achievementsStatMarineProtectedArea: string;
  achievementsStatAreaBasedManagement: string;
  achievementsStatFisheriesManagementAreas: string;
  achievementsStatCommunityGroups: string;
  achievementsStatFieldEnumerators: string;
  achievementsStatJournalPublications: string;
  achievementsStatKnowledgeProduction: string;
  achievementsStatBooks: string;
  achievementsStatPolicyPublications: string;
  achievementsStatScholarshipAwardees: string;
  achievementsStatStudentInternships: string;
  achievementsStatVolunteers: string;
  achievementsMilestoneEyebrow: string;
  achievementsMilestoneHeading: string;
  achievementsMilestoneSubheading: string;
  achievementsPolicyEyebrow: string;
  achievementsPolicyHeading: string;
  achievementsPolicySubheading: string;
  achievementsPolicy1Title: string;
  achievementsPolicy1Description: string;
  achievementsPolicy2Title: string;
  achievementsPolicy2Description: string;
  achievementsPolicy3Title: string;
  achievementsPolicy3Description: string;
  achievementsCtaHeading: string;
  achievementsCtaBody: string;
  achievementsCtaExplorePublications: string;
  achievementsCtaDownloadData: string;

  // --- jogo-laut ---
  jogoLautHeroTitle: string;
  jogoLautHeroLead: string;

  // --- publications ---
  publicationsBadge: string;
  publicationsHeroHeading: string;
  publicationsHeroBody: string;
  publicationsSearchLabel: string;
  publicationsSearchPlaceholder: string;
  publicationsCategoryLabel: string;
  publicationsAllCategoriesOption: string;
  publicationsAllTab: string;
  publicationsDocTypeResearchReports: string;
  publicationsDocTypePolicyBriefs: string;
  publicationsDocTypeFieldGuides: string;
  publicationsDocTypeDataSheets: string;
  publicationsDocumentTypeNote: string;
  publicationsStatAvailable: string;
  publicationsStatDownloads: string;
  publicationsStatCategories: string;
  publicationsStatFmas: string;
  publicationsFeaturedEyebrow: string;
  publicationsFeaturedBody: string;
  publicationsFeaturedDownloadCta: string;
  publicationsFeaturedReadCta: string;
  publicationsOurPublicationEyebrow: string;
  publicationsOurPublicationHeading: string;
  publicationsNoResults: string;
  publicationsKnowledgeProductEyebrow: string;
  publicationsKnowledgeProductHeading: string;
  publicationsKnowledgeProductEmpty: string;
  publicationsVideoEyebrow: string;
  publicationsVideoHeading: string;

  // --- our-team ---
  ourTeamHeroBody: string;
  ourTeamHeroStatMembers: string;
  ourTeamHeroStatFieldOfficers: string;
  ourTeamHeroStatYearsFieldwork: string;
  ourTeamAdvisorLabel: string;
  ourTeamAdvisorHeading: string;
  ourTeamAdvisorSubheading: string;
  ourTeamManagerEyebrow: string;
  ourTeamLeadershipTag: string;
  ourTeamManagerHeading: string;
  ourTeamManagerSubheading: string;
  ourTeamOfficerEyebrow: string;
  ourTeamOfficerHeading: string;
  ourTeamOfficerSubheading: string;
  ourTeamProfileCta: string;
  ourTeamEnumeratorEyebrow: string;
  ourTeamEnumeratorHeading: string;
  ourTeamEnumeratorBody: string;
  ourTeamEnumeratorStat1: string;
  ourTeamEnumeratorStat2: string;
  ourTeamEnumeratorStat3: string;
  ourTeamEnumeratorStat4: string;
  ourTeamJoinUsEyebrow: string;
  ourTeamJoinUsHeading: string;
  ourTeamJoinUsBody: string;
  ourTeamJoinUsSeeRoles: string;
  ourTeamJoinUsFellowship: string;
};

export const discoverDictionary: Record<Locale, DiscoverDictionary> = {
  id: {
    navDiscover: 'Jelajahi',
    navAboutUs: 'Tentang Kami',
    navOurTeam: 'Tim Kami',
    navAchievements: 'Pencapaian',
    navOurImpact: 'Dampak Kami',
    navPublications: 'Publikasi',
    ourImpactHeading: 'Dampak Kami: Bukti aksi kami yang menjangkau seluruh perairan Indonesia',
    ourImpactBody:
      'Kerangka Neraca Sumber Daya Laut FRCI kini aktif di perairan Indonesia, menerjemahkan data ekosistem dan ekonomi dari lapangan menjadi informasi yang bisa ditindaklanjuti masyarakat.',

    aboutUsHeroHeading: 'Kami bicara dengan bukti',
    aboutUsIntroBody1:
      'Didirikan pada 2018, REKAM/FRCI adalah program khusus Rekam Nusantara Foundation untuk konservasi perikanan dan kelautan, dibangun di atas data berbasis sains dan kolaborasi erat dengan masyarakat, pemerintah, dan peneliti. Pekerjaan kami saat ini mencakup tiga wilayah utama, yaitu Jawa Tengah, Teluk Saleh di Nusa Tenggara Barat, dan Kawasan Konservasi Perairan (KKP) Liukang Tangaya di Sulawesi Selatan, tempat kami menghasilkan bukti yang dibutuhkan untuk pengelolaan perikanan dan kelautan yang berkelanjutan.',
    aboutUsIntroBody2:
      'Kerja REKAM/FRCI diorganisasikan dalam lima program utama. Program Perikanan Berkelanjutan kami mendorong pengelolaan perikanan skala kecil Indonesia berbasis sains dengan memadukan riset, teknologi, dan pengetahuan lokal, memberi masukan bagi kebijakan, meningkatkan kesadaran publik, dan memperkuat tata kelola perikanan demi ketahanan jangka panjang masyarakat pesisir. Program Neraca Sumber Daya Laut kami mendorong integrasi data ekosistem, ekonomi, dan sosial ke dalam tata kelola laut nasional, mendukung transisi Indonesia menuju pengelolaan laut yang berbasis bukti dan berkelanjutan. Program Konservasi Laut kami bekerja sama dengan pemerintah pusat dan daerah untuk memperkuat pengelolaan Kawasan Konservasi Perairan (KKP) yang efektif dan adaptif, mulai dari riset dan analisis biaya-manfaat hingga peningkatan kapasitas pengelola dan masyarakat lokal. Program Konservasi Spesies kami berfokus pada perlindungan hiu dan pari Indonesia, tangkapan hiu dan pari terbesar di dunia, melalui peningkatan kapasitas, dukungan kepatuhan CITES, dan riset nasional atas rantai perdagangan hiu dan pari. Program Karbon Biru kami mendukung rehabilitasi dan pengelolaan berkelanjutan ekosistem mangrove dan lamun, memberdayakan masyarakat pesisir melalui strategi mata pencaharian yang berakar pada potensi lokal.',
    aboutUsIntroBody3:
      'Mendasari kelima program tersebut adalah IKAN, aplikasi seluler berbasis Android untuk pengumpulan data perikanan. Dapat diakses publik dan dibangun di atas prinsip sains warga (citizen science) yang selaras dengan protokol ilmiah standar, IKAN memungkinkan nelayan, enumerator, dan anggota masyarakat di seluruh Indonesia berkontribusi langsung pada data yang menjadi dasar penilaian stok dan keputusan pengelolaan perikanan. Sejak dikembangkan, REKAM/FRCI terus memperluas dan menyempurnakan IKAN agar sains kelautan semakin partisipatif, transparan, dan digerakkan oleh masyarakat.',
    aboutUsMissionHeading: 'Misi dan pendekatan',
    aboutUsMissionEyebrow: 'Misi Kami',
    aboutUsMissionTitle: 'Pendekatan alternatif untuk analisis perikanan, berbasis sains',
    aboutUsMissionBody:
      'FRCI menghadirkan pendekatan alternatif untuk analisis perikanan dan pengelolaan kelautan berkelanjutan berbasis data ilmiah.',
    aboutUsApproachEyebrow: 'Pendekatan Kami',
    aboutUsApproachTitle: 'Kemitraan, bukan sekadar publikasi',
    aboutUsApproachBody:
      'Kami bermitra dan berkolaborasi dengan para pemangku kepentingan dan pembuat kebijakan, serta melibatkan masyarakat dalam pengumpulan data.',
    aboutUsTeamEyebrow: 'Tim Kami',
    aboutUsTeamHeading: 'Para ahli di balik kerja kami',
    aboutUsTeamMemberTag: 'Penasihat',
    aboutUsProfileCta: 'Profil',

    achievementsHeroHeading: 'Delapan tahun bukti yang mengubah keputusan',
    achievementsHeroBody:
      'Inilah momen-momen ketika FRCI mengubah data menjadi aksi, memengaruhi para pemangku kepentingan dan pembuat kebijakan untuk membentuk kebijakan berbasis bukti dan sains bagi perairan Indonesia.',
    achievementsStatMarineProtectedArea: 'Kawasan Konservasi Perairan',
    achievementsStatAreaBasedManagement: 'Pengelolaan Berbasis Kawasan',
    achievementsStatFisheriesManagementAreas: 'Wilayah Pengelolaan Perikanan (WPP)',
    achievementsStatCommunityGroups: 'Kelompok Masyarakat',
    achievementsStatFieldEnumerators: 'Enumerator Lapangan',
    achievementsStatJournalPublications: 'Publikasi Jurnal',
    achievementsStatKnowledgeProduction: 'Produksi Pengetahuan',
    achievementsStatBooks: 'Buku',
    achievementsStatPolicyPublications: 'Publikasi Kebijakan',
    achievementsStatScholarshipAwardees: 'Penerima Beasiswa',
    achievementsStatStudentInternships: 'Magang Mahasiswa',
    achievementsStatVolunteers: 'Relawan',
    achievementsMilestoneEyebrow: 'Tonggak Capaian',
    achievementsMilestoneHeading: 'Dari akar hingga pengakuan global',
    achievementsMilestoneSubheading: 'Perjalanan kami dari awal hingga kini',
    achievementsPolicyEyebrow: 'Dampak Kebijakan',
    achievementsPolicyHeading: 'Tempat bukti membentuk masa depan',
    achievementsPolicySubheading: 'Lihat di mana data FRCI telah memberi dampak',
    achievementsPolicy1Title: 'Kerangka Neraca Sumber Daya Laut Nasional',
    achievementsPolicy1Description:
      'Neraca uji coba FRCI menjadi templat struktural bagi kerangka nasional, termasuk klasifikasi tangkapan skala kecil yang sebelumnya hanya dicatat secara agregat.',
    achievementsPolicy2Title: 'Pengajuan ke Komite Fauna CITES',
    achievementsPolicy2Description:
      'Data pendaratan tingkat spesies mendukung posisi teknis Indonesia pada pencantuman hiu dan pari di AC33 dan AC34.',
    achievementsPolicy3Title: 'Strategi panen tingkat provinsi',
    achievementsPolicy3Description:
      'Empat provinsi kini menetapkan titik acuan musiman menggunakan data seri lokasi pendaratan yang dikelola bersama FRCI dan dinas perikanan setempat.',
    achievementsCtaHeading: 'Seluruh data kami terbuka untuk diakses',
    achievementsCtaBody:
      'Kami percaya dampak harus terlihat, terukur, dan dapat diakses oleh semua orang. Unduh publikasi dan data kami di bawah ini.',
    achievementsCtaExplorePublications: 'Jelajahi Publikasi Kami',
    achievementsCtaDownloadData: 'Unduh Data',

    jogoLautHeroTitle: 'Jogo Laut: Stasiun riset terpadu - Cilacap, Jawa Tengah',
    jogoLautHeroLead:
      'Platform pemantauan ekosistem pesisir secara real-time yang dikembangkan oleh Rekam Nusantara Foundation bersama IPB University, Kementerian Kelautan dan Perikanan, BRIN, Pemerintah Provinsi Jawa Tengah, dan Kelompok Masyarakat',

    publicationsBadge: 'Publikasi Akses Terbuka',
    publicationsHeroHeading: 'Semua angka kami terbuka untuk diakses',
    publicationsHeroBody:
      'Jelajahi laporan teknis, ringkasan kebijakan, panduan lapangan, dan lembar data dari kerja FRCI di seluruh perairan Indonesia.',
    publicationsSearchLabel: 'Cari Publikasi',
    publicationsSearchPlaceholder: 'Cari…',
    publicationsCategoryLabel: 'Kategori',
    publicationsAllCategoriesOption: 'Semua Kategori',
    publicationsAllTab: 'Semua',
    publicationsDocTypeResearchReports: 'Laporan Penelitian',
    publicationsDocTypePolicyBriefs: 'Ringkasan Kebijakan',
    publicationsDocTypeFieldGuides: 'Panduan Lapangan',
    publicationsDocTypeDataSheets: 'Lembar Data',
    publicationsDocumentTypeNote: 'Filter jenis dokumen belum tersedia.',
    publicationsStatAvailable: 'Publikasi Tersedia',
    publicationsStatDownloads: 'Total Unduhan',
    publicationsStatCategories: 'Kategori Dokumen',
    publicationsStatFmas: 'WPP Tercakup',
    publicationsFeaturedEyebrow: 'Publikasi Unggulan',
    publicationsFeaturedBody:
      'Data satu tahun penuh di seluruh 8 WPP — tren tangkapan, indikator ekosistem, dan cakupan pemantauan masyarakat.',
    publicationsFeaturedDownloadCta: 'Unduh PDF',
    publicationsFeaturedReadCta: 'Baca Daring',
    publicationsOurPublicationEyebrow: 'Publikasi Kami',
    publicationsOurPublicationHeading: 'Hasil kerja dan kolaborasi kami',
    publicationsNoResults: 'Tidak ada publikasi yang cocok dengan pencarian ini.',
    publicationsKnowledgeProductEyebrow: 'Produk Pengetahuan',
    publicationsKnowledgeProductHeading: 'Mengubah riset kami menjadi pengetahuan untuk semua',
    publicationsKnowledgeProductEmpty: 'Belum ada produk pengetahuan yang cocok dengan kategori ini.',
    publicationsVideoEyebrow: 'Publikasi Video',
    publicationsVideoHeading: 'Tonton dan pelajari lebih lanjut tentang laut kita',

    ourTeamHeroBody:
      'terdiri dari peneliti dan aktivis konservasi perikanan dan kelautan dengan lebih dari dua dekade pengalaman bekerja bersama masyarakat, pemerintah, dan sektor swasta, melalui pengelolaan data, pengembangan pengetahuan dan kapasitas, serta advokasi kebijakan di bidang kelautan dan perikanan.',
    ourTeamHeroStatMembers: 'Anggota tim',
    ourTeamHeroStatFieldOfficers: 'Petugas lapangan',
    ourTeamHeroStatYearsFieldwork: 'Tahun kerja lapangan',
    ourTeamAdvisorLabel: 'Penasihat',
    ourTeamAdvisorHeading: 'Para ahli di balik kerja kami',
    ourTeamAdvisorSubheading:
      'Peneliti senior dan pakar sektor yang menetapkan standar ilmiah FRCI dan membuka jalan kemitraan dengan institusi.',
    ourTeamManagerEyebrow: 'Manajer',
    ourTeamLeadershipTag: 'Pimpinan',
    ourTeamManagerHeading: 'Para pemimpin program kami',
    ourTeamManagerSubheading: 'Bertanggung jawab atas pelaksanaan program dan kemitraan institusional FRCI.',
    ourTeamOfficerEyebrow: 'Petugas',
    ourTeamOfficerHeading: 'Orang-orang yang mewujudkannya',
    ourTeamOfficerSubheading: 'Koordinator, spesialis, dan petugas di balik setiap program.',
    ourTeamProfileCta: 'Profil',
    ourTeamEnumeratorEyebrow: 'Relawan dan Enumerator Lapangan',
    ourTeamEnumeratorHeading: 'Orang-orang di balik setiap titik data',
    ourTeamEnumeratorBody:
      'Di luar tim inti, lebih dari 180 enumerator dan relawan masyarakat terlatih mencatat data tangkapan di lokasi pendaratan di seluruh Indonesia. Data ini tetap terbuka untuk diakses dan diberi kredit kepada pencatatnya, dengan kontributor tetap memiliki akses penuh atas data yang mereka kumpulkan.',
    ourTeamEnumeratorStat1: '180+ enumerator',
    ourTeamEnumeratorStat2: '100+ lokasi pendaratan',
    ourTeamEnumeratorStat3: '11 wilayah perikanan',
    ourTeamEnumeratorStat4: 'Pelatihan triwulanan',
    ourTeamJoinUsEyebrow: 'Bergabung Bersama Kami',
    ourTeamJoinUsHeading: 'Kami bekerja bersama orang-orang yang ingin usahanya berarti',
    ourTeamJoinUsBody:
      'Cari tahu lebih lanjut tentang peluang yang tersedia dan program fellowship riset kami di sini.',
    ourTeamJoinUsSeeRoles: 'Lihat Lowongan Terbuka',
    ourTeamJoinUsFellowship: 'Program Fellowship',
  },
  en: {
    navDiscover: 'Discover',
    navAboutUs: 'About Us',
    navOurTeam: 'Our Team',
    navAchievements: 'Achievements',
    navOurImpact: 'Our Impact',
    navPublications: 'Publications',
    ourImpactHeading: "Our Impact: Evidence of our action that reaches across Indonesia's seas",
    ourImpactBody:
      "FRCI's Ocean Accounts framework is now active in Indonesian seas, translating field-level ecosystem and economic data into information that communities can act on.",

    aboutUsHeroHeading: 'We speak with evidence',
    aboutUsIntroBody1:
      "Established in 2018, REKAM/FRCI is Rekam Nusantara Foundation's dedicated program for fisheries and marine conservation, built on science-based data and close collaboration with communities, government, and researchers. Our current work spans three key regions, Central Java, Saleh Bay in West Nusa Tenggara, and the Liukang Tangaya Marine Protected Area (MPA) in South Sulawesi, where we generate the evidence needed for sustainable fisheries and marine management.",
    aboutUsIntroBody2:
      "REKAM/FRCI's work is organized around five major programs. Our Sustainable Fisheries program promotes science-based management of Indonesia's small-scale fisheries by integrating research, technology, and local knowledge, informing policy, raising public awareness, and strengthening fisheries governance for the long-term resilience of coastal communities. Our Ocean Accounts program advances the integration of ecosystem, economic, and social data into national ocean governance, supporting Indonesia's transition toward evidence-based, sustainable ocean management. Our Marine Conservation program works with national and local government to strengthen the effective, adaptive management of MPAs, from research and cost-benefit analysis to capacity building for managers and local communities. Our Species Conservation program focuses on protecting Indonesia's sharks and rays, the world's largest shark and ray catch, through capacity building, CITES compliance support, and nationwide research on the shark and ray trade chain. Our Blue Carbon program supports the rehabilitation and sustainable management of mangrove and seagrass ecosystems, empowering coastal communities through livelihood strategies grounded in local potential.",
    aboutUsIntroBody3:
      'Underpinning all five programs is IKAN, our Android-based mobile application for fisheries data collection. Publicly accessible and built on citizen-science principles aligned with standard scientific protocols, IKAN enables fishers, enumerators, and community members across Indonesia to contribute directly to the data that informs stock assessments and fisheries management decisions. Since its development, REKAM/FRCI has continued to expand and refine IKAN to make marine science more participatory, transparent, and community-driven.',
    aboutUsMissionHeading: 'Mission and approach',
    aboutUsMissionEyebrow: 'Our Mission',
    aboutUsMissionTitle: 'An alternative to fisheries analysis, grounded in science',
    aboutUsMissionBody:
      'FRCI provides an alternative approach to fisheries analysis and sustainable marine management based on scientific data.',
    aboutUsApproachEyebrow: 'Our Approach',
    aboutUsApproachTitle: 'Partnership, not just publication',
    aboutUsApproachBody:
      'We partner and collaborate with stakeholders and policymakers, and involve communities to take part in data collection.',
    aboutUsTeamEyebrow: 'Our Team',
    aboutUsTeamHeading: 'The experts behind our work',
    aboutUsTeamMemberTag: 'Advisor',
    aboutUsProfileCta: 'Profile',

    achievementsHeroHeading: 'Eight years of evidence that changed decisions',
    achievementsHeroBody:
      "These are the moments where FRCI turned data into action, influencing stakeholders and policymakers to shape evidence-based, science-driven policy for Indonesia's seas.",
    achievementsStatMarineProtectedArea: 'Marine Protected Area',
    achievementsStatAreaBasedManagement: 'Area-Based Management',
    achievementsStatFisheriesManagementAreas: 'Fisheries Management Areas (FMAs)',
    achievementsStatCommunityGroups: 'Community Groups',
    achievementsStatFieldEnumerators: 'Field Enumerators',
    achievementsStatJournalPublications: 'Journal Publications',
    achievementsStatKnowledgeProduction: 'Knowledge Production',
    achievementsStatBooks: 'Books',
    achievementsStatPolicyPublications: 'Policy Publications',
    achievementsStatScholarshipAwardees: 'Scholarship Awardees',
    achievementsStatStudentInternships: 'Student Internships',
    achievementsStatVolunteers: 'Volunteers',
    achievementsMilestoneEyebrow: 'Milestone',
    achievementsMilestoneHeading: 'From the roots to global recognition',
    achievementsMilestoneSubheading: 'Our journey from the beginning until now',
    achievementsPolicyEyebrow: 'Policy Impact',
    achievementsPolicyHeading: 'Where the evidence shape the future',
    achievementsPolicySubheading: "See where FRCI's data has made an impact",
    achievementsPolicy1Title: 'National Ocean Accounting Framework',
    achievementsPolicy1Description:
      "FRCI's pilot accounts became the structural template for the national framework, including the classification of small-scale catch that had previously been recorded only in aggregate.",
    achievementsPolicy2Title: 'CITES Animals Committee submissions',
    achievementsPolicy2Description:
      "Species-level landing data supported Indonesia's technical position on shark and ray listings at AC33 and AC34.",
    achievementsPolicy3Title: 'Provincial harvest strategies',
    achievementsPolicy3Description:
      'Four provinces now set seasonal reference points using landing-site series that FRCI maintains jointly with local fisheries agencies.',
    achievementsCtaHeading: 'All our numbers are open access',
    achievementsCtaBody:
      'We believe impact should be visible, measurable, and accessible to everyone. Download our publications and data below.',
    achievementsCtaExplorePublications: 'Explore Our Publication',
    achievementsCtaDownloadData: 'Download Data',

    jogoLautHeroTitle: 'Jogo Laut: Integrated Research Station - Cilacap, Central Java',
    jogoLautHeroLead:
      'A real-time coastal ecosystem monitoring platform developed by Rekam Nusantara Foundation together with IPB University, the Ministry of Marine Affairs and Fisheries, BRIN, the Central Java Provincial Government, and Community Groups',

    publicationsBadge: 'Open Access Publication',
    publicationsHeroHeading: 'All our numbers are open access',
    publicationsHeroBody:
      "Explore our technical reports, policy briefs, field guides, and data sheets from FRCI's work across Indonesia's seas.",
    publicationsSearchLabel: 'Search Publications',
    publicationsSearchPlaceholder: 'Search…',
    publicationsCategoryLabel: 'Category',
    publicationsAllCategoriesOption: 'All Categories',
    publicationsAllTab: 'All',
    publicationsDocTypeResearchReports: 'Research Reports',
    publicationsDocTypePolicyBriefs: 'Policy Briefs',
    publicationsDocTypeFieldGuides: 'Field Guides',
    publicationsDocTypeDataSheets: 'Data Sheets',
    publicationsDocumentTypeNote: 'Document type filter is not available yet.',
    publicationsStatAvailable: 'Publications Available',
    publicationsStatDownloads: 'Total Downloads',
    publicationsStatCategories: 'Document Categories',
    publicationsStatFmas: 'FMAs Covered',
    publicationsFeaturedEyebrow: 'Featured Publication',
    publicationsFeaturedBody:
      'The full-year data account across all 8 FMAs — catch trends, ecosystem indicators, and community monitoring coverage.',
    publicationsFeaturedDownloadCta: 'Download PDF',
    publicationsFeaturedReadCta: 'Read Online',
    publicationsOurPublicationEyebrow: 'Our Publication',
    publicationsOurPublicationHeading: 'The results of our work and collaboration',
    publicationsNoResults: 'No publications match this search.',
    publicationsKnowledgeProductEyebrow: 'Knowledge Product',
    publicationsKnowledgeProductHeading: 'Turning our research into knowledge for everyone',
    publicationsKnowledgeProductEmpty: 'No knowledge products match this category yet.',
    publicationsVideoEyebrow: 'Video Publication',
    publicationsVideoHeading: 'Watch and learn more about our ocean',

    ourTeamHeroBody:
      'comprises marine conservation fisheries researchers and activists with over two decades of experience working with communities, governments, and private sector, through data management, knowledge and capacity building, and policy advocacy in the marine and fisheries subject.',
    ourTeamHeroStatMembers: 'Team members',
    ourTeamHeroStatFieldOfficers: 'Field officers',
    ourTeamHeroStatYearsFieldwork: 'Years of fieldwork',
    ourTeamAdvisorLabel: 'Advisor',
    ourTeamAdvisorHeading: 'The experts behind our work',
    ourTeamAdvisorSubheading:
      "Senior researchers and sector experts who set FRCI's scientific standards and open doors with institutional partners.",
    ourTeamManagerEyebrow: 'Manager',
    ourTeamLeadershipTag: 'Leadership',
    ourTeamManagerHeading: 'The leaders of our programs',
    ourTeamManagerSubheading: "Responsible for FRCI's program delivery and institutional partnerships.",
    ourTeamOfficerEyebrow: 'Officer',
    ourTeamOfficerHeading: 'The people who make it happen',
    ourTeamOfficerSubheading: 'Coordinators, specialists, and officers behind every program.',
    ourTeamProfileCta: 'Profile',
    ourTeamEnumeratorEyebrow: 'Field Volunteers & Enumerators',
    ourTeamEnumeratorHeading: 'The people behind every data point',
    ourTeamEnumeratorBody:
      'Beyond the core team, more than 180 trained community enumerators and volunteers record catch data at landing sites across Indonesia. The data stays open-access and credited to the people who recorded it, with contributors retaining full access to the data they collect.',
    ourTeamEnumeratorStat1: '180+ enumerators',
    ourTeamEnumeratorStat2: '100+ landing sites',
    ourTeamEnumeratorStat3: '11 fisheries areas',
    ourTeamEnumeratorStat4: 'Quarterly training',
    ourTeamJoinUsEyebrow: 'Join Us',
    ourTeamJoinUsHeading: 'We work with people who want their efforts matter',
    ourTeamJoinUsBody: 'Find out more about available opportunities and the research fellowship program here.',
    ourTeamJoinUsSeeRoles: 'See Open Roles',
    ourTeamJoinUsFellowship: 'Fellowship Program',
  },
};
