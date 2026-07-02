/**
 * OmniAI — Stickers Panel
 * Image/Meme stickers selection and positioning.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore } from '@/src/stores/editorStore';
import { Slider } from '@/src/components/ui/Slider';
import { Trash2 } from 'lucide-react-native';

const STICKERS = [
  { url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif', label: 'Wow' },
  { url: 'https://media.giphy.com/media/l41YmQjOz9qg2Ecow/giphy.gif', label: 'Clap' },
  { url: 'https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif', label: 'Cat' },
  { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTk4NWNkODdkOWVjOGZkZjRiMDljNjJiMzQ5NzcwOWIyYzNhMmNiNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/tIe6P45JpD5T2/giphy.gif', label: 'Laugh' },
  { url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', label: 'Cat Typing' },
  { url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', label: 'Mind Blown' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2165/2165564.png', label: 'Like' },
  { url: 'https://cdn-icons-png.flaticon.com/512/11513/11513076.png', label: 'Star' },
  { url: 'https://cdn-icons-png.flaticon.com/512/4780/4780119.png', label: 'Heart' },
  { url: 'https://cdn-icons-png.flaticon.com/512/2836/2836611.png', label: 'Smile' },
  { url: 'https://cdn-icons-png.flaticon.com/512/1020/1020963.png', label: 'Cool' },
  { url: 'https://cdn-icons-png.flaticon.com/512/743/743276.png', label: 'Fire' },
  { url: 'https://cdn-icons-png.flaticon.com/512/1182/1182136.png', label: 'Target' },
];

export function StickersPanel() {
  const { stickers, addSticker, removeSticker, durationMs } = useEditorStore();

  const [startMs, setStartMs] = useState(0);
  const [endMs, setEndMs] = useState(Math.min(3000, durationMs));

  const handleSelectSticker = (url: string, label: string) => {
    if (startMs >= endMs) {
      Alert.alert('Error', 'Start time must be before end time.');
      return;
    }

    addSticker({
      url,
      x: 0.5, // Center coordinates
      y: 0.5,
      scale: 1.0,
      startMs,
      endMs,
    });
    Alert.alert('Sticker Added', `"${label}" sticker added to the center of the timeline.`);
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Stickers</Text>
      <Text style={styles.subtitle}>Tap a sticker to place it on the screen</Text>

      {/* Timing Selection */}
      <Text style={styles.sectionTitle}>Set Sticker Timing</Text>
      <View style={styles.timingContainer}>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>Start: {formatTime(startMs)}</Text>
          <View style={styles.sliderWrapper}>
            <Slider
              value={startMs}
              min={0}
              max={durationMs}
              step={100}
              onValueChange={(val) => setStartMs(Math.min(val, endMs - 100))}
            />
          </View>
        </View>

        <View style={styles.sliderRow}>
          <Text style={styles.sliderLabel}>End: {formatTime(endMs)}</Text>
          <View style={styles.sliderWrapper}>
            <Slider
              value={endMs}
              min={0}
              max={durationMs}
              step={100}
              onValueChange={(val) => setEndMs(Math.max(val, startMs + 100))}
            />
          </View>
        </View>
      </View>

      {/* Stickers Grid */}
      <Text style={styles.sectionTitle}>Available Stickers</Text>
      <View style={styles.grid}>
        {STICKERS.map((sticker, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSelectSticker(sticker.url, sticker.label)}
            activeOpacity={0.7}
            style={styles.stickerItem}
          >
            <Image source={{ uri: sticker.url }} style={styles.stickerImage} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Active stickers list */}
      {stickers.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Stickers on Video ({stickers.length})</Text>
          {stickers.map((s) => (
            <View key={s.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Image source={{ uri: s.url }} style={styles.listImage} resizeMode="contain" />
                <View>
                  <Text style={styles.listLabel}>Sticker Overlay</Text>
                  <Text style={styles.listSubtext}>
                    Active: {formatTime(s.startMs)} - {formatTime(s.endMs)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeSticker(s.id)} style={styles.deleteButton}>
                <Trash2 size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Bottom spacer */}
      <View style={{ height: 40 }} />
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
  timingContainer: {
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sliderLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    width: 90,
  },
  sliderWrapper: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
    marginBottom: Spacing.lg,
  },
  stickerItem: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  listImage: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
  },
  listLabel: {
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

