/**
 * OmniAI — Editor Screen
 * Professional mobile video editor — single screen, no scroll.
 * Layout: Top bar → Video Preview → Playback Controls → Timeline → Toolbar
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  ScrollView,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius } from '@/src/theme';
import { useProjectStore } from '@/src/stores/projectStore';
import { useEditorStore } from '@/src/stores/editorStore';
import { playerBridge } from '@/src/services/editor/playerBridge';
import { 
  Music, Type, Sparkles, Captions, Layers, Wand2, Smile, Clock, SlidersHorizontal, Scissors,
  Play, Pause, Undo2, Redo2, Frown, Film, Pointer, AudioWaveform
} from 'lucide-react-native';

// Components
import { VideoPlayer } from '@/src/components/editor/VideoPlayer';
import { DraggableOverlay } from '@/src/components/editor/DraggableOverlay';
import { BottomSheet } from '@/src/components/ui/BottomSheet';
import { TrimPanel } from '@/src/components/editor/panels/TrimPanel';
import { TextPanel } from '@/src/components/editor/panels/TextPanel';
import { FilterPanel } from '@/src/components/editor/panels/FilterPanel';
import { OverlayPanel } from '@/src/components/editor/panels/OverlayPanel';
import { SpeedPanel } from '@/src/components/editor/panels/SpeedPanel';
import { AudioPanel } from '@/src/components/editor/panels/AudioPanel';
import { AIPromptPanel } from '@/src/components/editor/panels/AIPromptPanel';
import { CaptionPanel } from '@/src/components/editor/panels/CaptionPanel';
import { EffectPanel } from '@/src/components/editor/panels/EffectPanel';
import { StickersPanel } from '@/src/components/editor/panels/StickersPanel';
import { AdjustPanel } from '@/src/components/editor/panels/AdjustPanel';
import { PipVideoPlayer } from '@/src/components/editor/PipVideoPlayer';

const { width: W, height: H } = Dimensions.get('window');

const PANEL_HEIGHTS: Record<string, number> = {
  trim: 340, text: 460, captions: 460, filter: 260,
  effects: 260, stickers: 460, speed: 340,
  audio: 340, adjust: 460, ai: 460, overlay: 340,
};

// ─── Toolbar tool definitions ───────────────────────────────────────────────
const TOOLS = [
  { id: 'audio',    label: 'Audio',    icon: Music },
  { id: 'text',     label: 'Text',     icon: Type },
  { id: 'ai',       label: 'AI Edit',  icon: Sparkles },
  { id: 'captions', label: 'Captions', icon: Captions },
  { id: 'filter',   label: 'Filter',   icon: Sparkles },
  { id: 'overlay',  label: 'Overlay',  icon: Layers },
  { id: 'effects',  label: 'Effects',  icon: Wand2 },
  { id: 'stickers', label: 'Stickers', icon: Smile },
  { id: 'speed',    label: 'Speed',    icon: Clock },
  { id: 'adjust',   label: 'Adjust',   icon: SlidersHorizontal },
  { id: 'trim',     label: 'Cutout',   icon: Scissors },
] as const;

// ─── Multi-track Timeline ────────────────────────────────────────────────────
function MultiTrackTimeline() {
  const {
    currentPositionMs, durationMs, setCurrentPosition,
    trimStartMs, trimEndMs, isTrimActive,
    captions, textOverlays, stickers,
  } = useEditorStore();

  // Make tracks scrollable if they exceed screen width (zoom simulation)
  const trackWidth = Math.max(W - 60, (durationMs / 1000) * 20); // 20px per second minimum
  const progress = durationMs > 0 ? currentPositionMs / durationMs : 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (durationMs === 0) return;
        const pct = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidth));
        const seekMs = pct * durationMs;
        setCurrentPosition(seekMs);
        playerBridge.seek(seekMs);
      },
      onPanResponderMove: (evt) => {
        if (durationMs === 0) return;
        const pct = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidth));
        const seekMs = pct * durationMs;
        setCurrentPosition(seekMs);
        playerBridge.seek(seekMs);
      },
    })
  ).current;

  // Generate waveform bar heights
  const waveData = Array.from({ length: 40 }, (_, i) => 
    Math.abs(Math.sin(i * 1.3) * 0.6 + Math.sin(i * 0.7) * 0.4)
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: W }}>
      <View style={tlStyles.container}>
        {/* ── Caption / Text track ── */}
        <View style={tlStyles.track}>
          <View style={tlStyles.trackIcon}>
            <Type color={Colors.textTertiary} size={16} />
          </View>
          <View
            style={[tlStyles.trackBody, { width: trackWidth }]}
            {...panResponder.panHandlers}
          >
            {[...captions, ...textOverlays].map((c: any) => {
              const left = durationMs > 0 ? (c.startMs / durationMs) * 100 : 0;
              const w = durationMs > 0 ? ((c.endMs - c.startMs) / durationMs) * 100 : 30;
              return (
                <View key={c.id} style={[tlStyles.captionSegment, { left: `${left}%`, width: `${Math.max(w, 2)}%` }]}>
                  <Text style={tlStyles.captionSegmentText} numberOfLines={1}>{c.text}</Text>
                </View>
              );
            })}
            {/* Playhead */}
            <View style={[tlStyles.playhead, { left: `${Math.min(progress * 100, 99)}%` }]} />
          </View>
        </View>

        {/* ── Sticker track ── */}
        <View style={tlStyles.track}>
          <View style={tlStyles.trackIcon}>
            <Smile color={Colors.textTertiary} size={16} />
          </View>
          <View style={[tlStyles.trackBody, { width: trackWidth }]} {...panResponder.panHandlers}>
            {stickers.map((s: any) => {
              const left = durationMs > 0 ? (s.startMs / durationMs) * 100 : 0;
              const w = durationMs > 0 ? ((s.endMs - s.startMs) / durationMs) * 100 : 30;
              return (
                <View key={s.id} style={[tlStyles.stickerSegment, { left: `${left}%`, width: `${Math.max(w, 2)}%` }]}>
                  <Text style={tlStyles.stickerSegmentText} numberOfLines={1}>{s.emoji}</Text>
                </View>
              );
            })}
            {/* Playhead */}
            <View style={[tlStyles.playhead, { left: `${Math.min(progress * 100, 99)}%` }]} />
          </View>
        </View>

        {/* ── Audio waveform track ── */}
        <View style={tlStyles.track}>
          <View style={tlStyles.trackIcon}>
            <AudioWaveform color={Colors.textTertiary} size={16} />
          </View>
          <View style={[tlStyles.trackBody, { width: trackWidth, overflow: 'hidden' }]}>
            <View style={[tlStyles.playhead, { left: `${Math.min(progress * 100, 99)}%` }]} />
          </View>
        </View>

        {/* ── Video thumbnail track ── */}
        <View style={tlStyles.track}>
          <View style={tlStyles.trackIcon}>
            <Film color={Colors.textTertiary} size={16} />
          </View>
          <View style={[tlStyles.trackBody, { width: trackWidth, overflow: 'hidden' }]}>
            <View style={tlStyles.videoStripRow}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={tlStyles.videoThumb}>
                  <LinearGradient
                    colors={['#252536', '#1A1A28']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Film size={10} color={Colors.textTertiary} />
                </View>
              ))}
              <TouchableOpacity style={tlStyles.addThumb}>
                <Text style={tlStyles.addThumbText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={[tlStyles.playhead, { left: `${Math.min(progress * 100, 99)}%` }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const tlStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    gap: 4,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
  },
  trackIcon: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBody: {
    flex: 1,
    height: 30,
    position: 'relative',
    backgroundColor: '#1A1A24',
    borderRadius: 4,
  },
  captionSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#7C3AED',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 30,
  },
  captionSegmentText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  stickerSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#EC4899',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 10,
  },
  stickerSegmentText: {
    fontSize: 10,
    color: '#fff',
  },
  audioSegment: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#9333EA',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    gap: 6,
    overflow: 'hidden',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1.5,
    flex: 1,
  },
  waveBar: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
  },
  audioLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
    position: 'absolute',
    left: 6,
    top: 4,
  },
  videoStripRow: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    flexDirection: 'row',
    gap: 1,
  },
  videoThumb: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addThumb: {
    width: 30,
    height: '100%',
    backgroundColor: '#252536',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
  },
  addThumbText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#fff',
    zIndex: 10,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
});

// ─── Main Editor Screen ──────────────────────────────────────────────────────
export default function EditorScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { getProject, updateProject } = useProjectStore();
  const insets = useSafeAreaInsets();
  const {
    activeTool, setActiveTool, initEditor, resetEditor,
    undoStack, redoStack, undo, redo,
    textOverlays, captions, stickers, videoOverlays, currentPositionMs, durationMs,
    isPlaying, setPlaying, isAIProcessing
  } = useEditorStore();

  const project = projectId ? getProject(projectId) : undefined;

  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [quality, setQuality] = useState<'4K' | '1080p' | '720p'>('1080p');
  
  const [title, setTitle] = useState(project?.title || '');
  
  // AI Pulse Animation
  const aiPulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAIProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(aiPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(aiPulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      aiPulseAnim.setValue(0);
    }
  }, [isAIProcessing]);

  useEffect(() => {
    if (project) initEditor(project.durationMs || 60000);
    return () => resetEditor();
  }, [project?.id]);

  const formatTimecode = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const frame = Math.floor((ms % 1000) / 33);
    return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  const renderToolPanel = () => {
    switch (activeTool) {
      case 'trim':     return <TrimPanel />;
      case 'text':     return <TextPanel />;
      case 'captions': return <CaptionPanel />;
      case 'filter':   return <FilterPanel />;
      case 'overlay':  return <OverlayPanel />;
      case 'effects':  return <EffectPanel />;
      case 'stickers': return <StickersPanel />;
      case 'speed':    return <SpeedPanel />;
      case 'audio':    return <AudioPanel />;
      case 'adjust':   return <AdjustPanel />;
      case 'ai':       return <AIPromptPanel />;
      default:         return null;
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Frown size={48} color={Colors.textSecondary} />
          <Text style={{ color: Colors.textSecondary, fontSize: 16, marginTop: 12 }}>Project not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 8 }}>
            <Text style={{ color: Colors.primaryLight }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

      {/* ═══════════════════════════════════════
          TOP BAR
      ═══════════════════════════════════════ */}
      <View style={s.topBar}>
        {/* Close */}
        <TouchableOpacity onPress={() => router.back()} style={s.topCloseBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.topCloseIcon}>✕</Text>
        </TouchableOpacity>

        {/* Project title + quality dropdown */}
        <View style={s.topTitleRow}>
          <TextInput
            style={s.topTitleInput}
            value={title}
            onChangeText={setTitle}
            onEndEditing={() => {
              if (title.trim() && title !== project.title) {
                updateProject(project.id, { title: title.trim() });
              }
            }}
            placeholder="Project Title"
            placeholderTextColor={Colors.textTertiary}
            selectTextOnFocus
          />
          <TouchableOpacity onPress={() => setShowQualityMenu(!showQualityMenu)} style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}>
            <View style={s.qualityBadge}>
              <Text style={s.qualityBadgeText}>{quality}</Text>
            </View>
            <Text style={s.topChevron}> ∨</Text>
          </TouchableOpacity>
        </View>

        {/* Export */}
        <TouchableOpacity onPress={() => router.push(`/export/${projectId}?quality=${quality}`)} style={s.exportBtn}>
          <Text style={s.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Quality dropdown */}
      {showQualityMenu && (
        <View style={s.qualityMenu}>
          {(['4K', '1080p', '720p'] as const).map(q => (
            <TouchableOpacity key={q} onPress={() => { setQuality(q); setShowQualityMenu(false); }} style={s.qualityMenuItem}>
              <Text style={[s.qualityMenuText, quality === q && s.qualityMenuTextActive]}>{q}</Text>
              {quality === q && <Text style={{ color: Colors.primaryLight }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ═══════════════════════════════════════
          VIDEO PREVIEW
      ═══════════════════════════════════════ */}
      <View style={s.videoSection}>
        <VideoPlayer
          videoUri={project.sourceVideoLocalPath}
          style={s.videoPlayer}
        />

        {/* Text overlays */}
        {textOverlays.map((overlay) => (
          <DraggableOverlay key={overlay.id} style={[
            s.textOverlay,
            overlay.position === 'top' && s.overlayTop,
            overlay.position === 'center' && s.overlayCenter,
            overlay.position === 'bottom' && s.overlayBottom,
          ]}>
            <Text style={[s.textOverlayText, { fontSize: Math.min(overlay.fontSize, 26), color: overlay.color }]}>
              {overlay.text}
            </Text>
          </DraggableOverlay>
        ))}

        {/* Active captions */}
        {captions
          .filter(c => currentPositionMs >= c.startMs && currentPositionMs <= c.endMs)
          .map((c) => (
            <DraggableOverlay key={c.id} style={[s.textOverlay, s.overlayBottom]}>
              <Text style={[s.textOverlayText, { fontSize: c.fontSize, color: c.color }]}>{c.text}</Text>
            </DraggableOverlay>
          ))}

        {/* Stickers */}
        {stickers
          .filter(st => currentPositionMs >= st.startMs && currentPositionMs <= st.endMs)
          .map((sticker) => (
            <DraggableOverlay key={sticker.id} style={[
              s.stickerOverlay,
              { left: `${sticker.x * 100}%` as any, top: `${sticker.y * 100}%` as any, transform: [{ scale: sticker.scale }] }
            ]}>
              <Image source={{ uri: sticker.url }} style={{ width: 64, height: 64 }} resizeMode="contain" />
            </DraggableOverlay>
          ))}
          
        {/* Video Overlays */}
        {videoOverlays
          .filter(o => currentPositionMs >= o.startMs && currentPositionMs <= o.endMs)
          .map((o) => (
            <PipVideoPlayer
              key={o.id}
              id={o.id}
              uri={o.uri}
              initialX={o.x}
              initialY={o.y}
              scale={o.scale}
            />
          ))}
      </View>

      {/* ═══════════════════════════════════════
          PLAYBACK CONTROLS
      ═══════════════════════════════════════ */}
      <View style={s.playbackBar}>
        {/* Play/Pause */}
        <TouchableOpacity
          onPress={() => {
            if (isPlaying) {
              playerBridge.pause();
            } else {
              playerBridge.play();
            }
          }}
          style={s.playBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isPlaying
            ? <Pause color={Colors.textPrimary} size={18} fill={Colors.textPrimary} />
            : <Play color={Colors.textPrimary} size={18} fill={Colors.textPrimary} />
          }
        </TouchableOpacity>

        {/* Timecode */}
        <View style={s.timecodeBlock}>
          <Text style={s.timecodeMain}>{formatTimecode(currentPositionMs)}</Text>
          <Text style={s.timecodeTotal}>{formatTimecode(durationMs)}</Text>
        </View>

        {/* Zoom indicator */}
        <View style={s.zoomBadge}>
          <Text style={s.zoomText}>1s</Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Undo */}
        <TouchableOpacity
          onPress={undo}
          disabled={undoStack.length === 0}
          style={[s.playBtn, undoStack.length === 0 && s.disabledBtn]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Undo2 size={18} color={undoStack.length === 0 ? Colors.textTertiary : Colors.textPrimary} />
        </TouchableOpacity>

        {/* Redo */}
        <TouchableOpacity
          onPress={redo}
          disabled={redoStack.length === 0}
          style={[s.playBtn, redoStack.length === 0 && s.disabledBtn]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Redo2 size={18} color={redoStack.length === 0 ? Colors.textTertiary : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════
          MULTI-TRACK TIMELINE
      ═══════════════════════════════════════ */}
      <View style={s.timelineSection}>
        <MultiTrackTimeline />
      </View>

      {/* ═══════════════════════════════════════
          EDITOR TOOLBAR
      ═══════════════════════════════════════ */}
      <View style={[s.toolbar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.toolbarScroll}
          bounces={false}
        >
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            const IconComp = tool.icon;
            return (
              <TouchableOpacity
                key={tool.id}
                onPress={() => setActiveTool(tool.id as any)}
                style={s.toolItem}
                activeOpacity={0.7}
              >
                <View style={s.toolIconWrapper}>
                  <IconComp color={isActive ? Colors.primaryLight : Colors.textSecondary} />
                  {isActive && <View style={s.toolActiveBar} />}
                </View>
                <Text style={[s.toolLabel, isActive && s.toolLabelActive]}>{tool.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ═══════════════════════════════════════
          TOOL PANEL BOTTOM SHEET
      ═══════════════════════════════════════ */}
      <BottomSheet
        visible={activeTool !== null}
        onClose={() => setActiveTool(null)}
        height={activeTool ? PANEL_HEIGHTS[activeTool] || 320 : 320}
      >
        {renderToolPanel()}
      </BottomSheet>

      {/* ═══════════════════════════════════════
          AI PROCESSING OVERLAY
      ═══════════════════════════════════════ */}
      {isAIProcessing && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, justifyContent: 'center', alignItems: 'center' }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <Animated.View style={{
            ...StyleSheet.absoluteFillObject,
            opacity: aiPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] })
          }}>
             <LinearGradient
               colors={['rgba(139,92,246,0.6)', 'rgba(236,72,153,0.6)', 'rgba(59,130,246,0.6)']}
               start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
               style={StyleSheet.absoluteFill}
             />
          </Animated.View>
        </View>
      )}

    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0C0C0C',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topCloseIcon: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  topTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginHorizontal: 8,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    maxWidth: 160,
  },
  topTitleInput: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    maxWidth: 160,
    padding: 0,
    margin: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  topChevron: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  qualityBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  qualityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exportBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },

  // Quality menu
  qualityMenu: {
    position: 'absolute',
    top: 56,
    left: '30%',
    zIndex: 100,
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  qualityMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 20,
  },
  qualityMenuText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  qualityMenuTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  // Video
  videoSection: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    flex: 1,
  },
  textOverlay: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayTop: { top: 32 },
  overlayCenter: { top: '40%' },
  overlayBottom: { bottom: 24 },
  textOverlayText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  stickerOverlay: {
    position: 'absolute',
    marginLeft: -16,
    marginTop: -16,
  },

  // Playback bar
  playbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0C0C0C',
    gap: 4,
  },
  playBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: { opacity: 0.3 },
  timecodeBlock: {
    marginLeft: 4,
    alignItems: 'center',
  },
  timecodeMain: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    lineHeight: 16,
  },
  timecodeTotal: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
    lineHeight: 12,
  },
  zoomBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  zoomText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Timeline
  timelineSection: {
    backgroundColor: '#111116',
    paddingVertical: 6,
    paddingRight: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  // Toolbar
  toolbar: {
    backgroundColor: '#0C0C0C',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  toolbarScroll: {
    paddingHorizontal: 8,
    gap: 0,
  },
  toolItem: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    minWidth: 60,
  },
  toolIconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  toolActiveBar: {
    position: 'absolute',
    bottom: -4,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: Colors.primaryLight,
    borderRadius: 1,
  },
  toolLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 5,
    fontWeight: '500',
  },
  toolLabelActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
});
