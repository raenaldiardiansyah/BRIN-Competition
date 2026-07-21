import { dummyProjects } from "./registry/projects";
import { dummyOrganizations } from "./registry/organizations";

function projectSearchProjection(project: (typeof dummyProjects)[number]): SearchItem {
  const organization = dummyOrganizations.find((o) => o.id === project.organizationId);
  return {
    id: `project-${project.slug}`,
    slug: project.slug,
    scope: "projects",
    title: project.title,
    owner: organization?.displayName ?? "Unknown",
    summary: project.problem,
    field: "Environmental Data",
    location: project.location ?? "",
    status: project.lifecycle,
    readiness: project.readiness,
    verification: `Status ${project.readinessSource}`,
    evidence: [`${project.evidenceSummary.total} sumber tersedia`],
    reasons: ["Masalah dan teknologi relevan", "Evidence publik tersedia"],
    gaps: ["Membutuhkan validasi di lokasi kedua"],
    href: `/projects/${project.slug}`,
  };
}

const aquaLoopProject = dummyProjects.find((p) => p.slug === "aqua-loop")!;

export type SearchScope =
  | "projects"
  | "people"
  | "organizations"
  | "opportunities";

export type SearchItem = {
  id: string;
  slug: string;
  scope: SearchScope;
  title: string;
  owner: string;
  summary: string;
  field: string;
  location: string;
  status: string;
  readiness?: string;
  availability?: string;
  commitment?: string;
  verification: string;
  evidence: string[];
  reasons: string[];
  gaps: string[];
  href: string;
};

export const searchItems: SearchItem[] = [
  projectSearchProjection(aquaLoopProject),
  {
    id: "project-industrial-motor",
    slug: "industrial-motor-monitoring",
    scope: "projects",
    title: "Industrial Motor Predictive Monitoring",
    owner: "Nexa Research Lab",
    summary: "Deteksi dini anomali motor industri menggunakan data getaran.",
    field: "Predictive Maintenance",
    location: "Bandung",
    status: "ACTIVE",
    readiness: "PROTOTYPE",
    verification: "Readiness dilaporkan pemilik proyek",
    evidence: ["Prototype signal classifier", "Benchmark dataset"],
    reasons: ["Kebutuhan computer vision dan sensor", "Terbuka untuk pilot"],
    gaps: ["Dataset produksi belum tersedia"],
    href: "/projects/industrial-motor-monitoring",
  },
  {
    id: "project-smart-cooling",
    slug: "smart-cooling",
    scope: "projects",
    title: "Smart Cooling for Community Cold Chain",
    owner: "Agri Nexus",
    summary: "Optimasi rantai dingin hasil tani dengan sensor hemat energi.",
    field: "IoT",
    location: "Yogyakarta",
    status: "ACTIVE",
    readiness: "TESTING",
    verification: "Pengujian dikonfirmasi mitra",
    evidence: ["Hardware test log"],
    reasons: ["Mencari kolaborator embedded", "Pengujian aktif"],
    gaps: ["Belum ada data konsumsi satu musim"],
    href: "/projects/smart-cooling",
  },
  {
    id: "person-maya",
    slug: "maya-pradipta",
    scope: "people",
    title: "Maya Pradipta",
    owner: "Data Engineer",
    summary: "Data pipeline, environmental sensing, dan open research.",
    field: "Environmental Data",
    location: "Bandung",
    status: "AVAILABLE",
    availability: "AVAILABLE",
    verification: "Identitas dan 2 kontribusi dikonfirmasi",
    evidence: ["AquaLoop pipeline", "2 repository publik"],
    reasons: ["3 kebutuhan proyek cocok", "Tersedia 8 jam/minggu"],
    gaps: ["Belum memiliki evidence deployment skala produksi"],
    href: "/profiles/maya-pradipta",
  },
  {
    id: "person-nadia",
    slug: "nadia-putri",
    scope: "people",
    title: "Nadia Putri",
    owner: "Computer Vision Researcher",
    summary: "Computer vision untuk inspeksi industri dan citra termal.",
    field: "Computer Vision",
    location: "Jakarta",
    status: "AVAILABLE",
    availability: "AVAILABLE",
    verification: "Identitas terverifikasi; evidence self-reported",
    evidence: ["Thermal anomaly benchmark"],
    reasons: ["Keahlian computer vision cocok", "Pernah mengerjakan inspeksi"],
    gaps: ["Ketersediaan setelah September"],
    href: "/profiles/nadia-putri",
  },
  {
    id: "person-arya",
    slug: "arya-santoso",
    scope: "people",
    title: "Arya Santoso",
    owner: "Embedded Systems Engineer",
    summary: "Firmware, low-power sensors, dan prototyping perangkat.",
    field: "IoT",
    location: "Surabaya",
    status: "PRIVATE_AVAILABILITY",
    availability: "PRIVATE",
    verification: "1 kontribusi dikonfirmasi organisasi",
    evidence: ["Sensor calibration firmware"],
    reasons: ["Kebutuhan embedded cocok"],
    gaps: ["Availability tidak dipublikasikan"],
    href: "/profiles/arya-santoso",
  },
  {
    id: "org-nexa",
    slug: "nexa-research-lab",
    scope: "organizations",
    title: "Nexa Research Lab",
    owner: "Applied Research Organization",
    summary: "Riset terapan untuk climate technology dan industrial intelligence.",
    field: "Climate Technology",
    location: "Bandung",
    status: "VERIFIED",
    verification: "Identitas organisasi terverifikasi",
    evidence: ["4 proyek publik", "7 kolaborasi dimulai"],
    reasons: ["Bidang dan lokasi sesuai", "Memiliki peluang terbuka"],
    gaps: ["Beberapa outcome masih self-reported"],
    href: "/organizations/nexa-research-lab",
  },
  {
    id: "org-nusantara",
    slug: "nusantara-labs",
    scope: "organizations",
    title: "Nusantara Labs",
    owner: "Research Partner",
    summary: "Laboratorium data perkotaan dan climate resilience.",
    field: "Urban Systems",
    location: "Jakarta",
    status: "VERIFIED",
    verification: "Identitas organisasi terverifikasi",
    evidence: ["2 proyek publik"],
    reasons: ["Bidang urban systems relevan"],
    gaps: ["Tidak ada peluang aktif"],
    href: "/organizations/nusantara-labs",
  },
  {
    id: "org-arunika",
    slug: "arunika-innovation-hub",
    scope: "organizations",
    title: "Arunika Innovation Hub",
    owner: "Innovation Hub",
    summary: "Penghubung pilot industri dan komunitas teknologi.",
    field: "Innovation",
    location: "Surabaya",
    status: "PENDING_VERIFICATION",
    verification: "Verifikasi organisasi sedang diproses",
    evidence: ["1 proyek publik"],
    reasons: ["Memiliki jaringan pilot"],
    gaps: ["Identitas organisasi belum selesai diverifikasi"],
    href: "/organizations/arunika-innovation-hub",
  },
  {
    id: "opp-urban-heat",
    slug: "urban-heat-mapping",
    scope: "opportunities",
    title: "Urban Heat Mapping Research Collaboration",
    owner: "Nexa Research Lab",
    summary: "Kolaborasi pemetaan panas perkotaan untuk pilot Bandung.",
    field: "Geospatial",
    location: "Bandung",
    status: "OPEN",
    commitment: "6–8 jam/minggu",
    verification: "Peluang dikonfirmasi organisasi",
    evidence: ["Project brief", "Pilot readiness note"],
    reasons: ["Terbuka untuk data engineer", "Scope kontribusi jelas"],
    gaps: ["Honorarium masih dalam finalisasi"],
    href: "/opportunities/urban-heat-mapping",
  },
  {
    id: "opp-embedded",
    slug: "embedded-engineer-pilot",
    scope: "opportunities",
    title: "Embedded Engineer untuk Sensor Pilot",
    owner: "Agri Nexus",
    summary: "Kontribusi firmware dan kalibrasi untuk cold-chain pilot.",
    field: "IoT",
    location: "Yogyakarta",
    status: "OPEN",
    commitment: "4 minggu",
    verification: "Project owner terverifikasi",
    evidence: ["Hardware specification"],
    reasons: ["Output dan durasi jelas"],
    gaps: ["Kompensasi belum dipublikasikan"],
    href: "/opportunities/embedded-engineer-pilot",
  },
  {
    id: "opp-railway",
    slug: "railway-sensor-collaboration",
    scope: "opportunities",
    title: "Railway Sensor Collaboration",
    owner: "Nusantara Labs",
    summary: "Kolaborasi analisis sensor untuk preventive maintenance.",
    field: "Predictive Maintenance",
    location: "Jakarta",
    status: "CLOSED",
    commitment: "Selesai",
    verification: "Status ditutup oleh organisasi",
    evidence: ["Archived opportunity brief"],
    reasons: ["Tersimpan sebagai referensi bidang"],
    gaps: ["Tidak lagi menerima aplikasi"],
    href: "/opportunities/railway-sensor-collaboration",
  },
];

export const scopeConfig = {
  projects: {
    label: "Proyek",
    queryPlaceholder: "Cari proyek, teknologi, masalah, atau bidang",
    filters: ["field", "readiness"] as const,
    sorts: ["relevance", "recent", "readiness"] as const,
  },
  people: {
    label: "Orang",
    queryPlaceholder: "Cari nama, expertise, peran, atau institusi",
    filters: ["field", "availability", "location"] as const,
    sorts: ["relevance", "availability", "recent"] as const,
  },
  organizations: {
    label: "Organisasi",
    queryPlaceholder: "Cari nama, fokus, sektor, atau lokasi",
    filters: ["field", "location"] as const,
    sorts: ["relevance", "recent"] as const,
  },
  opportunities: {
    label: "Peluang",
    queryPlaceholder: "Cari peran, bidang, proyek, atau organisasi",
    filters: ["field", "location", "status"] as const,
    sorts: ["relevance", "recent", "deadline"] as const,
  },
} satisfies Record<SearchScope, {
  label: string;
  queryPlaceholder: string;
  filters: readonly string[];
  sorts: readonly string[];
}>;

export const filterLabels: Record<string, string> = {
  field: "Bidang",
  readiness: "Kesiapan",
  availability: "Ketersediaan",
  location: "Lokasi",
  status: "Status",
};

export const filterOptions: Record<string, string[]> = {
  field: ["Environmental Data", "Predictive Maintenance", "Computer Vision", "IoT", "Climate Technology", "Geospatial"],
  readiness: ["RESEARCH", "PROTOTYPE", "TESTING", "PILOT", "IMPLEMENTED"],
  availability: ["AVAILABLE", "PRIVATE"],
  location: ["Bandung", "Jakarta", "Yogyakarta", "Surabaya"],
  status: ["OPEN", "CLOSED"],
};

export const publicSlugs = {
  projects: ["aqua-loop", "industrial-motor-monitoring", "smart-cooling", "confidential-water-system"],
  profiles: ["maya-pradipta", "nadia-putri", "arya-santoso"],
  organizations: ["nexa-research-lab", "nusantara-labs", "arunika-innovation-hub"],
  opportunities: ["urban-heat-mapping", "embedded-engineer-pilot", "railway-sensor-collaboration"],
} as const;

export * as subscriptionFixtures from "./subscription-fixtures";
