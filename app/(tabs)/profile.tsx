/**
 * OmniAI — Profile Screen
 * User profile, subscription status, settings, and Creator Insights Dashboard.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { GlassmorphicCard } from '@/src/components/ui/GlassmorphicCard';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/stores/authStore';
import { useProjectStore } from '@/src/stores/projectStore';
import { APP_NAME, AI_LIMITS, SUBSCRIPTION } from '@/src/utils/constants';
import { UpgradeWall } from '@/src/components/profile/UpgradeWall';
import { ChevronLeft, Folder, Bot, Smartphone, BarChart3, Palette, Ruler, Film, ClipboardList, Info, FileText, Lock } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

function StatItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, onPress, trailing }: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsRowLeft}>
        <View style={styles.settingsIcon}>{icon}</View>
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      {trailing || <Text style={styles.settingsArrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, downgradeToFree, isGuest, skipLogin } = useAuthStore();
  const { projects } = useProjectStore();

  const [isPaywallVisible, setPaywallVisible] = useState(false);
  const [isAnalyticsVisible, setAnalyticsVisible] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const handleSignInInstead = () => {
    // If they were a guest, sign out to reset state and send them to login
    signOut().then(() => router.replace('/(auth)/login'));
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Premium Plan',
      'Are you sure you want to cancel your Premium features? You will revert to the Free Plan with ads and watermark.',
      [
        { text: 'Keep Pro', style: 'cancel' },
        {
          text: 'Cancel Plan',
          style: 'destructive',
          onPress: async () => {
            await downgradeToFree();
            Alert.alert('Plan Cancelled', 'Your plan has been downgraded to Free.');
          },
        },
      ]
    );
  };

  const promptsUsed = user?.aiPromptsUsedToday || 0;
  const promptsTotal = AI_LIMITS.FREE_PROMPTS_PER_DAY + (user?.bonusPrompts || 0);
  const isPro = user?.plan === 'pro';

  // Creator Analytics Mock Data
  const getMetrics = () => {
    switch (timeframe) {
      case '7d':
        return { views: '18.4K', watch: '12.4s', engagement: '5.2%', graph: [20, 45, 30, 60, 50, 75, 40] };
      case '90d':
        return { views: '412.0K', watch: '14.8s', engagement: '4.1%', graph: [55, 35, 45, 60, 50, 70, 85] };
      case '30d':
      default:
        return { views: '84.2K', watch: '13.5s', engagement: '4.8%', graph: [30, 50, 40, 70, 60, 85, 55] };
    }
  };

  const metrics = getMetrics();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <ChevronLeft size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* User Card */}
        <GlassmorphicCard style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[...Colors.gradientPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {isGuest ? '?' : (user?.displayName || 'U')[0].toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{isGuest ? 'Guest User' : (user?.displayName || 'User')}</Text>
          <Text style={styles.userEmail}>{isGuest ? 'Sign in to sync your projects' : (user?.email || '')}</Text>

          {/* Plan Badge */}
          {!isGuest ? (
            <TouchableOpacity
              disabled={!isPro}
              onPress={handleCancelSubscription}
              style={[styles.planPill, isPro && styles.planPillPro]}
            >
              <Text style={styles.planPillText}>
                {isPro ? '⭐ Pro Plan (Click to Cancel)' : '🆓 Free Plan'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSignInInstead}
              style={[styles.planPill, styles.planPillPro]}
            >
              <Text style={[styles.planPillText, { fontWeight: '700' }]}>
                Sign In / Sign Up
              </Text>
            </TouchableOpacity>
          )}
        </GlassmorphicCard>

        {/* Stats */}
        <GlassmorphicCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatItem icon={<Folder size={24} color={Colors.primaryLight} />} value={String(projects.length)} label="Projects" />
            <View style={styles.statDivider} />
            <StatItem
              icon={<Bot size={24} color={Colors.primaryLight} />}
              value={isPro ? '∞' : `${promptsUsed}/${promptsTotal}`}
              label="AI Today"
            />
            <View style={styles.statDivider} />
            <StatItem
              icon={<Smartphone size={24} color={Colors.primaryLight} />}
              value={isPro ? 'Pro' : 'Free'}
              label="Plan"
            />
          </View>
        </GlassmorphicCard>

        {/* Upgrade CTA (for free users) */}
        {!isPro && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => setPaywallVisible(true)}>
            <LinearGradient
              colors={[...Colors.gradientPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeCard}
            >
              <View>
                <Text style={styles.upgradeTitle}>Upgrade to Pro ⚡</Text>
                <Text style={styles.upgradeSubtitle}>
                  No ads · Unlimited AI · No watermark
                </Text>
              </View>
              <View style={styles.upgradePrice}>
                <Text style={styles.upgradePriceText}>{SUBSCRIPTION.MONTHLY_PRICE}</Text>
                <Text style={styles.upgradePricePeriod}>/mo</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Features / Analytics */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <GlassmorphicCard padding={0}>
            <SettingsRow
              icon={<BarChart3 size={20} color={Colors.textSecondary} />}
              label="Creator Insights & Analytics"
              onPress={() => setAnalyticsVisible(true)}
            />
          </GlassmorphicCard>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <GlassmorphicCard padding={0}>
            <SettingsRow icon={<Palette size={20} color={Colors.textSecondary} />} label="Theme" onPress={() => {}} trailing={
              <Text style={styles.settingsValue}>Dark</Text>
            } />
            <View style={styles.settingsDivider} />
            <SettingsRow icon={<Ruler size={20} color={Colors.textSecondary} />} label="Default Aspect Ratio" onPress={() => {}} trailing={
              <Text style={styles.settingsValue}>9:16</Text>
            } />
            <View style={styles.settingsDivider} />
            <SettingsRow icon={<Film size={20} color={Colors.textSecondary} />} label="Default FPS" onPress={() => {}} trailing={
              <Text style={styles.settingsValue}>30</Text>
            } />
            <View style={styles.settingsDivider} />
            <SettingsRow icon={<ClipboardList size={20} color={Colors.textSecondary} />} label="Export Quality" onPress={() => {}} trailing={
              <Text style={styles.settingsValue}>High</Text>
            } />
          </GlassmorphicCard>
        </View>

        {/* About */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <GlassmorphicCard padding={0}>
            <SettingsRow icon={<Info size={20} color={Colors.textSecondary} />} label="App Version" onPress={() => {}} trailing={
              <Text style={styles.settingsValue}>1.0.0</Text>
            } />
            <View style={styles.settingsDivider} />
            <SettingsRow icon={<FileText size={20} color={Colors.textSecondary} />} label="Terms of Service" onPress={() => {}} />
            <View style={styles.settingsDivider} />
            <SettingsRow icon={<Lock size={20} color={Colors.textSecondary} />} label="Privacy Policy" onPress={() => {}} />
          </GlassmorphicCard>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <Button
            title={isGuest ? "Sign In Now" : "Sign Out"}
            onPress={isGuest ? handleSignInInstead : handleSignOut}
            variant={isGuest ? "primary" : "outline"}
            fullWidth
            size="md"
          />
        </View>

        <Text style={styles.footer}>
          {APP_NAME} v1.0.0 · Made with 💜
        </Text>
      </ScrollView>

      {/* Subscription Paywall */}
      <UpgradeWall visible={isPaywallVisible} onClose={() => setPaywallVisible(false)} />

      {/* Creator Insights Overlay */}
      <Modal visible={isAnalyticsVisible} animationType="slide" transparent={false}>
        <View style={styles.analyticsContainer}>
          {/* Header */}
          <View style={styles.analyticsHeader}>
            <TouchableOpacity onPress={() => setAnalyticsVisible(false)} style={styles.backButton}>
              <Text style={styles.backText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.analyticsTitle}>Creator Insights</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.analyticsScroll} contentContainerStyle={styles.analyticsScrollContent}>
            {/* Timeframe Filter */}
            <View style={styles.timeframeTabs}>
              {(['7d', '30d', '90d'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTimeframe(t)}
                  style={[styles.timeframeTab, timeframe === t && styles.timeframeTabActive]}
                >
                  <Text style={[styles.timeframeText, timeframe === t && styles.timeframeTextActive]}>
                    {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '90 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats Overview */}
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewVal}>{metrics.views}</Text>
                <Text style={styles.overviewLbl}>Reel Views</Text>
                <Text style={styles.growthText}>📈 +14.2%</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewVal}>{metrics.watch}</Text>
                <Text style={styles.overviewLbl}>Avg. Watch Time</Text>
                <Text style={styles.growthText}>📈 +8.5%</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewVal}>{metrics.engagement}</Text>
                <Text style={styles.overviewLbl}>Engagement Rate</Text>
                <Text style={styles.growthText}>📈 +1.2%</Text>
              </View>
            </View>

            {/* Visual Bar Graph */}
            <Text style={styles.chartTitle}>Views Trend Analysis</Text>
            <GlassmorphicCard style={styles.chartCard}>
              <View style={styles.graphContainer}>
                {metrics.graph.map((val, idx) => (
                  <View key={idx} style={styles.graphCol}>
                    <View style={[styles.graphBarBg, { height: 120, justifyContent: 'flex-end' }]}>
                      <LinearGradient
                        colors={[...Colors.gradientPrimary]}
                        style={[styles.graphBarFill, { height: `${val}%` }]}
                      />
                    </View>
                    <Text style={styles.graphLabel}>D{idx + 1}</Text>
                  </View>
                ))}
              </View>
            </GlassmorphicCard>

            {/* Audience Retention */}
            <Text style={styles.chartTitle}>Audience Retention Curve</Text>
            <GlassmorphicCard style={styles.chartCard}>
              <View style={styles.retentionContainer}>
                {[100, 85, 70, 55, 45, 40, 38].map((val, idx) => (
                  <View key={idx} style={styles.retentionCol}>
                    <Text style={styles.retentionVal}>{val}%</Text>
                    <View style={[styles.retentionBarBg, { height: 80, justifyContent: 'flex-end' }]}>
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={[styles.retentionBarFill, { height: `${val}%` }]}
                      />
                    </View>
                    <Text style={styles.retentionLabel}>{idx * 15}s</Text>
                  </View>
                ))}
              </View>
            </GlassmorphicCard>

            {/* Top performing Reels list */}
            <Text style={styles.chartTitle}>Top Performing Projects</Text>
            <View style={styles.listContainer}>
              {projects.length === 0 ? (
                <Text style={styles.emptyListText}>No completed projects yet. Export projects to see insights here.</Text>
              ) : (
                projects.map((proj, idx) => (
                  <View key={proj.id} style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                      <Text style={styles.listNumber}>#{idx + 1}</Text>
                      <View>
                        <Text style={styles.listTitle} numberOfLines={1}>{proj.title}</Text>
                        <Text style={styles.listSubtext}>Duration: {(proj.durationMs / 1000).toFixed(1)}s</Text>
                      </View>
                    </View>
                    <Text style={styles.listViewCount}>
                      {idx === 0 ? '45.2K' : idx === 1 ? '24.1K' : '10.5K'} views
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['6xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  headerBackBtn: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerTitle: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userName: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  userEmail: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  planPill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planPillPro: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  planPillText: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.divider,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  upgradeTitle: {
    ...Typography.headlineSmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  upgradeSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  upgradePrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  upgradePriceText: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
  },
  upgradePricePeriod: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 2,
  },
  settingsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: Spacing.md,
  },
  settingsLabel: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
  settingsValue: {
    ...Typography.bodyMedium,
    color: Colors.textTertiary,
  },
  settingsArrow: {
    fontSize: 22,
    color: Colors.textTertiary,
    fontWeight: '300',
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: Spacing['4xl'] + Spacing.sm,
  },
  signOutSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  footer: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // ── Creator Insights Styles ──
  analyticsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButton: {
    padding: Spacing.sm,
    width: 60,
  },
  backText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  analyticsTitle: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  analyticsScroll: {
    flex: 1,
  },
  analyticsScrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  timeframeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  timeframeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  timeframeTabActive: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeframeText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  overviewLbl: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  growthText: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  chartTitle: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  chartCard: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
  },
  graphCol: {
    alignItems: 'center',
    flex: 1,
  },
  graphBarBg: {
    width: 14,
    backgroundColor: Colors.surface,
    borderRadius: 7,
    overflow: 'hidden',
  },
  graphBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  graphLabel: {
    fontSize: 8,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  retentionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 110,
  },
  retentionCol: {
    alignItems: 'center',
    flex: 1,
  },
  retentionVal: {
    fontSize: 8,
    color: '#34D399',
    fontWeight: '700',
    marginBottom: 2,
  },
  retentionBarBg: {
    width: 18,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  retentionBarFill: {
    width: '100%',
    borderRadius: 3,
  },
  retentionLabel: {
    fontSize: 8,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  listContainer: {
    gap: Spacing.xs,
  },
  emptyListText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  listNumber: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  listTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    maxWidth: 160,
  },
  listSubtext: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  listViewCount: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
