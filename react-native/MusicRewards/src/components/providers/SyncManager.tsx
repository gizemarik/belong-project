import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSyncStore, OutboxItem } from '../../stores/syncStore';
import { useUserStore } from '../../stores/userStore';
import { useMusicStore } from '../../stores/musicStore';
import { useToast } from '../../hooks/useToast';

export const SyncManager: React.FC = () => {
  const flushNow = useSyncStore((s) => s.flushNow);
  const outbox = useSyncStore((s) => s.outbox);
  const dequeue = useSyncStore((s) => s.dequeue);
  const toast = useToast();

  useEffect(() => {
    const process = async () => {
      // Placeholder network: assume success; show rollback path if needed later
      for (const item of outbox) {
        try {
          // Simulate request success
          await flushNow();
          dequeue(item.id);
        } catch (e) {
          // Rollback optimistic update
          rollback(item);
          dequeue(item.id);
          toast.error('Sync failed. Changes rolled back.');
        }
      }
    };
    process().catch(() => {});

    // Periodic attempt while app is running
    const interval = setInterval(() => {
      process().catch(() => {});
    }, 30000);

    // Attempt on app foreground
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        flushNow().catch(() => {});
      }
    };
    const sub = AppState.addEventListener('change', onChange);

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [flushNow]);
  function rollback(item: OutboxItem) {
    if (item.type === 'ADD_POINTS') {
      try { useUserStore.setState({ totalPoints: item.prevTotalPoints }); } catch {}
    } else if (item.type === 'COMPLETE_CHALLENGE') {
      try {
        // user store revert
        useUserStore.setState((state) => ({
          completedChallenges: item.prevUserHas
            ? state.completedChallenges
            : state.completedChallenges.filter((id) => id !== item.challengeId),
        }));
        // music store revert
        const { revertChallengeStatus } = useMusicStore.getState();
        revertChallengeStatus(item.challengeId, item.prevMusicStatus);
      } catch {}
    }
  }

  return null;
};

export default SyncManager;


