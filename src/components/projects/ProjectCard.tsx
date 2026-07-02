/**
 * OmniAI — Project Card Component
 * Displays a project thumbnail with title, duration, and status.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/src/theme';
import type { Project } from '@/src/types/project';
import { Film } from 'lucide-react-native';

interface ProjectCardProps {
  project: Project;
  onPress: (project: Project) => void;
  onLongPress?: (project: Project) => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ProjectCard({ project, onPress, onLongPress }: ProjectCardProps) {
  const statusColors = {
    draft: Colors.textTertiary,
    editing: Colors.warning,
    completed: Colors.success,
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(project)}
      onLongPress={() => onLongPress?.(project)}
      activeOpacity={0.85}
      style={styles.container}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {project.thumbnailLocalPath ? (
          <Image
            source={{ uri: project.thumbnailLocalPath }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Film size={36} color={Colors.textTertiary} />
          </View>
        )}

        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(project.durationMs)}
          </Text>
        </View>

        {/* Status Dot */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColors[project.status] },
            ]}
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {project.title}
        </Text>
        <Text style={styles.date}>{formatDate(project.updatedAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: Colors.backgroundTertiary,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundTertiary,
  },
  placeholderIcon: {
    fontSize: 36,
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs + 1,
    borderRadius: BorderRadius.xs,
  },
  durationText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statusContainer: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  date: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
