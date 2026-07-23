"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile, Profile } from "@/lib/storage/profile-storage";
import { triggerSimulatedNotification } from "@/lib/storage/notification-storage";
import { BackButton } from "@/components/ui/BackButton";

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

// In a real app this comes from auth context. 
// For prototype we assume the first active user is person-maya (the first dummy profile).
const ACTIVE_USER_ID = "person-maya";

export function ProfileEditorPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getProfile(ACTIVE_USER_ID);
    if (current) {
      setProfile(current);
      setFormData(current);
    }
  }, []);

  const handleSave = () => {
    if (profile) {
      updateProfile(profile.id, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      triggerSimulatedNotification(
        "SYSTEM",
        "Profil Diperbarui",
        "Perubahan pada profil publik Anda telah disimpan."
      );
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <>
      <div className="breadcrumbs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <BackButton fallbackHref="/me" label="Kembali ke profil" />
      </div>
      <PageHeader
        eyebrow="Settings"
        title="Edit Profil"
        description="Informasi ini akan terlihat secara publik (tergantung pengaturan privasi)."
        actions={<button className="button primary pl-action-primary" onClick={handleSave}>{saved ? "Disimpan ✓" : "Simpan Perubahan"}</button>}
      />
      <div className="form-layout">
        <section className="wire-box">
          <label>Nama Tampilan
            <input 
              value={formData.displayName || ""} 
              onChange={e => setFormData({...formData, displayName: e.target.value})} 
            />
          </label>
          <label>Bio Singkat
            <textarea 
              rows={3}
              value={formData.bio || ""} 
              onChange={e => setFormData({...formData, bio: e.target.value})} 
            />
          </label>
          <label>Lokasi
            <input 
              value={formData.location || ""} 
              onChange={e => setFormData({...formData, location: e.target.value})} 
            />
          </label>
          <label>Keahlian (Pisahkan dengan koma)
            <input 
              value={(formData.skills || []).join(", ")} 
              onChange={e => setFormData({...formData, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} 
            />
          </label>
        </section>
        <aside className="side-panel">
          <h3>Pratinjau Profil</h3>
          <div style={{ padding: "16px", background: "var(--surface-sunken)", borderRadius: "8px" }}>
            <strong>{formData.displayName || "Tanpa Nama"}</strong>
            <p className="muted">{formData.location}</p>
            <p style={{ marginTop: "12px", fontSize: "14px" }}>{formData.bio}</p>
            <div style={{ marginTop: "12px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {(formData.skills || []).map((s: string) => (
                <span key={s} className="badge neutral">{s}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
