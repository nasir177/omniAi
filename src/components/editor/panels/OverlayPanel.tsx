/**
 * OmniAI — Overlay Panel
 * Add picture-in-picture video clips.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore } from '@/src/stores/editorStore';
import * as DocumentPicker from 'expo-document-picker';
import { Plus, Trash2, Layers } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function OverlayPanel() {
  const { videoOverlays, addVideoOverlay, removeVideoOverlay, durationMs } = useEditorStore();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportVideo = async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        addVideoOverlay({
          uri: file.uri,
          x: 0.5,
          y: 0.5,
          scale: 0.4,
          startMs: 0,
          endMs: durationMs,
        });
        Alert.alert('Success', 'Video clip added as overlay.');
      }
    } catch (err) {
      Alert.alert('Import Failed', 'Could not import the video file.');
    } finally {
      setIsImporting(false);
    }
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Video Overlay</Text>
      <Text style={styles.subtitle}>Add Picture-in-Picture (PiP) video clips on top of your main video</Text>

      {/* Import Button */}
      <TouchableOpacity 
        onPress={handleImportVideo} 
        style={styles.addButtonWrapper}
        disabled={isImporting}
      >
        <LinearGradient
          colors={[...Colors.gradientPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addButton}
        >
          <Layers size={20} color={Colors.textPrimary} />
          <Text style={styles.addButtonText}>
            {isImporting ? 'Importing...' : 'Import Video Clip'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Current List */}
      {videoOverlays.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Active Overlays ({videoOverlays.length})</Text>
          {videoOverlays.map((o) => (
            <View key={o.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listText} numberOfLines={1}>
                  Video Overlay
                </Text>
                <Text style={styles.listSubtext}>
                  Time: {formatTime(o.startMs)} - {formatTime(o.endMs)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeVideoOverlay(o.id)} style={styles.deleteButton}>
                <Trash2 size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
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
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  addButtonWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItemLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  listText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  listSubtext: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
