import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { Clapperboard, Heart, Rocket, Flame, Music, Sparkles, MessageCircle, ThumbsUp, Scissors, Camera } from 'lucide-react-native';

const ICONS = [
  { icon: MessageCircle, color: '#38BDF8' },
  { icon: Heart, color: '#EC4899' },
  { icon: Rocket, color: '#8B5CF6' },
  { icon: Flame, color: '#F97316' },
  { icon: Music, color: '#EC4899' },
  { icon: Sparkles, color: '#FBBF24' },
  { icon: MessageCircle, color: '#10B981' },
  { icon: Heart, color: '#1E293B' },
  { icon: ThumbsUp, color: '#FBBF24' },
  { icon: Clapperboard, color: '#1E293B' },
  { icon: Scissors, color: '#8B5CF6' },
  { icon: Camera, color: '#334155' },
];
const { width } = Dimensions.get('window');

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Start progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/projects');
      } else {
        router.replace('/(auth)/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E0F2FE', '#F3E8FF', '#FCE7F3', '#FFEDD5']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.center}>
        <Animated.View style={[styles.circle, { transform: [{ rotate: spin }] }]}>
          {ICONS.map((item, index) => {
            const angle = (index * 360) / ICONS.length;
            const radius = 130;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);

            // Counter-rotate the icon itself so it stays upright
            const counterSpin = rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-360deg'],
            });
            const Icon = item.icon;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.iconContainer,
                  { 
                    transform: [
                      { translateX: x }, 
                      { translateY: y },
                      { rotate: counterSpin }
                    ] 
                  },
                ]}
              >
                <Icon size={20} color={item.color} />
              </Animated.View>
            );
          })}
        </Animated.View>

        <View style={styles.logoWrapper}>
          <LinearGradient
            colors={['#38BDF8', '#818CF8', '#F472B6']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.logoBox}
          >
            <Clapperboard size={56} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
          <Text style={styles.logoText}>Omni Ai</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
            <LinearGradient
              colors={['#38BDF8', '#F472B6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.bottomText}>Create reels with emojis, captions, and music</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  circle: {
    width: 260,
    height: 260,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F472B6',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    marginBottom: 24,
  },
  logoText: {
    color: '#1E293B',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  bottomText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
