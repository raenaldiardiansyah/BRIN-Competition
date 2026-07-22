export type Contribution = {
  person: string;
  role: string;
  avatar: string;
  task: string;
  metric: string;
  proof: string[];
};

export type Evidence = {
  type: string;
  title: string;
  status: string;
};

export type OpenNeed = {
  id: string;
  title: string;
  role: string;
  commitment?: string;
  deadline?: string;
  status: 'open' | 'closed';
};

export type FeaturedProject = {
  id: string;
  title: string;
  organization: string;
  problem: string;
  summary: string;

  lifecycle: string;
  readiness: string;
  readinessSource: string;

  visibility: 'public' | 'limited-preview';
  location: string;
  recommendationReason: string;

  contributions: Contribution[];
  evidence: Evidence[];
  openNeeds: OpenNeed[];

  matching: {
    skillFit: number;
    evidenceCoverage: number;
    availability: number;
    projectReadiness: number;
    dataConfidence: number;

    primaryReason: string;
    supportingEvidence: string[];
    mainGap: string;
    confidenceLabel: string;
    dataLimitation: string;
  };
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "aqualoop",
    title: "AquaLoop: Pemantauan kualitas air terbuka",
    organization: "BRIN Lab",
    problem: "Pencemaran industri di daerah aliran sungai yang merusak ekosistem pertanian lokal.",
    summary: "Menyediakan sistem pemantauan kualitas air sungai secara real-time berbasis sensor terbuka guna mencegah polusi industri.",
    lifecycle: "PILOT",
    readiness: "Siap uji lapangan di 3 daerah aliran sungai utama Jawa Barat.",
    readinessSource: "Tinjauan Kesiapan Lapangan BRIN",
    visibility: "public",
    location: "Bandung, Indonesia",
    recommendationReason: "Relevan untuk validasi sensor lingkungan perkotaan.",
    contributions: [
      {
        person: "Maya Pradipta",
        role: "Data Engineer",
        avatar: "MP",
        task: "Pipeline validasi data sensor",
        metric: "38% data lebih cepat diproses",
        proof: ["Repository", "Catatan pengujian"]
      }
    ],
    evidence: [
      { type: "Repository", title: "aqualoop-sensor-pipeline", status: "Verified" },
      { type: "Test Report", title: "Uji Validasi Sensor DAS Citarum", status: "Approved" },
      { type: "Project Doc", title: "Spesifikasi Kalibrasi Elektrik v1.2", status: "Signed" }
    ],
    openNeeds: [
      { id: "need-aq-1", title: "GIS Specialist", role: "Remote Sensing & Spasial", commitment: "10 jam/minggu", status: "open" },
      { id: "need-aq-2", title: "IoT Hardware Integrator", role: "Embedded Electronics", commitment: "15 jam/minggu", status: "open" }
    ],
    matching: {
      skillFit: 88,
      evidenceCoverage: 81,
      availability: 90,
      projectReadiness: 74,
      dataConfidence: 82,
      primaryReason: "3 kebutuhan proyek cocok dengan evidence Anda di bidang visualisasi spasial.",
      supportingEvidence: [
        "Repository pemetaan suhu perkotaan di profil Anda",
        "Dokumentasi pengujian sensor cuaca terverifikasi BRIN"
      ],
      mainGap: "Keahlian kalibrasi fisik sensor IoT (dapat diselesaikan via pendampingan)",
      confidenceLabel: "Keyakinan Tinggi (82%)",
      dataLimitation: "Hasil pencocokan didasarkan pada repositori publik 6 bulan terakhir."
    }
  },
  {
    id: "urbanheat",
    title: "Urban Heat Mapping untuk kota tangguh",
    organization: "Nexa Research Lab",
    problem: "Kenaikan suhu mikro perkotaan akibat hilangnya ruang terbuka hijau dan penggunaan material beton.",
    summary: "Pemetaan suhu permukaan daratan perkotaan menggunakan citra satelit Landsat-9 untuk merancang koridor hijau mitigasi iklim.",
    lifecycle: "RESEARCH",
    readiness: "Tahap analisis spasial awal & pengumpulan data thermal darat.",
    readinessSource: "Riset Spasial Nexa Lab",
    visibility: "public",
    location: "Jakarta, Indonesia",
    recommendationReason: "Relevan dengan keahlian pemetaan iklim perkotaan Anda.",
    contributions: [
      {
        person: "Fahri Husein",
        role: "GIS Analyst",
        avatar: "FH",
        task: "Rasio indeks vegetasi (NDVI)",
        metric: "Akurasi peta termal meningkat 15%",
        proof: ["Model Spasial", "Metadata Citra"]
      }
    ],
    evidence: [
      { type: "Model Spasial", title: "urban-heat-ndvi-model", status: "Verified" },
      { type: "Metadata Citra", title: "Landsat-9 Correction Log", status: "Approved" },
      { type: "Project Doc", title: "Urban Heat Mitigation Report", status: "Verified" }
    ],
    openNeeds: [
      { id: "need-uh-1", title: "Remote Sensing Specialist", role: "Landsat Analysis", commitment: "8 jam/minggu", status: "open" },
      { id: "need-uh-2", title: "GIS Researcher", role: "QGIS Mapping", commitment: "12 jam/minggu", status: "open" }
    ],
    matching: {
      skillFit: 92,
      evidenceCoverage: 85,
      availability: 80,
      projectReadiness: 88,
      dataConfidence: 90,
      primaryReason: "Keahlian Landsat Analysis dan QGIS Anda sangat cocok untuk fase riset termal Nexa.",
      supportingEvidence: [
        "Model analisis spasial rasio NDVI perkotaan Anda",
        "Peta kontribusi analisis Landsat pada repositori Agri Nexus"
      ],
      mainGap: "Pengalaman pengolahan citra satelit malam hari",
      confidenceLabel: "Sangat Kuat (90%)",
      dataLimitation: "Tingkat keyakinan tinggi berdasarkan keselarasan total dengan kontribusi terdahulu."
    }
  },
  {
    id: "coldchain",
    title: "Rantai dingin hasil tani berbasis sensor",
    organization: "Agri Nexus",
    problem: "Kerusakan hasil panen sayur segar hingga 40% selama masa distribusi logistik pedesaan.",
    summary: "Sistem pelacakan suhu kontainer distribusi sayur segar dari hulu ke hilir untuk mengurangi kerusakan pangan pasca-panen.",
    lifecycle: "VALIDATION",
    readiness: "Fase validasi sensor suhu & integrasi modul GPS transmisi.",
    readinessSource: "Audit Kualitas Supply Chain Agri Nexus",
    visibility: "public",
    location: "Depok, Indonesia",
    recommendationReason: "Pencocokan kuat dengan rekam jejak hardware IoT Anda.",
    contributions: [
      {
        person: "Budi Setiawan",
        role: "Embedded Developer",
        avatar: "BS",
        task: "Firmware GPS hemat energi",
        metric: "Daya tahan baterai sensor naik 50%",
        proof: ["Skema CAD", "ESP32 Code"]
      }
    ],
    evidence: [
      { type: "Skema CAD", title: "agri-sensor-enclosure-v2", status: "Approved" },
      { type: "ESP32 Code", title: "esp32-deep-sleep-gps", status: "Verified" },
      { type: "Project Doc", title: "Laporan Kalibrasi Suhu Tani", status: "Signed" }
    ],
    openNeeds: [
      { id: "need-cc-1", title: "Firmware Developer", role: "ESP32 Programming", commitment: "15 jam/minggu", status: "open" },
      { id: "need-cc-2", title: "Electronics Hobbyist", role: "CAD Enclosure design", commitment: "10 jam/minggu", status: "open" }
    ],
    matching: {
      skillFit: 78,
      evidenceCoverage: 70,
      availability: 85,
      projectReadiness: 90,
      dataConfidence: 75,
      primaryReason: "Pengalaman pemrograman ESP32 dan C++ Anda sangat relevan untuk kebutuhan firmware sensor.",
      supportingEvidence: [
        "Repositori pipeline pengolahan data sensor lingkungan di profil Anda",
        "Firmware sensor pemantauan air DAS Citarum"
      ],
      mainGap: "Desain penutup fisik (CAD enclosure) 3D printing",
      confidenceLabel: "Moderat (75%)",
      dataLimitation: "Data terbatas karena profil hardware Anda sebagian belum diverifikasi BRIN."
    }
  }
];
