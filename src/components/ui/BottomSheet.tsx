/**
 * OmniAI — Bottom Sheet Component
 * Animated panel that slides up from the bottom for tool panels.
 * Uses Pressable (not deprecated TouchableWithoutFeedback).
 * Uses boxShadow (not deprecated shadow* props).
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BorderRadius, Spacing } from '@/src/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  height = 320,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, height]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop — tap to close */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { height, transform: [{ translateY }] }]}
      >
        {/* Drag Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Content */}
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.glassBorder,
    // Cross-platform shadow — no deprecated shadow* props
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px -8px 24px rgba(0,0,0,0.4)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.35,
          shadowRadius: 24,
          elevation: 20,
        }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
});
