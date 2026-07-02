/**
 * OmniAI — Speed Panel
 * Playback speed selector with animated pill buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore, SPEED_OPTIONS } from '@/src/stores/editorStore';
import { Snail, Play, Zap } from 'lucide-react-native';

export function SpeedPanel() {
  const { playbackSpeed, setSpeed } = useEditorStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speed</Text>
      <Text style={styles.subtitle}>
        Change the playback speed of your video
      </Text>

      {/* Current Speed Display */}
      <View style={styles.currentSpeed}>
        <Text style={styles.currentSpeedValue}>{playbackSpeed}x</Text>
        <Text style={styles.currentSpeedLabel}>
          {playbackSpeed < 1
            ? 'Slow Motion'
            : playbackSpeed === 1
            ? 'Normal'
            : 'Fast Forward'}
        </Text>
      </View>

      {/* Speed Options */}
      <View style={styles.speedRow}>
        {SPEED_OPTIONS.map((speed) => {
          const isActive = playbackSpeed === speed;
          return (
            <TouchableOpacity
              key={speed}
              onPress={() => setSpeed(speed)}
              activeOpacity={0.7}
              style={styles.speedButtonWrapper}
            >
              {isActive ? (
                <LinearGradient
                  colors={[...Colors.gradientPrimary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.speedButton}
                >
                  <Text style={styles.speedTextActive}>{speed}x</Text>
                </LinearGradient>
              ) : (
                <View style={styles.speedButtonInactive}>
                  <Text style={styles.speedText}>{speed}x</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Speed Descriptions */}
      <View style={styles.descriptions}>
        <View style={styles.descRow}>
          <Snail size={16} color={Colors.textSecondary} />
          <Text style={styles.descText}>0.25x–0.75x for dramatic slow-mo</Text>
        </View>
        <View style={styles.descRow}>
          <Play size={16} color={Colors.textSecondary} />
          <Text style={styles.descText}>1x is normal playback speed</Text>
        </View>
        <View style={styles.descRow}>
          <Zap size={16} color={Colors.textSecondary} />
          <Text style={styles.descText}>1.5x–3x for time-lapse effects</Text>
        </View>
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.xl,
  },
  currentSpeed: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  currentSpeedValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primaryLight,
    letterSpacing: -1,
  },
  currentSpeedLabel: {
    ...Typography.labelMedium,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    flexWrap: 'wrap',
  },
  speedButtonWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  speedButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 56,
    alignItems: 'center',
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  speedButtonInactive: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 56,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  speedTextActive: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  speedText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  descriptions: {
    gap: Spacing.sm,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  descText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
});
