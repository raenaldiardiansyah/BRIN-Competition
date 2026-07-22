import { Contribution } from "../../types/domain/contribution";

export const dummyContributions: Contribution[] = [
  {
    id: "contrib-1",
    projectId: "proj-1",
    profileId: "person-raka",
    role: "Environmental Scientist",
    responsibility: "Validasi sensor parameter air",
    output: "Laporan uji lapangan v2",
    period: { start: "2025-10-01", end: "2026-03-01" },
    confirmationStatus: "CONFIRMED",
    evidenceIds: ["ev-3"]
  },
  {
    id: "contrib-2",
    projectId: "proj-1",
    profileId: "person-maya",
    role: "Data Engineer",
    responsibility: "Data pipeline & ingestion",
    output: "Repository sensor ingestion",
    period: { start: "2026-01-15" },
    confirmationStatus: "CONFIRMED",
    evidenceIds: ["ev-1"]
  }
];
