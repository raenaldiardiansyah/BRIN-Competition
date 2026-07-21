import { Project } from "../../types/domain";

export const dummyProjects: Project[] = [
  {
    id: "proj-1",
    slug: "aqua-loop",
    title: "AquaLoop",
    problem: "Monitoring kualitas dan distribusi air",
    organizationId: "org-nusantara",
    lifecycle: "ACTIVE",
    readiness: "PROTOTYPE",
    readinessSource: "Self-reported",
    visibility: "PUBLIC",
    location: "Bandung",
    mode: "Hybrid",
    commitment: "6–8 jam/minggu",
    deadline: "2026-08-31T00:00:00Z",
    evidenceSummary: {
      total: 4,
      verified: 2,
      pending: 1,
      unavailable: 1,
      lastUpdatedAt: "2026-07-15T08:00:00Z"
    },
    collaborationNeeds: [
      {
        id: "need-1",
        title: "Embedded Systems Contributor",
        role: "Embedded Systems Contributor",
        experienceLevel: "Menengah",
        commitment: "6–8 jam/minggu",
        status: "OPEN"
      }
    ],
    nextAction: {
      id: "act-join-aqua",
      label: "Lihat 1 peluang kontribusi",
      href: "/projects/aqua-loop"
    }
  },
  {
    id: "proj-2",
    slug: "urban-heat-mapping",
    title: "Urban Heat Mapping untuk Kota Tangguh",
    problem: "Kurangnya peta panas kota yang akurat untuk perencanaan tata ruang tahan krisis iklim.",
    organizationId: "org-2",
    lifecycle: "PROTOTYPE",
    readiness: "PROTOTYPE",
    readinessSource: "Model awal divalidasi dengan data sekunder",
    visibility: "LIMITED_PREVIEW",
    previewPolicy: {
      visibility: "LIMITED_PREVIEW",
      visibleFields: ["problem", "readiness", "collaborationNeeds"],
      hiddenFields: ["evidence", "documents", "contributors"],
      restrictionReason: "Sebagian data tunduk pada NDA kota.",
      authenticationAction: {
        id: "auth-view",
        label: "Masuk untuk detail",
        href: "/login?returnTo=/projects/urban-heat-mapping"
      }
    },
    location: "Jakarta",
    mode: "REMOTE",
    evidenceSummary: {
      total: 3,
      verified: 1,
      pending: 2,
      unavailable: 0
    },
    collaborationNeeds: [
      {
        id: "need-3",
        title: "Pemrosesan Citra Satelit",
        role: "GIS Specialist",
        status: "OPEN"
      }
    ],
    nextAction: {
      id: "act-req",
      label: "Minta akses penuh",
      href: "/projects/urban-heat-mapping/request-access"
    }
  },
  {
    id: "proj-3",
    slug: "rantai-dingin-sensor",
    title: "Rantai Dingin Hasil Tani Berbasis Sensor",
    problem: "Kerusakan hasil tani pasca-panen mencapai 30% akibat fluktuasi suhu logistik.",
    organizationId: "org-3",
    lifecycle: "ACTIVE",
    readiness: "CONCEPT",
    readinessSource: "Validasi masalah dengan 50 petani",
    visibility: "PUBLIC",
    evidenceSummary: {
      total: 2,
      verified: 2,
      pending: 0,
      unavailable: 0
    },
    collaborationNeeds: [
      {
        id: "need-4",
        title: "Desain Sistem IoT Murah",
        role: "IoT Architect",
        status: "OPEN"
      }
    ]
  }
];
