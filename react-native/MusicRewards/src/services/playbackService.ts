// Playback service for react-native-track-player
// This file handles background playback events
import TrackPlayer, { Event, State } from 'react-native-track-player';
import { useToastStore } from '../stores/toastStore';

export default async function playbackService() {
  // This service needs to be registered in order for the TrackPlayer to work
  // when the app is in the background
  
  let resumeAfterDuck = false;
  let isDucked = false;

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });

  // Handle audio focus / ducking (phone calls, navigation prompts, etc.)
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    try {
      // Explicit/phone-call pause or permanent focus loss: pause and don't auto-resume
      if (event.paused || (event as any).permanent === true) {
        resumeAfterDuck = false;
        isDucked = false;
        await TrackPlayer.pause();
        return;
      }

      // Transient duck: toggle volume and optionally resume when unducked
      if (!isDucked) {
        // Start duck
        try {
          const state = await TrackPlayer.getState();
          resumeAfterDuck = state === State.Playing;
        } catch {
          resumeAfterDuck = false;
        }
        await TrackPlayer.setVolume(0.5);
        isDucked = true;
      } else {
        // End duck
        await TrackPlayer.setVolume(1.0);
        if (resumeAfterDuck) {
          await TrackPlayer.play();
        }
        resumeAfterDuck = false;
        isDucked = false;
      }
    } catch (e) {
      // best-effort; avoid throwing in background service
      // eslint-disable-next-line no-console
      console.warn('RemoteDuck handling error', e);
    }
  });

  // Handle playback queue ended
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
    console.log('Playback queue ended:', event);
  });

  // Handle playback errors
  TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
    console.error('Playback error:', event);
    try {
      useToastStore.getState().show('Playback error', { variant: 'error' });
    } catch {}
  });
}

// Also export as module.exports for compatibility
module.exports = playbackService;