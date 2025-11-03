import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type AudioVisualizerProps = {
  isPlaying: boolean;
  rate?: number;
  height?: number;
  barCount?: number;
  barColor?: string;
  backgroundColor?: string;
  gap?: number;
  rounded?: boolean;
  seed?: string;
};

// Very small, deterministic pseudo-random based on a string seed and index
function createSeededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (x: number) => {
    let n = h ^ (x + 0x9e3779b9 + (h << 6) + (h >> 2));
    n = Math.imul(n ^ (n >>> 15), 1 | n);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967295;
  };
}

export function AudioVisualizer(props: AudioVisualizerProps) {
  const {
    isPlaying,
    rate = 1,
    height = 90,
    barCount = 36,
    barColor = 'rgba(255,255,255,0.9)',
    backgroundColor = 'rgba(255,255,255,0.06)',
    gap = 3,
    rounded = true,
    seed = 'musicrewards',
  } = props;

  const basePhase = useSharedValue(0);

  // drive phase when playing; keep last frame when paused
  useEffect(() => {
    if (isPlaying) {
      const duration = Math.max(600, 1400 / Math.max(rate, 0.25));
      basePhase.value = 0;
      basePhase.value = withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(basePhase);
    }
  }, [isPlaying, rate]);

  const seeded = useMemo(() => createSeededRandom(String(seed)), [seed]);

  const bars = useMemo(() => {
    return new Array(barCount).fill(0).map((_, i) => {
      const base = seeded(i) * 0.6 + 0.2; // 0.2 .. 0.8
      const phaseJitter = seeded(i + 1000) * 0.8 + 0.1; // 0.1 .. 0.9
      const swing = seeded(i + 2000) * 0.5 + 0.4; // 0.4 .. 0.9
      return { index: i, base, phaseJitter, swing };
    });
  }, [barCount, seeded]);

  const containerStyle = useMemo(() => [
    styles.container,
    { height, backgroundColor },
  ], [height, backgroundColor]);

  // Precompute bar width (numeric width only; percent will distribute via flex)
  const barWidth = useMemo(() => {
    return undefined as number | undefined;
  }, []);

  return (
    <View style={containerStyle}>
      {bars.map(({ index, base, phaseJitter, swing }) => {
        const style = useAnimatedStyle(() => {
          const t = (basePhase.value * phaseJitter + index * 0.007) % 1;
          // smooth oscillation 0..1
          const osc = (1 - Math.cos(t * Math.PI * 2)) * 0.5;
          // dynamic height factor
          const factor = base * 0.6 + osc * swing * 0.8;
          const h = interpolate(factor, [0, 1], [height * 0.12, height * 0.98]);
          return {
            height: h,
          };
        }, [height]);

        return (
          <Animated.View
            key={`bar-${index}`}
            style={[
              styles.bar,
              style,
              {
                backgroundColor: barColor,
                marginRight: index === barCount - 1 ? 0 : gap,
                borderRadius: rounded ? 999 : 0,
                width: barWidth ?? undefined,
                flex: barWidth ? undefined : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    paddingHorizontal: 6,
  },
  bar: {
    alignSelf: 'center',
  },
});

export default AudioVisualizer;


