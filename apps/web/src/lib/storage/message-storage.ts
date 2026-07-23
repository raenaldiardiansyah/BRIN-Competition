export interface Message {
  id: string;
  threadId: string; // The CollaborationRequest ID
  senderId: string;
  content: string;
  timestamp: string;
}

const STORAGE_KEY = "tautin:v1:messages";

export function getLocalMessages(): Message[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local messages", e);
    return [];
  }
}

export function saveLocalMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function getMessagesByThread(threadId: string): Message[] {
  return getLocalMessages().filter(m => m.threadId === threadId);
}

export function createMessage(threadId: string, senderId: string, content: string): Message {
  const newMsg: Message = {
    id: `msg-local-${Date.now()}`,
    threadId,
    senderId,
    content,
    timestamp: new Date().toISOString()
  };
  const local = getLocalMessages();
  saveLocalMessages([...local, newMsg]);
  return newMsg;
}
