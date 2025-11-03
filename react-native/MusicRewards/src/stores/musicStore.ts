// Zustand store for music playback and challenges
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MusicChallenge } from '../types';
import { SAMPLE_CHALLENGES } from '../constants/theme';

interface MusicStore {
  // State
  challenges: MusicChallenge[];
  currentTrack: MusicChallenge | null;
  isPlaying: boolean;
  currentPosition: number;
  rehydrated: boolean;
  
  // Actions
  loadChallenges: () => void;
  setCurrentTrack: (track: MusicChallenge) => void;
  clearCurrentTrack: () => void;
  updateProgress: (challengeId: string, progress: number) => void;
  markChallengeComplete: (challengeId: string) => void;
  revertChallengeStatus: (challengeId: string, prev: { completed: boolean; progress: number; completedAt?: string }) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentPosition: (position: number) => void;
}

let markMusicHydrated: (() => void) | null = null;

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      // Initial state
      challenges: SAMPLE_CHALLENGES,
      currentTrack: null,
      isPlaying: false,
      currentPosition: 0,
      rehydrated: false,

      // Actions
      loadChallenges: () => {
        set({ challenges: SAMPLE_CHALLENGES });
      },

      setCurrentTrack: (track: MusicChallenge) => {
        set({ currentTrack: track });
      },

      clearCurrentTrack: () => {
        set({ currentTrack: null });
      },

      updateProgress: (challengeId: string, progress: number) => {
        set((state) => {
          const clamped = Math.min(progress, 100);
          return {
            challenges: state.challenges.map((challenge) =>
              challenge.id === challengeId
                ? { ...challenge, progress: clamped }
                : challenge
            ),
            currentTrack:
              state.currentTrack && state.currentTrack.id === challengeId
                ? { ...state.currentTrack, progress: clamped }
                : state.currentTrack,
          };
        });
      },

      markChallengeComplete: (challengeId: string) => {
        set((state) => ({
          challenges: state.challenges.map((challenge) =>
            challenge.id === challengeId
              ? {
                  ...challenge,
                  completed: true,
                  progress: 100,
                  completedAt: new Date().toISOString(),
                }
              : challenge
          ),
          currentTrack:
            state.currentTrack && state.currentTrack.id === challengeId
              ? {
                  ...state.currentTrack,
                  completed: true,
                  progress: 100,
                  completedAt: new Date().toISOString(),
                }
              : state.currentTrack,
        }));
      },

      revertChallengeStatus: (challengeId: string, prev: { completed: boolean; progress: number; completedAt?: string }) => {
        set((state) => ({
          challenges: state.challenges.map((challenge) =>
            challenge.id === challengeId
              ? {
                  ...challenge,
                  completed: prev.completed,
                  progress: prev.progress,
                  completedAt: prev.completedAt,
                }
              : challenge
          ),
          currentTrack:
            state.currentTrack && state.currentTrack.id === challengeId
              ? {
                  ...state.currentTrack,
                  completed: prev.completed,
                  progress: prev.progress,
                  completedAt: prev.completedAt,
                }
              : state.currentTrack,
        }));
      },

      setIsPlaying: (playing: boolean) => {
        set({ isPlaying: playing });
      },

      setCurrentPosition: (position: number) => {
        set({ currentPosition: position });
      },
    }),
    {
      name: 'music-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted: unknown, fromVersion: number) => {
        const base = (persisted && typeof persisted === 'object') ? (persisted as Record<string, unknown>) : {};
        const rawChallenges = Array.isArray(base.challenges) ? (base.challenges as unknown[]) : [];
        const normalized = rawChallenges.map((cUnknown) => {
          const c = (cUnknown && typeof cUnknown === 'object') ? (cUnknown as Record<string, unknown>) : {};
          const progressNum = typeof c.progress === 'number' ? c.progress : 0;
          const durationNum = typeof c.duration === 'number' ? c.duration : 0;
          const pointsNum = typeof c.points === 'number' ? c.points : 0;
          const diff = c.difficulty;
          const difficulty = diff === 'easy' || diff === 'medium' || diff === 'hard' ? diff : 'easy';
          return {
            id: String(c.id ?? ''),
            title: String(c.title ?? ''),
            artist: String(c.artist ?? ''),
            duration: durationNum,
            points: pointsNum,
            audioUrl: String(c.audioUrl ?? ''),
            imageUrl: c.imageUrl ? String(c.imageUrl as string) : undefined,
            description: String(c.description ?? ''),
            difficulty,
            completed: Boolean(c.completed),
            progress: Math.max(0, Math.min(100, Number(progressNum))),
            completedAt: c.completedAt ? String(c.completedAt as string) : undefined,
          };
        });
        return { challenges: normalized };
      },
      // Only persist challenges, not playback state
      partialize: (state) => ({
        challenges: state.challenges,
      }),
      onRehydrateStorage: () => () => {
        if (markMusicHydrated) markMusicHydrated();
      },
    }
  )
);

// set rehydrated after store is created
markMusicHydrated = () => {
  try { useMusicStore.setState({ rehydrated: true }); } catch {}
};

// Selector functions for performance
export const selectCurrentTrack = (state: MusicStore) => state.currentTrack;
export const selectIsPlaying = (state: MusicStore) => state.isPlaying;
export const selectChallenges = (state: MusicStore) => state.challenges;
export const selectMusicRehydrated = (state: MusicStore) => state.rehydrated;