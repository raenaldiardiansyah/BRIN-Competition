import { Project } from "@/types/domain/project";
import { dummyProjects } from "@/dummy/registry/projects";

const STORAGE_KEY = "tautin:v1:projects";

export function getLocalProjects(): Project[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local projects", e);
    return [];
  }
}

export function saveLocalProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getCombinedProjects(): Project[] {
  const local = getLocalProjects();
  // Filter out any dummy projects that have been overridden locally
  const localIds = new Set(local.map(p => p.id));
  const base = dummyProjects.filter(p => !localIds.has(p.id));
  return [...base, ...local];
}

export function getProjectById(id: string): Project | undefined {
  return getCombinedProjects().find((p) => p.id === id);
}

export function createProject(project: Omit<Project, "id">): Project {
  const newId = `proj-local-${Date.now()}`;
  const newProject: Project = { ...project, id: newId };
  const local = getLocalProjects();
  saveLocalProjects([...local, newProject]);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const allProjects = getCombinedProjects();
  const existingIndex = allProjects.findIndex(p => p.id === id);
  if (existingIndex === -1) return undefined;

  const existing = allProjects[existingIndex];
  const updated: Project = { ...existing, ...updates };

  const local = getLocalProjects();
  const localIndex = local.findIndex(p => p.id === id);
  if (localIndex >= 0) {
    local[localIndex] = updated;
  } else {
    local.push(updated);
  }
  saveLocalProjects(local);

  return updated;
}

export function deleteProject(id: string) {
  const local = getLocalProjects();
  const filtered = local.filter(p => p.id !== id);
  saveLocalProjects(filtered);
}
