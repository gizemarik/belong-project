// Toast notifications store (Zustand) - simplified single-toast version
import { create } from 'zustand';
import { haptics } from '../utils/haptics';

export type ToastVariant = 'success' | 'error' | 'info';

export interface SimpleToast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastStore {
  toast: SimpleToast | null;
  show: (message: string, opts?: { variant?: ToastVariant; durationMs?: number }) => string;
  hide: () => void;
  clear: () => void;
}

let timeoutRef: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,

  show: (message, opts) => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const variant = opts?.variant ?? 'info';
    const duration = opts?.durationMs ?? 2500;
    set({ toast: { id, message, variant } });
    // Unified stronger haptic for all toasts
    try { haptics.heavy(); } catch {}
    if (duration > 0) {
      timeoutRef = setTimeout(() => {
        set({ toast: null });
        timeoutRef = null;
      }, duration);
    }
    return id;
  },

  hide: () => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
    set({ toast: null });
  },

  clear: () => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
    set({ toast: null });
  },
}));


