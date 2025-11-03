// Audio service - TrackPlayer setup and configuration
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { useToastStore } from '../stores/toastStore';

let playerSetup = false;

// TrackPlayer service setup - call this in your App.tsx or _layout.tsx
export const setupTrackPlayer = async (): Promise<void> => {
  try {
    if (playerSetup) return;

    // Best-effort: check if background service is running (platform-dependent)
    let serviceRunning = false;
    try {
      serviceRunning = await TrackPlayer.isServiceRunning();
    } catch (_) {
      // ignore
    }

    // Probe if player is already initialized by calling an API that requires setup
    try {
      await TrackPlayer.getQueue();
      playerSetup = true;
      return; // Already initialized
    } catch (_) {
      // Not initialized, proceed to setup
    }

    // Setup the player with proper configuration
    await TrackPlayer.setupPlayer({
      waitForBuffer: true,
      maxCacheSize: 1024 * 10, // 10MB
    });

    // Configure capabilities
    await TrackPlayer.updateOptions({
      // Configure which control center / notification controls are shown
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
      ],

      // Capabilities that will show up when the notification is in the compact form on Android
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
      ],

      // Configure behavior when app is killed
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },

      // Configure notification
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
      ],
    });

    console.log('TrackPlayer setup complete');
    playerSetup = true;
  } catch (error: unknown) {
    // If already initialized, mark flag and continue
    const message = (typeof error === 'object' && error && 'message' in error)
      ? String((error as { message?: unknown }).message ?? '')
      : '';
    if (message.toLowerCase().includes('already been initialized')) {
      playerSetup = true;
      return;
    }
    console.error('TrackPlayer setup error:', error);
    try { useToastStore.getState().show('Audio setup failed', { variant: 'error' }); } catch {}
    throw error;
  }
};

// Reset player state
export const resetPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Reset player error:', error);
    try { useToastStore.getState().show('Reset player failed', { variant: 'error' }); } catch {}
  }
};

// Add track to player
export const addTrack = async (track: {
  id: string;
  url: string;
  title: string;
  artist: string;
  duration?: number;
}): Promise<void> => {
  try {
    await TrackPlayer.add({
      id: track.id,
      url: track.url,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      // Optional: Add artwork if available
      // artwork: track.artwork,
    });
  } catch (error) {
    console.error('Add track error:', error);
    try { useToastStore.getState().show('Add track failed', { variant: 'error' }); } catch {}
    throw error;
  }
};

// Play current track
export const playTrack = async (): Promise<void> => {
  try {
    await TrackPlayer.play();
  } catch (error) {
    console.error('Play track error:', error);
    try { useToastStore.getState().show('Play failed', { variant: 'error' }); } catch {}
    throw error;
  }
};

// Pause current track
export const pauseTrack = async (): Promise<void> => {
  try {
    await TrackPlayer.pause();
  } catch (error) {
    console.error('Pause track error:', error);
    try { useToastStore.getState().show('Pause failed', { variant: 'error' }); } catch {}
    throw error;
  }
};

// Seek to position
export const seekToPosition = async (seconds: number): Promise<void> => {
  try {
    await TrackPlayer.seekTo(seconds);
  } catch (error) {
    console.error('Seek error:', error);
    try { useToastStore.getState().show('Seek failed', { variant: 'error' }); } catch {}
    throw error;
  }
};

// Get current position
export const getCurrentPosition = async (): Promise<number> => {
  try {
    return await TrackPlayer.getPosition();
  } catch (error) {
    console.error('Get position error:', error);
    try { useToastStore.getState().show('Get position failed', { variant: 'error' }); } catch {}
    return 0;
  }
};

// Get track duration
export const getTrackDuration = async (): Promise<number> => {
  try {
    return await TrackPlayer.getDuration();
  } catch (error) {
    console.error('Get duration error:', error);
    try { useToastStore.getState().show('Get duration failed', { variant: 'error' }); } catch {}
    return 0;
  }
};

// Handle playback errors
export const handlePlaybackError = (error: unknown) => {
  console.error('Playback error:', error);
  try { useToastStore.getState().show('Playback error', { variant: 'error' }); } catch {}
  
  // You can add error reporting here
  // Example: report to crash analytics
  // crashlytics().recordError(error);
  
  return {
    message: (typeof error === 'object' && error && 'message' in error)
      ? String((error as { message?: unknown }).message ?? 'Unknown playback error')
      : 'Unknown playback error',
    code: (typeof error === 'object' && error && 'code' in error)
      ? String((error as { code?: unknown }).code ?? 'UNKNOWN_ERROR')
      : 'UNKNOWN_ERROR',
  };
};

// Cleanup function - call when app is unmounting
export const cleanupTrackPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};