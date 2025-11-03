// Zustand store for user data and points
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncStore } from './syncStore';

interface UserStore {
  // State
  totalPoints: number;
  completedChallenges: string[];
  rehydrated: boolean;
  
  // Actions
  addPoints: (points: number) => void;
  subtractPoints: (points: number) => void;
  completeChallenge: (challengeId: string) => void;
  uncompleteChallenge: (challengeId: string) => void;
  resetProgress: () => void;
}

let markUserHydrated: (() => void) | null = null;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      totalPoints: 0,
      completedChallenges: [],
      rehydrated: false,

      // Actions
      addPoints: (points: number) => {
        set((state) => ({
          totalPoints: state.totalPoints + points,
        }));
        try {
          const prevTotalPoints = get().totalPoints;
          useSyncStore.getState().enqueue({ type: 'ADD_POINTS', points, prevTotalPoints });
        } catch {}
      },

      subtractPoints: (points: number) => {
        set((state) => ({ totalPoints: Math.max(0, state.totalPoints - points) }));
      },

      completeChallenge: (challengeId: string) => {
        set((state) => ({
          completedChallenges: state.completedChallenges.includes(challengeId)
            ? state.completedChallenges
            : [...state.completedChallenges, challengeId],
        }));
        try {
          const prevUserHas = get().completedChallenges.includes(challengeId);
          const musicState = require('./musicStore');
          const useMusicStore = musicState.useMusicStore as typeof import('./musicStore').useMusicStore;
          const ch = useMusicStore.getState().challenges.find((c) => c.id === challengeId);
          const prevMusicStatus = {
            completed: Boolean(ch?.completed),
            progress: typeof ch?.progress === 'number' ? ch!.progress : 0,
            completedAt: ch?.completedAt,
          };
          useSyncStore.getState().enqueue({ type: 'COMPLETE_CHALLENGE', challengeId, prevUserHas, prevMusicStatus });
        } catch {}
      },

      uncompleteChallenge: (challengeId: string) => {
        set((state) => ({
          completedChallenges: state.completedChallenges.filter((id) => id !== challengeId),
        }));
      },

      resetProgress: () => {
        set({
          totalPoints: 0,
          completedChallenges: [],
        });
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted: unknown, fromVersion: number) => {
        const base = (persisted && typeof persisted === 'object') ? (persisted as Record<string, unknown>) : {};
        const totalPoints = typeof base.totalPoints === 'number' ? base.totalPoints : 0;
        const completedChallenges = Array.isArray(base.completedChallenges) ? (base.completedChallenges as unknown[]).map((x) => String(x)) : [];
        return { totalPoints, completedChallenges };
      },
      partialize: (state) => ({
        totalPoints: state.totalPoints,
        completedChallenges: state.completedChallenges,
      }),
      onRehydrateStorage: () => () => {
        if (markUserHydrated) markUserHydrated();
      },
    }
  )
);

// set rehydrated after store is created
markUserHydrated = () => {
  try { useUserStore.setState({ rehydrated: true }); } catch {}
};

// Selector functions
export const selectTotalPoints = (state: UserStore) => state.totalPoints;
export const selectCompletedChallenges = (state: UserStore) => state.completedChallenges;
export const selectUserRehydrated = (state: UserStore) => state.rehydrated;