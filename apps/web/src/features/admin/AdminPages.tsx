"use client";

import { useEffect, useState } from "react";
import { getLocalModerations, createModerationAction, ModerationAction } from "@/lib/storage/moderation-storage";
import { triggerSimulatedNotification } from "@/lib/storage/notification-storage";

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

function Badge({ children, tone = "neutral" }: any) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function AdminModerationPage() {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [formData, setFormData] = useState({
    targetId: "",
    targetType: "PROJECT" as ModerationAction["targetType"],
    action: "SUSPEND" as ModerationAction["action"],
    reason: ""
  });

  useEffect(() => {
    setActions(getLocalModerations());
  }, []);

  const handleAction = () => {
    if (!formData.targetId || !formData.reason) {
      alert("Target ID dan Alasan wajib diisi.");
      return;
    }
    createModerationAction(formData);
    setActions(getLocalModerations());
    triggerSimulatedNotification(
      "SYSTEM",
      "Tindakan Moderasi (Simulasi)",
      `Tindakan ${formData.action} terhadap ${formData.targetType} ${formData.targetId} telah dicatat lokal.`
    );
    setFormData({...formData, targetId: "", reason: ""});
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin Control"
        title="Moderasi Platform (Simulasi)"
        description="Kelola laporan pelanggaran, blokir proyek, atau suspend pengguna. Hanya tersedia untuk peran Admin sistem."
        actions={<Badge tone="warning">Prototype Simulation</Badge>}
      />
      <div className="form-layout">
        <section className="wire-box">
          <h3>Terapkan Tindakan Baru</h3>
          <label>Tipe Target
            <select value={formData.targetType} onChange={e => setFormData({...formData, targetType: e.target.value as any})}>
              <option value="PROJECT">Proyek</option>
              <option value="USER">Pengguna</option>
              <option value="CONTRIBUTION">Kontribusi</option>
            </select>
          </label>
          <label>ID Target (Simulasi)
            <input value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})} placeholder="Misal: proj-1 atau person-maya" />
          </label>
          <label>Tindakan
            <select value={formData.action} onChange={e => setFormData({...formData, action: e.target.value as any})}>
              <option value="SUSPEND">Simulasikan penangguhan</option>
              <option value="WARN">Simulasikan peringatan</option>
              <option value="APPROVE">Simulasikan persetujuan</option>
              <option value="REJECT">Simulasikan penolakan</option>
            </select>
          </label>
          <label>Alasan Publik / Internal
            <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Alasan tindakan ini dilakukan..." rows={3} />
          </label>
          <button className="button primary" onClick={handleAction}>Terapkan Moderasi</button>
        </section>
        
        <aside className="side-panel">
          <h3>Log Moderasi (Lokal)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {actions.map(a => (
              <div key={a.id} style={{ padding: "12px", background: "var(--surface-sunken)", borderRadius: "8px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <Badge tone={a.action === "SUSPEND" || a.action === "REJECT" ? "danger" : a.action === "WARN" ? "warning" : "success"}>{a.action}</Badge>
                  <small className="muted">{new Date(a.timestamp).toLocaleDateString()}</small>
                </div>
                <strong>{a.targetType}: {a.targetId}</strong>
                <p style={{ marginTop: "4px" }}>{a.reason}</p>
              </div>
            ))}
            {actions.length === 0 && <p className="muted">Belum ada tindakan moderasi tercatat.</p>}
          </div>
        </aside>
      </div>
    </>
  );
}
