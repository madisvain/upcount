import { atom } from "jotai";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/core/macro";
import keyBy from "lodash/keyBy";
import map from "lodash/map";
import { invoke } from "@tauri-apps/api/core";

import { organizationIdAtom } from "./organization";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  clientId?: string;
  startDate?: number;
  endDate?: number;
  archivedAt?: number;
  createdAt: string;
}

// Projects
export const projectsAtom = atom<Project[]>([]);
projectsAtom.debugLabel = "projectsAtom";

export const setProjectsAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  try {
    const response = await invoke<Project[]>("get_projects", { organizationId });
    set(projectsAtom, response);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    message.error(t`Failed to fetch projects`);
    set(projectsAtom, []);
  }
});
setProjectsAtom.debugLabel = "setProjectsAtom";

export const projectsByIdAtom = atom((get) => {
  const projects = get(projectsAtom);
  return keyBy(projects, "id");
});
projectsByIdAtom.debugLabel = "projectsByIdAtom";

// Create project
export const createProjectAtom = atom(
  null,
  async (get, set, project: Omit<Project, "id" | "organizationId" | "createdAt">) => {
    const organizationId = get(organizationIdAtom);
    if (!organizationId) {
      throw new Error("No organization selected");
    }
    const newProject: Omit<Project, "createdAt"> = {
      id: nanoid(),
      organizationId,
      ...project,
    };

    try {
      await invoke("create_project", { project: newProject });
      const projects = get(projectsAtom);
      set(projectsAtom, [...projects, { ...newProject, createdAt: new Date().toISOString() }]);
      message.success(t`Project created successfully`);
      return newProject.id;
    } catch (error) {
      console.error("Failed to create project:", error);
      message.error(t`Failed to create project`);
      throw error;
    }
  }
);
createProjectAtom.debugLabel = "createProjectAtom";

// Update project
export const updateProjectAtom = atom(
  null,
  async (get, set, projectId: string, updates: Partial<Omit<Project, "id" | "organizationId" | "createdAt">>) => {
    try {
      await invoke("update_project", { projectId, updates });
      const projects = get(projectsAtom);
      const updatedProjects = map(projects, (project) =>
        project.id === projectId ? { ...project, ...updates } : project
      );
      set(projectsAtom, updatedProjects);
      message.success(t`Project updated successfully`);
    } catch (error) {
      console.error("Failed to update project:", error);
      message.error(t`Failed to update project`);
      throw error;
    }
  }
);
updateProjectAtom.debugLabel = "updateProjectAtom";

// Archive project
export const archiveProjectAtom = atom(
  null,
  async (get, set, projectId: string) => {
    const archivedAt = Math.floor(Date.now() / 1000);
    try {
      await invoke("update_project", { projectId, updates: { archivedAt } });
      const projects = get(projectsAtom);
      const updatedProjects = map(projects, (project) =>
        project.id === projectId ? { ...project, archivedAt } : project
      );
      set(projectsAtom, updatedProjects);
      message.success(t`Project archived successfully`);
    } catch (error) {
      console.error("Failed to archive project:", error);
      message.error(t`Failed to archive project`);
      throw error;
    }
  }
);
archiveProjectAtom.debugLabel = "archiveProjectAtom";

// Unarchive project
export const unarchiveProjectAtom = atom(
  null,
  async (get, set, projectId: string) => {
    try {
      await invoke("update_project", { projectId, updates: { archivedAt: null } });
      const projects = get(projectsAtom);
      const updatedProjects = map(projects, (project) =>
        project.id === projectId ? { ...project, archivedAt: undefined } : project
      );
      set(projectsAtom, updatedProjects);
      message.success(t`Project unarchived successfully`);
    } catch (error) {
      console.error("Failed to unarchive project:", error);
      message.error(t`Failed to unarchive project`);
      throw error;
    }
  }
);
unarchiveProjectAtom.debugLabel = "unarchiveProjectAtom";

