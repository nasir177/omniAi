/**
 * OmniAI — Effects Panel
 * Visual effect presets overlay selection.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore, EFFECT_PRESETS } from '@/src/stores/editorStore';
import * as Icons from 'lucide-react-native';

export function EffectPanel() {
  const { activeEffectId, setEffect } = useEditorStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visual Effects</Text>
      <Text style={styles.subtitle}>
        Apply stylized visual filters to make your video pop
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {EFFECT_PRESETS.map((effect) => {
          const isActive = activeEffectId === effect.id;
          return (
            <TouchableOpacity
              key={effect.id}
              onPress={() => setEffect(effect.id)}
              activeOpacity={0.7}
              style={[
                styles.effectCard,
                isActive && styles.effectCardActive,
              ]}
            >
              {/* Effect Preview Circle */}
              <View
                style={[
                  styles.effectPreview,
                  isActive && styles.effectPreviewActive,
                ]}
              >
                {(() => {
                  const IconComp = (Icons as any)[effect.iconName] || Icons.Circle;
                  return <IconComp size={28} color={isActive ? Colors.primaryLight : Colors.textPrimary} />;
                })()}
              </View>

              {/* Name */}
              <Text
                style={[
                  styles.effectName,
                  isActive && styles.effectNameActive,
                ]}
                numberOfLines={1}
              >
                {effect.name}
              </Text>

              {/* Description */}
              <Text style={styles.effectDesc} numberOfLines={2}>
                {effect.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingRight: Spacing.xl,
    gap: Spacing.md,
  },
  effectCard: {
    alignItems: 'center',
    width: 90,
  },
  effectCardActive: {},
  effectPreview: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  effectPreviewActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  effectEmoji: {
    fontSize: 28,
  },
  effectName: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  effectNameActive: {
    color: Colors.primaryLight,
  },
  effectDesc: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 12,
  },
});
