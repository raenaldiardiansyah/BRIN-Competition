import { ExplainableMatch } from "../../types/domain/matching";

export interface MatchRecord extends ExplainableMatch {
  profileId: string;
  projectId: string;
  score?: number;
  relevantSkills?: string[];
  supportingProjectIds?: string[];
  supportingEvidenceIds?: string[];
}

export const dummyMatches: MatchRecord[] = [
  {
    id: "aqua-maya",
    profileId: "person-maya",
    projectId: "proj-1",
    score: 68,
    relevantSkills: ["Data Pipeline", "Environmental Data", "Open Research"],
    supportingProjectIds: [],
    supportingEvidenceIds: ["ev-1", "ev-2"],
    core: {
      primaryReason: "Pengalaman pipeline data lingkungan yang terverifikasi",
      supportingEvidence: ["Kontribusi di repository open source", "Dataset yang dipublikasikan"],
      mainGap: "Belum memiliki evidence deployment skala produksi besar",
      dataLimitation: "Data kontribusi spesifik pada platform IoT belum ada",
      confidence: "MEDIUM",
      nextAction: {
        id: "act-collaborate",
        label: "Lanjutkan Kolaborasi",
        href: "/projects/aqua-loop/collaborate"
      }
    }
  }
];
