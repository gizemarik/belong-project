// Challenge Detail (modal)
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { GlassCard, GlassButton } from '../../../components/ui/GlassCard';
import { THEME } from '../../../constants/theme';
import { useMusicStore } from '../../../stores/musicStore';
import { useMusicPlayer } from '../../../hooks/useMusicPlayer';
import { useUserStore } from '../../../stores/userStore';

export default function ChallengeDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenge = useMusicStore((s) => s.challenges.find((c) => c.id === id));

  const markChallengeComplete = useMusicStore((s) => s.markChallengeComplete);
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const setCurrentPosition = useMusicStore((s) => s.setCurrentPosition);
  const { play } = useMusicPlayer();
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const completedChallenges = useUserStore((s) => s.completedChallenges);
  const addPoints = useUserStore((s) => s.addPoints);
  const completeChallenge = useUserStore((s) => s.completeChallenge);

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
      <ScrollView style={styles.container} contentContainerStyle={styles.centered}>
        <GlassCard style={styles.centerCard}>
          <Text style={styles.title}>Challenge not found</Text>
          <GlassButton title="Close" onPress={() => router.back()} variant="secondary" />
        </GlassCard>
      </ScrollView>
    );
  }

  const handleMarkComplete = () => {
    if (challenge.completed) return;
    markChallengeComplete(challenge.id);
    if (!completedChallenges.includes(challenge.id)) {
      completeChallenge(challenge.id);
      addPoints(challenge.points);
    }
    Alert.alert('Completed', 'Challenge marked as completed.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

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
          <GlassButton title="Open Player" onPress={async () => {
            if (!challenge) return;
            if (!currentTrack || currentTrack.id !== challenge.id) {
              await play(challenge as any);
            }
            router.push('/(modals)/player');
          }} variant="primary" />
          <GlassButton
            title={challenge.completed ? 'Completed ✓' : 'Mark Completed'}
            onPress={handleMarkComplete}
            variant="secondary"
            disabled={challenge.completed}
          />
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});


