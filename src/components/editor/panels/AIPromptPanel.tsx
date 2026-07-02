/**
 * OmniAI — AI Prompt Panel
 * Natural-language editing command input with suggestion chips.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { Chip } from '@/src/components/ui/Chip';
import { useEditorStore } from '@/src/stores/editorStore';
import { useAuthStore } from '@/src/stores/authStore';
import { processAIPrompt, getEditorChanges } from '@/src/services/ai/aiService';
import { AI_LIMITS } from '@/src/utils/constants';
import { 
  Sun, Snail, Film, Zap, CircleDashed, MessageSquare, 
  Eraser, VolumeX, WifiOff, Wifi, Wand2, AlertTriangle, ArrowRight 
} from 'lucide-react-native';

const SUGGESTIONS = [
  { label: 'Warm filter', Icon: Sun },
  { label: 'Slow motion', Icon: Snail },
  { label: 'Cinematic look', Icon: Film },
  { label: 'Speed up 2x', Icon: Zap },
  { label: 'Black & white', Icon: CircleDashed },
  { label: 'Add caption', Icon: MessageSquare },
  { label: 'Remove filter', Icon: Eraser },
  { label: 'Mute audio', Icon: VolumeX },
];

export function AIPromptPanel() {
  const [prompt, setPrompt] = useState('');
  const [isOffline, setOffline] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const {
    isAIProcessing,
    setAIProcessing,
    aiPromptHistory,
    addAIResult,
    durationMs,
    setFilter,
    setSpeed,
    setVolume,
    toggleMute,
    setTrimStart,
    addTextOverlay,
    isMuted,
  } = useEditorStore();

  const { user, incrementAIPrompts, canUseAI } = useAuthStore();

  const startShimmer = () => {
    shimmerAnim.setValue(0);
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleSubmit = async (text?: string) => {
    if (isOffline) {
      Alert.alert(
        'Offline Mode Active',
        'AI parsing requires an internet connection. Please disable offline simulation or connect to proceed.',
        [{ text: 'OK' }]
      );
      return;
    }

    const promptText = (text || prompt).trim();
    if (!promptText) return;

    // Check AI limits
    if (!canUseAI()) {
      Alert.alert(
        'Daily Limit Reached',
        `You've used all ${AI_LIMITS.FREE_PROMPTS_PER_DAY} free AI prompts today.\n\nUpgrade to Pro for unlimited AI editing!`,
        [{ text: 'OK' }]
      );
      return;
    }

    setAIProcessing(true);
    startShimmer();
    setPrompt('');

    try {
      // Simulate wait to show awesome gradient blur effect
      await new Promise(resolve => setTimeout(resolve, 3000));
      const result = await processAIPrompt(promptText, durationMs);
      addAIResult(result);

      // Apply editor changes
      const changes = getEditorChanges(promptText);
      if (changes.filter) setFilter(changes.filter);
      if (changes.speed) setSpeed(changes.speed);
      if (changes.volume !== undefined) {
        setVolume(changes.volume);
        if (changes.volume === 0 && !isMuted) toggleMute();
      }
      if (changes.trimStart) setTrimStart(changes.trimStart);
      if (changes.textOverlay) {
        addTextOverlay({
          text: changes.textOverlay.text,
          fontSize: 24,
          color: changes.textOverlay.color,
          position: changes.textOverlay.position,
          startMs: 0,
          endMs: durationMs,
        });
      }

      // Count prompt usage
      incrementAIPrompts();
    } catch (error: any) {
      Alert.alert('AI Error', error.message || 'Something went wrong');
    } finally {
      setAIProcessing(false);
    }
  };

  const promptsUsed = user?.aiPromptsUsedToday || 0;
  const promptsTotal = AI_LIMITS.FREE_PROMPTS_PER_DAY + (user?.bonusPrompts || 0);
  const isPro = user?.plan === 'pro';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>AI Editor</Text>
        {!isPro && (
          <View style={styles.usageBadge}>
            <Text style={styles.usageText}>
              {promptsUsed}/{promptsTotal} today
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>
        Describe what you want to change in natural language
      </Text>

      {/* Connection Mode Toggle */}
      <TouchableOpacity
        onPress={() => setOffline(!isOffline)}
        style={[styles.offlineToggle, isOffline && styles.offlineToggleActive]}
      >
        <View style={styles.iconLabel}>
          {isOffline ? <WifiOff size={16} color="#FBBF24" /> : <Wifi size={16} color={Colors.textTertiary} />}
          <Text style={[styles.offlineToggleText, isOffline && styles.offlineToggleTextActive]}>
            {isOffline ? 'Simulated Offline Mode (AI Locked)' : 'Simulated Online Mode (AI Active)'}
          </Text>
        </View>
      </TouchableOpacity>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <View style={styles.iconLabel}>
            <AlertTriangle size={16} color="#FCA5A5" />
            <Text style={styles.offlineBannerText}>
              AI commands require internet. Use manual editor tools or click the status bar to connect.
            </Text>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder='Try "Make it cinematic" or "Slow motion"...'
          placeholderTextColor={Colors.placeholder}
          editable={!isAIProcessing}
          onSubmitEditing={() => handleSubmit()}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={() => handleSubmit()}
          disabled={isAIProcessing || !prompt.trim()}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              isAIProcessing || !prompt.trim()
                ? ['#374151', '#374151']
                : [...Colors.gradientPrimary]
            }
            style={styles.sendButton}
          >
            {isAIProcessing ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <ArrowRight size={20} color={Colors.textPrimary} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Suggestion Chips */}
      <View style={styles.chipsContainer}>
        {SUGGESTIONS.map((s) => (
          <Chip
            key={s.label}
            label={s.label}
            icon={<s.Icon size={14} color={Colors.textSecondary} />}
            onPress={() => handleSubmit(s.label)}
          />
        ))}
      </View>

      {/* Processing Animation */}
      {isAIProcessing && (
        <View style={styles.processingCard}>
          <Animated.View
            style={[
              styles.shimmer,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          >
            <Wand2 size={24} color={Colors.primaryLight} />
            <Text style={styles.processingText}>AI is analyzing your video...</Text>
          </Animated.View>
        </View>
      )}

      {/* History */}
      {aiPromptHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>History</Text>
          {[...aiPromptHistory].reverse().map((result) => (
            <View key={result.id} style={styles.historyItem}>
              <View style={styles.historyPromptRow}>
                <Text style={styles.historyPromptLabel}>You:</Text>
                <Text style={styles.historyPrompt} numberOfLines={2}>
                  {result.prompt}
                </Text>
              </View>
              <View style={styles.historyResponseRow}>
                <Text style={styles.historyResponse}>{result.response}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.headlineSmall,
    color: Colors.textPrimary,
  },
  usageBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  usageText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  processingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  shimmer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  processingText: {
    ...Typography.bodyMedium,
    color: Colors.primaryLight,
  },
  historySection: {
    marginBottom: Spacing['4xl'],
  },
  historyTitle: {
    ...Typography.labelMedium,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  historyItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyPromptRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  historyPromptLabel: {
    ...Typography.labelSmall,
    color: Colors.primaryLight,
  },
  historyPrompt: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  historyResponseRow: {},
  historyResponse: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  offlineToggle: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  offlineToggleActive: {
    borderColor: '#D97706',
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  offlineToggleText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  offlineToggleTextActive: {
    color: '#FBBF24',
    fontWeight: '600',
  },
  offlineBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  offlineBannerText: {
    ...Typography.bodySmall,
    color: '#FCA5A5',
    lineHeight: 18,
    flex: 1,
  },
});
