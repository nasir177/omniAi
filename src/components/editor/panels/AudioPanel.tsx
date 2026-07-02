/**
 * OmniAI — Audio Panel
 * Volume slider, mute toggle, and audio enhancement mock.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { Slider } from '@/src/components/ui/Slider';
import { useEditorStore } from '@/src/stores/editorStore';
import * as DocumentPicker from 'expo-document-picker';
import { Volume2, VolumeX, Sparkles, Music } from 'lucide-react-native';

export function AudioPanel() {
  const { volume, setVolume, isMuted, toggleMute } = useEditorStore();

  const handleEnhanceAudio = () => {
    Alert.alert(
      'AI Audio Enhancement',
      'Audio enhancement would reduce background noise and boost voice clarity.\n\nThis feature requires a dev build with native audio processing.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleImportAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      const file = result.assets[0];
      Alert.alert('Audio Imported', `Successfully selected ${file.name}`);
      // TODO: Save audio to editor store here
    } catch (error) {
      console.log('Error picking audio:', error);
      Alert.alert('Error', 'Failed to pick audio file.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio</Text>

      {/* Volume Control */}
      <View style={styles.section}>
        <View style={styles.muteRow}>
          <Text style={styles.sectionLabel}>Volume</Text>
          <TouchableOpacity
            onPress={toggleMute}
            style={[styles.muteButton, isMuted && styles.muteButtonActive]}
          >
            {isMuted ? (
              <VolumeX size={16} color={Colors.error} />
            ) : (
              <Volume2 size={16} color={Colors.textSecondary} />
            )}
            <Text
              style={[
                styles.muteText,
                isMuted && styles.muteTextActive,
              ]}
            >
              {isMuted ? 'Muted' : 'On'}
            </Text>
          </TouchableOpacity>
        </View>

        <Slider
          value={isMuted ? 0 : volume}
          min={0}
          max={1}
          step={0.05}
          onValueChange={setVolume}
          formatValue={(v) => `${Math.round(v * 100)}%`}
          showValue
        />
      </View>

      {/* Volume Presets */}
      <View style={styles.presetsRow}>
        {[
          { label: '25%', value: 0.25 },
          { label: '50%', value: 0.5 },
          { label: '75%', value: 0.75 },
          { label: '100%', value: 1 },
        ].map((preset) => (
          <TouchableOpacity
            key={preset.label}
            onPress={() => {
              setVolume(preset.value);
              if (isMuted) toggleMute();
            }}
            style={[
              styles.presetButton,
              Math.abs(volume - preset.value) < 0.01 &&
                !isMuted &&
                styles.presetButtonActive,
            ]}
          >
            <Text
              style={[
                styles.presetText,
                Math.abs(volume - preset.value) < 0.01 &&
                  !isMuted &&
                  styles.presetTextActive,
              ]}
            >
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Enhancement & Import */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={handleImportAudio}
          activeOpacity={0.8}
          style={styles.importButton}
        >
          <Music size={24} color={Colors.textPrimary} />
          <View>
            <Text style={styles.actionTitle}>Import Music</Text>
            <Text style={styles.actionSubtitle}>
              Add audio from your device
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEnhanceAudio}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[...Colors.gradientCool]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enhanceButton}
          >
            <Sparkles size={24} color="#FFF" />
            <View>
              <Text style={styles.actionTitle}>Enhance Audio</Text>
              <Text style={styles.actionSubtitle}>
                AI noise reduction & voice boost
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  muteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  muteButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: Colors.error,
  },
  muteText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  muteTextActive: {
    color: Colors.error,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  presetButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  presetText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  presetTextActive: {
    color: Colors.primaryLight,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  actionTitle: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
});
