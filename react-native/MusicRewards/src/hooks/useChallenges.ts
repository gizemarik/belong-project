import { useCallback, useMemo, useState } from 'react';
import { useToast } from './useToast';
import { useMusicStore } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import { completeChallengeFlow } from '../services/challengeActions';
import type { UseChallengesReturn } from '../types';

export function useChallenges(): UseChallengesReturn {
  const challenges = useMusicStore((s) => s.challenges);
  const loadChallenges = useMusicStore((s) => s.loadChallenges);
  const completedChallenges = useUserStore((s) => s.completedChallenges);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const refreshChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.resolve(loadChallenges());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh challenges');
      toast.error('Failed to refresh challenges');
    } finally {
      setLoading(false);
    }
  }, [loadChallenges]);

  const completeChallenge = useCallback(async (challengeId: string) => {
    try {
      setLoading(true);
      setError(null);
      completeChallengeFlow(challengeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
      toast.error('Failed to complete challenge');
    } finally {
      setLoading(false);
    }
  }, []);

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
