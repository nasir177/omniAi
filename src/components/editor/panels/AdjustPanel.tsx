/**
 * OmniAI — Adjust Panel
 * Color grading (brightness, contrast, saturation, temperature).
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore } from '@/src/stores/editorStore';
import { Slider } from '@/src/components/ui/Slider';
import { Sun, Moon, Droplet, Thermometer } from 'lucide-react-native';

export function AdjustPanel() {
  const { adjustments, setAdjustment, resetAdjustments } = useEditorStore();

  const formatPercent = (val: number) => {
    return `${Math.round(val * 100)}%`;
  };

  const formatTemp = (val: number) => {
    return val > 0 ? `+${val}°` : `${val}°`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Adjust & Grading</Text>
        <TouchableOpacity onPress={resetAdjustments} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset All</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Fine-tune exposure and color temperature
      </Text>

      {/* Sliders */}
      <View style={styles.sliderGroup}>
        {/* Brightness */}
        <View style={styles.sliderRow}>
          <View style={styles.labelRow}>
            <View style={styles.iconLabel}>
              <Sun size={16} color={Colors.textSecondary} />
              <Text style={styles.sliderLabel}>Brightness</Text>
            </View>
            <Text style={styles.sliderValue}>{formatPercent(adjustments.brightness)}</Text>
          </View>
          <Slider
            value={adjustments.brightness}
            min={0.5}
            max={1.5}
            step={0.05}
            onValueChange={(val) => setAdjustment('brightness', val)}
          />
        </View>

        {/* Contrast */}
        <View style={styles.sliderRow}>
          <View style={styles.labelRow}>
            <View style={styles.iconLabel}>
              <Moon size={16} color={Colors.textSecondary} />
              <Text style={styles.sliderLabel}>Contrast</Text>
            </View>
            <Text style={styles.sliderValue}>{formatPercent(adjustments.contrast)}</Text>
          </View>
          <Slider
            value={adjustments.contrast}
            min={0.5}
            max={1.5}
            step={0.05}
            onValueChange={(val) => setAdjustment('contrast', val)}
          />
        </View>

        {/* Saturation */}
        <View style={styles.sliderRow}>
          <View style={styles.labelRow}>
            <View style={styles.iconLabel}>
              <Droplet size={16} color={Colors.textSecondary} />
              <Text style={styles.sliderLabel}>Saturation</Text>
            </View>
            <Text style={styles.sliderValue}>{formatPercent(adjustments.saturation)}</Text>
          </View>
          <Slider
            value={adjustments.saturation}
            min={0.0}
            max={2.0}
            step={0.05}
            onValueChange={(val) => setAdjustment('saturation', val)}
          />
        </View>

        {/* Temperature */}
        <View style={styles.sliderRow}>
          <View style={styles.labelRow}>
            <View style={styles.iconLabel}>
              <Thermometer size={16} color={Colors.textSecondary} />
              <Text style={styles.sliderLabel}>Temperature</Text>
            </View>
            <Text style={styles.sliderValue}>{formatTemp(adjustments.temperature)}</Text>
          </View>
          <Slider
            value={adjustments.temperature}
            min={-50}
            max={50}
            step={2}
            onValueChange={(val) => setAdjustment('temperature', val)}
          />
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.headlineSmall,
    color: Colors.textPrimary,
  },
  resetButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  sliderGroup: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sliderRow: {
    gap: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sliderLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sliderValue: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

