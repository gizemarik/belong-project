import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  confettiHapticsEnabled: boolean;
  setConfettiHapticsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      confettiHapticsEnabled: true,
      setConfettiHapticsEnabled: (enabled) => set({ confettiHapticsEnabled: enabled }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);


