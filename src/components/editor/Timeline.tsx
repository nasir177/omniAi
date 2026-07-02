/**
 * OmniAI — Timeline Component
 * Horizontal scrollable timeline with draggable playhead.
 */

import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { useEditorStore } from '@/src/stores/editorStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TIMELINE_PADDING = 20;
const TICK_COUNT = 20;

function formatTimeShort(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function Timeline() {
  const {
    currentPositionMs,
    durationMs,
    setCurrentPosition,
    trimStartMs,
    trimEndMs,
    isTrimActive,
    setTrimStart,
    setTrimEnd,
    zoomLevel,
  } = useEditorStore();

  const [trackWidth, setTrackWidth] = React.useState(SCREEN_WIDTH - TIMELINE_PADDING * 2);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const progress = durationMs > 0 ? currentPositionMs / durationMs : 0;

  const seekFromX = useCallback(
    (x: number) => {
      if (trackWidth <= 0 || durationMs <= 0) return;
      const pct = Math.max(0, Math.min(1, x / trackWidth));
      const seekMs = pct * durationMs;
      setCurrentPosition(seekMs);

      // Also seek the video player
      const seekFn = (globalThis as any).__omniaiSeek;
      if (seekFn) seekFn(seekMs);
    },
    [trackWidth, durationMs]
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

  // Generate tick marks
  const ticks = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= TICK_COUNT; i++) {
      const pct = i / TICK_COUNT;
      const ms = pct * durationMs;
      const isMajor = i % 5 === 0;
      arr.push({ pct, ms, isMajor });
    }
    return arr;
  }, [durationMs]);

  // Trim region percentages
  const trimStartPct = durationMs > 0 ? trimStartMs / durationMs : 0;
  const trimEndPct = durationMs > 0 ? trimEndMs / durationMs : 1;

  return (
    <View style={styles.container}>
      {/* Timeline Track */}
      <View
        style={styles.trackContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Background strip */}
        <LinearGradient
          colors={['#1a1a2e', '#252540', '#1a1a2e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.track}
        >
          {/* Frame markers — subtle gradient segments */}
          {ticks.map((tick, i) => (
            <View
              key={i}
              style={[
                styles.tick,
                { left: `${tick.pct * 100}%` },
                tick.isMajor ? styles.tickMajor : styles.tickMinor,
              ]}
            />
          ))}
        </LinearGradient>

        {/* Trim dimmed regions */}
        {isTrimActive && (
          <>
            <View
              style={[
                styles.trimDim,
                { left: 0, width: `${trimStartPct * 100}%` },
              ]}
            />
            <View
              style={[
                styles.trimDim,
                { right: 0, width: `${(1 - trimEndPct) * 100}%` },
              ]}
            />
            {/* Trim start handle */}
            <View
              style={[
                styles.trimHandle,
                { left: `${trimStartPct * 100}%` },
              ]}
            >
              <View style={styles.trimHandleBar} />
            </View>
            {/* Trim end handle */}
            <View
              style={[
                styles.trimHandle,
                { left: `${trimEndPct * 100}%` },
              ]}
            >
              <View style={styles.trimHandleBar} />
            </View>
          </>
        )}

        {/* Playhead */}
        <View
          style={[
            styles.playhead,
            { left: `${Math.min(progress * 100, 100)}%` },
          ]}
        >
          <View style={styles.playheadTop} />
          <View style={styles.playheadLine} />
        </View>
      </View>

      {/* Time labels */}
      <View style={styles.timeLabels}>
        <Text style={styles.timeLabel}>0:00</Text>
        <Text style={styles.timeLabelCenter}>
          {formatTimeShort(currentPositionMs)}
        </Text>
        <Text style={styles.timeLabel}>{formatTimeShort(durationMs)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TIMELINE_PADDING,
    paddingVertical: Spacing.sm,
  },
  trackContainer: {
    height: 48,
    position: 'relative',
    justifyContent: 'center',
  },
  track: {
    height: 36,
    borderRadius: BorderRadius.sm,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tick: {
    position: 'absolute',
    top: 0,
    width: 1,
  },
  tickMajor: {
    height: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  tickMinor: {
    height: '40%',
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    alignItems: 'center',
    zIndex: 10,
  },
  playheadTop: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textPrimary,
    marginBottom: -2,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  playheadLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.textPrimary,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  trimDim: {
    position: 'absolute',
    top: 6,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 5,
  },
  trimHandle: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 44,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  trimHandleBar: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  timeLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  timeLabelCenter: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
    fontVariant: ['tabular-nums'],
  },
});
