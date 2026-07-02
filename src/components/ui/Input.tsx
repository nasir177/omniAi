/**
 * OmniAI — Input Component
 * Styled text input with floating label effect and validation states.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/src/theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  editable?: boolean;
  multiline?: boolean;
  maxLength?: number;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  style,
  editable = true,
  multiline = false,
  maxLength,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error
    ? Colors.error
    : isFocused
    ? Colors.primary
    : Colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      <Text style={[styles.label, error && styles.labelError]}>
        {label}
      </Text>
      <View
        style={[
          styles.container,
          { borderColor },
          isFocused && styles.focusedContainer,
          error && styles.errorContainer,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          multiline={multiline}
          maxLength={maxLength}
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  labelError: {
    color: Colors.error,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
  },
  focusedContainer: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.primary,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  errorContainer: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md + 2,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  toggleButton: {
    paddingLeft: Spacing.sm,
  },
  toggleText: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
