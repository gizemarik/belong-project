// Root layout for Expo Router
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import { setupTrackPlayer, cleanupTrackPlayer } from '../services/audioService';
import { ToastContainer } from '../components/ui/ToastContainer';
import { useToast } from '../hooks/useToast';
import HydrationGate from '../components/providers/HydrationGate';
import SyncManager from '../components/providers/SyncManager';
import RealtimeSimulator from '../components/providers/RealtimeSimulator';

export default function RootLayout() {
  const toast = useToast();
  useEffect(() => {
    // Register the playback service first
    TrackPlayer.registerPlaybackService(() => require('../services/playbackService'));
    
    // Then initialize TrackPlayer when app starts
    setupTrackPlayer().catch((error) => {
      console.error('Failed to setup TrackPlayer:', error);
      toast.error('Failed to setup audio player');
    });
    
    // Cleanup TrackPlayer when app unmounts to release resources
    return () => {
      cleanupTrackPlayer().catch(() => {});
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HydrationGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="(modals)" 
            options={{ 
              presentation: 'modal',
              headerShown: false 
            }} 
          />
        </Stack>
        <ToastContainer />
        <SyncManager />
        <RealtimeSimulator />
      </HydrationGate>
    </GestureHandlerRootView>
  );
}