/**
 * OmniAI — Login Screen
 * Premium dark login with gradient accents.
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
import { APP_NAME, APP_TAGLINE } from '@/src/utils/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Min 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/projects');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Something went wrong');
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
          {/* Header / Branding */}
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
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.tagline}>{APP_TAGLINE}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.signInButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Placeholder */}
            <Button
              title="Continue with Google"
              onPress={() => Alert.alert('Coming Soon', 'Google Sign-In will be available with Firebase setup.')}
              variant="outline"
              fullWidth
              size="lg"
              icon={<Text style={{ fontSize: 18 }}>🔵</Text>}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Button
              title="Sign Up"
              onPress={() => router.push('/(auth)/signup')}
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
    marginBottom: Spacing['4xl'],
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
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  appName: {
    ...Typography.displayLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
  },
  form: {
    marginBottom: Spacing['3xl'],
  },
  signInButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    ...Typography.labelMedium,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.lg,
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
