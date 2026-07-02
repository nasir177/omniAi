import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to auth if not logged in
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="projects/index" />
      <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
