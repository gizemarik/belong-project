import React, { useEffect } from 'react';
import { useMusicStore } from '../../stores/musicStore';
import { useUserStore } from '../../stores/userStore';
import { useToast } from '../../hooks/useToast';

// Simple real-time simulation: periodically emits "server" updates
// - Increment progress on a random incomplete challenge
// - Occasionally mark a challenge complete and award points if not already

export const RealtimeSimulator: React.FC = () => {
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      try {
        const { challenges, updateProgress, markChallengeComplete } = useMusicStore.getState();
        const { completedChallenges, completeChallenge, addPoints } = useUserStore.getState();

        const open = challenges.filter((c) => !c.completed && c.progress < 100);
        if (open.length === 0) return;

        // Pick random challenge and bump progress by 5-15%
        const target = open[Math.floor(Math.random() * open.length)];
        const bump = 5 + Math.floor(Math.random() * 11);
        const next = Math.min(100, (target.progress || 0) + bump);
        updateProgress(target.id, next);

        if (next >= 100) {
          // Simulate server completing it and awarding points once
          markChallengeComplete(target.id);
          if (!completedChallenges.includes(target.id)) {
            completeChallenge(target.id);
            addPoints(target.points);
          }
          toast.info(`Server completed: ${target.title}`);
        } else {
          toast.info(`Server progress: ${target.title} → ${Math.round(next)}%`);
        }
      } catch {}
    };

    // Randomized interval ~ every 25-45s
    const interval = setInterval(tick, 25000 + Math.floor(Math.random() * 20000));
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [toast]);

  return null;
};

export default RealtimeSimulator;


