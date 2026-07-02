/**
 * OmniAI Design System — Typography
 * Using system fonts (no external font loading needed for MVP)
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: 'System',
});

const fontFamilyMedium = Platform.select({
  android: 'sans-serif-medium',
  ios: 'System',
  default: 'System',
});

const fontFamilyBold = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: 'System',
});

export const Typography = {
  // ── Display ──
  displayLarge: {
    fontFamily: fontFamilyBold,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -0.5,
  } as TextStyle,

  displayMedium: {
    fontFamily: fontFamilyBold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: -0.3,
  } as TextStyle,

  // ── Headlines ──
  headlineLarge: {
    fontFamily: fontFamilyBold,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.2,
  } as TextStyle,

  headlineMedium: {
    fontFamily: fontFamilyMedium,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  headlineSmall: {
    fontFamily: fontFamilyMedium,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  } as TextStyle,

  // ── Body ──
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  // ── Labels ──
  labelLarge: {
    fontFamily: fontFamilyMedium,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.3,
  } as TextStyle,

  labelMedium: {
    fontFamily: fontFamilyMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.4,
  } as TextStyle,

  labelSmall: {
    fontFamily: fontFamilyMedium,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    letterSpacing: 0.5,
  } as TextStyle,

  // ── Button ──
  button: {
    fontFamily: fontFamilyMedium,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0.3,
  } as TextStyle,

  buttonSmall: {
    fontFamily: fontFamilyMedium,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.3,
  } as TextStyle,

  // ── Caption ──
  caption: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,
};
