export interface ModerationAction {
  id: string;
  targetId: string; // project or user id
  targetType: "PROJECT" | "USER" | "CONTRIBUTION";
  action: "SUSPEND" | "WARN" | "APPROVE" | "REJECT";
  reason: string;
  timestamp: string;
}

const STORAGE_KEY = "tautin:v1:moderation";

export function getLocalModerations(): ModerationAction[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse local moderations", e);
    }
  }
  return [];
}

export function saveLocalModerations(actions: ModerationAction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

export function createModerationAction(action: Omit<ModerationAction, "id" | "timestamp">) {
  const newAction: ModerationAction = {
    ...action,
    id: `mod-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  const local = getLocalModerations();
  saveLocalModerations([newAction, ...local]);
  return newAction;
}
