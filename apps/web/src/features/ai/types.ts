export type AIAnalysisStatus = "idle" | "loading" | "empty" | "result" | "error" | "recovery";
export type AIFeatureId = "collaboration-matching" | "innovation-profile" | "innovation-workspace" | "research-gap" | "novelty-checker" | "industry-matching" | "funding-recommendation" | "commercialization";
export type AIFeatureCategory = "matching" | "insight" | "workspace" | "strategy";
export type AIFeatureMaturity = "mvp" | "advanced-prototype";
export type AIAccessTier = "free" | "pro" | "organization";
export type AIConfidenceLevel = "low" | "medium" | "high";
export interface AIFeatureAccess { tiers: AIAccessTier[]; defaultTier: AIAccessTier; quotaLimited: boolean; }
export interface AIFeature { id: AIFeatureId; title: string; description: string; route: string; category: AIFeatureCategory; maturity: AIFeatureMaturity; access: AIFeatureAccess; icon: string; capabilityId: string; limitationSummary: string; }
export interface AIScore { label: string; value: number; max?: number; description?: string; }
export interface AIConfidence { level: AIConfidenceLevel; label: string; description: string; }
export interface AIEvidenceSource { id: string; title: string; type: string; source: string; status: "available" | "pending" | "unavailable"; note?: string; }
export interface AIReason { id: string; title: string; description: string; evidenceIds?: string[]; }
export interface AIGap { id: string; title: string; description: string; severity: "low" | "medium" | "high"; }
export interface AILimitation { id: string; title: string; description: string; accessTier?: AIAccessTier; }
export interface AINextAction { id: string; label: string; description?: string; href?: string; tone?: "primary" | "secondary"; }
export interface AIHistoryItem { id: string; featureId: AIFeatureId; title: string; summary: string; status: AIAnalysisStatus; createdAt: string; }
export interface MatchingCandidate { id: string; profileId: string; name: string; role: string; score: AIScore; confidence: AIConfidence; reasons: AIReason[]; gaps: AIGap[]; evidence: AIEvidenceSource[]; limitation: AILimitation; nextAction: AINextAction; }
export interface InnovationProfileInsight { id: string; title: string; result: string; confidence: AIConfidence; evidence: AIEvidenceSource[]; gaps: AIGap[]; limitation: AILimitation; nextAction: AINextAction; claimStatus: "draft" | "accepted" | "hidden" | "needs-evidence"; }
export interface WorkspaceRecommendation { id: string; title: string; result: string; reason: string; confidence: AIConfidence; evidence: AIEvidenceSource[]; gaps: AIGap[]; limitation: AILimitation; nextAction: AINextAction; }
export interface CopilotMessage { id: string; role: "assistant" | "user"; content: string; createdAt: string; evidenceIds?: string[]; }
