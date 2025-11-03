// Player modal - Full-screen audio player (Expo Router modal)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { THEME } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PointsCounter } from '../../components/ui/PointsCounter';
import { SpeedControls } from '../../components/ui/SpeedControls';
  import AudioVisualizer from '../../components/ui/AudioVisualizer';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useMusicStore } from '../../stores/musicStore';

export default function PlayerModal() {
  const { theme, mode } = useAppTheme();
  const {
    currentTrack,
    isPlaying,
    currentPosition,
    duration,
    play,
    pause,
    resume,
    seekTo,
    rate,
    setRate,
    loading,
    error
  } = useMusicPlayer();
  const [progressWidth, setProgressWidth] = useState(1);
  // Animated progress percent (0..100)
  const progressPct = useSharedValue(0);
  const confettiRef = useRef<any>(null);
  // Read canonical challenge data from the store by id to avoid stale flags
  const canonicalChallenge = useMusicStore((s) =>
    currentTrack ? s.challenges.find((c) => c.id === currentTrack.id) : undefined
  );
  // Fire confetti when challenge transitions to completed
  const prevCompletedRef = useRef<boolean>(false);
  useEffect(() => {
    const done = !!canonicalChallenge?.completed;
    if (done && !prevCompletedRef.current) {
      try { confettiRef.current?.start?.(); } catch {}
    }
    prevCompletedRef.current = done;
  }, [canonicalChallenge?.completed]);

  // Swipe-to-close (downward) gesture (MUST be before any conditional returns)
  const panTransY = useRef(0);
  const panVelY = useRef(0);
  const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
    panTransY.current = e.nativeEvent.translationY || 0;
    panVelY.current = e.nativeEvent.velocityY || 0;
  };
  const onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
    if (e.nativeEvent.state === State.END) {
      if (panTransY.current > 60 || panVelY.current > 800) {
        router.back();
      }
      panTransY.current = 0; panVelY.current = 0;
    }
  };

  // Show loading only while the player is preparing (no artificial delay)
  const showLoading = loading || !duration || duration === 0;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (canonicalChallenge) return canonicalChallenge.progress || 0;
    if (!duration || duration === 0) return 0;
    return (currentPosition / duration) * 100;
  };

  const handleSeek = (percentage: number) => {
    if (duration) {
      const newPosition = (percentage / 100) * duration;
      seekTo(newPosition);
    }
  };

  // Animate progress smoothly whenever it changes
  const computedProgress = getProgress();
  useEffect(() => {
    const next = Math.max(0, Math.min(100, computedProgress || 0));
    progressPct.value = withTiming(next, { duration: 240 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedProgress]);

  const progressFillAnimatedStyle = useAnimatedStyle(() => {
    const px = (progressWidth || 0) * (progressPct.value / 100);
    return { width: px };
  }, [progressWidth]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      if (currentTrack) {
        // If nothing is loaded yet (duration 0), start playback for current track
        if (!duration || duration === 0) {
          await play(currentTrack);
        } else {
          resume();
        }
      }
    }
  };

  if (error) {
    Alert.alert('Playback Error', error);
  }

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <GlassCard style={styles.noTrackCard}>
          <Text style={[styles.noTrackText, { color: theme.colors.text.primary }]}>No track selected</Text>
          <Text style={[styles.noTrackSubtext, { color: theme.colors.text.secondary }]}>
            Go back and select a challenge to start playing music
          </Text>
        </GlassCard>
      </SafeAreaView>
    );
  }

  if (showLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Preparing player…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Track Info */}
        <GlassCard style={styles.trackInfoCard}>
          <Text style={[styles.trackTitle, { color: theme.colors.text.primary }]}>{currentTrack.title}</Text>
          <Text style={[styles.trackArtist, { color: theme.colors.text.secondary }]}>{currentTrack.artist}</Text>
          <Text style={[styles.trackDescription, { color: theme.colors.text.tertiary }]}>{currentTrack.description}</Text>

          <PointsCounter />

          {/* JS-only animated visualizer */}
          <View style={styles.visualizerContainer}>
            <AudioVisualizer
              isPlaying={isPlaying}
              rate={rate}
              height={64}
              barCount={40}
              seed={currentTrack.id}
              backgroundColor={mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              barColor={theme.colors.accent}
              gap={4}
              rounded
            />
          </View>
        </GlassCard>

        {/* Progress Section */}
        <GlassCard style={styles.progressCard}>
          <Text style={[styles.progressLabel, { color: theme.colors.text.primary }]}>Listening Progress</Text>


          {/* Progress Bar */}
          <TouchableOpacity
            style={styles.progressTrack}
            onLayout={(e) => setProgressWidth(e.nativeEvent.layout.width || 1)}
            onPress={(event) => {
              const locationX = (event.nativeEvent as { locationX: number }).locationX;
              const percentage = progressWidth > 0 ? (locationX / progressWidth) * 100 : 0;
              handleSeek(percentage);
            }}
            accessibilityRole="progressbar"
            accessibilityLabel="Listening progress"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(getProgress()) }}
          >
            <View style={styles.progressBackground}>
              <Animated.View style={[styles.progressFill, progressFillAnimatedStyle]} />
            </View>
          </TouchableOpacity>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>{formatTime(currentPosition)}</Text>
            <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>{formatTime(duration)}</Text>
          </View>

          {/* Progress Percentage */}
          <Text style={[styles.progressPercentage, { color: theme.colors.accent }]}>
            {Math.round(getProgress())}% Complete
          </Text>
        </GlassCard>

        {/* Controls */}
        <GlassCard style={styles.controlsCard}>
          <View style={styles.controlsRow}>
            <GlassButton
              title="⏪ -10s"
              onPress={() => handleSeek(Math.max(0, getProgress() - (10 / duration) * 100))}
              variant="secondary"
              style={styles.controlButton}
              accessibilityLabel="Rewind 10 seconds"
              accessibilityHint="Double tap to rewind ten seconds"
            />

            <GlassButton
              title={loading ? "..." : isPlaying ? "⏸️ Pause" : "▶️ Play"}
              onPress={handlePlayPause}
              variant="primary"
              style={styles.mainControlButton}
              loading={loading}
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
              accessibilityHint={isPlaying ? 'Double tap to pause playback' : 'Double tap to start playback'}
            />

            <GlassButton
              title="⏩ +10s"
              onPress={() => handleSeek(Math.min(100, getProgress() + (10 / duration) * 100))}
              variant="secondary"
              style={styles.controlButton}
              accessibilityLabel="Forward 10 seconds"
              accessibilityHint="Double tap to forward ten seconds"
            />
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </GlassCard>

        <SpeedControls rate={rate} setRate={setRate} />

        {/* Challenge Progress */}
        <GlassCard style={styles.challengeCard}>
          <Text style={styles.challengeLabel}>Challenge Status</Text>
          <View style={styles.challengeInfo}>
            <Text style={[
              styles.challengeStatus,
              { color: canonicalChallenge?.completed ? theme.colors.secondary : theme.colors.accent }
            ]}>
              {canonicalChallenge?.completed ? '✅ Completed' : '🎧 In Progress'}
            </Text>
            <Text style={[styles.challengeProgress, { color: theme.colors.text.secondary }]}>
              {Math.round(canonicalChallenge?.progress ?? 0)}% of challenge complete
            </Text>
          </View>
        </GlassCard>
      </View>
      {/* Full-screen confetti overlay to match Challenge Detail */}
      <View pointerEvents="none" style={styles.confettiOverlayRoot}>
        <ConfettiCannon
          count={180}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          autoStart={false}
          fadeOut={false}
          ref={confettiRef}
          explosionSpeed={200}
          fallSpeed={2000}
        />
      </View>
    </SafeAreaView>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
    justifyContent: 'space-between',
  },
  confettiOverlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.lg,
  },
  loadingText: {
    marginTop: THEME.spacing.sm,
    color: THEME.colors.text.secondary,
    fontSize: THEME.fonts.sizes.md,
  },
  noTrackCard: {
    margin: THEME.spacing.xl,
    alignItems: 'center',
  },
  noTrackText: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  noTrackSubtext: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  trackInfoCard: {
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  trackArtist: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  trackDescription: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  visualizerContainer: {
    marginTop: THEME.spacing.sm,
    width: '100%',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  pointsValue: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
  progressCard: {
    // Card styling handled by GlassCard
  },
  progressLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    marginBottom: THEME.spacing.md,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  timeText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  progressPercentage: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    textAlign: 'center',
  },
  controlsCard: {
    // Card styling handled by GlassCard
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flex: 0.25,
    marginHorizontal: THEME.spacing.xs,
  },
  mainControlButton: {
    flex: 0.4,
    marginHorizontal: THEME.spacing.xs,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
  },
  challengeCard: {
    // Card styling handled by GlassCard
  },
  challengeLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  challengeInfo: {
    alignItems: 'center',
  },
  challengeStatus: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.xs,
  },
  challengeProgress: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
});