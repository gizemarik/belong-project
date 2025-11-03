// Audio service - TrackPlayer setup and configuration
import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { useToastStore } from '../stores/toastStore';

let playerSetup = false;

// TrackPlayer service setup - call this in your App.tsx or _layout.tsx
export const setupTrackPlayer = async (): Promise<void> => {
  try {
    if (playerSetup) return;

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
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
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

// Cleanup function - call when app is unmounting
export const cleanupTrackPlayer = async (): Promise<void> => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};