import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { THEME } from '../../constants/theme';
import { useToastStore } from '../../stores/toastStore';

export const ToastContainer: React.FC = () => {
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);

  if (!toast) return null;

  // Opaque background using existing theme colors only
  const bg = THEME.colors.background;
  const border = toast.variant === 'success'
    ? THEME.colors.secondary
    : toast.variant === 'error'
    ? THEME.colors.accent
    : THEME.colors.border;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View pointerEvents="box-none" style={[styles.wrapper, { paddingTop: Platform.select({ ios: 54, android: 24, default: 24 }) }]}>
        <TouchableOpacity onPress={hide} activeOpacity={0.9} style={[styles.banner, { backgroundColor: bg, borderColor: border }]}>
          <Text style={styles.message}>{toast.message}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  banner: {
    maxWidth: 560,
    width: '90%',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderWidth: 1,
  },
  message: {
    color: THEME.colors.text.primary,
    fontSize: THEME.fonts.sizes.md,
    textAlign: 'center',
  },
});

export default ToastContainer;


