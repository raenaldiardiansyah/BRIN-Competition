"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Contribution, ContributionConfirmationStatus, ContributionDisputeStatus } from "@/types/domain/contribution";
import { Evidence, EvidenceReviewStatus, EvidenceVisibility } from "@/types/domain/evidence";
import { 
  getContributionsByProject, 
  getContributionById, 
  createContribution, 
  updateContribution 
} from "@/lib/storage/contribution-storage";
import { 
  createEvidence,
  getCombinedEvidence
} from "@/lib/storage/evidence-storage";
import { BackButton } from "@/components/ui/BackButton";
import { getProjectById } from "@/lib/storage/project-storage";
import { dummyProfiles } from "@/dummy/registry/profiles";

// Inline UI components mirroring prototype-app
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

export function ProjectContributionsPage({ projectId }: { projectId: string }) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const project = getProjectById(projectId);

  useEffect(() => {
    if (projectId) {
      setContributions(getContributionsByProject(projectId));
      setEvidenceList(getCombinedEvidence().filter(e => 
        // Need to find evidence linked to these contributions, since the evidence itself in our dummy data might not have projectId directly if we strictly follow the type (it has it in dummy, but let's check contribution linkages)
        getContributionsByProject(projectId).some(c => c.evidenceIds?.includes(e.id))
      ));
    }
  }, [projectId]);

  if (!project) return <div>Project not found</div>;

  const handleAction = (id: string, action: string) => {
    let update: Partial<Contribution> = {};
    if (action === "CONFIRM") update = { confirmationStatus: "CONFIRMED" };
    if (action === "DISPUTE") update = { confirmationStatus: "DISPUTED", disputeStatus: "OPEN" };
    if (action === "REQUEST_CORRECTION") update = { confirmationStatus: "PENDING_CONFIRMATION" }; // map to pending
    if (action === "WITHDRAW") update = { confirmationStatus: "REVOKED" }; // mapping withdrawn
    
    updateContribution(id, update);
    setContributions(getContributionsByProject(projectId)); // refresh
  };

  return (
    <>
      <div className="breadcrumbs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <BackButton fallbackHref={`/projects/detail?project=${projectId}`} label="Kembali ke detail proyek" />
      </div>
      <PageHeader
        eyebrow="Project Contributions"
        title="Kelola Kontribusi"
        description="Keanggotaan proyek tidak otomatis berarti kontribusi terverifikasi."
        actions={<ActionLink href={`/projects/contributions/edit?project=${projectId}`} variant="primary">Add Contribution</ActionLink>}
      />
      <div className="table-card">
        <div className="table-head"><span>Kontributor</span><span>Peran & hasil</span><span>Evidence</span><span>Status</span><span>Aksi</span></div>
        {contributions.map((c) => {
          const profile = dummyProfiles.find((p) => p.id === c.profileId) || { displayName: "Local Profile" };
          const linkedEvidence = c.evidenceIds
            ?.map((id) => evidenceList.find((e) => e.id === id) || getCombinedEvidence().find(e=>e.id===id))
            .filter(Boolean);
            
          return (
            <div className="table-row" key={c.id}>
              <span><strong>{profile?.displayName}</strong><small>{c.period?.start ?? "2025-2026"}</small></span>
              <span>{c.role}<small>{c.output}</small></span>
              <span>{linkedEvidence?.length ? linkedEvidence.map((e) => (e as any).title || e?.type).join(", ") : "None"}</span>
              <span><Badge tone={c.confirmationStatus === "CONFIRMED" ? "success" : "warning"}>{c.confirmationStatus}</Badge></span>
              <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {c.confirmationStatus !== "CONFIRMED" && (
                  <button className="button secondary" onClick={() => handleAction(c.id, "CONFIRM")}>Confirm</button>
                )}
                {c.confirmationStatus !== "DISPUTED" && (
                  <button className="button secondary" onClick={() => handleAction(c.id, "DISPUTE")}>Dispute</button>
                )}
                {c.confirmationStatus !== "REVOKED" && (
                  <button className="button ghost" style={{color: 'red'}} onClick={() => handleAction(c.id, "WITHDRAW")}>Withdraw</button>
                )}
                <ActionLink href={`/projects/contributions/edit?project=${projectId}&contribution=${c.id}`}>Edit</ActionLink>
              </span>
            </div>
          );
        })}
        {contributions.length === 0 && <div className="table-row">Belum ada kontribusi.</div>}
      </div>
    </>
  );
}

export function ContributionEditorPage({ projectId, contributionId }: { projectId: string, contributionId?: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [contribution, setContribution] = useState<Partial<Contribution>>({
    projectId,
    profileId: dummyProfiles[0].id, // dummy for current user
    role: "",
    responsibility: "",
    output: "",
    period: { start: new Date().getFullYear().toString() },
    confirmationStatus: "CLAIMED",
    evidenceIds: []
  });
  const [localFiles, setLocalFiles] = useState<{name: string, size: number, type: string, id: string}[]>([]);

  useEffect(() => {
    if (contributionId) {
      const existing = getContributionById(contributionId);
      if (existing) {
        setContribution(existing);
        const evList = existing.evidenceIds.map(id => getCombinedEvidence().find(e=>e.id === id)).filter(Boolean);
        // We simulate that the linked evidence is already "parsed files" for UI
        setLocalFiles(evList.map((e: any) => ({ name: e.title || e.source, size: 1024, type: e.type, id: e.id })));
      }
    }
  }, [contributionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Local metadata parsing ONLY. NO SERVER UPLOAD.
      const newEv = createEvidence({
        type: file.type || "application/octet-stream",
        source: file.name,
        sourceStatus: "AVAILABLE",
        visibility: "PROJECT_MEMBERS",
        ownership: "self",
        reviewStatus: "UNREVIEWED"
      });
      // In a real app we'd add title to Evidence type, we'll patch it locally 
      (newEv as any).title = file.name;
      
      setLocalFiles([...localFiles, { name: file.name, size: file.size, type: file.type, id: newEv.id }]);
      setContribution(prev => ({ ...prev, evidenceIds: [...(prev.evidenceIds || []), newEv.id] }));
    }
  };

  const handleSave = () => {
    if (!contribution.role || !contribution.output) {
      alert("Role dan Output wajib diisi.");
      return;
    }
    if (contributionId) {
      updateContribution(contributionId, contribution);
    } else {
      createContribution(contribution as Omit<Contribution, "id">);
    }
    router.push(`/projects/contributions?project=${projectId}`);
  };

  return (
    <>
      <div className="breadcrumbs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <BackButton fallbackHref={`/projects/contributions?project=${projectId}`} label="Kembali ke kontribusi" />
      </div>
      <PageHeader
        eyebrow="Contribution"
        title={contributionId ? "Edit Contribution" : "Claim Contribution"}
        actions={<button className="button primary pl-action-primary" onClick={handleSave}>Simpan</button>}
      />
      <div className="content-with-rail">
        <section className="wire-box">
          <label>Peran
            <input value={contribution.role} onChange={e => setContribution({...contribution, role: e.target.value})} placeholder="Contoh: Lead Researcher" />
          </label>
          <label>Tanggung Jawab
            <textarea value={contribution.responsibility} onChange={e => setContribution({...contribution, responsibility: e.target.value})} placeholder="Deskripsi tugas..." rows={3} />
          </label>
          <label>Hasil (Output)
            <input value={contribution.output} onChange={e => setContribution({...contribution, output: e.target.value})} placeholder="Contoh: Laporan Analisis" />
          </label>
          
          <hr style={{margin: "24px 0"}} />
          <h3>Evidence (Metadata Lokal)</h3>
          <p className="microcopy">Hanya membaca metadata file (nama, ukuran, tipe). File tidak diunggah ke server.</p>
          
          <div style={{ marginBottom: "16px" }}>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
             <button className="button secondary" onClick={() => fileInputRef.current?.click()}>+ Tambah Evidence File</button>
          </div>
          
          {localFiles.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {localFiles.map(f => (
                <li key={f.id} style={{ padding: "8px", border: "1px solid var(--border)", borderRadius: "4px", marginBottom: "8px" }}>
                  <strong>{f.name}</strong> <span className="muted">({Math.round(f.size/1024)} KB)</span>
                  <div><Badge tone="info">{f.type || "unknown"}</Badge></div>
                </li>
              ))}
            </ul>
          )}
        </section>
        
        <aside className="side-panel">
          <label>Status
            <select value={contribution.confirmationStatus} onChange={e => setContribution({...contribution, confirmationStatus: e.target.value as ContributionConfirmationStatus})}>
              <option value="CLAIMED">Claimed (Draft)</option>
              <option value="PENDING_CONFIRMATION">Waiting Confirmation</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DISPUTED">Disputed</option>
              <option value="REVOKED">Withdrawn</option>
            </select>
          </label>
        </aside>
      </div>
    </>
  );
}
