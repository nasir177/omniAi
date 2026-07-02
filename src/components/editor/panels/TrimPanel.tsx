/**
 * OmniAI — Trim Panel
 * Start/end time controls and apply trim action.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/src/theme';
import { Button } from '@/src/components/ui/Button';
import { Slider } from '@/src/components/ui/Slider';
import { useEditorStore } from '@/src/stores/editorStore';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frac = Math.floor((ms % 1000) / 100);
  return `${min}:${sec.toString().padStart(2, '0')}.${frac}`;
}

export function TrimPanel() {
  const {
    durationMs,
    trimStartMs,
    trimEndMs,
    setTrimStart,
    setTrimEnd,
    applyTrim,
    setActiveTool,
  } = useEditorStore();

  const trimmedDuration = trimEndMs - trimStartMs;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trim Video</Text>

      {/* Duration Info */}
      <View style={styles.durationRow}>
        <View style={styles.durationItem}>
          <Text style={styles.durationLabel}>Start</Text>
          <Text style={styles.durationValue}>{formatTime(trimStartMs)}</Text>
        </View>
        <View style={styles.durationDivider}>
          <Text style={styles.arrow}>→</Text>
        </View>
        <View style={styles.durationItem}>
          <Text style={styles.durationLabel}>End</Text>
          <Text style={styles.durationValue}>{formatTime(trimEndMs)}</Text>
        </View>
        <View style={styles.durationDivider} />
        <View style={styles.durationItem}>
          <Text style={styles.durationLabel}>Duration</Text>
          <Text style={styles.durationValueAccent}>
            {formatTime(trimmedDuration)}
          </Text>
        </View>
      </View>

      {/* Start Slider */}
      <Slider
        label="Start Point"
        value={trimStartMs}
        min={0}
        max={durationMs}
        step={100}
        onValueChange={setTrimStart}
        formatValue={(v) => formatTime(v)}
      />

      {/* End Slider */}
      <Slider
        label="End Point"
        value={trimEndMs}
        min={0}
        max={durationMs}
        step={100}
        onValueChange={setTrimEnd}
        formatValue={(v) => formatTime(v)}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={() => setActiveTool(null)}
          variant="outline"
          size="md"
          style={styles.cancelButton}
        />
        <Button
          title="Apply Trim"
          onPress={applyTrim}
          size="md"
          style={styles.applyButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...Typography.headlineSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationItem: {
    alignItems: 'center',
    flex: 1,
  },
  durationLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  durationValue: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  durationValueAccent: {
    ...Typography.labelLarge,
    color: Colors.primaryLight,
    fontVariant: ['tabular-nums'],
  },
  durationDivider: {
    width: 20,
    alignItems: 'center',
  },
  arrow: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
