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
import { APP_NAME } from '@/src/utils/constants';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, skipLogin, isLoading } = useAuthStore();

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
        Alert.alert(
          'Authentication Error',
          'Google sign-in failed. Please check your connection and try again.\n\nIf this keeps happening, sign up with Email/Password instead.',
          [{ text: 'OK' }]
        );
        break;
      case 'dismiss':
        console.log('[GoogleAuth] User dismissed the auth flow.');
        break;
      case 'cancel':
        console.log('[GoogleAuth] Auth cancelled by user.');
        break;
    }
  }, [response]);


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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              <View style={styles.logoGradient}>
                <Image 
                  source={require('../../assets/images/icon.png')} 
                  style={{ width: 60, height: 60, borderRadius: 15 }} 
                  resizeMode="contain" 
                />
              </View>
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
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
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

            {/* Divider */}
            <View style={[styles.divider, { marginTop: 20 }]}>
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
              style={{ marginTop: 20 }}
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
