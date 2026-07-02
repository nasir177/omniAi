/**
 * OmniAI — Editor Store
 * Manages video editor state: playback, tools, timeline, overlays, undo/redo.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  EditorTool,
  TextOverlay,
  FilterPreset,
  EditAction,
  AIPromptResult,
} from '@/src/types/project';

// ── Filter Presets ──
export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: 'Normal', iconName: 'Circle', tint: 'transparent', opacity: 0 },
  { id: 'warm', name: 'Warm', iconName: 'Sun', tint: '#FF8C00', opacity: 0.15 },
  { id: 'cool', name: 'Cool', iconName: 'Snowflake', tint: '#4169E1', opacity: 0.15 },
  { id: 'bw', name: 'B&W', iconName: 'CircleDashed', tint: '#808080', opacity: 0.6 },
  { id: 'vintage', name: 'Vintage', iconName: 'Camera', tint: '#D2691E', opacity: 0.2 },
  { id: 'cinema', name: 'Cinema', iconName: 'Film', tint: '#1a1a2e', opacity: 0.25 },
  { id: 'vivid', name: 'Vivid', iconName: 'Rainbow', tint: '#FF1493', opacity: 0.1 },
  { id: 'moody', name: 'Moody', iconName: 'Moon', tint: '#2F4F4F', opacity: 0.2 },
];

// ── Visual Effect Presets ──
export interface EffectPreset {
  id: string;
  name: string;
  iconName: string;
  description: string;
}

export const EFFECT_PRESETS: EffectPreset[] = [
  { id: 'none', name: 'None', iconName: 'Circle', description: 'No visual effect' },
  { id: 'glitch', name: 'Glitch', iconName: 'MonitorOff', description: 'Retro digital glitch glitch effect' },
  { id: 'vhs', name: 'VHS Tape', iconName: 'CassetteTape', description: 'Classic 80s tape distortion' },
  { id: 'blur', name: 'Radial Blur', iconName: 'Tornado', description: 'Fast zoom lens blur' },
  { id: 'mirror', name: 'Mirror Split', iconName: 'SplitSquareHorizontal', description: 'Horizontal mirror reflection' },
  { id: 'neon', name: 'Neon Edge', iconName: 'Sparkles', description: 'Electric glowing outline' },
];

// ── Speed Options ──
export const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3] as const;

// ── Captions Interfaces ──
export interface CaptionOverlay {
  id: string;
  text: string;
  style: 'minimal' | 'bold' | 'karaoke' | 'highlight' | 'pop' | 'neon' | 'handwritten';
  animation: 'none' | 'fadeIn' | 'typewriter' | 'bounce' | 'slide' | 'pop' | 'wordByWord';
  color: string;
  fontSize: number;
  position: 'top' | 'center' | 'bottom';
  startMs: number;
  endMs: number;
}

// ── Stickers Interfaces ──
export interface StickerOverlay {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  startMs: number;
  endMs: number;
}

// ── Adjustments (Color Grading & Chroma Key) ──
export interface Adjustments {
  brightness: number;     // 0.5 to 1.5
  contrast: number;       // 0.5 to 1.5
  saturation: number;     // 0.0 to 2.0
  temperature: number;    // -50 to 50
  greenScreenEnabled: boolean;
  greenScreenColor: string; // Hex color to key out
}

// ── Video Overlays ──
export interface VideoOverlay {
  id: string;
  uri: string;
  x: number;
  y: number;
  scale: number;
  startMs: number;
  endMs: number;
}

interface EditorState {
  // Playback
  isPlaying: boolean;
  currentPositionMs: number;
  durationMs: number;

  // Tools
  activeTool: EditorTool;

  // Timeline
  zoomLevel: number;

  // Trim
  trimStartMs: number;
  trimEndMs: number;
  isTrimActive: boolean;

  // Text Overlays
  textOverlays: TextOverlay[];

  // Video Overlays
  videoOverlays: VideoOverlay[];

  // Filter
  activeFilterId: string;

  // Speed
  playbackSpeed: number;

  // Audio
  volume: number;
  isMuted: boolean;

  // Captions
  captions: CaptionOverlay[];

  // Effects
  activeEffectId: string;

  // Stickers
  stickers: StickerOverlay[];

  // Adjustments
  adjustments: Adjustments;

  // Undo / Redo
  undoStack: EditAction[];
  redoStack: EditAction[];

  // AI
  aiPromptHistory: AIPromptResult[];
  isAIProcessing: boolean;

  // ── Actions ──
  setPlaying: (playing: boolean) => void;
  setCurrentPosition: (ms: number) => void;
  setDuration: (ms: number) => void;
  setActiveTool: (tool: EditorTool) => void;
  setZoomLevel: (zoom: number) => void;

  // Trim
  setTrimStart: (ms: number) => void;
  setTrimEnd: (ms: number) => void;
  applyTrim: () => void;

  // Text
  addTextOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
  removeTextOverlay: (id: string) => void;

  // Video Overlays
  addVideoOverlay: (overlay: Omit<VideoOverlay, 'id'>) => void;
  removeVideoOverlay: (id: string) => void;

  // Filter
  setFilter: (filterId: string) => void;

  // Speed
  setSpeed: (speed: number) => void;

  // Audio
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Captions
  addCaption: (caption: Omit<CaptionOverlay, 'id'>) => void;
  removeCaption: (id: string) => void;
  clearCaptions: () => void;

  // Effects
  setEffect: (effectId: string) => void;

  // Stickers
  addSticker: (sticker: Omit<StickerOverlay, 'id'>) => void;
  removeSticker: (id: string) => void;

  // Adjustments
  setAdjustment: (key: keyof Adjustments, value: any) => void;
  resetAdjustments: () => void;

  // Undo / Redo
  pushUndo: (action: Omit<EditAction, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;

  // AI
  addAIResult: (result: AIPromptResult) => void;
  setAIProcessing: (processing: boolean) => void;

  // Reset
  resetEditor: () => void;
  initEditor: (durationMs: number) => void;
}

const initialState = {
  isPlaying: false,
  currentPositionMs: 0,
  durationMs: 0,
  activeTool: null as EditorTool,
  zoomLevel: 1,
  trimStartMs: 0,
  trimEndMs: 0,
  isTrimActive: false,
  textOverlays: [] as TextOverlay[],
  videoOverlays: [] as VideoOverlay[],
  activeFilterId: 'none',
  playbackSpeed: 1,
  volume: 1,
  isMuted: false,
  captions: [] as CaptionOverlay[],
  activeEffectId: 'none',
  stickers: [] as StickerOverlay[],
  adjustments: {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    temperature: 0,
    greenScreenEnabled: false,
    greenScreenColor: '#00FF00',
  },
  undoStack: [] as EditAction[],
  redoStack: [] as EditAction[],
  aiPromptHistory: [] as AIPromptResult[],
  isAIProcessing: false,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      ...initialState,

  initEditor: (durationMs: number) => {
    set({
      ...initialState,
      durationMs,
      trimEndMs: durationMs,
    });
  },

  resetEditor: () => set(initialState),

  // ── Playback ──
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentPosition: (ms) => set({ currentPositionMs: Math.max(0, ms) }),
  setDuration: (ms) => set({ durationMs: ms }),

  // ── Tools ──
  setActiveTool: (tool) => {
    const current = get().activeTool;
    set({
      activeTool: current === tool ? null : tool,
      isTrimActive: tool === 'trim',
    });
  },

  // ── Timeline ──
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.5, Math.min(3, zoom)) }),

  // ── Trim ──
  setTrimStart: (ms) => {
    const { trimEndMs } = get();
    set({ trimStartMs: Math.max(0, Math.min(ms, trimEndMs - 500)) });
  },
  setTrimEnd: (ms) => {
    const { trimStartMs, durationMs } = get();
    set({ trimEndMs: Math.min(durationMs, Math.max(ms, trimStartMs + 500)) });
  },
  applyTrim: () => {
    const { trimStartMs, trimEndMs, durationMs } = get();
    get().pushUndo({
      type: 'trim',
      description: `Trimmed to ${Math.floor(trimStartMs / 1000)}s - ${Math.floor(trimEndMs / 1000)}s`,
      previousState: JSON.stringify({ trimStartMs: 0, trimEndMs: durationMs }),
    });
    set({
      currentPositionMs: trimStartMs,
      activeTool: null,
      isTrimActive: false,
    });
  },

  // ── Text ──
  addTextOverlay: (overlay) => {
    const newOverlay: TextOverlay = {
      ...overlay,
      id: `text_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    get().pushUndo({
      type: 'add_text',
      description: `Added text: "${overlay.text.slice(0, 20)}"`,
    });
    set((state) => ({
      textOverlays: [...state.textOverlays, newOverlay],
    }));
  },
  removeTextOverlay: (id) => {
    get().pushUndo({
      type: 'remove_text',
      description: 'Removed text overlay',
    });
    set((state) => ({
      textOverlays: state.textOverlays.filter((t) => t.id !== id),
    }));
  },

  // ── Video Overlays ──
  addVideoOverlay: (overlay) => {
    const newOverlay: VideoOverlay = {
      ...overlay,
      id: `video_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    get().pushUndo({
      type: 'add_video_overlay',
      description: 'Added video overlay',
    });
    set((state) => ({
      videoOverlays: [...state.videoOverlays, newOverlay],
    }));
  },
  removeVideoOverlay: (id) => {
    get().pushUndo({
      type: 'remove_video_overlay',
      description: 'Removed video overlay',
    });
    set((state) => ({
      videoOverlays: state.videoOverlays.filter((v) => v.id !== id),
    }));
  },

  // ── Filter ──
  setFilter: (filterId) => {
    const prev = get().activeFilterId;
    if (prev !== filterId) {
      get().pushUndo({
        type: 'apply_filter',
        description: `Applied filter: ${FILTER_PRESETS.find((f) => f.id === filterId)?.name || filterId}`,
      });
    }
    set({ activeFilterId: filterId });
  },

  // ── Speed ──
  setSpeed: (speed) => {
    const prev = get().playbackSpeed;
    if (prev !== speed) {
      get().pushUndo({
        type: 'change_speed',
        description: `Speed changed to ${speed}x`,
      });
    }
    set({ playbackSpeed: speed });
  },

  // ── Audio ──
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // ── Captions ──
  addCaption: (caption) => {
    const newCaption: CaptionOverlay = {
      ...caption,
      id: `caption_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    get().pushUndo({
      type: 'add_text',
      description: `Added caption: "${caption.text.slice(0, 20)}"`,
    });
    set((state) => ({
      captions: [...state.captions, newCaption],
    }));
  },
  removeCaption: (id) => {
    get().pushUndo({
      type: 'remove_text',
      description: 'Removed caption segment',
    });
    set((state) => ({
      captions: state.captions.filter((c) => c.id !== id),
    }));
  },
  clearCaptions: () => {
    get().pushUndo({
      type: 'remove_text',
      description: 'Cleared captions',
    });
    set({ captions: [] });
  },

  // ── Effects ──
  setEffect: (effectId) => {
    const prev = get().activeEffectId;
    if (prev !== effectId) {
      get().pushUndo({
        type: 'apply_filter',
        description: `Applied effect: ${effectId}`,
      });
    }
    set({ activeEffectId: effectId });
  },

  // ── Stickers ──
  addSticker: (sticker) => {
    const newSticker: StickerOverlay = {
      ...sticker,
      id: `sticker_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    get().pushUndo({
      type: 'add_text',
      description: `Added sticker`,
    });
    set((state) => ({
      stickers: [...state.stickers, newSticker],
    }));
  },
  removeSticker: (id) => {
    get().pushUndo({
      type: 'remove_text',
      description: 'Removed sticker',
    });
    set((state) => ({
      stickers: state.stickers.filter((s) => s.id !== id),
    }));
  },

  // ── Adjustments ──
  setAdjustment: (key, value) => {
    get().pushUndo({
      type: 'apply_filter',
      description: `Adjusted ${key}`,
    });
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        [key]: value,
      },
    }));
  },
  resetAdjustments: () => {
    get().pushUndo({
      type: 'apply_filter',
      description: 'Reset adjustments',
    });
    set({
      adjustments: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        temperature: 0,
        greenScreenEnabled: false,
        greenScreenColor: '#00FF00',
      },
    });
  },

  // ── Undo / Redo ──
  pushUndo: (action) => {
    const currentState = {
      textOverlays: get().textOverlays,
      activeFilterId: get().activeFilterId,
      playbackSpeed: get().playbackSpeed,
      volume: get().volume,
      isMuted: get().isMuted,
      captions: get().captions,
      activeEffectId: get().activeEffectId,
      stickers: get().stickers,
      adjustments: get().adjustments,
      trimStartMs: get().trimStartMs,
      trimEndMs: get().trimEndMs,
      videoOverlays: get().videoOverlays,
    };
    
    const newAction: EditAction = {
      ...action,
      id: `action_${Date.now()}`,
      timestamp: Date.now(),
      previousState: JSON.stringify(currentState),
    };
    set((state) => ({
      undoStack: [...state.undoStack.slice(-29), newAction],
      redoStack: [],
    }));
  },
  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    
    const currentState = {
      textOverlays: get().textOverlays,
      activeFilterId: get().activeFilterId,
      playbackSpeed: get().playbackSpeed,
      volume: get().volume,
      isMuted: get().isMuted,
      captions: get().captions,
      activeEffectId: get().activeEffectId,
      stickers: get().stickers,
      adjustments: get().adjustments,
      trimStartMs: get().trimStartMs,
      trimEndMs: get().trimEndMs,
      videoOverlays: get().videoOverlays,
    };

    // The current state becomes the previousState of the action we move to redoStack
    const actionForRedo = { ...lastAction, previousState: JSON.stringify(currentState) };
    
    const previousStateObj = JSON.parse(lastAction.previousState);

    set((state) => ({
      ...previousStateObj,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, actionForRedo],
    }));
  },
  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const lastAction = redoStack[redoStack.length - 1];

    const currentState = {
      textOverlays: get().textOverlays,
      activeFilterId: get().activeFilterId,
      playbackSpeed: get().playbackSpeed,
      volume: get().volume,
      isMuted: get().isMuted,
      captions: get().captions,
      activeEffectId: get().activeEffectId,
      stickers: get().stickers,
      adjustments: get().adjustments,
      trimStartMs: get().trimStartMs,
      trimEndMs: get().trimEndMs,
      videoOverlays: get().videoOverlays,
    };

    const actionForUndo = { ...lastAction, previousState: JSON.stringify(currentState) };
    const nextStateObj = JSON.parse(lastAction.previousState);

    set((state) => ({
      ...nextStateObj,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, actionForUndo],
    }));
  },

  // ── AI ──
  addAIResult: (result) => {
    set((state) => ({
      aiPromptHistory: [...state.aiPromptHistory, result],
    }));
  },
  setAIProcessing: (processing) => set({ isAIProcessing: processing }),
    }),
    {
      name: 'omniai-editor-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        textOverlays: state.textOverlays,
        activeFilterId: state.activeFilterId,
        playbackSpeed: state.playbackSpeed,
        volume: state.volume,
        isMuted: state.isMuted,
        captions: state.captions,
        activeEffectId: state.activeEffectId,
        stickers: state.stickers,
        adjustments: state.adjustments,
        trimStartMs: state.trimStartMs,
        trimEndMs: state.trimEndMs,
        undoStack: state.undoStack,
        redoStack: state.redoStack,
      }),
    }
  )
);
