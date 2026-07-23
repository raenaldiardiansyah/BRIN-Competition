"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectLifecycle, ProjectVisibility, ProjectReadiness } from "@/types/domain/project";
import { getProjectById, createProject, updateProject, deleteProject } from "@/lib/storage/project-storage";
import { BackButton } from "@/components/ui/BackButton";
import { dummyOrganizations } from "@/dummy/registry/organizations";
import { dummyProfiles } from "@/dummy/registry/profiles";

function NativeLink({ href, children, className, ...props }: any) {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
}

function ActionLink({ href, children, variant = "secondary" }: any) {
  return (
    <NativeLink className={`button ${variant}`} href={href}>
      {children}
    </NativeLink>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "info" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function WireBox({ title, children, className = "", id }: any) {
  return (
    <section className={`wire-box ${className}`} id={id}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

function PageHeader({ eyebrow, title, description, actions }: any) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="lead">{description}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </header>
  );
}

export function ProjectEditorPage({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [isDraft, setIsDraft] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [project, setProject] = useState<Partial<Project>>({
    title: "",
    problem: "",
    lifecycle: "DRAFT",
    visibility: "PRIVATE",
    readiness: "IDEA",
    evidenceSummary: { total: 0, verified: 0, pending: 0, unavailable: 0 },
    collaborationNeeds: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const existing = getProjectById(projectId);
      if (existing) {
        setProject(existing);
        setIsDraft(existing.lifecycle === "DRAFT");
      } else {
        setError("Proyek tidak ditemukan.");
      }
    }
  }, [projectId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = (publish = false) => {
    if (publish && (!project.title || !project.problem)) {
      setError("Judul dan Masalah wajib diisi sebelum melakukan Publish.");
      return;
    }

    const payload = {
      ...project,
      lifecycle: publish ? ("ACTIVE" as ProjectLifecycle) : project.lifecycle,
      visibility: publish ? ("PUBLIC" as ProjectVisibility) : project.visibility,
    };

    if (projectId) {
      updateProject(projectId, payload);
    } else {
      const newProj = createProject(payload as Omit<Project, "id">);
      router.push(`/projects/edit?project=${newProj.id}`);
      return;
    }

    setHasUnsavedChanges(false);
    setError(null);
    if (publish) {
      router.push(`/projects/detail?project=${projectId}`);
    }
  };

  const handleArchive = () => {
    if (projectId) {
      updateProject(projectId, { lifecycle: "ARCHIVED" });
      router.push("/my-projects");
    }
  };

  if (error && !projectId) {
    return (
      <div className="simulated-state error">
        <div className="state-icon">!</div>
        <h2>{error}</h2>
        <ActionLink href="/my-projects">Kembali ke daftar proyek</ActionLink>
      </div>
    );
  }

  return (
    <>
      <div className="breadcrumbs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <BackButton fallbackHref={`/projects/detail?project=${projectId}`} label="Kembali ke detail proyek" />
      </div>
      <PageHeader
        eyebrow={projectId ? "Edit Project" : "Create Project"}
        title={project.title || "Proyek Baru"}
        description={isDraft ? "Draft lokal Anda." : "Proyek ini sedang aktif."}
        actions={
          <>
            <button className="button primary pl-action-primary" onClick={() => handleSave(true)}>
              {isDraft ? "Publish" : "Simpan Perubahan"}
            </button>
            <button className="button secondary" onClick={() => handleSave(false)}>
              Simpan Draft
            </button>
          </>
        }
      />
      {error && <div className="error-banner">{error}</div>}
      {hasUnsavedChanges && <div className="info-banner" style={{ background: "var(--surface-sunken)", padding: "12px", marginBottom: "16px", borderRadius: "8px" }}>Anda memiliki perubahan yang belum disimpan.</div>}

      <div className="content-with-rail">
        <WireBox title="Informasi Dasar">
          <label>Judul
            <input 
              value={project.title} 
              onChange={e => { setProject({...project, title: e.target.value}); setHasUnsavedChanges(true); setError(null); }} 
              placeholder="Contoh: AquaLoop — Pemantauan Kualitas Air"
            />
          </label>
          <label>Masalah yang dipecahkan
            <textarea 
              rows={4} 
              value={project.problem} 
              onChange={e => { setProject({...project, problem: e.target.value}); setHasUnsavedChanges(true); setError(null); }}
              placeholder="Jelaskan masalah spesifik yang ingin dipecahkan."
            />
          </label>
        </WireBox>
        <aside className="side-panel">
          <h3>Status & Lifecycle</h3>
          <label>Lifecycle
            <select 
              value={project.lifecycle} 
              onChange={e => { setProject({...project, lifecycle: e.target.value as ProjectLifecycle}); setHasUnsavedChanges(true); }}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PROTOTYPE">Prototype</option>
              <option value="PILOT">Pilot</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <label>Readiness
            <select 
              value={project.readiness} 
              onChange={e => { setProject({...project, readiness: e.target.value as ProjectReadiness}); setHasUnsavedChanges(true); }}
            >
              <option value="IDEA">Idea</option>
              <option value="CONCEPT">Concept</option>
              <option value="PROTOTYPE">Prototype</option>
              <option value="PILOT_READY">Pilot Ready</option>
              <option value="DEPLOYMENT_READY">Deployment Ready</option>
            </select>
          </label>
          <label>Visibility
            <select 
              value={project.visibility} 
              onChange={e => { setProject({...project, visibility: e.target.value as ProjectVisibility}); setHasUnsavedChanges(true); }}
            >
              <option value="PUBLIC">Public</option>
              <option value="LIMITED_PREVIEW">Limited Preview</option>
              <option value="PRIVATE">Private</option>
              <option value="ORGANIZATION_ONLY">Organization Only</option>
            </select>
          </label>
          {projectId && (
            <>
              <hr />
              <button className="button ghost full" onClick={handleArchive} style={{ color: "var(--danger-text, red)" }}>Archive Project</button>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  
  useEffect(() => {
    const existing = getProjectById(projectId);
    if (existing) {
      setProject(existing as Project);
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="simulated-state empty">
        <div className="state-icon">∅</div>
        <h2>Proyek tidak ditemukan</h2>
        <p>Mungkin proyek ini telah dihapus atau Anda tidak memiliki akses.</p>
        <ActionLink href="/explore" variant="primary">Kembali ke Explore</ActionLink>
      </div>
    );
  }

  const handleRestore = () => {
    updateProject(projectId, { lifecycle: "DRAFT" });
    setProject({ ...project, lifecycle: "DRAFT" });
  };

  return (
    <>
      <div className="breadcrumbs" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        <BackButton fallbackHref="/explore" label="Kembali ke daftar proyek" />
      </div>
      <PageHeader
        eyebrow="Public project"
        title={project.title}
        description={project.problem}
        actions={
          project.lifecycle === "ARCHIVED" ? (
             <button className="button secondary" onClick={handleRestore}>Restore Project</button>
          ) : (
            <>
              <ActionLink href={`/projects/edit?project=${project.id}`} variant="primary">Edit Project</ActionLink>
              <ActionLink href={`/projects/contributions?project=${project.id}`} variant="secondary">View Contributions</ActionLink>
            </>
          )
        }
      />
      <div className="project-meta">
        <Badge tone="info">{project.lifecycle.toUpperCase()}</Badge>
        <span className="muted">Readiness: {project.readiness.replace("_", " ")}</span>
        <span>Visibility: {project.visibility.replace("_", " ")}</span>
      </div>
      <div className="content-with-rail">
        <div className="card-list">
          <WireBox title="Masalah & hasil">
            <p>{project.problem}</p>
          </WireBox>
          <WireBox title="Status Bukti (Evidence)">
            <p>Total: {project.evidenceSummary?.total || 0}</p>
            <p>Diverifikasi: {project.evidenceSummary?.verified || 0}</p>
          </WireBox>
        </div>
        <aside className="side-panel">
          <h3>Kebutuhan kolaborasi</h3>
          {project.collaborationNeeds?.length > 0 ? (
            project.collaborationNeeds.map(need => (
              <div key={need.id} style={{ marginBottom: "12px" }}>
                <strong>{need.title || need.role}</strong>
                <p>{need.commitment || "TBD"}</p>
              </div>
            ))
          ) : (
            <p className="muted">Belum ada kebutuhan spesifik.</p>
          )}
        </aside>
      </div>
    </>
  );
}
