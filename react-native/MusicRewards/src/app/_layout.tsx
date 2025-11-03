// Root layout for Expo Router
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { setupTrackPlayer, cleanupTrackPlayer } from '../services/audioService';
import { ToastContainer } from '../components/ui/ToastContainer';
import { useToast } from '../hooks/useToast';
import HydrationGate from '../components/providers/HydrationGate';
import SyncManager from '../components/providers/SyncManager';
import RealtimeSimulator from '../components/providers/RealtimeSimulator';
import ErrorBoundary from '../components/providers/ErrorBoundary';
import { ENABLE_REALTIME_SIMULATOR } from '../constants/config';

export default function RootLayout() {
  const toast = useToast();
  useEffect(() => {
    // Initialize TrackPlayer when app starts
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
        <ErrorBoundary>
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
          {ENABLE_REALTIME_SIMULATOR ? <RealtimeSimulator /> : null}
        </ErrorBoundary>
      </HydrationGate>
    </GestureHandlerRootView>
  );
}