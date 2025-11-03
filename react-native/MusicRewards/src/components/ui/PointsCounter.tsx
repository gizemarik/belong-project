import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { usePointsCounter } from '../../hooks/usePointsCounter';
import { useMusicStore, selectCurrentTrack } from '../../stores/musicStore';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

interface PointsCounterProps {
  style?: ViewStyle;
  label?: string;
}

export const PointsCounter: React.FC<PointsCounterProps> = ({ style, label = 'Challenge Points' }) => {
  const { pointsEarned } = usePointsCounter();
  const currentTrack = useMusicStore(selectCurrentTrack);
  const { theme } = useAppTheme();

  // Animated count-up and scale pop
  const [displayed, setDisplayed] = useState(0);
  const valueSv = useSharedValue(0);
  const scaleSv = useSharedValue(1);

  useEffect(() => {
    // animate number to new pointsEarned
    valueSv.value = withTiming(pointsEarned, { duration: 450 });
    // pop effect
    scaleSv.value = withSequence(
      withTiming(1.08, { duration: 120 }),
      withTiming(1, { duration: 120 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsEarned]);

  useAnimatedReaction(
    () => valueSv.value,
    (val) => {
      runOnJS(setDisplayed)(Math.round(val));
    }
  );

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleSv.value }],
  }));

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <Animated.Text style={[styles.value, { color: theme.colors.accent }, animatedTextStyle]}>
        {displayed} / {currentTrack?.points ?? 0}
      </Animated.Text>
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


