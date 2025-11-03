import { useEffect, useRef, useState } from 'react';
import { useMusicStore, selectCurrentTrack } from '../stores/musicStore';
import { useProgress } from 'react-native-track-player';
import type { PointsCounterConfig, UsePointsCounterReturn } from '../types';

export function usePointsCounter(): UsePointsCounterReturn {
  const currentTrack = useMusicStore(selectCurrentTrack);
  const tpProgress = useProgress();

  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<PointsCounterConfig | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [progress, setProgress] = useState(0);
  const lastChallengeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive || !config) return;
    const duration = tpProgress.duration || 0;
    const position = tpProgress.position || 0;
    const pct = duration > 0 ? (position / duration) * 100 : 0;
    const earned = Math.floor((pct / 100) * config.totalPoints);
    setProgress(pct);
    setPointsEarned(earned);
  }, [tpProgress.position, tpProgress.duration, isActive, config]);

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


