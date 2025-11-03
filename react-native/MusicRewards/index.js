// Expo Router entry and playback service registration
import 'expo-router/entry';
import TrackPlayer from 'react-native-track-player';

// Register the playback service once at the app entrypoint
TrackPlayer.registerPlaybackService(() => require('./src/services/playbackService'));