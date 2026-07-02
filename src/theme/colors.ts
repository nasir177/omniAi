/**
 * OmniAI Design System — Color Palette
 * Premium dark theme with vibrant accent colors
 */

export const Colors = {
  // ── Core Brand ──
  primary: '#7C3AED',        // Vibrant purple
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  primaryGlow: 'rgba(124, 58, 237, 0.3)',

  secondary: '#06B6D4',      // Cyan accent
  secondaryLight: '#67E8F9',
  secondaryDark: '#0891B2',

  accent: '#F59E0B',         // Amber for highlights
  accentLight: '#FCD34D',

  // ── Backgrounds (Dark Theme) ──
  background: '#0A0A0F',     // Deep dark
  backgroundSecondary: '#111118',
  backgroundTertiary: '#1A1A24',
  surface: '#1E1E2E',        // Cards, panels
  surfaceLight: '#252536',
  surfaceHover: '#2A2A3D',

  // ── Glass Effect ──
  glass: 'rgba(30, 30, 46, 0.7)',
  glassBorder: 'rgba(124, 58, 237, 0.2)',
  glassLight: 'rgba(255, 255, 255, 0.05)',

  // ── Text ──
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0F172A',

  // ── Semantic ──
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',

  // ── Borders ──
  border: 'rgba(148, 163, 184, 0.1)',
  borderLight: 'rgba(148, 163, 184, 0.15)',
  borderFocus: '#7C3AED',

  // ── Gradients (use with LinearGradient) ──
  gradientPrimary: ['#7C3AED', '#06B6D4'] as const,
  gradientDark: ['#0A0A0F', '#1E1E2E'] as const,
  gradientSurface: ['#1E1E2E', '#252536'] as const,
  gradientAccent: ['#F59E0B', '#EF4444'] as const,
  gradientCool: ['#06B6D4', '#3B82F6'] as const,

  // ── Shadows ──
  shadowPrimary: 'rgba(124, 58, 237, 0.25)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',

  // ── Overlays ──
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // ── Tab Bar ──
  tabBarBackground: '#111118',
  tabBarActive: '#7C3AED',
  tabBarInactive: '#64748B',

  // ── Status Bar ──
  statusBar: '#0A0A0F',

  // ── Specific UI ──
  fab: '#7C3AED',
  fabGlow: 'rgba(124, 58, 237, 0.4)',
  inputBackground: '#1A1A24',
  placeholder: '#475569',
  divider: 'rgba(148, 163, 184, 0.08)',
  skeleton: '#252536',
  skeletonShimmer: '#2A2A3D',
};

export type ColorKey = keyof typeof Colors;
