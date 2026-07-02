/**
 * OmniAI — Custom Slider Component
 * Gradient track with circular thumb for volume, speed, text size controls.
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export function Slider({
  value,
  min,
  max,
  step = 0.01,
  onValueChange,
  label,
  showValue = true,
  formatValue,
}: SliderProps) {
  const [trackWidth, setTrackWidth] = React.useState(0);
  const progress = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const snapToStep = (val: number) => {
    const stepped = Math.round(val / step) * step;
    return Math.max(min, Math.min(max, parseFloat(stepped.toFixed(10))));
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          if (trackWidth === 0) return;
          const x = evt.nativeEvent.locationX;
          const pct = Math.max(0, Math.min(1, x / trackWidth));
          onValueChange(snapToStep(min + pct * (max - min)));
        },
        onPanResponderMove: (evt) => {
          if (trackWidth === 0) return;
          const x = evt.nativeEvent.locationX;
          const pct = Math.max(0, Math.min(1, x / trackWidth));
          onValueChange(snapToStep(min + pct * (max - min)));
        },
      }),
    [trackWidth, min, max, step, onValueChange]
  );

  const displayValue = formatValue
    ? formatValue(value)
    : value % 1 === 0
    ? String(value)
    : value.toFixed(2);

  return (
    <View style={styles.wrapper}>
      {(label || showValue) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValue && <Text style={styles.value}>{displayValue}</Text>}
        </View>
      )}
      <View
        style={styles.trackContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Background Track */}
        <View style={styles.track} />

        {/* Active Track */}
        <LinearGradient
          colors={[...Colors.gradientPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.activeTrack, { width: `${progress * 100}%` }]}
        />

        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            { left: `${progress * 100}%` },
          ]}
        >
          <View style={styles.thumbInner} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  value: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
  },
  activeTrack: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    left: 0,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textPrimary,
  },
});
