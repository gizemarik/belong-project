// Profile screen - User progress and stats
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { useMusicStore, selectChallenges } from '../../stores/musicStore';
import { useUserStore, selectTotalPoints, selectCompletedChallenges } from '../../stores/userStore';
import { THEME } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { GlassButton } from '../../components/ui/GlassButton';
import { useThemeStore } from '../../stores/themeStore';
import { ProgressBar } from '../../components/ui/ProgressBar';

export default function ProfileScreen() {
  const { theme, mode } = useAppTheme();
  const toggleTheme = useThemeStore((s) => s.toggle);
  const challenges = useMusicStore(selectChallenges);
  const totalPoints = useUserStore(selectTotalPoints);
  const completedChallenges = useUserStore(selectCompletedChallenges);

  const totalChallenges = challenges.length;
  const completionRate = totalChallenges > 0 ? (completedChallenges.length / totalChallenges) * 100 : 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: THEME.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: THEME.spacing.lg,
      marginBottom: THEME.spacing.sm,
    },
    header: {
      flex: 1,
      fontSize: THEME.fonts.sizes.xxl,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    statsCard: {
      marginBottom: THEME.spacing.md,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: THEME.fonts.sizes.xl,
      fontWeight: 'bold',
      color: theme.colors.accent,
      marginBottom: THEME.spacing.xs,
    },
    statLabel: {
      fontSize: THEME.fonts.sizes.sm,
      color: theme.colors.text.secondary,
    },
    progressCard: {
      marginBottom: THEME.spacing.md,
    },
    sectionTitle: {
      fontSize: THEME.fonts.sizes.lg,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: THEME.spacing.md,
    },
    challengeItem: {
      marginBottom: THEME.spacing.md,
    },
    challengeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: THEME.spacing.xs,
    },
    challengeTitle: {
      fontSize: THEME.fonts.sizes.md,
      color: theme.colors.text.primary,
    },
    challengeStatus: {
      fontSize: THEME.fonts.sizes.lg,
    },
    progressBar: {
      height: 6,
      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: THEME.spacing.xs,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 3,
    },
    progressText: {
      fontSize: THEME.fonts.sizes.sm,
      color: theme.colors.text.secondary,
    },
    achievementsCard: {
      marginBottom: THEME.spacing.xl,
    },
    achievement: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: THEME.spacing.sm,
    },
    achievementIcon: {
      fontSize: THEME.fonts.sizes.xl,
      marginRight: THEME.spacing.md,
    },
    achievementText: {
      fontSize: THEME.fonts.sizes.md,
      color: theme.colors.text.primary,
    },
    noAchievements: {
      fontSize: THEME.fonts.sizes.sm,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ width: 96 }} />
        <Text style={styles.header}>Your Progress</Text>
        <GlassButton
          title={mode === 'dark' ? '🌞 Light' : '🌙 Dark'}
          onPress={toggleTheme}
          variant="secondary"
          style={{ width: 96 }}
        />
      </View>

      {/* Removed success toast demo trigger */}

      {/* Stats Overview */}
      <GlassCard style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedChallenges.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>
      </GlassCard>

      {/* Challenge Progress */}
      <GlassCard style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Challenge Progress</Text>
        {challenges.map((challenge) => {
          const isCompleted = completedChallenges.includes(challenge.id);
          return (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={[
                  styles.challengeStatus,
              { color: isCompleted ? theme.colors.secondary : theme.colors.text.secondary }
                ]}>
                  {isCompleted ? '✅' : '⏳'}
                </Text>
              </View>
              <ProgressBar progress={challenge.progress} animated={false} height={6} />
              <Text style={styles.progressText}>
                {Math.round(challenge.progress)}% • {challenge.points} points
              </Text>
            </View>
          );
        })}
      </GlassCard>

      {/* Achievements */}
      <GlassCard style={styles.achievementsCard}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        
        {totalPoints >= 100 && (
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🏆</Text>
            <Text style={styles.achievementText}>First 100 Points!</Text>
          </View>
        )}
        
        {completedChallenges.length >= 1 && (
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🎵</Text>
            <Text style={styles.achievementText}>Music Lover</Text>
          </View>
        )}
        
        {completionRate >= 100 && (
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🌟</Text>
            <Text style={styles.achievementText}>Perfect Score!</Text>
          </View>
        )}

        {totalPoints === 0 && completedChallenges.length === 0 && (
          <Text style={styles.noAchievements}>
            Complete challenges to unlock achievements!
          </Text>
        )}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
  },
  header: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginVertical: THEME.spacing.lg,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    marginBottom: THEME.spacing.xs,
  },
  statLabel: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  progressCard: {
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.md,
  },
  challengeItem: {
    marginBottom: THEME.spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  challengeTitle: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.primary,
  },
  challengeStatus: {
    fontSize: THEME.fonts.sizes.lg,
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
  achievementsCard: {
    marginBottom: THEME.spacing.xl,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  achievementIcon: {
    fontSize: THEME.fonts.sizes.xl,
    marginRight: THEME.spacing.md,
  },
  achievementText: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.primary,
  },
  noAchievements: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});