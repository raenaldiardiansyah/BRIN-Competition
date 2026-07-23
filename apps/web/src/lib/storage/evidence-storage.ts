import { Evidence } from "@/types/domain/evidence";
import { dummyEvidence } from "@/dummy/registry/evidence";

const STORAGE_KEY = "tautin:v1:evidence";

export function getLocalEvidence(): Evidence[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local evidence", e);
    return [];
  }
}

export function saveLocalEvidence(evidenceList: Evidence[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(evidenceList));
}

export function getCombinedEvidence(): Evidence[] {
  const local = getLocalEvidence();
  const localIds = new Set(local.map(e => e.id));
  const base = dummyEvidence.filter((e: any) => !localIds.has(e.id)) as Evidence[];
  return [...base, ...local];
}

export function getEvidenceById(id: string): Evidence | undefined {
  return getCombinedEvidence().find((e) => e.id === id);
}

export function createEvidence(evidence: Omit<Evidence, "id">): Evidence {
  const newId = `evidence-local-${Date.now()}`;
  const newEvidence: Evidence = { ...evidence, id: newId };
  const local = getLocalEvidence();
  saveLocalEvidence([...local, newEvidence]);
  return newEvidence;
}

export function updateEvidence(id: string, updates: Partial<Evidence>): Evidence | undefined {
  const allEvidence = getCombinedEvidence();
  const existingIndex = allEvidence.findIndex(e => e.id === id);
  if (existingIndex === -1) return undefined;

  const existing = allEvidence[existingIndex];
  const updated: Evidence = { ...existing, ...updates };

  const local = getLocalEvidence();
  const localIndex = local.findIndex(e => e.id === id);
  if (localIndex >= 0) {
    local[localIndex] = updated;
  } else {
    local.push(updated);
  }
  saveLocalEvidence(local);

  return updated;
}
