/**
 * OmniAI — Project Type Definitions
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  plan: 'free' | 'pro';
  aiPromptsUsedToday: number;
  aiPromptsResetDate: string;
  bonusPrompts: number;
  createdAt: number;
  lastActive: number;
  projectCount: number;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  thumbnailLocalPath: string | null;
  aspectRatio: AspectRatio;
  resolution: { width: number; height: number };
  fps: number;
  durationMs: number;
  status: 'draft' | 'editing' | 'completed';
  createdAt: number;
  updatedAt: number;
  sourceVideoLocalPath: string;
}

export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export interface ProjectCreateInput {
  title: string;
  sourceVideoLocalPath: string;
  durationMs: number;
  thumbnailLocalPath: string | null;
}

// ── Editor Types ──

export type EditorTool =
  | 'trim'
  | 'text'
  | 'filter'
  | 'speed'
  | 'audio'
  | 'ai'
  | 'captions'
  | 'effects'
  | 'stickers'
  | 'adjust'
  | null;

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  position: 'top' | 'center' | 'bottom';
  startMs: number;
  endMs: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  iconName: string;
  /** CSS-like filter description for display — actual processing is mocked */
  tint: string;
  opacity: number;
}

export interface SpeedSegment {
  startMs: number;
  endMs: number;
  rate: number;
}

export type EditActionType =
  | 'trim'
  | 'add_text'
  | 'remove_text'
  | 'apply_filter'
  | 'change_speed'
  | 'adjust_volume'
  | 'ai_edit';

export interface EditAction {
  id: string;
  type: EditActionType;
  timestamp: number;
  description: string;
  /** Serialized previous state for undo */
  previousState: string;
}

export interface AIPromptResult {
  id: string;
  prompt: string;
  response: string;
  actions: EditActionType[];
  timestamp: number;
  success: boolean;
}
