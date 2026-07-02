/**
 * OmniAI — Floating Action Button (FAB)
 * Animated "+" button for creating new projects.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '@/src/theme';

interface NewProjectFABProps {
  onPress: () => void;
}

export function NewProjectFAB({ onPress }: NewProjectFABProps) {
  return (
    <View style={styles.wrapper}>
      {/* Glow Effect */}
      <View style={styles.glow} />
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[...Colors.gradientPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Text style={styles.icon}>＋</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Spacing['3xl'],
    right: Spacing.xl,
    zIndex: 100,
  },
  glow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.fabGlow,
    top: -2,
    left: -2,
    // Simulated glow with blur
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 0,
  },
  touchable: {
    borderRadius: BorderRadius.full,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: '300',
    marginTop: -2,
  },
});
