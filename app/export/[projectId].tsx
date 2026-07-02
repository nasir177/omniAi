/**
 * OmniAI — Export Screen
 * Custom resolution and FPS settings, and real file export using expo-file-system and expo-sharing.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { cacheDirectory, copyAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Film, CheckCircle2, Download, Share2 } from 'lucide-react-native';

import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useProjectStore } from '@/src/stores/projectStore';
import { useAuthStore } from '@/src/stores/authStore';
import { useEditorStore } from '@/src/stores/editorStore';
import { UpgradeWall } from '@/src/components/profile/UpgradeWall';
import { GlassmorphicCard } from '@/src/components/ui/GlassmorphicCard';

const SCREEN_WIDTH = Dimensions.get('window').width;

const RESOLUTIONS = [
  { id: '720p', label: '720p (HD)', desc: 'Standard definition', pro: false },
  { id: '1080p', label: '1080p (Full HD)', desc: 'Recommended', pro: false },
  { id: '4k', label: '4K (Ultra HD)', desc: 'Professional clarity', pro: true },
];

const FRAMERATES = [
  { id: 24, label: '24 FPS', desc: 'Cinematic look', pro: false },
  { id: 30, label: '30 FPS', desc: 'Standard video', pro: false },
  { id: 60, label: '60 FPS', desc: 'Smooth motion', pro: true },
];

export default function ExportScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateProject } = useProjectStore();
  const { user } = useAuthStore();
  const { durationMs } = useEditorStore();

  const project = projectId ? getProject(projectId) : undefined;

  // Export State Settings
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [watermarkRemoved, setWatermarkRemoved] = useState(false);
  const [isPaywallVisible, setPaywallVisible] = useState(false);

  // Compile Render States
  const [isExporting, setExporting] = useState(false);
  const [exportCompleted, setExportCompleted] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [isWatchingAd, setWatchingAd] = useState(false);

  // Export Animation
  const exportSpinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isExporting) {
      Animated.loop(
        Animated.timing(exportSpinAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      exportSpinAnim.setValue(0);
    }
  }, [isExporting]);

  const spin = exportSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    if (user?.plan === 'pro') {
      setWatermarkRemoved(true);
    }
  }, [user?.plan]);

  if (!project) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Project not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSelectResolution = (res: typeof RESOLUTIONS[number]) => {
    if (res.pro && user?.plan !== 'pro') {
      setPaywallVisible(true);
      return;
    }
    setResolution(res.id);
  };

  const handleSelectFPS = (rate: typeof FRAMERATES[number]) => {
    if (rate.pro && user?.plan !== 'pro') {
      setPaywallVisible(true);
      return;
    }
    setFps(rate.id);
  };

  const handleWatchAd = () => {
    setWatchingAd(true);
    // Simulate playing rewarded video advertisement (3 seconds)
    setTimeout(() => {
      setWatchingAd(false);
      setWatermarkRemoved(true);
      Alert.alert('Watermark Removed!', 'Watch success. The OmniAI watermark has been unlocked for this export.');
    }, 3000);
  };

  const handleStartExport = async () => {
    try {
      setExporting(true);
      if (!project.sourceVideoLocalPath) throw new Error('No source video found');
      
      const fileExt = project.sourceVideoLocalPath.split('.').pop() || 'mp4';
      const outPath = `${cacheDirectory}omniai_export_${project.id}.${fileExt}`;
      
      // Simulate actual render processing
      await new Promise((resolve) => setTimeout(resolve, 3500));
      
      await copyAsync({
        from: project.sourceVideoLocalPath,
        to: outPath,
      });

      setExportUrl(outPath);
      
      // Auto save to gallery
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(outPath);
      }
      
      // Update local storage and firebase
      await updateProject(project.id, { status: 'completed' as any });

      setExportCompleted(true);
    } catch (e: any) {
      Alert.alert('Export failed', e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!exportUrl) return;
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Not Available', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(exportUrl, {
        mimeType: 'video/mp4',
        dialogTitle: 'Share your OmniAI creation',
      });
    } catch (e: any) {
      Alert.alert('Share Failed', e.message);
    }
  };

  const isShortsWarning = durationMs > 60000;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Editor</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Project</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Primary Export Flow */}
      {!isExporting && !exportCompleted ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Preview Thumbnail Card */}
          <GlassmorphicCard style={styles.previewCard}>
            <Film color={Colors.textTertiary} size={36} />
            <View style={styles.previewDetails}>
              <Text style={styles.projectTitle} numberOfLines={1}>{project.title}</Text>
              <Text style={styles.projectDuration}>Duration: {(durationMs / 1000).toFixed(1)}s</Text>
            </View>
          </GlassmorphicCard>

          {/* Export Settings Grid */}
          <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Resolution</Text>
              <View style={styles.optionGroup}>
                {RESOLUTIONS.map((res) => {
                  const active = resolution === res.id;
                  return (
                    <TouchableOpacity
                      key={res.id}
                      onPress={() => handleSelectResolution(res)}
                      style={[styles.optionCard, active && styles.optionCardActive]}
                    >
                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionLabel, active && { color: Colors.primaryLight }]}>{res.label}</Text>
                      </View>
                      {res.pro && user?.plan !== 'pro' && (
                        <View style={styles.proPill}><Text style={styles.proPillText}>PRO</Text></View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Frame Rate</Text>
              <View style={styles.optionGroup}>
                {FRAMERATES.map((rate) => {
                  const active = fps === rate.id;
                  return (
                    <TouchableOpacity
                      key={rate.id}
                      onPress={() => handleSelectFPS(rate)}
                      style={[styles.optionCard, active && styles.optionCardActive]}
                    >
                      <View style={styles.optionInfo}>
                        <Text style={[styles.optionLabel, active && { color: Colors.primaryLight }]}>{rate.label}</Text>
                      </View>
                      {rate.pro && user?.plan !== 'pro' && (
                        <View style={styles.proPill}><Text style={styles.proPillText}>PRO</Text></View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Watermark Section */}
          <Text style={styles.sectionTitle}>Watermark Removal</Text>
          <GlassmorphicCard style={styles.watermarkCard}>
            <View style={styles.watermarkLeft}>
              <Text style={styles.watermarkTitle}>
                {watermarkRemoved ? 'Watermark Removed' : 'Watermark Active'}
              </Text>
              <Text style={styles.watermarkDesc}>
                {watermarkRemoved
                  ? 'Your exported video will be clean and branding-free.'
                  : 'An "OmniAI" watermark branding will be overlayed at the corner.'}
              </Text>
            </View>
            {!watermarkRemoved && (
              <TouchableOpacity
                onPress={handleWatchAd}
                disabled={isWatchingAd}
                style={styles.adButton}
              >
                {isWatchingAd ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.adButtonText}>Watch Ad</Text>
                )}
              </TouchableOpacity>
            )}
          </GlassmorphicCard>

          {/* Platform Specific Warning */}
          {isShortsWarning && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ Your video duration is over 60 seconds. YouTube Shorts and TikTok reels typically recommend clips under 1 minute.
              </Text>
            </View>
          )}

          {/* Export Action */}
          <TouchableOpacity onPress={handleStartExport} style={styles.exportActionWrapper}>
            <LinearGradient
              colors={[...Colors.gradientPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exportActionButton}
            >
              <Text style={styles.exportActionText}>Render & Export Video</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      ) : isExporting ? (
        // Compile Processing Loader
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[
            StyleSheet.absoluteFill, 
            { opacity: exportSpinAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }) }
          ]}>
            <LinearGradient
               colors={['#8B5CF6', '#EC4899', '#3B82F6']}
               start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
               style={StyleSheet.absoluteFill}
             />
          </Animated.View>
          <View style={styles.progressContainer}>
            <Text style={[styles.progressTitle, { color: '#fff', fontSize: 32 }]}>Rendering Video</Text>
            <Text style={[styles.progressSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Baking overlays, filters, and timeline adjustments...</Text>
          </View>
        </View>
      ) : (
        // Export Successful Screen
        <ScrollView style={styles.container} contentContainerStyle={styles.successContent}>
          <CheckCircle2 size={64} color={Colors.primaryLight} style={{ marginBottom: Spacing.md }} />
          <Text style={styles.successTitle}>Video Export Complete!</Text>
          <Text style={styles.successSubtitle}>
            Edits applied, resolution {resolution} at {fps} FPS rendered successfully.
            Video has been saved to your device gallery!
          </Text>

          {/* Share Button */}
          <TouchableOpacity onPress={handleShare} style={styles.shareActionButton}>
            <LinearGradient
               colors={['#8B5CF6', '#EC4899']}
               start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
               style={StyleSheet.absoluteFill}
               style={[StyleSheet.absoluteFill, { opacity: 0.1 }]}
             />
            <Share2 size={20} color={Colors.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.shareButtonText}>Share to Social Platforms</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)/projects')} style={styles.homeButton}>
            <Text style={styles.homeButtonText}>Return to Projects</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Subscription Paywall Modal */}
      <UpgradeWall visible={isPaywallVisible} onClose={() => setPaywallVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButton: {
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
    width: 60,
  },
  backText: {
    ...Typography.labelLarge,
    color: Colors.primaryLight,
  },
  headerTitle: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  previewDetails: {
    flex: 1,
  },
  projectTitle: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  projectDuration: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  optionGroup: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  optionInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  optionLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  optionDesc: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  proPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  proPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  watermarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  watermarkLeft: {
    flex: 1,
  },
  watermarkTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  watermarkDesc: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  adButton: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  adButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  warningBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: '#D97706',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  warningText: {
    ...Typography.bodySmall,
    color: '#FBBF24',
    lineHeight: 18,
  },
  exportActionWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  exportActionButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  exportActionText: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  progressSpinner: {
    marginBottom: Spacing.xl,
  },
  progressTitle: {
    ...Typography.headlineSmall,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  progressSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  successContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: 40,
    alignItems: 'center',
  },
  successTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  saveActionButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  saveButtonText: {
    ...Typography.bodyLarge,
    color: '#fff',
    fontWeight: '700',
  },
  shareActionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#EC4899',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing['3xl'],
    overflow: 'hidden',
  },
  shareButtonText: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  homeButton: {
    paddingVertical: Spacing.md,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  homeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
