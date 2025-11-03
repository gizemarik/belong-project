import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
  backgroundColor?: string;
  fillColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  animated = true,
  style,
  backgroundColor,
  fillColor,
}) => {
  const { theme, mode } = useAppTheme();
  const target = Math.max(0, Math.min(100, progress || 0));
  const sv = useSharedValue(target);

  useEffect(() => {
    const next = Math.max(0, Math.min(100, progress || 0));
    if (animated) {
      sv.value = withTiming(next, { duration: 240 });
    } else {
      sv.value = next;
    }
  }, [progress, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: (sv.value || 0) / 100 }],
  }));

  const trackBg = backgroundColor ?? (mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)');
  const trackFill = fillColor ?? theme.colors.accent;

  return (
    <View style={StyleSheet.flatten([styles.track, { height, backgroundColor: trackBg }, style])}>
      <Animated.View
        style={[
          styles.fill,
          fillStyle,
          { backgroundColor: trackFill, transformOrigin: 'left center' as const },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
});

export default ProgressBar;


