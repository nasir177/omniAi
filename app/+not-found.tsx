/**
 * OmniAI — Not Found Screen
 */

import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/src/theme';
import { Button } from '@/src/components/ui/Button';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>This screen doesn't exist.</Text>
      <Button
        title="Go Home"
        onPress={() => router.replace('/(tabs)/projects')}
        variant="primary"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing['3xl'],
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
    marginBottom: Spacing['3xl'],
  },
  button: {
    minWidth: 160,
  },
});
