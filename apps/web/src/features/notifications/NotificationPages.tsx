"use client";

import { useEffect, useState } from "react";
import { getLocalNotifications, markNotificationAsRead, Notification } from "@/lib/storage/notification-storage";
import { useRouter } from "next/navigation";

function NativeLink({ href, children, className, ...props }: any) {
  return <a href={href} className={className} {...props}>{children}</a>;
}
function ActionLink({ href, children, variant = "secondary" }: any) {
  return <NativeLink className={`button ${variant}`} href={href}>{children}</NativeLink>;
}
function Badge({ children, tone = "neutral" }: any) {
  return <span className={`badge ${tone}`}>{children}</span>;
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

export function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("All");
  
  useEffect(() => {
    setNotifications(getLocalNotifications());
  }, []);

  const handleRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getLocalNotifications());
  };

  const handleAction = (id: string, link: string) => {
    handleRead(id);
    router.push(link);
  };

  const filtered = filter === "All" ? notifications : notifications.filter(n => {
    if (filter === "Action required") return n.type === "ACTION_REQUIRED";
    if (filter === "Updates") return n.type === "UPDATE";
    if (filter === "Recommendations") return n.type === "RECOMMENDATION";
    if (filter === "System") return n.type === "SYSTEM";
    return true;
  });

  return (
    <>
      <PageHeader 
        eyebrow="Notification Center" 
        title="Notifikasi berdasarkan prioritas" 
        description="Security dan action required tidak bercampur dengan rekomendasi." 
      />
      <div className="filter-bar">
        {["All", "Action required", "Updates", "Recommendations", "System"].map(f => (
          <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="notification-list">
        {filtered.map(notif => (
          <article className={`notification ${notif.read ? "read" : "unread"}`} key={notif.id} style={{ opacity: notif.read ? 0.6 : 1 }}>
            <span className={`priority-dot ${notif.read ? "quiet" : ""}`} />
            <div>
              <Badge tone={notif.type === "ACTION_REQUIRED" ? "warning" : "neutral"}>
                {notif.type.replace("_", " ")}
              </Badge>
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
              <small className="muted">{new Date(notif.timestamp).toLocaleString()}</small>
            </div>
            <div className="button-row">
              {notif.actionLink && (
                <button className="button primary" onClick={() => handleAction(notif.id, notif.actionLink!)}>Lihat Detail</button>
              )}
              {!notif.read && (
                <button className="button secondary" onClick={() => handleRead(notif.id)}>Tandai dibaca</button>
              )}
            </div>
          </article>
        ))}
        {filtered.length === 0 && <p className="muted">Belum ada notifikasi.</p>}
      </div>
    </>
  );
}
