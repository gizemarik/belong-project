import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useToastStore } from '../../stores/toastStore';

export const ToastContainer: React.FC = () => {
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const { theme } = useAppTheme();

  if (!toast) return null;

  // Opaque background using existing theme colors only
  const bg = theme.colors.background;
  const border = toast.variant === 'success'
    ? theme.colors.secondary
    : toast.variant === 'error'
    ? theme.colors.accent
    : theme.colors.border;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View pointerEvents="box-none" style={[styles.wrapper, { paddingTop: Platform.select({ ios: 54, android: 24, default: 24 }) }]}>
        <TouchableOpacity onPress={hide} activeOpacity={0.9} style={[styles.banner, { backgroundColor: bg, borderColor: border }]}>
          <Text style={[styles.message, { color: theme.colors.text.primary }]}>{toast.message}</Text>
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
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ToastContainer;


