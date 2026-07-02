/**
 * OmniAI — Chip Component
 * Small tappable pill for AI suggestion chips and filter labels.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';

interface ChipProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Chip({ label, onPress, active = false, icon, style }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        active && styles.chipActive,
        style,
      ]}
    >
      {icon && <React.Fragment>{icon}</React.Fragment>}
      <Text style={[styles.label, active && styles.labelActive, icon && { marginLeft: Spacing.xs }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.primaryLight,
  },
});
