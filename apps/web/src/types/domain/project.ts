import { ActionConfig } from './action';

export type ProjectVisibility =
  | "PUBLIC"
  | "LIMITED_PREVIEW"
  | "PRIVATE"
  | "ORGANIZATION_ONLY";

export type ProjectLifecycle =
  | "DRAFT"
  | "ACTIVE"
  | "PROTOTYPE"
  | "PILOT"
  | "COMPLETED"
  | "ARCHIVED";

export type ProjectReadiness =
  | "IDEA"
  | "CONCEPT"
  | "PROTOTYPE"
  | "PILOT_READY"
  | "DEPLOYMENT_READY";

export type CollaborationNeedStatus =
  | "OPEN"
  | "PAUSED"
  | "FILLED"
  | "CLOSED";

export interface EvidenceSummary {
  total: number;
  verified: number;
  pending: number;
  unavailable: number;
  lastUpdatedAt?: string;
}

export interface CollaborationNeed {
  id: string;
  title: string;
  role: string;
  experienceLevel?: string;
  commitment?: string;
  deadline?: string;
  status: CollaborationNeedStatus;
}

export type ProjectPreviewField =
  | "problem"
  | "readiness"
  | "evidence"
  | "contributors"
  | "collaborationNeeds"
  | "documents"
  | "contact";

export interface ProjectPreviewPolicy {
  visibility: ProjectVisibility;
  visibleFields: ProjectPreviewField[];
  hiddenFields: ProjectPreviewField[];
  restrictionReason?: string;
  authenticationAction?: ActionConfig;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  problem: string;
  organizationId: string;
  lifecycle: ProjectLifecycle;
  readiness: ProjectReadiness;
  readinessSource: string;
  visibility: ProjectVisibility;
  previewPolicy?: ProjectPreviewPolicy;
  location?: string;
  mode?: string;
  commitment?: string;
  deadline?: string;
  evidenceSummary: EvidenceSummary;
  collaborationNeeds: CollaborationNeed[];
  nextAction?: ActionConfig;
}
