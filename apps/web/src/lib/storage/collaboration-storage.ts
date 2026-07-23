import { CollaborationNeed } from "@/types/domain/project";

export interface CollaborationRequest {
  id: string;
  projectId: string;
  senderProfileId: string;
  receiverProfileId?: string; // Optional if it's an open call
  role: string;
  message: string;
  commitment: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
  type: "INVITATION" | "APPLICATION" | "RFI";
  createdAt: string;
}

const STORAGE_KEY = "tautin:v1:collaborations";

export function getLocalCollaborations(): CollaborationRequest[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local collaborations", e);
    return [];
  }
}

export function saveLocalCollaborations(reqs: CollaborationRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
}

export function getCollaborationsByProfile(profileId: string): CollaborationRequest[] {
  const local = getLocalCollaborations();
  return local.filter(r => r.senderProfileId === profileId || r.receiverProfileId === profileId);
}

export function getCollaborationById(id: string): CollaborationRequest | undefined {
  return getLocalCollaborations().find(r => r.id === id);
}

export function createCollaboration(req: Omit<CollaborationRequest, "id" | "createdAt" | "status">): CollaborationRequest {
  const newReq: CollaborationRequest = {
    ...req,
    id: `collab-local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "PENDING"
  };
  const local = getLocalCollaborations();
  saveLocalCollaborations([...local, newReq]);
  return newReq;
}

export function updateCollaboration(id: string, updates: Partial<CollaborationRequest>): CollaborationRequest | undefined {
  const local = getLocalCollaborations();
  const existingIndex = local.findIndex(r => r.id === id);
  if (existingIndex === -1) return undefined;

  const existing = local[existingIndex];
  const updated: CollaborationRequest = { ...existing, ...updates };

  local[existingIndex] = updated;
  saveLocalCollaborations(local);

  return updated;
}
