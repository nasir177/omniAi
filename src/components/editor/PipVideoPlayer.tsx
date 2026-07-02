import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEditorStore } from '@/src/stores/editorStore';
import { DraggableOverlay } from './DraggableOverlay';

interface PipVideoPlayerProps {
  id: string;
  uri: string;
  initialX: number;
  initialY: number;
  scale: number;
}

export function PipVideoPlayer({ id, uri, initialX, initialY, scale }: PipVideoPlayerProps) {
  const { isPlaying, currentPositionMs } = useEditorStore();

  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true; // PiP video is muted by default to avoid clash
  });

  useEffect(() => {
    if (!player) return;
    if (isPlaying && !player.playing) {
      player.play();
    } else if (!isPlaying && player.playing) {
      player.pause();
    }
  }, [isPlaying, player]);

  return (
    <DraggableOverlay initialX={initialX * 300} initialY={initialY * 300} style={{ width: 160 * scale, height: 90 * scale, overflow: 'hidden', borderRadius: 8, borderWidth: 2, borderColor: 'white' }}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
    </DraggableOverlay>
  );
}
