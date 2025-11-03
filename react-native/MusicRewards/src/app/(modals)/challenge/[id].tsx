// Challenge Detail (modal)
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useLocalSearchParams, router } from 'expo-router';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { THEME } from '../../../constants/theme';
import { useMusicStore } from '../../../stores/musicStore';
import { useMusicPlayer } from '../../../hooks/useMusicPlayer';
import { useAppTheme } from '../../../hooks/useAppTheme';
// removed unused useUserStore after centralizing completion flow
// Progress bar left inline here due to module resolution quirk in this path
import { completeChallengeFlow } from '../../../services/challengeActions';
 
import { haptics } from '../../../utils/haptics';

export default function ChallengeDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: windowWidth } = useWindowDimensions();
  const challenge = useMusicStore((s) => s.challenges.find((c) => c.id === id));
  const { theme } = useAppTheme();

  // Removed unused store selectors after centralizing completion flow
  const { play } = useMusicPlayer();
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const wasCompletedRef = React.useRef(false);

  React.useEffect(() => {
    const now = !!challenge?.completed;
    if (now && !wasCompletedRef.current) {
      try { haptics.heavy(); } catch {}
    }
    wasCompletedRef.current = now;
  }, [challenge?.completed]);

  // Swipe-to-close (downward) gesture (MUST be before any conditional returns)
  const panTransY = React.useRef(0);
  const panVelY = React.useRef(0);
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

  const formattedDuration = useMemo(() => {
    if (!challenge) return '0:00';
    const minutes = Math.floor(challenge.duration / 60);
    const seconds = challenge.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [challenge]);

  const earnedPoints = useMemo(() => {
    if (!challenge) return 0;
    const effective = Math.min(challenge.progress, 90);
    return Math.floor((effective / 90) * challenge.points);
  }, [challenge]);

  if (!challenge) {
    return (
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.centered}>
        <GlassCard style={styles.centerCard}>
          <Text style={styles.title}>Challenge not found</Text>
          <GlassButton title="Close" onPress={() => router.back()} variant="secondary" />
        </GlassCard>
      </ScrollView>
      </PanGestureHandler>
    );
  }

  const handleMarkComplete = () => {
    if (challenge.completed) return;
    completeChallengeFlow(challenge.id);
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
    <View style={styles.wrapper}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>

      <GlassCard style={styles.card}>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.subtitle}>{challenge.artist}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.row}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{formattedDuration}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Points</Text>
            <Text style={[styles.infoValue, { color: THEME.colors.accent }]}>{challenge.points}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Earned</Text>
            <Text style={[styles.infoValue, { color: THEME.colors.accent }]}>{earnedPoints}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Difficulty</Text>
            <Text style={styles.infoValue}>{challenge.difficulty.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${challenge.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(challenge.progress)}% complete</Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <View style={styles.actions}>
          {/* Confetti moved to full-screen overlay */}
          <GlassButton title="Open Player" onPress={async () => {
            if (!challenge) return;
            if (!currentTrack || currentTrack.id !== challenge.id) {
              await play(challenge);
            }
            router.push('/(modals)/player');
          }} variant="primary"
            accessibilityLabel="Open player"
            accessibilityHint="Opens the full screen audio player"
          />
          <GlassButton
            title={challenge.completed ? 'Completed ✓' : 'Mark Completed'}
            onPress={handleMarkComplete}
            variant="secondary"
            disabled={challenge.completed}
            accessibilityLabel={challenge.completed ? 'Challenge already completed' : 'Mark challenge as completed'}
            accessibilityHint={challenge.completed ? 'No action available' : 'Marks this challenge as completed and awards points'}
          />
        </View>
      </GlassCard>
      </ScrollView>
      {/* Full-screen confetti overlay */}
      {challenge.completed && (
        <View pointerEvents="none" style={styles.confettiOverlayRoot}>
          <ConfettiCannon
            key={`confetti-${challenge.id}`}
            count={180}
            origin={{ x: windowWidth / 2, y: -30 }}
            autoStart
            fadeOut={false}
            explosionSpeed={200}
            fallSpeed={2000}
          />
        </View>
      )}
    </View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: THEME.spacing.md,
    paddingBottom: THEME.spacing.xl,
  },
  centered: {
    padding: THEME.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80%'
  },
  centerCard: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  description: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    marginBottom: THEME.spacing.xs,
  },
  infoValue: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: THEME.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 3,
  },
  progressText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  actions: {
    gap: THEME.spacing.sm,
  },
  confettiOverlayRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -30,
    zIndex: 99999,
    elevation: 99999,
  },
});


