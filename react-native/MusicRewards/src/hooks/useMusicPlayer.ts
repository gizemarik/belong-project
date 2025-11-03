// useMusicPlayer hook - Integrates react-native-track-player with Zustand
import { useCallback, useEffect, useRef, useState } from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { useMusicStore, selectCurrentTrack, selectIsPlaying } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import type { MusicChallenge, UseMusicPlayerReturn } from '../types';
import { setupTrackPlayer } from '../services/audioService';

export const useMusicPlayer = (): UseMusicPlayerReturn => {
  // TrackPlayer hooks
  const playbackState = usePlaybackState();
  const progress = useProgress();
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Zustand store selectors
  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);
  const setCurrentTrack = useMusicStore((state) => state.setCurrentTrack);
  const setIsPlaying = useMusicStore((state) => state.setIsPlaying);
  const setCurrentPosition = useMusicStore((state) => state.setCurrentPosition);
  const updateProgress = useMusicStore((state) => state.updateProgress);
  const markChallengeComplete = useMusicStore((state) => state.markChallengeComplete);
  const addPoints = useUserStore((state) => state.addPoints);
  const completeChallenge = useUserStore((state) => state.completeChallenge);

  // Track playback state changes (guard against update loops)
  const prevIsPlayingRef = useRef<boolean | null>(null);
  function getPlaybackStateValue(ps: State | { state: State } | undefined): State | undefined {
    if (ps === undefined || ps === null) return undefined;
    if (typeof ps === 'object' && 'state' in ps) {
      return (ps as { state: State }).state;
    }
    return ps as State;
  }
  useEffect(() => {
    const current = getPlaybackStateValue(playbackState);
    const isCurrentlyPlaying = current === State.Playing;
    if (prevIsPlayingRef.current === isCurrentlyPlaying) return;
    prevIsPlayingRef.current = isCurrentlyPlaying;
    setIsPlaying(isCurrentlyPlaying);
  }, [playbackState, setIsPlaying]);

  // Update position and calculate progress/points (avoid loops by keying on id and throttling writes)
  const currentTrackId = currentTrack?.id;
  const lastUpdateRef = useRef<{ id?: string; percent?: number }>({});
  useEffect(() => {
    if (!currentTrackId) return;
    if (!progress.duration || progress.duration <= 0) return;

    const percent = (progress.position / progress.duration) * 100;
    // Reduce churn to 0.1% steps
    const rounded = Math.floor(percent * 10) / 10;

    if (
      lastUpdateRef.current.id === currentTrackId &&
      lastUpdateRef.current.percent === rounded
    ) {
      return;
    }

    setCurrentPosition(progress.position);
    updateProgress(currentTrackId, percent);
    lastUpdateRef.current = { id: currentTrackId, percent: rounded };

    // Completion check at 100%
    if (percent >= 100 && currentTrack && !currentTrack.completed) {
      markChallengeComplete(currentTrackId);
      completeChallenge(currentTrackId);
      addPoints(currentTrack.points);
    }
  }, [progress.position, progress.duration, currentTrackId, setCurrentPosition, updateProgress, markChallengeComplete, completeChallenge, addPoints, currentTrack]);

  // Handle track player events
  useTrackPlayerEvents([Event.PlaybackError, Event.PlaybackQueueEnded], (event) => {
    if (event.type === Event.PlaybackError) {
      setError(`Playback error: ${event.message}`);
      setLoading(false);
    } else if (event.type === Event.PlaybackQueueEnded) {
      // Ensure finalization at track end
      const id = currentTrack?.id;
      if (id && !currentTrack?.completed) {
        updateProgress(id, 100);
        markChallengeComplete(id);
        completeChallenge(id);
        if (currentTrack) addPoints(currentTrack.points);
      }
    }
  });

  const play = useCallback(async (track: MusicChallenge) => {
    try {
      setLoading(true);
      setError(null);
      // Ensure player is ready
      await setupTrackPlayer();

      // Immediately stop any previous playback to avoid stale progress
      await TrackPlayer.reset();

      // Set selected track so modal shows correct content
      setCurrentTrack(track);

      // Establish baseline progress for this track in the store right away
      // so the UI (detail/player) doesn't render previous track's progress.
      // We'll still perform the actual seek after adding the track below.
      let savedPct = 0;
      try {
        const state = useMusicStore.getState();
        const saved = state.challenges.find((c) => c.id === track.id);
        savedPct = saved?.progress ?? 0;
      } catch {
        savedPct = 0;
      }
      updateProgress(track.id, savedPct);
      // Update local position state to match intended resume point (for UI labels)
      const intendedResumeSeconds = savedPct > 0 && track.duration > 0
        ? Math.min(track.duration * (savedPct / 100), Math.max(track.duration - 1, 0))
        : 0;
      setCurrentPosition(intendedResumeSeconds);

      // Quick availability check for the audio URL
      try {
        await fetch(track.audioUrl, { method: 'HEAD' });
      } catch (headErr) {
        throw new Error('Audio URL is not reachable');
      }

      // Add new track
      await TrackPlayer.add({
        id: track.id,
        url: track.audioUrl,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
      });

      // Try to resume from stored progress for this challenge (actual player seek)
      try {
        if (savedPct > 0 && track.duration > 0) {
          const resumeSeconds = Math.min(track.duration * (savedPct / 100), Math.max(track.duration - 1, 0));
          await TrackPlayer.seekTo(resumeSeconds);
          setCurrentPosition(resumeSeconds);
        } else {
          setCurrentPosition(0);
        }
      } catch {
        // fall back to start
        setCurrentPosition(0);
      }
      
      // Start playback
      await TrackPlayer.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Playback failed';
      setError(errorMessage);
      console.error('TrackPlayer error:', err);
    } finally {
      setLoading(false);
    }
  }, [setCurrentTrack]);

  // When switching tracks, reset local position to 0 so UI doesn't show previous track progress
  useEffect(() => {
    if (currentTrack) {
      setCurrentPosition(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  const pause = useCallback(() => {
    TrackPlayer.pause().catch((err) => {
      console.error('Pause error:', err);
    });
  }, []);

  const seekTo = useCallback((seconds: number) => {
    TrackPlayer.seekTo(seconds).catch((err) => {
      console.error('Seek error:', err);
    });
  }, []);

  const resume = useCallback(() => {
    TrackPlayer.play().catch((err) => {
      console.error('Resume error:', err);
    });
  }, []);

  // Extract value for isPlaying return as well
  const stateValue = getPlaybackStateValue(playbackState);
  return {
    isPlaying: stateValue === State.Playing,
    currentTrack,
    currentPosition: progress.position,
    duration: progress.duration,
    play,
    pause,
    seekTo,
    resume,
    loading,
    error,
  };
};