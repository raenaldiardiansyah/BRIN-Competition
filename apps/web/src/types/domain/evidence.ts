export type EvidenceSourceStatus =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "BROKEN"
  | "STALE";

export type EvidenceReviewStatus =
  | "UNREVIEWED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export type EvidenceVisibility =
  | "PUBLIC"
  | "LIMITED_PREVIEW"
  | "PROJECT_MEMBERS"
  | "ORGANIZATION_ONLY"
  | "PRIVATE";

export interface Evidence {
  id: string;
  type: string;
  source: string;
  sourceStatus: EvidenceSourceStatus;
  visibility: EvidenceVisibility;
  ownership: string;
  reviewStatus: EvidenceReviewStatus;
  lastCheckedAt?: string;
}
