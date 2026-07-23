export interface OrgPermission {
  organizationId: string;
  memberProfileId: string;
  role: "OWNER" | "ADMIN" | "REVIEWER" | "MEMBER" | "VIEWER";
}

const STORAGE_KEY = "tautin:v1:org-permissions";

export function getLocalOrgPermissions(): OrgPermission[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse local org permissions", e);
    }
  }
  
  // Initialize with a dummy owner if empty
  const initial: OrgPermission[] = [
    { organizationId: "org-nexa", memberProfileId: "person-maya", role: "OWNER" }
  ];
  saveLocalOrgPermissions(initial);
  return initial;
}

export function saveLocalOrgPermissions(perms: OrgPermission[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
}

export function updateOrgPermission(orgId: string, memberId: string, role: "OWNER" | "ADMIN" | "REVIEWER" | "MEMBER" | "VIEWER") {
  const local = getLocalOrgPermissions();
  const index = local.findIndex(p => p.organizationId === orgId && p.memberProfileId === memberId);
  if (index >= 0) {
    local[index].role = role;
  } else {
    local.push({ organizationId: orgId, memberProfileId: memberId, role });
  }
  saveLocalOrgPermissions(local);
}
