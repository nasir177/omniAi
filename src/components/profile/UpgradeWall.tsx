/**
 * OmniAI — Upgrade Subscription Wall Modal
 * Premium dark theme subscription page with custom plans and gradient accents.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useAuthStore } from '@/src/stores/authStore';

interface UpgradeWallProps {
  visible: boolean;
  onClose: () => void;
}

export function UpgradeWall({ visible, onClose }: UpgradeWallProps) {
  const { upgradeToPro } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setProcessing] = useState(false);

  const handleUpgrade = async () => {
    setProcessing(true);
    // Simulate App Store / Google Play purchase delay (1.5 seconds)
    setTimeout(async () => {
      try {
        await upgradeToPro();
        setProcessing(false);
        Alert.alert(
          '🎉 Welcome to Pro!',
          'Your upgrade was successful. Enjoy unlimited AI prompts, watermark-free 4K exports, and all premium effects!',
          [{ text: 'Start Editing', onPress: onClose }]
        );
      } catch (err) {
        setProcessing(false);
        Alert.alert('Payment Failed', 'An error occurred during transaction. Please try again.');
      }
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <LinearGradient
            colors={[...Colors.gradientPrimary]}
            style={styles.badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.badgeText}>⭐ OMNIAI PREMIUM</Text>
          </LinearGradient>

          <Text style={styles.title}>Unlock Creative Superpowers</Text>
          <Text style={styles.subtitle}>
            Take your reels and videos to the next level with artificial intelligence
          </Text>

          {/* Premium Features List */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureText}>Unlimited AI Prompt Editing (No Daily Cap)</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>💎</Text>
              <Text style={styles.featureText}>Premium Video Effects & Aesthetic Color Grading</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>✨</Text>
              <Text style={styles.featureText}>Watermark-Free Rendering & Exports</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>Ultra High Quality 4K / 60 FPS Export Presets</Text>
            </View>
          </View>

          {/* Plans Grid */}
          <View style={styles.plansContainer}>
            {/* Monthly */}
            <TouchableOpacity
              onPress={() => setSelectedPlan('monthly')}
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardActive,
              ]}
              activeOpacity={0.9}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Monthly Plan</Text>
              </View>
              <Text style={styles.planPrice}>$4.99</Text>
              <Text style={styles.planPeriod}>per month</Text>
            </TouchableOpacity>

            {/* Yearly */}
            <TouchableOpacity
              onPress={() => setSelectedPlan('yearly')}
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.planCardActive,
              ]}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#EC4899', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBadge}
              >
                <Text style={styles.saveText}>Save 33%</Text>
              </LinearGradient>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Yearly Plan</Text>
              </View>
              <Text style={styles.planPrice}>$39.99</Text>
              <Text style={styles.planPeriod}>billed annually (~$3.33/mo)</Text>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={isProcessing}
            style={styles.upgradeButtonWrapper}
          >
            <LinearGradient
              colors={[...Colors.gradientPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeButton}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.upgradeButtonText}>
                  Subscribe & Start Pro
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.securityText}>
            🔐 Secure Payment via Google Play Services. Cancel anytime.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: Spacing.sm,
  },
  closeText: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: Colors.textPrimary,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  features: {
    gap: Spacing.sm,
    width: '100%',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  plansContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  planCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  saveText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  planHeader: {
    marginBottom: Spacing.xs,
  },
  planTitle: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  planPeriod: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  upgradeButtonWrapper: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  upgradeButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  securityText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
