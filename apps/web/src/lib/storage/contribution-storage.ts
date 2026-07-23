import { Contribution } from "@/types/domain/contribution";
import { dummyContributions } from "@/dummy/registry/contributions";

const STORAGE_KEY = "tautin:v1:contributions";

export function getLocalContributions(): Contribution[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local contributions", e);
    return [];
  }
}

export function saveLocalContributions(contributions: Contribution[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions));
}

export function getCombinedContributions(): Contribution[] {
  const local = getLocalContributions();
  const localIds = new Set(local.map(c => c.id));
  const base = dummyContributions.filter((c: any) => !localIds.has(c.id)) as Contribution[];
  return [...base, ...local];
}

export function getContributionsByProject(projectId: string): Contribution[] {
  return getCombinedContributions().filter(c => c.projectId === projectId);
}

export function getContributionById(id: string): Contribution | undefined {
  return getCombinedContributions().find((c) => c.id === id);
}

export function createContribution(contribution: Omit<Contribution, "id">): Contribution {
  const newId = `contrib-local-${Date.now()}`;
  const newContribution: Contribution = { ...contribution, id: newId };
  const local = getLocalContributions();
  saveLocalContributions([...local, newContribution]);
  return newContribution;
}

export function updateContribution(id: string, updates: Partial<Contribution>): Contribution | undefined {
  const allContributions = getCombinedContributions();
  const existingIndex = allContributions.findIndex(c => c.id === id);
  if (existingIndex === -1) return undefined;

  const existing = allContributions[existingIndex];
  const updated: Contribution = { ...existing, ...updates };

  const local = getLocalContributions();
  const localIndex = local.findIndex(c => c.id === id);
  if (localIndex >= 0) {
    local[localIndex] = updated;
  } else {
    local.push(updated);
  }
  saveLocalContributions(local);

  return updated;
}
