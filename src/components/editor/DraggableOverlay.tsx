import React, { useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface DraggableOverlayProps {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  onDragEnd?: (x: number, y: number) => void;
  style?: StyleProp<ViewStyle>;
}

export function DraggableOverlay({ children, initialX = 0, initialY = 0, initialScale = 1, onDragEnd, style }: DraggableOverlayProps) {
  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const scale = useRef(new Animated.Value(initialScale)).current;
  
  const baseScale = useRef(initialScale);
  const initialDistance = useRef<number | null>(null);

  const calcDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        if (e.nativeEvent.touches.length === 2) {
          initialDistance.current = calcDistance(e.nativeEvent.touches);
        } else {
          initialDistance.current = null;
          pan.setOffset({
            x: (pan.x as any)._value,
            y: (pan.y as any)._value,
          });
          pan.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (e, gestureState) => {
        if (e.nativeEvent.touches.length === 2) {
          if (initialDistance.current) {
            const currentDistance = calcDistance(e.nativeEvent.touches);
            const scaleFactor = currentDistance / initialDistance.current;
            scale.setValue(baseScale.current * scaleFactor);
          } else {
            initialDistance.current = calcDistance(e.nativeEvent.touches);
          }
        } else if (e.nativeEvent.touches.length === 1 && !initialDistance.current) {
          Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
          )(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (initialDistance.current) {
          baseScale.current = (scale as any)._value;
          initialDistance.current = null;
        } else {
          pan.flattenOffset();
          if (onDragEnd) {
            onDragEnd((pan.x as any)._value, (pan.y as any)._value);
          }
        }
      }
    })
  ).current;

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}
