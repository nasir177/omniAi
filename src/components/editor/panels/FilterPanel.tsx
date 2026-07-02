/**
 * OmniAI — Filter Panel
 * Horizontal scrollable filter presets.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore, FILTER_PRESETS } from '@/src/stores/editorStore';
import * as Icons from 'lucide-react-native';

export function FilterPanel() {
  const { activeFilterId, setFilter } = useEditorStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filters</Text>
      <Text style={styles.subtitle}>
        Choose a look for your video
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_PRESETS.map((filter) => {
          const isActive = activeFilterId === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setFilter(filter.id)}
              activeOpacity={0.7}
              style={[
                styles.filterCard,
                isActive && styles.filterCardActive,
              ]}
            >
              {/* Filter Preview */}
              <View
                style={[
                  styles.filterPreview,
                  isActive && styles.filterPreviewActive,
                ]}
              >
                <View
                  style={[
                    styles.filterTint,
                    {
                      backgroundColor:
                        filter.id === 'none' ? 'transparent' : filter.tint,
                      opacity: filter.id === 'none' ? 0 : filter.opacity * 2.5,
                    },
                  ]}
                />
                {(() => {
                  const IconComp = (Icons as any)[filter.iconName] || Icons.Circle;
                  return <IconComp size={28} color={isActive ? Colors.primaryLight : Colors.textPrimary} style={{ zIndex: 1 }} />;
                })()}
              </View>

              {/* Name */}
              <Text
                style={[
                  styles.filterName,
                  isActive && styles.filterNameActive,
                ]}
              >
                {filter.name}
              </Text>

              {/* Active Dot */}
              {isActive && <View style={styles.activeDot} />}
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
  filterCard: {
    alignItems: 'center',
    width: 76,
  },
  filterCardActive: {},
  filterPreview: {
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
  filterPreviewActive: {
    borderColor: Colors.primary,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  filterTint: {
    ...StyleSheet.absoluteFillObject,
  },
  filterEmoji: {
    fontSize: 28,
    zIndex: 1,
  },
  filterName: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  filterNameActive: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: Spacing.xs,
  },
});
