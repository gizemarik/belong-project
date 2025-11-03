import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';
import { usePointsCounter } from '../../hooks/usePointsCounter';
import { useMusicStore, selectCurrentTrack } from '../../stores/musicStore';

interface PointsCounterProps {
  style?: ViewStyle;
  label?: string;
}

export const PointsCounter: React.FC<PointsCounterProps> = ({ style, label = 'Challenge Points' }) => {
  const { pointsEarned } = usePointsCounter();
  const currentTrack = useMusicStore(selectCurrentTrack);

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{pointsEarned} / {currentTrack?.points ?? 0}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  value: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
});


