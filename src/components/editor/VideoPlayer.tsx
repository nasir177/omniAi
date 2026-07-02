/**
 * OmniAI — Video Player Component
 *
 * Pattern: two separate components (RealVideoPlayer + DemoVideoPlayer) so that
 * React hook rules are never violated — hooks only live in the component that
 * actually needs them, and the parent VideoPlayer simply decides which to render.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { FILTER_PRESETS, useEditorStore } from '@/src/stores/editorStore';
import { playerBridge } from '@/src/services/editor/playerBridge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoPlayerProps {
  videoUri: string;
  style?: object;
}

// ─── Real video player (hooks always called — URI is always valid here) ───────

function RealVideoPlayer({ videoUri, style }: VideoPlayerProps) {
  const {
    isPlaying, setPlaying,
    currentPositionMs, setCurrentPosition,
    playbackSpeed, volume, isMuted,
    activeFilterId, activeEffectId,
    setDuration,
    trimStartMs, trimEndMs,
    isAIProcessing,
  } = useEditorStore();

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = false;
    p.muted = isMuted;
    p.volume = volume;
    p.playbackRate = playbackSpeed;
  });

  // Sync settings whenever store values change
  useEffect(() => {
    if (!player) return;
    player.muted = isMuted;
    player.volume = volume;
    player.playbackRate = playbackSpeed;
  }, [isMuted, volume, playbackSpeed, player]);

  // Mirror play/pause state into store
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('playingChange', (e) => setPlaying(e.isPlaying));
    return () => sub.remove();
  }, [player]);

  // Poll position while playing
  useEffect(() => {
    if (!isPlaying || !player) return;
    const id = setInterval(() => {
      const t = player.currentTime;
      if (t != null) {
        const ms = t * 1000;
        if (trimEndMs > 0 && ms >= trimEndMs) {
          player.pause();
          player.currentTime = trimStartMs / 1000;
          setCurrentPosition(trimStartMs);
        } else if (ms < trimStartMs) {
          player.currentTime = trimStartMs / 1000;
          setCurrentPosition(trimStartMs);
        } else {
          setCurrentPosition(ms);
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [isPlaying, player, trimStartMs, trimEndMs, setCurrentPosition]);

  const handlePlayPause = useCallback(() => {
    if (!player) return;
    isPlaying ? player.pause() : player.play();
  }, [player, isPlaying]);

  const handleSeek = useCallback((ms: number) => {
    if (!player) return;
    player.currentTime = ms / 1000;
    setCurrentPosition(ms);
  }, [player]);

  // Expose player methods to bridge
  useEffect(() => {
    if (!player) return;
    const bridge = {
      play: () => player.play(),
      pause: () => player.pause(),
      seek: handleSeek,
      getDuration: () => (player.duration ?? 0) * 1000,
    };
    playerBridge.registerPlayer(bridge);
    return () => playerBridge.unregisterPlayer();
  }, [player, handleSeek]);

  // Sync duration
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('statusChange', (e) => {
      if (e.status === 'readyToPlay' && player.duration) {
        setDuration(player.duration * 1000);
      }
    });
    if (player.status === 'readyToPlay' && player.duration) {
      setDuration(player.duration * 1000);
    }
    return () => sub.remove();
  }, [player, setDuration]);

  const filter = FILTER_PRESETS.find((f) => f.id === activeFilterId);

  // AI Loading Animation
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    if (isAIProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0.3);
    }
  }, [isAIProcessing]);

  return (
    <View style={[s.container, style]}>
      <VideoView
        player={player}
        style={[
          StyleSheet.absoluteFill,
          activeEffectId === 'mirror' && { transform: [{ scaleX: -1 }] },
          activeEffectId === 'blur' && { opacity: 0.7 },
          activeEffectId === 'neon' && { borderWidth: 4, borderColor: '#00FFFF', shadowColor: '#00FFFF', shadowRadius: 20, shadowOpacity: 1 },
        ]}
        contentFit="cover"
        nativeControls={false}
      />
      {activeEffectId === 'vhs' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,0,0,0.1)', borderTopWidth: 2, borderBottomWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }]} pointerEvents="none" />
      )}
      {activeEffectId === 'glitch' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 255, 255, 0.1)', transform: [{ translateX: 2 }] }]} pointerEvents="none" />
      )}
      {filter && filter.id !== 'none' && (
        <View
          style={[s.filterOverlay, { backgroundColor: filter.tint, opacity: filter.opacity }]}
          pointerEvents="none"
        />
      )}
      
      {/* AI Processing Magical Overlay */}
      {isAIProcessing && (
        <Animated.View style={[StyleSheet.absoluteFill, s.aiOverlay, { opacity: glowAnim }]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(138, 43, 226, 0.4)', 'rgba(75, 0, 130, 0.4)', 'rgba(0, 255, 255, 0.4)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={s.aiText}>✨ Processing Magic... ✨</Text>
        </Animated.View>
      )}

      <Pressable style={s.tapOverlay} onPress={handlePlayPause}>
        {!isPlaying && (
          <View style={s.playButton}>
            <Text style={s.playIcon}>▶</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

// ─── Empty state shown when no real video URI is provided ─────────────────────

function EmptyVideoPlayer({ style }: { style?: object }) {
  return (
    <View style={[s.container, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />

      {/* Upload prompt */}
      <View style={s.importHint}>
        <Text style={s.importHintText}>🎬  Import a video to start editing</Text>
      </View>
    </View>
  );
}

// ─── Public VideoPlayer ───────────────────────────────────────────────────────
// Conditionally renders RealVideoPlayer or EmptyVideoPlayer.
// Hooks inside each child are always called unconditionally — no hook rule violation.

export function VideoPlayer({ videoUri, style }: VideoPlayerProps) {
  const hasVideo =
    typeof videoUri === 'string' &&
    videoUri.trim().length > 0 &&
    videoUri !== 'undefined' &&
    videoUri !== 'null';

  if (hasVideo) {
    return <RealVideoPlayer videoUri={videoUri} style={style} />;
  }
  return <EmptyVideoPlayer style={style} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  tapOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Import hint
  importHint: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: -16,
  },
  importHintText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // Play button (used by real video player)
  playButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    top: '50%',
    marginTop: -28,
  },
  playIcon: {
    fontSize: 20,
    color: '#fff',
    marginLeft: 4,
  },
  aiOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  aiText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 0, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginTop: 20,
  }
});
