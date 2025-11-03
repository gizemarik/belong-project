// ChallengeCard component - Individual challenge display
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { THEME } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { MusicChallenge } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';

interface ChallengeCardProps {
  challenge: MusicChallenge;
  onPlay: (challenge: MusicChallenge) => void;
  isCurrentTrack?: boolean;
  isPlaying?: boolean;
  onPressCard?: (challenge: MusicChallenge) => void;
}

const ChallengeCardBase: React.FC<ChallengeCardProps> = ({
  challenge,
  onPlay,
  isCurrentTrack = false,
  isPlaying = false,
  onPressCard,
}) => {
  const { theme, mode } = useAppTheme();
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.secondary;
      case 'medium': return theme.colors.accent;
      case 'hard': return theme.colors.primary;
      default: return theme.colors.text.secondary;
    }
  };

  const getButtonTitle = () => {
    if (challenge.completed) return 'Completed ✓';
    if (isCurrentTrack && isPlaying) return 'Playing...';
    if (isCurrentTrack && !isPlaying) return 'Resume';
    return 'Play Challenge';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPressCard && onPressCard(challenge)}
    >
      <GlassCard
        style={StyleSheet.flatten([
          styles.card,
          isCurrentTrack && { borderWidth: 2, borderColor: theme.colors.primary }
        ])}
        gradientColors={
          isCurrentTrack
            ? theme.glass.gradientColors.primary
            : theme.glass.gradientColors.card
        }
      >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{challenge.title}</Text>
          <Text style={[styles.artist, { color: theme.colors.text.secondary }]}>{challenge.artist}</Text>
        </View>
        <View style={StyleSheet.flatten([
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(challenge.difficulty) }
        ])}>
          <Text style={[styles.difficultyText, { color: theme.colors.background }]}>
            {challenge.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: theme.colors.text.tertiary }]} numberOfLines={2}>
        {challenge.description}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.text.tertiary }]}>Duration</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>{formatDuration(challenge.duration)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.text.tertiary }]}>Points</Text>
          <Text style={[styles.infoValue, { color: theme.colors.accent }]}> 
            {challenge.points}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: theme.colors.text.tertiary }]}>Progress</Text>
          <Text style={[styles.infoValue, { color: theme.colors.text.primary }]}>{Math.round(challenge.progress)}%</Text>
        </View>
      </View>

      {challenge.progress > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={challenge.progress} animated={false} height={4} />
        </View>
      )}

      <GlassButton
        title={getButtonTitle()}
        onPress={() => onPlay(challenge)}
        variant={isCurrentTrack ? 'primary' : 'secondary'}
        disabled={challenge.completed}
        style={styles.playButton}
      />
      </GlassCard>
    </TouchableOpacity>
  );
};

export const ChallengeCard = React.memo(ChallengeCardBase, (prev, next) => {
  // Re-render only when relevant fields change
  return (
    prev.isCurrentTrack === next.isCurrentTrack &&
    prev.isPlaying === next.isPlaying &&
    prev.challenge.id === next.challenge.id &&
    prev.challenge.progress === next.challenge.progress &&
    prev.challenge.completed === next.challenge.completed &&
    prev.challenge.points === next.challenge.points &&
    prev.challenge.title === next.challenge.title &&
    prev.challenge.artist === next.challenge.artist &&
    prev.onPlay === next.onPlay &&
    prev.onPressCard === next.onPressCard
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: THEME.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: THEME.spacing.sm,
  },
  title: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.md,
  },
  difficultyBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  difficultyText: {
    fontSize: THEME.fonts.sizes.xs,
    fontWeight: 'bold',
  },
  description: {
    fontSize: THEME.fonts.sizes.sm,
    lineHeight: 20,
    marginBottom: THEME.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.md,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: THEME.fonts.sizes.xs,
    marginBottom: THEME.spacing.xs,
  },
  infoValue: {
    fontSize: THEME.fonts.sizes.sm,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  playButton: {
    marginTop: THEME.spacing.sm,
  },
});