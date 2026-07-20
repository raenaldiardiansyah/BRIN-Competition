import { ActionConfig } from './action';

export type ConfidenceLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type AnalysisAccess = "CORE" | "ADVANCED";

export interface CoreMatchExplanation {
  primaryReason: string;
  supportingEvidence: string[];
  mainGap?: string;
  dataLimitation?: string;
  confidence: ConfidenceLevel;
  nextAction?: ActionConfig;
}

export interface AdvancedMatchAnalysis {
  evidenceBreakdown: string[];
  detailedGaps: string[];
  historicalChanges?: string[];
  comparisons?: string[];
  weightedRequirements?: string[];
}

export interface ExplainableMatch {
  id: string;
  core: CoreMatchExplanation;
  advanced?: AdvancedMatchAnalysis;
}

export interface MatchAccessPolicy {
  availableLevels: AnalysisAccess[];
  requiredLevelForAdvanced: AnalysisAccess;
}
