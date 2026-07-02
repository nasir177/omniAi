/**
 * OmniAI — Sign Up Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/stores/authStore';
import { APP_NAME } from '@/src/utils/constants';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Min 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace('/(tabs)/projects');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[...Colors.gradientPrimary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>O</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Join {APP_NAME}</Text>
            <Text style={styles.subtitle}>Start editing videos with AI</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              error={errors.displayName}
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Button
              title="Sign In"
              onPress={() => router.back()}
              variant="ghost"
              size="sm"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
  },
  form: {
    marginBottom: Spacing['2xl'],
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  footerText: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
  },
});
