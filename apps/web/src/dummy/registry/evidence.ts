import { Evidence } from "../../types/domain/evidence";

export interface EvidenceRecord extends Evidence {
  projectId: string;
  title: string;
}

export const dummyEvidence: EvidenceRecord[] = [
  {
    id: "ev-1",
    projectId: "proj-1",
    type: "CODE_REPOSITORY",
    title: "Repository sensor ingestion",
    source: "github.com/nusantara-labs/aqua-loop",
    sourceStatus: "AVAILABLE",
    visibility: "PUBLIC",
    ownership: "Nusantara Labs",
    reviewStatus: "VERIFIED",
    lastCheckedAt: "2026-07-20T10:00:00Z"
  },
  {
    id: "ev-2",
    projectId: "proj-1",
    type: "DATASET",
    title: "Field dataset v2",
    source: "data.go.id/aqua-loop-v2",
    sourceStatus: "AVAILABLE",
    visibility: "PUBLIC",
    ownership: "Maya Pradipta",
    reviewStatus: "VERIFIED",
    lastCheckedAt: "2026-07-18T10:00:00Z"
  },
  {
    id: "ev-3",
    projectId: "proj-1",
    type: "DOCUMENT",
    title: "Laporan uji lapangan",
    source: "internal.nusantara.labs/docs/192",
    sourceStatus: "AVAILABLE",
    visibility: "PROJECT_MEMBERS",
    ownership: "Raka Wibawa",
    reviewStatus: "PENDING",
    lastCheckedAt: "2026-07-21T08:00:00Z"
  },
  {
    id: "ev-4",
    projectId: "proj-1",
    type: "TECHNICAL_SPEC",
    title: "Dokumentasi spesifikasi",
    source: "Not available",
    sourceStatus: "UNAVAILABLE",
    visibility: "PRIVATE",
    ownership: "Nusantara Labs",
    reviewStatus: "UNREVIEWED"
  }
];
