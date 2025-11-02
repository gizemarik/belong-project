// Glass design system components - Belong's signature UI
import React from 'react';
import { 
  View, 
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle, 
  TextStyle,
  StyleSheet 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  blurIntensity?: number;
  borderRadius?: number;
  style?: ViewStyle;
  gradientColors?: readonly string[];
  contentPadding?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  blurIntensity = THEME.glass.blurIntensity,
  borderRadius = THEME.borderRadius.md,
  gradientColors = THEME.glass.gradientColors.card,
  style,
  contentPadding = THEME.spacing.md,
}) => {
    return (
      <View style={StyleSheet.flatten([{ borderRadius, overflow: 'hidden' }, style])}>
        <BlurView 
          intensity={blurIntensity} 
          style={StyleSheet.absoluteFillObject}
          tint="dark"
          pointerEvents="none"
        />
        
        <LinearGradient
          colors={gradientColors as [string, string]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        
        <View 
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius,
            borderWidth: 1,
            borderColor: THEME.colors.border,
          }}
          pointerEvents="none"
        />
        
        <View style={[styles.contentContainer, { padding: contentPadding }]}>
          {children}
        </View>
      </View>
    );
};

// Glass Button Component
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  const gradientColors = variant === 'primary' 
    ? THEME.glass.gradientColors.primary
    : THEME.glass.gradientColors.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={style}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <GlassCard
        gradientColors={gradientColors}
        style={styles.button}
        contentPadding={0}
      >
        <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator color={THEME.colors.text.primary} size="small" />
          ) : (
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: THEME.spacing.md,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: THEME.colors.text.primary,
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
  },
});