// Home screen - Challenge list (Expo Router)
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChallengeList } from '../../components/challenge/ChallengeList';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { useMusicStore, selectCurrentTrack } from '../../stores/musicStore';
import { useUserStore } from '../../stores/userStore';
import { THEME } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { MusicChallenge } from '../../types';
import TrackPlayer from 'react-native-track-player';
import { GlassButton } from '../../components/ui/GlassButton';
import { useToast } from '../../hooks/useToast';
 

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const [openingPlayer, setOpeningPlayer] = useState(false);
  
  const currentTrack = useMusicStore(selectCurrentTrack);
  const { play, resume } = useMusicPlayer();
  const toast = useToast();
  

  const handlePlayChallenge = async (challenge: MusicChallenge) => {
    try {
      if (openingPlayer) return;
      setOpeningPlayer(true);
      if (currentTrack?.id === challenge.id) {
        await resume();
      } else {
        await play(challenge);
      }
      // Navigate to player modal after starting playback
      router.push('/(modals)/player');
      setTimeout(() => setOpeningPlayer(false), 600);
    } catch (error) {
      console.error('Failed to play challenge:', error);
      toast.error('Failed to start playback');
      setOpeningPlayer(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: THEME.spacing.md,
      paddingTop: THEME.spacing.lg,
    },
    header: {
      fontSize: THEME.fonts.sizes.xxl,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: THEME.spacing.sm,
    },
    subtitle: {
      fontSize: THEME.fonts.sizes.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: THEME.spacing.lg,
    },
    listContainer: {
      paddingBottom: THEME.spacing.xl,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Music Challenges</Text>
      <Text style={styles.subtitle}>
        Complete listening challenges to earn points and unlock achievements
      </Text>
      {/* TEMP: Added for local testing; will be removed before release. TODO: Remove reset button */}
      <GlassButton
        title="Reset"
        onPress={async () => {
          // Reset user and music stores and TrackPlayer
          useUserStore.getState().resetProgress();
          useMusicStore.getState().loadChallenges();
          useMusicStore.getState().clearCurrentTrack();
          useMusicStore.getState().setIsPlaying(false);
          useMusicStore.getState().setCurrentPosition(0);
          try { await TrackPlayer.reset(); } catch {}
          toast.info('Challenge statuses have been reset.');
          
        }}
        variant="secondary"
        style={{ marginBottom: THEME.spacing.md }}
      />
      
      <ChallengeList
        onPlay={handlePlayChallenge}
        onPressCard={(challenge) => router.push({ pathname: '/(modals)/challenge/[id]', params: { id: challenge.id } })}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}