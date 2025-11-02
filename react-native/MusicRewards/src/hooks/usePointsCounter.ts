import { useEffect, useMemo, useRef, useState } from 'react';
import { useMusicStore, selectCurrentTrack } from '../stores/musicStore';
import type { PointsCounterConfig, UsePointsCounterReturn } from '../types';

export function usePointsCounter(): UsePointsCounterReturn {
  const currentTrack = useMusicStore(selectCurrentTrack);
  const challenges = useMusicStore((s) => s.challenges);

  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<PointsCounterConfig | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [progress, setProgress] = useState(0);
  const lastChallengeIdRef = useRef<string | null>(null);

  const challengeProgress = useMemo(() => {
    if (!config) return 0;
    const c = challenges.find((ch) => ch.id === config.challengeId);
    return c ? c.progress : 0;
  }, [challenges, config]);

  useEffect(() => {
    if (!isActive || !config) return;
    const effective = Math.min(challengeProgress, 90);
    const earned = Math.floor((effective / 90) * config.totalPoints);
    setProgress(challengeProgress);
    setPointsEarned(earned);
  }, [challengeProgress, isActive, config]);

  useEffect(() => {
    if (currentTrack && currentTrack.id !== lastChallengeIdRef.current) {
      lastChallengeIdRef.current = currentTrack.id;
      setConfig({
        challengeId: currentTrack.id,
        totalPoints: currentTrack.points,
        durationSeconds: currentTrack.duration,
      });
      setIsActive(true);
      setPointsEarned(0);
      setProgress(0);
    }
  }, [currentTrack]);

  const startCounting = (next: PointsCounterConfig) => {
    setConfig(next);
    setIsActive(true);
    setPointsEarned(0);
    setProgress(0);
  };

  const stopCounting = () => {
    setIsActive(false);
  };

  const resetProgress = () => {
    setPointsEarned(0);
    setProgress(0);
  };

  return {
    currentPoints: pointsEarned,
    pointsEarned,
    progress,
    isActive,
    startCounting,
    stopCounting,
    resetProgress,
  };
}


