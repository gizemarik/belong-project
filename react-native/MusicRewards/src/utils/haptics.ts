// Minimal haptics wrapper with safe no-op fallback
// Uses expo-haptics if available; otherwise silently no-ops

type HapticsModule = typeof import('expo-haptics');

let HapticsRef: HapticsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  HapticsRef = require('expo-haptics');
} catch {
  HapticsRef = null;
}

export const haptics = {
  selection(): void {
    if (!HapticsRef) return;
    try { HapticsRef.selectionAsync(); } catch {}
  },
  light(): void {
    if (!HapticsRef) return;
    try { HapticsRef.impactAsync(HapticsRef.ImpactFeedbackStyle.Light); } catch {}
  },
  medium(): void {
    if (!HapticsRef) return;
    try { HapticsRef.impactAsync(HapticsRef.ImpactFeedbackStyle.Medium); } catch {}
  },
  heavy(): void {
    if (!HapticsRef) return;
    try { HapticsRef.impactAsync(HapticsRef.ImpactFeedbackStyle.Heavy); } catch {}
  },
  success(): void {
    if (!HapticsRef) return;
    try { HapticsRef.notificationAsync(HapticsRef.NotificationFeedbackType.Success); } catch {}
  },
  warning(): void {
    if (!HapticsRef) return;
    try { HapticsRef.notificationAsync(HapticsRef.NotificationFeedbackType.Warning); } catch {}
  },
  error(): void {
    if (!HapticsRef) return;
    try { HapticsRef.notificationAsync(HapticsRef.NotificationFeedbackType.Error); } catch {}
  },
};


