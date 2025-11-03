import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { THEME } from '../../constants/theme';

interface SpeedControlsProps {
  rate: number;
  setRate: (rate: number) => void;
  style?: ViewStyle;
}

export const SpeedControls: React.FC<SpeedControlsProps> = ({ rate, setRate, style }) => {
  return (
    <GlassCard style={StyleSheet.flatten([styles.card, style])}>
      <View style={styles.row}>
        <GlassButton
          title="0.5x"
          onPress={() => setRate(0.5)}
          variant={rate === 0.5 ? 'primary' : 'secondary'}
          style={styles.button}
        />
        <GlassButton
          title="1x"
          onPress={() => setRate(1)}
          variant={rate === 1 ? 'primary' : 'secondary'}
          style={styles.button}
        />
        <GlassButton
          title="1.25x"
          onPress={() => setRate(1.25)}
          variant={rate === 1.25 ? 'primary' : 'secondary'}
          style={styles.button}
        />
        <GlassButton
          title="2x"
          onPress={() => setRate(2)}
          variant={rate === 2 ? 'primary' : 'secondary'}
          style={styles.button}
        />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    // Card styling handled by GlassCard
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    flex: 0.25,
    marginHorizontal: THEME.spacing.xs,
  },
});


