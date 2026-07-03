import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';

const EMOJIS = ['🎬', '✨', '🔥', '🎵', '🚀', '✂️', '📸', '💬', '🌟', '🎥', '🎨', '🎉'];
const { width } = Dimensions.get('window');

export default function Index() {
  const { isAuthenticated, isLoading, loadSession } = useAuthStore();
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Make sure session is loaded when splash mounts
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      })
    ).start();

    // Start progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Wait 3 seconds then navigate — don't block on isLoading (Firebase can be slow)
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/projects');
      } else {
        router.replace('/(auth)/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);


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
          {EMOJIS.map((emoji, index) => {
            const angle = (index * 360) / EMOJIS.length;
            const radius = 140;
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);

            // Counter-rotate the emoji itself so it stays upright
            const counterSpin = rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-360deg'],
            });

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
                <Text style={styles.emojiText}>{emoji}</Text>
              </Animated.View>
            );
          })}
        </Animated.View>

        <View style={styles.logoWrapper}>
          <View style={styles.logoBox}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.logoImage}
              resizeMode="contain" 
            />
          </View>
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
    width: 280,
    height: 280,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#F472B6',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  logoText: {
    color: '#1E293B',
    fontSize: 34,
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
