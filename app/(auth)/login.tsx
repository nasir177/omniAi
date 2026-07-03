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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/stores/authStore';
import { APP_NAME, APP_TAGLINE } from '@/src/utils/constants';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, skipLogin, devLogin, isLoading } = useAuthStore();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'unconfigured',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'unconfigured',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'unconfigured',
  });

  React.useEffect(() => {
    if (!response) return;

    switch (response.type) {
      case 'success': {
        const { id_token } = response.params;
        if (id_token) {
          signInWithGoogle(id_token)
            .then(() => router.replace('/(tabs)/projects'))
            .catch((e: any) =>
              Alert.alert(
                'Google Sign-In Failed',
                e.message || 'Could not complete sign-in. Please try again.'
              )
            );
        }
        break;
      }
      case 'error':
        // OAuth flow failed natively (network error, misconfiguration)
        Alert.alert(
          'Authentication Error',
          'Google sign-in failed. Please check your connection and try again.\n\nIf this keeps happening, use Email/Password login instead.',
          [{ text: 'OK' }]
        );
        break;
      case 'dismiss':
        // User closed the browser (may have seen the 400 error page)
        // Silently log — no alert needed, user chose to dismiss
        console.log('[GoogleAuth] User dismissed the auth flow.');
        break;
      case 'cancel':
        console.log('[GoogleAuth] Auth cancelled by user.');
        break;
    }
  }, [response]);


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
      console.error("Login Failed:", error.message || error);
      Alert.alert('Sign In Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              <View style={styles.logoGradient}>
                <Image 
                  source={require('../../assets/images/icon.png')} 
                  style={{ width: 72, height: 72, borderRadius: 18 }} 
                  resizeMode="contain" 
                />
              </View>
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
              autoCapitalize="none"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
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

            {/* Google Sign In */}
            <Button
              title="Continue with Google"
              onPress={() => promptAsync()}
              variant="outline"
              fullWidth
              size="lg"
              disabled={!request}
              icon={<Ionicons name="logo-google" size={20} color={Colors.textPrimary} />}
            />

            {/* Skip Button */}
            <Button
              title="Skip for now"
              onPress={() => {
                skipLogin();
                router.replace('/(tabs)/projects');
              }}
              variant="ghost"
              fullWidth
              size="md"
              style={{ marginTop: Spacing.xl }}
            />

            {/* ── DEV BYPASS ─────────────────────────────────────── */}
            <View style={styles.devSection}>
              <View style={styles.devDivider}>
                <View style={styles.devLine} />
                <Text style={styles.devLabel}>🛠️ DEV</Text>
                <View style={styles.devLine} />
              </View>
              <Button
                title="⚡ Login as Nasir (Pro)"
                onPress={() => {
                  devLogin();
                  router.replace('/(tabs)/projects');
                }}
                variant="outline"
                fullWidth
                size="md"
                style={styles.devButton}
              />
            </View>
            {/* ─────────────────────────────────────────────────── */}
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
  // ── Dev Bypass Styles ──────────────────────────────────────────
  devSection: {
    marginTop: Spacing.xl,
  },
  devDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  devLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
  devLabel: {
    ...Typography.caption,
    color: 'rgba(239,68,68,0.7)',
    marginHorizontal: Spacing.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  devButton: {
    borderColor: 'rgba(239,68,68,0.4)',
    borderStyle: 'dashed',
  },
});
