/**
 * OmniAI — Text Overlay Panel
 * Add text overlays with font size, color, and position controls.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { Button } from '@/src/components/ui/Button';
import { Slider } from '@/src/components/ui/Slider';
import { useEditorStore } from '@/src/stores/editorStore';
import ColorPicker from 'react-native-wheel-color-picker';

const COLOR_PRESETS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Cyan', value: '#06B6D4' },
];

const POSITIONS = [
  { id: 'top' as const, label: 'Top' },
  { id: 'center' as const, label: 'Center' },
  { id: 'bottom' as const, label: 'Bottom' },
];

export function TextPanel() {
  const { durationMs, addTextOverlay, textOverlays, removeTextOverlay, setActiveTool } =
    useEditorStore();

  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#FFFFFF');
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [showColorWheel, setShowColorWheel] = useState(false);

  const handleAdd = () => {
    if (!text.trim()) {
      Alert.alert('Enter Text', 'Please type some text first.');
      return;
    }
    addTextOverlay({
      text: text.trim(),
      fontSize,
      color,
      position,
      startMs: 0,
      endMs: durationMs,
    });
    setText('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Add Text</Text>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Enter your text..."
        placeholderTextColor={Colors.placeholder}
        multiline
        maxLength={200}
      />

      {/* Font Size */}
      <Slider
        label="Font Size"
        value={fontSize}
        min={12}
        max={72}
        step={1}
        onValueChange={setFontSize}
        formatValue={(v) => `${v}px`}
      />

      {/* Color Picker Toggle */}
      <View style={styles.colorHeader}>
        <Text style={styles.sectionLabel}>Color</Text>
        <TouchableOpacity onPress={() => setShowColorWheel(!showColorWheel)}>
          <Text style={styles.toggleColorText}>
            {showColorWheel ? 'Use Presets' : 'Custom Color Wheel'}
          </Text>
        </TouchableOpacity>
      </View>

      {showColorWheel ? (
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
      ) : (
        <View style={styles.colorRow}>
          {COLOR_PRESETS.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setColor(c.value)}
              style={[
                styles.colorSwatch,
                { backgroundColor: c.value },
                color === c.value && styles.colorSwatchActive,
              ]}
            >
              {color === c.value && (
                <Text style={[styles.checkmark, c.value === '#FFFFFF' && { color: '#000' }]}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Position */}
      <Text style={styles.sectionLabel}>Position</Text>
      <View style={styles.positionRow}>
        {POSITIONS.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setPosition(p.id)}
            style={[
              styles.positionButton,
              position === p.id && styles.positionButtonActive,
            ]}
          >
            <Text
              style={[
                styles.positionLabel,
                position === p.id && styles.positionLabelActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Preview */}
      {text.trim() !== '' && (
        <View style={styles.preview}>
          <Text style={[styles.previewText, { fontSize: Math.min(fontSize, 32), color }]}>
            {text}
          </Text>
        </View>
      )}

      {/* Add Button */}
      <Button title="Add Text Overlay" onPress={handleAdd} fullWidth size="lg" />

      {/* Existing Overlays */}
      {textOverlays.length > 0 && (
        <View style={styles.existingSection}>
          <Text style={styles.sectionLabel}>
            Added ({textOverlays.length})
          </Text>
          {textOverlays.map((overlay) => (
            <View key={overlay.id} style={styles.overlayItem}>
              <Text style={styles.overlayText} numberOfLines={1}>
                "{overlay.text}"
              </Text>
              <TouchableOpacity onPress={() => removeTextOverlay(overlay.id)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Spacer */}
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
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    minHeight: 56,
    marginBottom: Spacing.md,
  },
  colorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  toggleColorText: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
  },
  colorWheelContainer: {
    height: 250,
    marginBottom: Spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  positionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  positionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  positionButtonActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  positionLabel: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  positionLabelActive: {
    color: Colors.primaryLight,
  },
  preview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewText: {
    fontWeight: '600',
  },
  existingSection: {
    marginTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overlayText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    flex: 1,
  },
  removeBtn: {
    fontSize: 16,
    color: Colors.error,
    paddingLeft: Spacing.md,
  },
});
