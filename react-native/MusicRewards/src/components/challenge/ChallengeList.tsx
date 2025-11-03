import React, { useCallback } from 'react';
import { FlatList, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ChallengeCard } from './ChallengeCard';
import { useMusicStore, selectChallenges, selectCurrentTrack, selectIsPlaying } from '../../stores/musicStore';
import type { MusicChallenge } from '../../types';
import { THEME } from '../../constants/theme';

interface ChallengeListProps {
  onPlay: (challenge: MusicChallenge) => void;
  onPressCard?: (challenge: MusicChallenge) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  onPlay,
  onPressCard,
  contentContainerStyle,
}) => {
  const challenges = useMusicStore(selectChallenges);
  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);

  const renderItem = useCallback(({ item }: { item: MusicChallenge }) => (
    <ChallengeCard
      challenge={item}
      onPlay={onPlay}
      isCurrentTrack={currentTrack?.id === item.id}
      isPlaying={isPlaying}
      onPressCard={onPressCard}
    />
  ), [onPlay, onPressCard, currentTrack?.id, isPlaying]);

  return (
    <FlatList
      data={challenges}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={contentContainerStyle ?? styles.listContainer}
      showsVerticalScrollIndicator={false}
      initialNumToRender={6}
      windowSize={10}
      removeClippedSubviews
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: THEME.spacing.xl,
  },
});


