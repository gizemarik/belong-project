import { useCallback, useMemo, useState } from 'react';
import { useMusicStore } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import type { UseChallengesReturn } from '../types';

export function useChallenges(): UseChallengesReturn {
  const challenges = useMusicStore((s) => s.challenges);
  const markChallengeComplete = useMusicStore((s) => s.markChallengeComplete);
  const loadChallenges = useMusicStore((s) => s.loadChallenges);
  const completedChallenges = useUserStore((s) => s.completedChallenges);
  const addCompleted = useUserStore((s) => s.completeChallenge);
  const addPoints = useUserStore((s) => s.addPoints);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.resolve(loadChallenges());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh challenges');
    } finally {
      setLoading(false);
    }
  }, [loadChallenges]);

  const completeChallenge = useCallback(async (challengeId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Mark complete in both stores, award points once
      markChallengeComplete(challengeId);
      if (!completedChallenges.includes(challengeId)) {
        addCompleted(challengeId);
        const c = challenges.find((x) => x.id === challengeId);
        if (c) addPoints(c.points);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
    } finally {
      setLoading(false);
    }
  }, [markChallengeComplete, completedChallenges, addCompleted, challenges, addPoints]);

  const completedList = useMemo(() => completedChallenges, [completedChallenges]);

  return {
    challenges,
    completedChallenges: completedList,
    loading,
    error,
    refreshChallenges,
    completeChallenge,
  };
}
