/**
 * OmniAI — Auth Layout
 * Stack navigator for login and signup screens.
 */

import { Stack, Redirect } from 'expo-router';
import { Colors } from '@/src/theme';
import { useAuthStore } from '@/src/stores/authStore';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // If user is already logged in, redirect to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/projects" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
