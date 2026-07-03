/**
 * OmniAI — Project Store
 * Local-First architecture: guests get full local experience.
 * Authenticated users sync to Firestore in the background.
 *
 * Sync Status Flow:
 *  'local_only'  → Guest project, stored only on device.
 *  'syncing'     → Queued for upload to Firestore.
 *  'synced'      → Persisted to Firestore.
 */

import { create } from 'zustand';
import { doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { LocalDB, db } from '@/src/services/firebase/config';
import type { Project, ProjectCreateInput } from '@/src/types/project';

// Key used when storing guest projects locally (no real userId)
const GUEST_STORAGE_KEY = 'projects_guest';

export type SyncStatus = 'local_only' | 'syncing' | 'synced';

export interface ProjectWithSync extends Project {
  syncStatus: SyncStatus;
}

interface ProjectState {
  projects: ProjectWithSync[];
  isLoading: boolean;
  selectedProjectId: string | null;

  // Actions
  loadProjects: (userId: string | null) => Promise<void>;
  createProject: (userId: string | null, input: ProjectCreateInput) => Promise<ProjectWithSync>;
  deleteProject: (projectId: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<ProjectWithSync>) => Promise<void>;
  getProject: (projectId: string) => ProjectWithSync | undefined;

  // Guest → Cloud Merge
  mergeGuestProjectsToCloud: (userId: string) => Promise<void>;
}

const storageKey = (userId: string | null) =>
  userId ? `projects_${userId}` : GUEST_STORAGE_KEY;

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  selectedProjectId: null,

  loadProjects: async (userId: string | null) => {
    set({ isLoading: true });
    try {
      // Always load from local storage first (works for both guests and real users)
      const projects =
        (await LocalDB.getItem<ProjectWithSync[]>(storageKey(userId))) || [];
      projects.sort((a, b) => b.updatedAt - a.updatedAt);
      set({ projects, isLoading: false });

      // If user is authenticated, also check for any guest leftovers to merge
      if (userId) {
        const guestProjects =
          (await LocalDB.getItem<ProjectWithSync[]>(GUEST_STORAGE_KEY)) || [];
        if (guestProjects.length > 0) {
          get().mergeGuestProjectsToCloud(userId);
        }
      }
    } catch {
      set({ projects: [], isLoading: false });
    }
  },

  createProject: async (userId: string | null, input: ProjectCreateInput) => {
    const isGuest = !userId;
    const newProject: ProjectWithSync = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: userId ?? 'guest',
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
      syncStatus: isGuest ? 'local_only' : 'syncing',
    };

    const currentProjects = get().projects;
    const updated = [newProject, ...currentProjects];

    // Always save locally first
    await LocalDB.setItem(storageKey(userId), updated);
    set({ projects: updated });

    // Background sync to Firestore for authenticated users only
    if (!isGuest) {
      try {
        await setDoc(doc(db, 'users', userId!, 'projects', newProject.id), newProject);
        const synced = get().projects.map((p) =>
          p.id === newProject.id ? { ...p, syncStatus: 'synced' as SyncStatus } : p
        );
        await LocalDB.setItem(storageKey(userId), synced);
        set({ projects: synced });
      } catch (e) {
        console.warn('Failed to sync new project to Firestore', e);
      }
    }

    return newProject;
  },

  deleteProject: async (projectId: string) => {
    const { projects } = get();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updated = projects.filter((p) => p.id !== projectId);
    const uid = project.userId === 'guest' ? null : project.userId;
    await LocalDB.setItem(storageKey(uid), updated);

    if (uid) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'projects', projectId));
      } catch (e) {
        console.warn('Failed to delete project from Firestore', e);
      }
    }

    set({ projects: updated });
  },

  updateProject: async (projectId: string, updates: Partial<ProjectWithSync>) => {
    const { projects } = get();
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    const project = updated.find((p) => p.id === projectId);
    if (!project) return;

    const uid = project.userId === 'guest' ? null : project.userId;
    await LocalDB.setItem(storageKey(uid), updated);

    if (uid) {
      try {
        await setDoc(
          doc(db, 'users', uid, 'projects', projectId),
          project,
          { merge: true }
        );
      } catch (e) {
        console.warn('Failed to update project in Firestore', e);
      }
    }
    set({ projects: updated });
  },

  getProject: (projectId: string) => {
    return get().projects.find((p) => p.id === projectId);
  },

  /**
   * Merge Job: Runs automatically when a guest user signs in.
   * Transfers all local-only guest projects to Firestore under the new userId.
   */
  mergeGuestProjectsToCloud: async (userId: string) => {
    try {
      const guestProjects =
        (await LocalDB.getItem<ProjectWithSync[]>(GUEST_STORAGE_KEY)) || [];
      if (guestProjects.length === 0) return;

      console.log(`[Merge] Merging ${guestProjects.length} guest project(s) for user ${userId}`);

      const batch = writeBatch(db);
      const migratedProjects: ProjectWithSync[] = guestProjects.map((p) => ({
        ...p,
        userId,
        syncStatus: 'synced' as SyncStatus,
      }));

      for (const project of migratedProjects) {
        batch.set(doc(db, 'users', userId, 'projects', project.id), project);
      }
      await batch.commit();

      // Merge into user's local storage and clear guest storage
      const userProjects =
        (await LocalDB.getItem<ProjectWithSync[]>(`projects_${userId}`)) || [];
      const merged = [...migratedProjects, ...userProjects];
      merged.sort((a, b) => b.updatedAt - a.updatedAt);

      await LocalDB.setItem(`projects_${userId}`, merged);
      await LocalDB.removeItem(GUEST_STORAGE_KEY);

      set({ projects: merged });
      console.log('[Merge] Guest projects merged to cloud successfully.');
    } catch (e) {
      console.error('[Merge] Failed to merge guest projects:', e);
    }
  },
}));
