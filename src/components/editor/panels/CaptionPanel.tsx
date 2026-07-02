/**
 * OmniAI — Caption Panel
 * Add, customize, and schedule subtitles/captions with different styles and animations.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore } from '@/src/stores/editorStore';
import { Slider } from '@/src/components/ui/Slider';
import { Plus, Trash2, Wand2 } from 'lucide-react-native';
import ColorPicker from 'react-native-wheel-color-picker';

const STYLES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold Accent' },
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'highlight', label: 'Highlight' },
  { id: 'pop', label: 'Pop Scale' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'handwritten', label: 'Cursive' },
] as const;

const ANIMATIONS = [
  { id: 'none', label: 'None' },
  { id: 'fadeIn', label: 'Fade In' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'slide', label: 'Slide Up' },
  { id: 'pop', label: 'Scale Pop' },
  { id: 'wordByWord', label: 'Word By Word' },
] as const;

export function CaptionPanel() {
  const { captions, addCaption, removeCaption, durationMs } = useEditorStore();

  const [text, setText] = useState('');
  const [style, setStyle] = useState<typeof STYLES[number]['id']>('minimal');
  const [animation, setAnimation] = useState<typeof ANIMATIONS[number]['id']>('none');
  const [color, setColor] = useState('#FFFFFF');
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [startMs, setStartMs] = useState(0);
  const [endMs, setEndMs] = useState(Math.min(5000, durationMs));
  const [isDetecting, setIsDetecting] = useState(false);

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      // Mock generation of 3 timed captions
      addCaption({
        text: "Welcome to this awesome video!",
        style,
        animation,
        color,
        fontSize: style === 'bold' ? 24 : 18,
        position: style === 'karaoke' ? 'center' : 'bottom',
        startMs: 0,
        endMs: Math.min(2500, durationMs),
      });
      if (durationMs > 2500) {
         addCaption({
          text: "AI auto-captioning in action.",
          style,
          animation,
          color,
          fontSize: style === 'bold' ? 24 : 18,
          position: style === 'karaoke' ? 'center' : 'bottom',
          startMs: 2500,
          endMs: Math.min(5000, durationMs),
        });
      }
      setIsDetecting(false);
      Alert.alert('AI Auto Detect Complete', 'Captions generated successfully based on current style settings.');
    }, 2500);
  };

  const handleAdd = () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some caption text.');
      return;
    }
    if (startMs >= endMs) {
      Alert.alert('Error', 'Start time must be before end time.');
      return;
    }

    addCaption({
      text: text.trim(),
      style,
      animation,
      color,
      fontSize: style === 'bold' ? 24 : 18,
      position: style === 'karaoke' ? 'center' : 'bottom',
      startMs,
      endMs,
    });
    setText('');
    Alert.alert('Success', 'Caption added to timeline.');
  };

  const formatTime = (ms: number) => {
    const sec = (ms / 1000).toFixed(1);
    return `${sec}s`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Captions</Text>
      <Text style={styles.subtitle}>Add timed subtitles with animated typography presets</Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type captions here..."
          placeholderTextColor={Colors.placeholder}
          value={text}
          onChangeText={setText}
          maxLength={120}
        />
      </View>

      {/* Style & Animation Grid */}
      <Text style={styles.sectionTitle}>Caption Style</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {STYLES.map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setStyle(s.id)}
            style={[styles.chip, style === s.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, style === s.id && styles.chipTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Transition Animation</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {ANIMATIONS.map((a) => (
          <TouchableOpacity
            key={a.id}
            onPress={() => setAnimation(a.id)}
            style={[styles.chip, animation === a.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, animation === a.id && styles.chipTextActive]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Color Selection */}
      <View style={styles.colorHeader}>
        <Text style={styles.sectionTitle}>Caption Color</Text>
        <TouchableOpacity onPress={() => setShowColorWheel(!showColorWheel)}>
          <Text style={styles.toggleColorText}>
            {showColorWheel ? 'Hide Color Wheel' : 'Show Color Wheel'}
          </Text>
        </TouchableOpacity>
      </View>

      {showColorWheel && (
        <View style={styles.colorWheelContainer}>
          <ColorPicker
            color={color}
            onColorChangeComplete={setColor}
            thumbSize={30}
            sliderSize={30}
            noSnap={true}
            row={false}
          />
        </View>
      )}

      {/* Timeline Range */}
      <Text style={styles.sectionTitle}>Timeline Timing</Text>
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

      {/* Add Buttons */}
      <View style={{ flexDirection: 'column', gap: Spacing.sm, marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
        <TouchableOpacity onPress={handleAutoDetect} disabled={isDetecting} style={styles.addButtonWrapper}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            {isDetecting ? (
              <ActivityIndicator color={Colors.textPrimary} size="small" />
            ) : (
              <Wand2 size={20} color={Colors.textPrimary} />
            )}
            <Text style={styles.addButtonText}>
              {isDetecting ? 'Listening to audio...' : 'Auto Detect (AI) Captions'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAdd} style={styles.addButtonWrapper}>
          <LinearGradient
            colors={[...Colors.gradientPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            <Plus size={20} color={Colors.textPrimary} />
            <Text style={styles.addButtonText}>Add Manual Caption</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Current List */}
      {captions.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Active Subtitles ({captions.length})</Text>
          {captions.map((c) => (
            <View key={c.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listText} numberOfLines={1}>
                  "{c.text}"
                </Text>
                <Text style={styles.listSubtext}>
                  Style: {c.style} | Time: {formatTime(c.startMs)} - {formatTime(c.endMs)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeCaption(c.id)} style={styles.deleteButton}>
                <Trash2 size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Extra space */}
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
  inputContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  textInput: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scrollRow: {
    gap: Spacing.xs,
    paddingRight: Spacing.xl,
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  colorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleColorText: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
  },
  colorWheelContainer: {
    height: 250,
    marginBottom: Spacing.md,
  },
  timingContainer: {
    gap: Spacing.sm,
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
  addButtonWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
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

