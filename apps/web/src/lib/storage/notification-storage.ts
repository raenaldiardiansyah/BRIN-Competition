export interface Notification {
  id: string;
  type: "ACTION_REQUIRED" | "UPDATE" | "RECOMMENDATION" | "SYSTEM";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionLink?: string;
}

const STORAGE_KEY = "tautin:v1:notifications";

export function getLocalNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local notifications", e);
    return [];
  }
}

export function saveLocalNotifications(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function createNotification(notif: Omit<Notification, "id" | "read" | "timestamp">): Notification {
  const newNotif: Notification = {
    ...notif,
    id: `notif-local-${Date.now()}`,
    read: false,
    timestamp: new Date().toISOString()
  };
  const local = getLocalNotifications();
  saveLocalNotifications([newNotif, ...local]);
  return newNotif;
}

export function markNotificationAsRead(id: string) {
  const local = getLocalNotifications();
  const index = local.findIndex(n => n.id === id);
  if (index >= 0) {
    local[index].read = true;
    saveLocalNotifications(local);
  }
}

export function triggerSimulatedNotification(type: Notification["type"], title: string, message: string, link?: string) {
  createNotification({ type, title, message, actionLink: link });
}
