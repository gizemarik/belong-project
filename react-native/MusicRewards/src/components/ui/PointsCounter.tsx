import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { usePointsCounter } from '../../hooks/usePointsCounter';
import { useMusicStore, selectCurrentTrack } from '../../stores/musicStore';

interface PointsCounterProps {
  style?: ViewStyle;
  label?: string;
}

export const PointsCounter: React.FC<PointsCounterProps> = ({ style, label = 'Challenge Points' }) => {
  const { pointsEarned } = usePointsCounter();
  const currentTrack = useMusicStore(selectCurrentTrack);
  const { theme } = useAppTheme();

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.accent }]}>{pointsEarned} / {currentTrack?.points ?? 0}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: THEME.fonts.sizes.sm,
  },
  value: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
  },
});


