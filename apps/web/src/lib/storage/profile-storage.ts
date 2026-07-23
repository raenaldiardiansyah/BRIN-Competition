import { dummyProfiles } from "@/dummy/registry/profiles";

export interface Profile {
  id: string;
  displayName: string;
  bio: string;
  skills: string[];
  location: string;
  avatarUrl?: string;
}

const STORAGE_KEY = "tautin:v1:profiles";

export function getLocalProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse local profiles", e);
    }
  }
  
  // Initialize with dummy data if empty
  const initial = dummyProfiles.map(p => ({
    id: p.id,
    displayName: p.displayName,
    bio: (p as any).bio || "No bio yet",
    skills: (p as any).skills || [],
    location: (p as any).location || "Unknown",
    avatarUrl: p.avatarUrl
  }));
  saveLocalProfiles(initial);
  return initial;
}

export function saveLocalProfiles(profiles: Profile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getProfile(id: string): Profile | undefined {
  return getLocalProfiles().find(p => p.id === id);
}

export function updateProfile(id: string, updates: Partial<Profile>) {
  const local = getLocalProfiles();
  const index = local.findIndex(p => p.id === id);
  if (index >= 0) {
    local[index] = { ...local[index], ...updates };
    saveLocalProfiles(local);
  }
}
