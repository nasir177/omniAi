/**
 * OmniAI — Projects Screen (Home)
 * Displays all user projects in a grid with FAB to create new.
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
import { useAuthStore } from '@/src/stores/authStore';
import { useProjectStore } from '@/src/stores/projectStore';
import { APP_NAME, VIDEO_LIMITS } from '@/src/utils/constants';
import type { Project } from '@/src/types/project';
import { Film, User } from 'lucide-react-native';

export default function ProjectsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { projects, isLoading, loadProjects, createProject, deleteProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProjects(user.id);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) await loadProjects(user.id);
    setRefreshing(false);
  }, [user?.id]);

  const handleNewProject = async () => {
    try {
      // Request permission and pick video
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

      // Check duration limit (allow a 1-second grace period)
      if (durationMs > VIDEO_LIMITS.MAX_DURATION_MS + 1000) {
        Alert.alert(
          'Video Too Long',
          `Maximum video duration is ${VIDEO_LIMITS.MAX_DURATION_DISPLAY}. Please trim your video.`
        );
        return;
      }

      let thumbnailLocalPath = null;
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, {
          time: 1000,
        });
        thumbnailLocalPath = uri;
      } catch (e) {
        console.warn('Could not generate thumbnail', e);
      }

      // Create project
      if (!user?.id) return;
      const project = await createProject(user.id, {
        title: `Project ${projects.length + 1}`,
        sourceVideoLocalPath: video.uri,
        durationMs,
        thumbnailLocalPath,
      });

      // Navigate to editor
      router.push(`/editor/${project.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
    }
  };

  const handleProjectPress = (project: Project) => {
    router.push(`/editor/${project.id}`);
  };

  const handleProjectLongPress = (project: Project) => {
    Alert.alert(
      project.title,
      'What would you like to do?',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete Project', 'Are you sure? This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteProject(project.id),
              },
            ]);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <GlassmorphicCard style={styles.emptyCard}>
        <Film size={56} color={Colors.textTertiary} style={{ marginBottom: Spacing.lg }} />
        <Text style={styles.emptyTitle}>No Projects Yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to import a video{'\n'}and start editing with AI
        </Text>
      </GlassmorphicCard>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hey, {user?.displayName?.split(' ')[0] || 'Creator'}
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
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.lg,
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
});
