"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CollaborationRequest, getLocalCollaborations, createCollaboration, updateCollaboration } from "@/lib/storage/collaboration-storage";
import { triggerSimulatedNotification } from "@/lib/storage/notification-storage";
import { getCombinedProjects } from "@/lib/storage/project-storage";
import { dummyProfiles } from "@/dummy/registry/profiles";
import { BackButton } from "@/components/ui/BackButton";

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

export function CollaborationRequestsPage() {
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  
  useEffect(() => {
    setRequests(getLocalCollaborations());
  }, []);

  const handleAction = (id: string, status: "ACCEPTED" | "REJECTED") => {
    updateCollaboration(id, { status });
    setRequests(getLocalCollaborations());
    triggerSimulatedNotification(
      "UPDATE",
      `Permintaan Kolaborasi ${status === "ACCEPTED" ? "Diterima" : "Ditolak"}`,
      `Permintaan Anda telah direspons.`
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Collaboration Center"
        title="Permintaan dan tindak lanjut"
        description="Undangan, aplikasi, offer, dan request information—bukan inbox promosi."
        actions={<ActionLink href="/collaboration/new" variant="primary">New Request</ActionLink>}
      />
      <div className="filter-bar">
        <button className="active">All Requests ({requests.length})</button>
      </div>
      <div className="request-list">
        {requests.map(req => {
          const project = getCombinedProjects().find(p => p.id === req.projectId);
          const isSender = req.senderProfileId === dummyProfiles[0].id; 
          // For prototype, assume dummyProfiles[0] is current user
          
          return (
            <article className="request-card" key={req.id}>
              <div>
                <Badge tone={req.status === "PENDING" ? "warning" : req.status === "ACCEPTED" ? "success" : "neutral"}>
                  {req.status}
                </Badge>
                <h3>{req.type} - {req.role}</h3>
                <p>Proyek: {project?.title || req.projectId}</p>
                <p className="microcopy">Pesan: {req.message}</p>
              </div>
              <div className="button-row">
                {!isSender && req.status === "PENDING" && (
                  <>
                    <button className="button primary" onClick={() => handleAction(req.id, "ACCEPTED")}>Terima</button>
                    <button className="button ghost" onClick={() => handleAction(req.id, "REJECTED")}>Tolak</button>
                  </>
                )}
                {req.status === "ACCEPTED" && (
                  <ActionLink href={`/messages?thread=${req.id}`}>Buka Pesan</ActionLink>
                )}
              </div>
            </article>
          );
        })}
        {requests.length === 0 && <p className="muted">Belum ada permintaan kolaborasi lokal.</p>}
      </div>
    </>
  );
}

export function CollaborationFormPage({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: projectId || "",
    role: "",
    message: "",
    commitment: "",
    type: "INVITATION" as "INVITATION" | "APPLICATION" | "RFI"
  });

  useEffect(() => {
    setProjects(getCombinedProjects());
  }, []);

  const handleSend = () => {
    if (!formData.projectId || !formData.role) {
      alert("Proyek dan Peran wajib diisi");
      return;
    }
    createCollaboration({
      projectId: formData.projectId,
      senderProfileId: dummyProfiles[0].id,
      role: formData.role,
      message: formData.message,
      commitment: formData.commitment,
      type: formData.type
    });
    triggerSimulatedNotification(
      "ACTION_REQUIRED",
      "Permintaan Kolaborasi Baru",
      "Ada pihak yang mengirimkan permintaan kolaborasi kepada Anda.",
      "/collaboration/requests"
    );
    router.push("/collaboration/requests");
  };

  return (
    <>
      <div className="breadcrumbs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <BackButton fallbackHref="/collaboration/requests" label="Kembali ke permintaan" />
      </div>
      <PageHeader
        eyebrow="Structured collaboration"
        title="Buat Permintaan Baru"
        description="Konteks wajib membantu mencegah spam dan permintaan tanpa tujuan."
      />
      <div className="form-layout">
        <section className="wire-box" title="Detail undangan">
          <label>Jenis permintaan
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
              <option value="INVITATION">Project invitation</option>
              <option value="RFI">Request for information</option>
              <option value="APPLICATION">Collaboration offer</option>
            </select>
          </label>
          <label>Proyek
            <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
              <option value="">Pilih Proyek...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </label>
          <label>Peran / kebutuhan
            <input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Contoh: Data Engineer" />
          </label>
          <label>Pesan / Alasan
            <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Alasan mengundang atau melamar..." />
          </label>
          <label>Komitmen
            <input value={formData.commitment} onChange={e => setFormData({...formData, commitment: e.target.value})} placeholder="Contoh: 8-10 jam/minggu" />
          </label>
          <button className="button primary pl-action-primary" onClick={handleSend}>Kirim Permintaan</button>
        </section>
      </div>
    </>
  );
}
