"use client";

import { useEffect, useState, useRef } from "react";
import { getMessagesByThread, createMessage, Message } from "@/lib/storage/message-storage";
import { getCollaborationById } from "@/lib/storage/collaboration-storage";
import { getProjectById, getCombinedProjects } from "@/lib/storage/project-storage";
import { dummyProfiles } from "@/dummy/registry/profiles";

function NativeLink({ href, children, className, ...props }: any) {
  return <a href={href} className={className} {...props}>{children}</a>;
}
function PageHeader({ eyebrow, title, description, actions }: any) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="lead">{description}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}

export function MessagesPage({ threadId }: { threadId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const request = threadId ? getCollaborationById(threadId) : undefined;
  // If threadId is provided but not found, or not ACCEPTED, show empty state
  const isAccepted = request && request.status === "ACCEPTED";
  
  const project = request ? getCombinedProjects().find(p => p.id === request.projectId) : undefined;
  
  useEffect(() => {
    if (isAccepted && threadId) {
      setMessages(getMessagesByThread(threadId));
    }
  }, [threadId, isAccepted]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !threadId) return;
    createMessage(threadId, dummyProfiles[0].id, input.trim());
    setInput("");
    setMessages(getMessagesByThread(threadId));
  };

  if (threadId && (!request || !isAccepted)) {
    return (
      <div className="simulated-state empty">
        <div className="state-icon">!</div>
        <h2>Pesan tidak tersedia</h2>
        <p>Anda hanya dapat mengirim pesan untuk permintaan kolaborasi yang telah ada dan diterima.</p>
        <NativeLink className="button primary" href="/collaboration/requests">Kembali</NativeLink>
      </div>
    );
  }

  if (!threadId || !request) {
    return (
      <div className="simulated-state empty">
        <div className="state-icon">💬</div>
        <h2>Inbox Kosong</h2>
        <p>Pilih thread pesan dari Collaboration Center.</p>
        <NativeLink className="button primary" href="/collaboration/requests">Buka Collaboration Center</NativeLink>
      </div>
    );
  }

  return (
    <>
      <div className="breadcrumbs">
        <NativeLink href="/collaboration/requests">Collaboration</NativeLink><span>/</span><span>Messages</span>
      </div>
      <PageHeader
        eyebrow={`Project: ${project?.title || request.projectId}`}
        title={`Thread: ${request.role}`}
        description="Amankan komunikasi dalam konteks proyek ini."
      />
      <div className="chat-interface" style={{ border: "1px solid var(--border)", borderRadius: "12px", display: "flex", flexDirection: "column", height: "60vh", background: "var(--surface)" }}>
        <div className="chat-history" style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ textAlign: "center", color: "var(--muted)" }}>
            <small>Permintaan kolaborasi diterima pada {new Date(request.createdAt).toLocaleDateString()}</small>
            <br />
            <small><strong>Pesan awal:</strong> {request.message}</small>
          </div>
          
          {messages.map(msg => {
            const isMe = msg.senderId === dummyProfiles[0].id;
            return (
              <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                <div style={{ background: isMe ? "var(--primary)" : "var(--surface-sunken)", color: isMe ? "var(--on-primary)" : "var(--text)", padding: "12px 16px", borderRadius: "16px", borderBottomRightRadius: isMe ? "4px" : "16px", borderBottomLeftRadius: !isMe ? "4px" : "16px" }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <p className="muted" style={{textAlign: "center", marginTop: "auto"}}>Belum ada pesan baru.</p>}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSend} style={{ padding: "16px", borderTop: "1px solid var(--border)", display: "flex", gap: "12px" }}>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Tulis pesan..." 
            style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid var(--border)" }}
          />
          <button type="submit" className="button primary" disabled={!input.trim()}>Kirim</button>
        </form>
      </div>
    </>
  );
}
