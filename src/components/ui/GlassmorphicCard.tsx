/**
 * OmniAI — Glassmorphic Card Component
 * Frosted glass effect card for premium UI.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/src/theme';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
}

export function GlassmorphicCard({
  children,
  style,
  padding = Spacing.lg,
  borderRadius = BorderRadius.xl,
}: GlassmorphicCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          borderRadius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    // Simulated glass effect with subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
});
