import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OutboxItem =
  | { id: string; type: 'ADD_POINTS'; points: number; prevTotalPoints: number; at: string }
  | { id: string; type: 'COMPLETE_CHALLENGE'; challengeId: string; prevUserHas: boolean; prevMusicStatus: { completed: boolean; progress: number; completedAt?: string }; at: string };

export type OutboxEnqueue =
  | { type: 'ADD_POINTS'; points: number; prevTotalPoints: number }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: string; prevUserHas: boolean; prevMusicStatus: { completed: boolean; progress: number; completedAt?: string } };

interface SyncStore {
  outbox: OutboxItem[];
  enqueue: (item: OutboxEnqueue) => void;
  clear: () => void;
  flushNow: () => Promise<void>; // placeholder (no network yet)
  dequeue: (id: string) => void;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      outbox: [],
      enqueue: (item: OutboxEnqueue) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const at = new Date().toISOString();
        set((state) => ({ outbox: [...state.outbox, { ...item, id, at } as OutboxItem] }));
      },
      clear: () => set({ outbox: [] }),
      dequeue: (id: string) => set((state) => ({ outbox: state.outbox.filter((i) => i.id !== id) })),
      flushNow: async () => {
        // No backend for now
        return Promise.resolve();
      },
    }),
    {
      name: 'sync-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted: unknown, fromVersion: number) => {
        const base = (persisted && typeof persisted === 'object') ? (persisted as Record<string, unknown>) : {};
        const outbox = Array.isArray(base.outbox) ? (base.outbox as unknown[]) : [];
        return { outbox };
      },
    }
  )
);


