/**
 * OmniAI — Editor Toolbar
 * Horizontal scrollable tool buttons at the bottom of the editor.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore } from '@/src/stores/editorStore';
import type { EditorTool } from '@/src/types/project';

interface ToolDef {
  id: EditorTool;
  emoji: string;
  label: string;
}

const TOOLS: ToolDef[] = [
  { id: 'trim', emoji: '✂️', label: 'Trim' },
  { id: 'text', emoji: '📝', label: 'Text' },
  { id: 'captions', emoji: '💬', label: 'Captions' },
  { id: 'filter', emoji: '🎨', label: 'Filter' },
  { id: 'effects', emoji: '✨', label: 'Effects' },
  { id: 'stickers', emoji: '🎭', label: 'Stickers' },
  { id: 'speed', emoji: '⏩', label: 'Speed' },
  { id: 'audio', emoji: '🔊', label: 'Audio' },
  { id: 'adjust', emoji: '🎚️', label: 'Adjust' },
  { id: 'ai', emoji: '🤖', label: 'AI' },
];

export function EditorToolbar() {
  const { activeTool, setActiveTool } = useEditorStore();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <TouchableOpacity
              key={tool.id}
              onPress={() => setActiveTool(tool.id)}
              activeOpacity={0.7}
              style={styles.toolButton}
            >
              {isActive ? (
                <LinearGradient
                  colors={[...Colors.gradientPrimary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.toolIconContainer}
                >
                  <Text style={styles.toolEmoji}>{tool.emoji}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toolIconContainerInactive}>
                  <Text style={styles.toolEmoji}>{tool.emoji}</Text>
                </View>
              )}
              <Text
                style={[
                  styles.toolLabel,
                  isActive && styles.toolLabelActive,
                ]}
              >
                {tool.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minWidth: 56,
  },
  toolIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  toolIconContainerInactive: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolEmoji: {
    fontSize: 20,
  },
  toolLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  toolLabelActive: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
});
