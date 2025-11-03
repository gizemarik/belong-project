// Centralized challenge orchestration actions
import { useMusicStore } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import { useSyncStore } from '../stores/syncStore';

export function completeChallengeFlow(challengeId: string): void {
  const music = useMusicStore.getState();
  const user = useUserStore.getState();
  const sync = useSyncStore.getState();

  const challenge = music.challenges.find((c) => c.id === challengeId);
  const prevMusicStatus = {
    completed: Boolean(challenge?.completed),
    progress: typeof challenge?.progress === 'number' ? challenge!.progress : 0,
    completedAt: challenge?.completedAt,
  };
  const prevUserHas = user.completedChallenges.includes(challengeId);

  // 1) Update music store (source of truth for challenge state)
  music.markChallengeComplete(challengeId);

  // 2) Update user store and award points only once per challenge
  if (!prevUserHas) {
    user.completeChallenge(challengeId);
    if (challenge) {
      user.addPoints(challenge.points);
    }
  }

  // 3) Enqueue sync outbox item with rollback metadata
  try {
    sync.enqueue({
      type: 'COMPLETE_CHALLENGE',
      challengeId,
      prevUserHas,
      prevMusicStatus,
    });
  } catch {}
}


