/**
 * OmniAI — Auth Store
 * Manages user authentication state using Firebase.
 */

import { auth, db } from '@/src/services/firebase/config';
// NOTE: projectStore is imported lazily inside functions to avoid circular dependency
import type { User as ProjectUser } from '@/src/types/project';
import { AI_LIMITS } from '@/src/utils/constants';
import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthState {
  user: ProjectUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;

  // Actions
  skipLogin: () => void;
  devLogin: () => void; // ← Dev bypass: instant Pro login as Nasir
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadSession: () => void;

  // AI Prompt Tracking
  incrementAIPrompts: () => Promise<void>;
  canUseAI: () => boolean;

  // Subscriptions
  upgradeToPro: () => Promise<void>;
  downgradeToFree: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,

  skipLogin: () => {
    set({
      user: null,
      isAuthenticated: true,
      isGuest: true,
      isLoading: false,
    });
  },

  devLogin: () => {
    const devUser: ProjectUser = {
      id: 'dev-nasir-pro',
      email: 'nasir@omniai.dev',
      displayName: 'Nasir',
      photoURL: null,
      plan: 'pro',
      aiPromptsUsedToday: 0,
      aiPromptsResetDate: new Date().toISOString().split('T')[0],
      bonusPrompts: 999,
      createdAt: Date.now(),
      lastActive: Date.now(),
      projectCount: 0,
    };
    set({
      user: devUser,
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    });
  },

  loadSession: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            set({
              user: userDoc.data() as ProjectUser,
              isAuthenticated: true,
              isGuest: false,
              isLoading: false,
            });
          } else {
            // Fallback if doc is not fully created yet
            set({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL || null,
                plan: 'free',
                aiPromptsUsedToday: 0,
                aiPromptsResetDate: new Date().toISOString().split('T')[0],
                bonusPrompts: 0,
                createdAt: Date.now(),
                lastActive: Date.now(),
                projectCount: 0,
              },
              isAuthenticated: true,
              isGuest: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          set({ isLoading: false, isAuthenticated: true, isGuest: false }); // Still authenticated with fallback
        }
      } else {
        const { isGuest } = get();
        // Do not overwrite isGuest if they intentionally skipped login during this session
        if (!isGuest) {
          set({ user: null, isAuthenticated: false, isGuest: false, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      }
    });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Lazily trigger guest project merge to avoid circular import at module init
      const { useProjectStore } = await import('@/src/stores/projectStore');
      useProjectStore.getState().mergeGuestProjectsToCloud(credential.user.uid);
      // Remaining state updates automatically via onAuthStateChanged
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      const newUser: ProjectUser = {
        id: userCredential.user.uid,
        email,
        displayName,
        photoURL: null,
        plan: 'free',
        aiPromptsUsedToday: 0,
        aiPromptsResetDate: new Date().toISOString().split('T')[0],
        bonusPrompts: 0,
        createdAt: Date.now(),
        lastActive: Date.now(),
        projectCount: 0,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      // Lazily trigger guest project merge to avoid circular import at module init
      const { useProjectStore } = await import('@/src/stores/projectStore');
      useProjectStore.getState().mergeGuestProjectsToCloud(userCredential.user.uid);
      // State updates automatically via onAuthStateChanged
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signInWithGoogle: async (idToken: string) => {
    set({ isLoading: true });
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        const newUser: ProjectUser = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || null,
          plan: 'free',
          aiPromptsUsedToday: 0,
          aiPromptsResetDate: new Date().toISOString().split('T')[0],
          bonusPrompts: 0,
          createdAt: Date.now(),
          lastActive: Date.now(),
          projectCount: 0,
        };
        await setDoc(userDocRef, newUser);
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isGuest: false, isAuthenticated: false, user: null });
    await firebaseSignOut(auth);
  },

  // ── AI Prompt Tracking ──

  incrementAIPrompts: async () => {
    const { user } = get();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedUser: ProjectUser = {
      ...user,
      aiPromptsUsedToday:
        user.aiPromptsResetDate === today
          ? user.aiPromptsUsedToday + 1
          : 1,
      aiPromptsResetDate: today,
    };

    set({ user: updatedUser });
    if (user.id !== "test-user-id") {
      await updateDoc(doc(db, 'users', user.id), {
        aiPromptsUsedToday: updatedUser.aiPromptsUsedToday,
        aiPromptsResetDate: updatedUser.aiPromptsResetDate,
      });
    }
  },

  canUseAI: () => {
    const { user } = get();
    if (!user) return false;
    if (user.plan === 'pro') return true;

    const today = new Date().toISOString().split('T')[0];
    const usedToday =
      user.aiPromptsResetDate === today ? user.aiPromptsUsedToday : 0;
    const limit = AI_LIMITS.FREE_PROMPTS_PER_DAY + (user.bonusPrompts || 0);
    return usedToday < limit;
  },

  upgradeToPro: async () => {
    const { user } = get();
    if (!user) return;
    
    set({ user: { ...user, plan: 'pro' } });
    if (user.id !== "test-user-id") {
      await updateDoc(doc(db, 'users', user.id), {
        plan: 'pro'
      });
    }
  },

  downgradeToFree: async () => {
    const { user } = get();
    if (!user) return;
    
    set({ user: { ...user, plan: 'free' } });
    if (user.id !== "test-user-id") {
      await updateDoc(doc(db, 'users', user.id), {
        plan: 'free'
      });
    }
  },
}));
