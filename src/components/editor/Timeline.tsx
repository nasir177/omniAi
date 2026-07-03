/**
 * OmniAI — Multi-track Timeline Component
 * Professional horizontal timeline with multiple layers and a draggable playhead.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore } from '@/src/stores/editorStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TIMELINE_PADDING = 16;
const SIDEBAR_WIDTH = 100;
const TRACK_HEIGHT = 44;
const TRACK_SPACING = 8;
const TICK_COUNT = 20;

function formatTimeLong(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frames = Math.floor((ms % 1000) / (1000 / 30)); // Mocking 30fps
  return `00:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

function formatTimeScale(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function Timeline() {
  const {
    currentPositionMs,
    durationMs,
    setCurrentPosition,
  } = useEditorStore();

  const [trackWidth, setTrackWidth] = useState(SCREEN_WIDTH - TIMELINE_PADDING * 2 - SIDEBAR_WIDTH);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const effectiveDuration = durationMs > 0 ? durationMs : 15000; // Mock 15s if 0
  const progress = currentPositionMs / effectiveDuration;

  const seekFromX = useCallback(
    (x: number) => {
      if (trackWidth <= 0 || effectiveDuration <= 0) return;
      const pct = Math.max(0, Math.min(1, x / trackWidth));
      const seekMs = pct * effectiveDuration;
      setCurrentPosition(seekMs);

      // Also seek the video player if available
      const seekFn = (globalThis as any).__omniaiSeek;
      if (seekFn) seekFn(seekMs);
    },
    [trackWidth, effectiveDuration]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          seekFromX(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt) => {
          seekFromX(evt.nativeEvent.locationX);
        },
      }),
    [seekFromX]
  );

  // Generate tick marks for the time scale
  const ticks = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= TICK_COUNT; i++) {
      const pct = i / TICK_COUNT;
      const ms = pct * effectiveDuration;
      const isMajor = i % 4 === 0;
      arr.push({ pct, ms, isMajor });
    }
    return arr;
  }, [effectiveDuration]);

  return (
    <View style={styles.container}>
      {/* Time Scale Header */}
      <View style={styles.timeScaleRow}>
        <View style={styles.sidebarPlaceholder} />
        <View style={styles.timeScaleTicks}>
          {ticks.map((tick, i) => (
            <View
              key={i}
              style={[
                styles.tickContainer,
                { left: `${tick.pct * 100}%` },
              ]}
            >
              <Text style={styles.tickLabel}>
                {tick.isMajor ? formatTimeScale(tick.ms) : '·'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Main Timeline Area */}
      <View style={styles.mainArea}>
        
        {/* Left Sidebar (Track Headers) */}
        <View style={styles.sidebar}>
          <TrackHeader icon="videocam" title="Video" time="01:24:16" rightIcon="ellipsis-vertical" />
          <TrackHeader icon="pulse" title="Audio" time="01:24:06" rightIcon="volume-mute" />
          <TrackHeader icon="text" title="Text" time="01:24:16" rightIcon="lock-closed" />
          <TrackHeader icon="layers" title="Overlay" time="01:24:16" rightIcon="eye-off" />
          <TrackHeader icon="musical-notes" title="Music" time="01:24:16" rightIcon="volume-mute" />
        </View>

        {/* Right Track Content */}
        <View 
          style={styles.tracksContent} 
          onLayout={handleLayout}
          {...panResponder.panHandlers}
        >
          {/* Vertical grid lines matching major ticks */}
          {ticks.filter(t => t.isMajor).map((tick, i) => (
            <View key={i} style={[styles.gridLine, { left: `${tick.pct * 100}%` }]} pointerEvents="none" />
          ))}

          {/* Track 1: Video */}
          <View style={styles.trackRow}>
            <View style={[styles.clipVideo, { width: '80%', left: '10%' }]}>
              <View style={styles.clipVideoHandle} />
            </View>
          </View>

          {/* Track 2: Audio */}
          <View style={styles.trackRow}>
            <View style={[styles.clipAudio, { width: '70%', left: '10%' }]}>
               <Waveform color="rgba(255,255,255,0.4)" />
            </View>
          </View>

          {/* Track 3: Text */}
          <View style={styles.trackRow}>
            <View style={[styles.clipText, { width: '40%', left: '30%' }]}>
               <Text style={styles.clipTextContent} numberOfLines={1}>Adventure awaits!</Text>
               <View style={styles.clipTextHandle} />
            </View>
          </View>

          {/* Track 4: Overlay */}
          <View style={styles.trackRow}>
            <View style={[styles.clipOverlay, { width: '30%', left: '30%' }]}>
               <Ionicons name="sparkles" size={12} color="#fff" style={styles.overlayIcon} />
            </View>
          </View>

          {/* Track 5: Music */}
          <View style={styles.trackRow}>
            <View style={[styles.clipMusic, { width: '60%', left: '40%' }]}>
                <Waveform color="rgba(255,255,255,0.6)" />
            </View>
          </View>

          {/* Master Playhead (spanning all tracks vertically) */}
          <View
            style={[
              styles.playhead,
              { left: `${Math.min(progress * 100, 100)}%` },
            ]}
            pointerEvents="none"
          >
            <View style={styles.playheadLine} />
            <View style={styles.playheadPill}>
              <Text style={styles.playheadPillText}>{formatTimeLong(currentPositionMs)}</Text>
            </View>
          </View>
          
        </View>
      </View>
    </View>
  );
}

// Subcomponents for visual structure

function TrackHeader({ icon, title, time, rightIcon }: { icon: any, title: string, time: string, rightIcon: any }) {
  return (
    <View style={styles.trackHeader}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} style={styles.trackHeaderIcon} />
      <View style={styles.trackHeaderCenter}>
        <Text style={styles.trackHeaderTitle}>{title}</Text>
        <Text style={styles.trackHeaderTime}>{time}</Text>
      </View>
      <Ionicons name={rightIcon} size={16} color={Colors.textTertiary} />
    </View>
  );
}

function Waveform({ color }: { color: string }) {
  // Mock waveform bars
  const bars = Array.from({ length: 40 }).map((_, i) => Math.random() * 20 + 5);
  return (
    <View style={styles.waveformContainer}>
      {bars.map((h, i) => (
        <View key={i} style={[styles.waveformBar, { height: h, backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TIMELINE_PADDING,
    paddingVertical: Spacing.sm,
    backgroundColor: '#101015',
  },
  timeScaleRow: {
    flexDirection: 'row',
    height: 24,
    marginBottom: 4,
  },
  sidebarPlaceholder: {
    width: SIDEBAR_WIDTH,
  },
  timeScaleTicks: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  tickContainer: {
    position: 'absolute',
    transform: [{ translateX: -15 }],
    width: 30,
    alignItems: 'center',
  },
  tickLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  mainArea: {
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    paddingRight: 8,
  },
  trackHeader: {
    height: TRACK_HEIGHT,
    marginBottom: TRACK_SPACING,
    backgroundColor: '#1E1E28',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  trackHeaderIcon: {
    width: 20,
    textAlign: 'center',
  },
  trackHeaderCenter: {
    flex: 1,
    paddingHorizontal: 6,
  },
  trackHeaderTitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  trackHeaderTime: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textTertiary,
  },
  tracksContent: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  trackRow: {
    height: TRACK_HEIGHT,
    marginBottom: TRACK_SPACING,
    position: 'relative',
    justifyContent: 'center',
  },
  clipVideo: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#2D3B5E',
    borderWidth: 1,
    borderColor: '#4E73DF',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clipVideoHandle: {
    width: 8,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginLeft: 4,
  },
  clipAudio: {
    position: 'absolute',
    height: '80%',
    backgroundColor: '#2A2C39',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  clipText: {
    position: 'absolute',
    height: '80%',
    backgroundColor: '#D9B64E',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  clipTextContent: {
    ...Typography.caption,
    color: '#000',
    fontWeight: '600',
    flex: 1,
  },
  clipTextHandle: {
    width: 4,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 2,
    marginLeft: 4,
  },
  clipOverlay: {
    position: 'absolute',
    height: '90%',
    backgroundColor: '#C57E42',
    borderWidth: 1,
    borderColor: '#E8A56E',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayIcon: {
    opacity: 0.8,
  },
  clipMusic: {
    position: 'absolute',
    height: '70%',
    backgroundColor: '#376F70',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
    paddingHorizontal: 4,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  playhead: {
    position: 'absolute',
    top: -20, // Start above the timeline
    bottom: -10, // Extend below the timeline
    width: 2,
    marginLeft: -1,
    alignItems: 'center',
    zIndex: 100,
  },
  playheadLine: {
    position: 'absolute',
    top: 20,
    bottom: 0,
    width: 2,
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  playheadPill: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#E53E3E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  playheadPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
