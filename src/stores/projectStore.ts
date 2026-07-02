/**
 * OmniAI — Project Store
 * Manages project CRUD operations.
 * Phase 1: AsyncStorage persistence
 */

import { create } from 'zustand';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { LocalDB, db } from '@/src/services/firebase/config';
import type { Project, ProjectCreateInput } from '@/src/types/project';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  selectedProjectId: string | null;

  // Actions
  loadProjects: (userId: string) => Promise<void>;
  createProject: (userId: string, input: ProjectCreateInput) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  getProject: (projectId: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  selectedProjectId: null,

  loadProjects: async (userId: string) => {
    set({ isLoading: true });
    try {
      const projects = await LocalDB.getItem<Project[]>(`projects_${userId}`) || [];
      // Sort by most recently updated
      projects.sort((a, b) => b.updatedAt - a.updatedAt);
      set({ projects, isLoading: false });
    } catch {
      set({ projects: [], isLoading: false });
    }
  },

  createProject: async (userId: string, input: ProjectCreateInput) => {
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      title: input.title,
      thumbnailLocalPath: input.thumbnailLocalPath,
      aspectRatio: '9:16',
      resolution: { width: 1080, height: 1920 },
      fps: 30,
      durationMs: input.durationMs,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sourceVideoLocalPath: input.sourceVideoLocalPath,
    };

    const currentProjects = get().projects;
    const updated = [newProject, ...currentProjects];
    
    // Save locally
    await LocalDB.setItem(`projects_${userId}`, updated);
    
    // Sync to Firestore
    try {
      await setDoc(doc(db, 'users', userId, 'projects', newProject.id), newProject);
    } catch (e) {
      console.warn('Failed to sync new project to Firestore', e);
    }

    set({ projects: updated });
    return newProject;
  },

  deleteProject: async (projectId: string) => {
    const { projects } = get();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updated = projects.filter(p => p.id !== projectId);
    
    // Save locally
    await LocalDB.setItem(`projects_${project.userId}`, updated);
    
    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'users', project.userId, 'projects', projectId));
    } catch (e) {
      console.warn('Failed to delete project from Firestore', e);
    }

    set({ projects: updated });
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
    const { projects } = get();
    const updated = projects.map(p =>
      p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    const project = updated.find(p => p.id === projectId);
    if (project) {
      // Save locally
      await LocalDB.setItem(`projects_${project.userId}`, updated);
      
      // Update in Firestore
      try {
        await setDoc(doc(db, 'users', project.userId, 'projects', projectId), project, { merge: true });
      } catch (e) {
        console.warn('Failed to update project in Firestore', e);
      }
    }
    set({ projects: updated });
  },

  getProject: (projectId: string) => {
    return get().projects.find(p => p.id === projectId);
  },
}));
