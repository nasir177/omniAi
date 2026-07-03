/**
 * OmniAI — App Constants
 */

export const APP_NAME = 'OmniAI';
export const APP_TAGLINE = 'Edit with Intelligence';

export const VIDEO_LIMITS = {
  MAX_DURATION_MS: 300_000,       // 5 minutes
  SHORTS_WARNING_MS: 60_000,      // 60 seconds
  MAX_DURATION_DISPLAY: '5:00',
  SHORTS_WARNING_DISPLAY: '1:00',
};

export const AI_LIMITS = {
  FREE_PROMPTS_PER_DAY: 10,
  BONUS_PROMPTS_PER_AD: 5,
  PRO_PROMPTS_PER_DAY: Infinity,
  GUEST_PROJECT_LIMIT: 3, // Max projects for guests before prompting sign-up
};

export const SUBSCRIPTION = {
  MONTHLY_PRICE: '$4.99',
  YEARLY_PRICE: '$39.99',
  YEARLY_MONTHLY_EQUIVALENT: '$3.33',
};

export const TIMELINE = {
  DEFAULT_FPS: 30,
  MIN_CLIP_FRAMES: 3,
  MAX_UNDO_STACK: 30,
  ZOOM_LEVELS: [0.5, 0.75, 1, 1.5, 2, 3] as const,
};

export const EXPORT_PRESETS = {
  tiktok: { label: 'TikTok', ratio: '9:16', maxMs: 600_000 },
  instagram_reel: { label: 'Instagram Reel', ratio: '9:16', maxMs: 90_000 },
  instagram_post: { label: 'Instagram Post', ratio: '1:1', maxMs: 60_000 },
  youtube: { label: 'YouTube', ratio: '16:9', maxMs: 300_000 },
  youtube_short: { label: 'YouTube Short', ratio: '9:16', maxMs: 60_000 },
  x: { label: 'X (Twitter)', ratio: '16:9', maxMs: 140_000 },
  snapchat: { label: 'Snapchat', ratio: '9:16', maxMs: 60_000 },
} as const;
