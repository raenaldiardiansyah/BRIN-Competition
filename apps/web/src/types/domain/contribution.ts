export type ContributionConfirmationStatus =
  | "CLAIMED"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "DISPUTED"
  | "REVOKED";

export type ContributionDisputeStatus =
  | "NONE"
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export interface Contribution {
  id: string;
  projectId: string;
  profileId: string;
  role: string;
  responsibility: string;
  output: string;
  outcome?: string;
  period: {
    start: string;
    end?: string;
  };
  confirmationStatus: ContributionConfirmationStatus;
  evidenceIds: string[];
  disputeStatus?: ContributionDisputeStatus;
}
