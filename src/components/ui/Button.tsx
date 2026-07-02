/**
 * OmniAI — Button Component
 * Premium styled button with multiple variants and animations.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, Spacing } from '@/src/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
      text: Typography.buttonSmall,
    },
    md: {
      container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
      text: Typography.button,
    },
    lg: {
      container: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing['2xl'] },
      text: { ...Typography.button, fontSize: 18 },
    },
  };

  const currentSize = sizeStyles[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#374151', '#374151'] : [...Colors.gradientPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.container,
            currentSize.container,
            styles.primaryContainer,
            fullWidth && styles.fullWidth,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <>
              {icon && <>{icon}</>}
              <Text style={[styles.primaryText, currentSize.text, icon ? styles.textWithIcon : undefined]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    secondary: {
      container: { backgroundColor: Colors.surface },
      text: { color: Colors.textPrimary },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.primary,
      },
      text: { color: Colors.primary },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: Colors.primaryLight },
    },
  };

  const variantStyle = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.container,
        currentSize.container,
        variantStyle.container,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color as string} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              currentSize.text,
              variantStyle.text,
              isDisabled ? styles.disabledText : undefined,
              icon ? styles.textWithIcon : undefined,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  primaryContainer: {
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
