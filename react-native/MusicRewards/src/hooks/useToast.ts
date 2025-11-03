import { useCallback } from 'react';
import { ToastVariant, useToastStore } from '../stores/toastStore';

export const useToast = () => {
  const showRaw = useToastStore((s) => s.show);
  const hide = useToastStore((s) => s.hide);
  const clear = useToastStore((s) => s.clear);

  const showWithVariant = useCallback(
    (variant: ToastVariant, message: string, durationMs?: number) =>
      showRaw(message, { variant, durationMs }),
    [showRaw]
  );

  return {
    show: (message: string, opts?: { variant?: ToastVariant; durationMs?: number }) => showRaw(message, opts),
    hide,
    clear,
    success: (message: string, durationMs?: number) => showWithVariant('success', message, durationMs),
    error: (message: string, durationMs?: number) => showWithVariant('error', message, durationMs),
    info: (message: string, durationMs?: number) => showWithVariant('info', message, durationMs),
  };
};

export type UseToastReturn = ReturnType<typeof useToast>;


