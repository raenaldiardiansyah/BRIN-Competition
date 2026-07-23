"use client";

import { useEffect, useState } from "react";
import { getLocalOrgPermissions, updateOrgPermission, OrgPermission } from "@/lib/storage/org-permission-storage";
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

export function OrgPermissionsPage({ orgId }: { orgId: string }) {
  const [permissions, setPermissions] = useState<OrgPermission[]>([]);

  useEffect(() => {
    setPermissions(getLocalOrgPermissions().filter(p => p.organizationId === orgId));
  }, [orgId]);

  const handleRoleChange = (memberId: string, role: any) => {
    updateOrgPermission(orgId, memberId, role);
    setPermissions(getLocalOrgPermissions().filter(p => p.organizationId === orgId));
    triggerSimulatedNotification(
      "SYSTEM",
      "Peran Diperbarui",
      `Peran organisasi untuk ${memberId} telah diperbarui menjadi ${role}.`
    );
  };

  if (!orgId) {
    return <div>Silakan tentukan organization= di URL query.</div>;
  }

  return (
    <>
      <PageHeader
        eyebrow="Organization Settings"
        title="Pengaturan Hak Akses"
        description="Kelola anggota dan izin akses mereka di organisasi ini."
      />
      <div className="table-card">
        <div className="table-head">
          <span>Anggota</span>
          <span>Role</span>
          <span>Aksi</span>
        </div>
        {permissions.map((p, idx) => (
          <div className="table-row" key={idx}>
            <span><strong>{p.memberProfileId}</strong></span>
            <span>
              <select value={p.role} onChange={e => handleRoleChange(p.memberProfileId, e.target.value)}>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="REVIEWER">Reviewer</option>
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </span>
            <span>
               <button className="button ghost" style={{color: "var(--danger)"}}>Remove</button>
            </span>
          </div>
        ))}
        {permissions.length === 0 && <div className="table-row">Belum ada pengaturan permission lokal.</div>}
      </div>
      <div className="inline-state" style={{ marginTop: "24px" }}>
        <strong>Mode Simulasi:</strong> Anda sedang melihat simulasi manajemen permission. Perubahan hanya tersimpan di browser secara lokal.
      </div>
    </>
  );
}
