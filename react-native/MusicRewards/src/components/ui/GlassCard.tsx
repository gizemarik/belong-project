// Glass design system components - Belong's signature UI
import React from 'react';
import { 
  View, 
  ViewStyle, 
  StyleSheet 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

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
  gradientColors,
  style,
  contentPadding = THEME.spacing.md,
}) => {
    const { theme } = useAppTheme();
    const gradient = gradientColors ?? theme.glass.gradientColors.card;
    return (
      <View style={StyleSheet.flatten([{ borderRadius, overflow: 'hidden' }, style])}>
        <BlurView 
          intensity={blurIntensity} 
          style={StyleSheet.absoluteFillObject}
          tint="dark"
          pointerEvents="none"
        />
        
        <LinearGradient
          colors={gradient as [string, string]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        
        <View 
          style={{
            ...StyleSheet.absoluteFillObject,
            borderRadius,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
          pointerEvents="none"
        />
        
        <View style={[styles.contentContainer, { padding: contentPadding }]}>
          {children}
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: THEME.spacing.md,
  },
});