/**
 * OmniAI — Projects Screen (Home)
 * Local-First: Guests can create up to 3 projects locally.
 * Authenticated users get unlimited cloud-synced projects.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { GlassmorphicCard } from '@/src/components/ui/GlassmorphicCard';
import { ProjectCard } from '@/src/components/projects/ProjectCard';
import { NewProjectFAB } from '@/src/components/projects/NewProjectFAB';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/stores/authStore';
import { useProjectStore } from '@/src/stores/projectStore';
import { APP_NAME, VIDEO_LIMITS, AI_LIMITS } from '@/src/utils/constants';
import type { Project } from '@/src/types/project';
import { Film, User, Cloud, CloudOff, Rocket } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Guest Soft-Limit Bottom Sheet ────────────────────────────────────────────
function GuestLimitSheet({
  visible,
  onClose,
  onSignIn,
}: {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
}) {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[styles.sheetContainer, { transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Icon */}
            <View style={styles.sheetIconRow}>
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sheetIconBg}
              >
                <Rocket size={32} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.sheetTitle}>You're on a roll! 🚀</Text>
            <Text style={styles.sheetSubtitle}>
              You've used all {AI_LIMITS.GUEST_PROJECT_LIMIT} guest project slots. Create a
              free account to unlock{' '}
              <Text style={styles.sheetHighlight}>unlimited cloud projects & AI features.</Text>
            </Text>

            <View style={styles.sheetFeatureList}>
              {[
                '☁️  Cloud backup — never lose your work',
                '🤖  Unlimited AI-powered edits',
                '📤  Export in 1080p without watermark',
                '🎨  Access all premium templates',
              ].map((f) => (
                <Text key={f} style={styles.sheetFeatureItem}>
                  {f}
                </Text>
              ))}
            </View>

            <Button
              title="Create Free Account →"
              onPress={onSignIn}
              fullWidth
              size="lg"
              style={{ marginBottom: Spacing.md }}
            />
            <Button
              title="Maybe Later"
              onPress={onClose}
              variant="ghost"
              fullWidth
              size="md"
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Guest Backup Banner ────────────────────────────────────────────────────────
function GuestBackupBanner({ onSignIn }: { onSignIn: () => void }) {
  return (
    <TouchableOpacity style={styles.banner} onPress={onSignIn} activeOpacity={0.85}>
      <CloudOff size={16} color="#F59E0B" style={{ marginRight: 8 }} />
      <Text style={styles.bannerText}>
        Projects saved locally only.{' '}
        <Text style={styles.bannerLink}>Sign in to back up to cloud →</Text>
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ProjectsScreen() {
  const router = useRouter();
  const { user, isGuest, skipLogin } = useAuthStore();
  const { projects, isLoading, loadProjects, createProject, deleteProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showLimitSheet, setShowLimitSheet] = useState(false);

  // Load projects: pass userId for real users, null for guests
  useEffect(() => {
    loadProjects(isGuest ? null : user?.id ?? null);
  }, [user?.id, isGuest]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects(isGuest ? null : user?.id ?? null);
    setRefreshing(false);
  }, [user?.id, isGuest]);

  const handleSignIn = () => {
    router.replace('/(auth)/login');
  };

  const handleNewProject = async () => {
    // Guest soft limit check
    if (isGuest && projects.length >= AI_LIMITS.GUEST_PROJECT_LIMIT) {
      setShowLimitSheet(true);
      return;
    }

    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your media library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 1,
        videoMaxDuration: VIDEO_LIMITS.MAX_DURATION_MS / 1000,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const video = result.assets[0];
      const durationMs = video.duration || 0;

      if (durationMs > VIDEO_LIMITS.MAX_DURATION_MS + 1000) {
        Alert.alert(
          'Video Too Long',
          `Maximum video duration is ${VIDEO_LIMITS.MAX_DURATION_DISPLAY}. Please trim your video.`
        );
        return;
      }

      let thumbnailLocalPath = null;
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, { time: 1000 });
        thumbnailLocalPath = uri;
      } catch (e) {
        console.warn('Could not generate thumbnail', e);
      }

      // Pass null for guests — projectStore handles local storage automatically
      const effectiveUserId = isGuest ? null : user?.id ?? null;
      const project = await createProject(effectiveUserId, {
        title: `Project ${projects.length + 1}`,
        sourceVideoLocalPath: video.uri,
        durationMs,
        thumbnailLocalPath,
      });

      router.push(`/editor/${project.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
    }
  };

  const handleProjectPress = (project: Project) => {
    router.push(`/editor/${project.id}`);
  };

  const handleProjectLongPress = (project: Project) => {
    Alert.alert(project.title, 'What would you like to do?', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Project', 'Are you sure? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteProject(project.id) },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderHeader = () => (
    <>
      {/* Guest Backup Banner */}
      {isGuest && projects.length > 0 && (
        <GuestBackupBanner onSignIn={handleSignIn} />
      )}

      {/* Guest project count progress */}
      {isGuest && (
        <View style={styles.guestProgress}>
          <Text style={styles.guestProgressText}>
            {projects.length}/{AI_LIMITS.GUEST_PROJECT_LIMIT} guest projects used
          </Text>
          <View style={styles.guestProgressBarBg}>
            <LinearGradient
              colors={projects.length >= AI_LIMITS.GUEST_PROJECT_LIMIT ? ['#EF4444', '#B91C1C'] : ['#7C3AED', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.guestProgressBarFill,
                { width: `${Math.min((projects.length / AI_LIMITS.GUEST_PROJECT_LIMIT) * 100, 100)}%` },
              ]}
            />
          </View>
        </View>
      )}
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassmorphicCard style={styles.emptyCard}>
        <Film size={56} color={Colors.textTertiary} style={{ marginBottom: Spacing.lg }} />
        <Text style={styles.emptyTitle}>No Projects Yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to import a video{'\n'}and start editing with AI
        </Text>
        {isGuest && (
          <TouchableOpacity onPress={handleSignIn} style={styles.emptySignInBtn}>
            <Cloud size={14} color={Colors.primary} />
            <Text style={styles.emptySignInText}> Sign in to enable cloud backup</Text>
          </TouchableOpacity>
        )}
      </GlassmorphicCard>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {isGuest ? 'Welcome, Guest 👋' : `Hey, ${user?.displayName?.split(' ')[0] || 'Creator'}`}
          </Text>
          <Text style={styles.headerTitle}>{APP_NAME}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.profileIconContainer}>
            <User size={24} color={Colors.textPrimary} />
          </View>
          {user?.plan === 'pro' && (
            <LinearGradient
              colors={[...Colors.gradientPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proTag}
            >
              <Text style={styles.proTagText}>PRO</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      {/* Projects Grid */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={handleProjectPress}
            onLongPress={handleProjectLongPress}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          projects.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            progressBackgroundColor={Colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <NewProjectFAB onPress={handleNewProject} />

      {/* Guest Soft-Limit Bottom Sheet */}
      <GuestLimitSheet
        visible={showLimitSheet}
        onClose={() => setShowLimitSheet(false)}
        onSignIn={() => {
          setShowLimitSheet(false);
          handleSignIn();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  greeting: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.xxs,
  },
  headerTitle: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
  },
  profileBtn: {
    position: 'relative',
    padding: Spacing.xs,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proTag: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#000',
  },
  proTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  // Guest backup banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  bannerText: {
    ...Typography.bodySmall,
    color: '#F59E0B',
    flexShrink: 1,
  },
  bannerLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  // Guest progress bar
  guestProgress: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  guestProgressText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xxs,
  },
  guestProgressBarBg: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  guestProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  listContent: {
    padding: Spacing.sm,
    paddingBottom: 120,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['3xl'],
    width: '100%',
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptySignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  emptySignInText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Guest Limit Bottom Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing['2xl'],
  },
  sheetIconRow: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sheetIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sheetSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  sheetHighlight: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  sheetFeatureList: {
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  sheetFeatureItem: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
