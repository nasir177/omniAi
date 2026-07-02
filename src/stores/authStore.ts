/**
 * OmniAI — Auth Store
 * Manages user authentication state using Firebase.
 */

import { auth, db } from '@/src/services/firebase/config';
import type { User as ProjectUser } from '@/src/types/project';
import { AI_LIMITS } from '@/src/utils/constants';
import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthState {
  user: ProjectUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
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
  user: {
    id: "test-user-id",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: null,
    plan: "pro",
    aiPromptsUsedToday: 0,
    aiPromptsResetDate: new Date().toISOString().split('T')[0],
    bonusPrompts: 100,
    createdAt: Date.now(),
    lastActive: Date.now(),
    projectCount: 0
  },
  isLoading: false,
  isAuthenticated: true,

  loadSession: () => {
    console.log("Auth bypassed for testing. Using mocked user state.");
    // onAuthStateChanged is bypassed
    return;
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // State updates automatically via onAuthStateChanged
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
      // State updates automatically via onAuthStateChanged
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
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
