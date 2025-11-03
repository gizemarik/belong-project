# Architecture Overview

This document explains key design decisions for MusicRewards.

## Goals
- Smooth audio playback with background support and interruption handling
- Clear separation of concerns via stores + hooks
- Reusable UI system with a glass design aesthetic
- Strong TypeScript guarantees (strict mode)

## State Management (Zustand)
- Stores:
  - `musicStore`: challenge list, current track, progress, playback flags
  - `userStore`: points and completed challenge ids
  - `syncStore`: outbox placeholder for future server sync
- Persistence: AsyncStorage with `persist`; only required fields persisted via `partialize`.
- Migrations: typed (`unknown` + narrowing) to avoid unsafe `any`.
- Selectors: exported selector functions to minimize re-renders.

## Hooks
- `useMusicPlayer`:
  - Integrates TrackPlayer API, orchestrates play/pause/seek/rate
  - Syncs player progress to store (throttled) and awards points on completion
  - Handles loading/error states and seeks to saved position
- `useChallenges`:
  - Wraps challenge completion and points awarding; provides refresh
- `usePointsCounter`:
  - Derives current challenge target, computes earned points from playback progress

## Audio Subsystem
- TrackPlayer setup (`audioService`):
  - `setupPlayer` with buffering and cache
  - `updateOptions` capabilities (Play, Pause, SeekTo)
  - Android `appKilledPlaybackBehavior: StopPlaybackAndRemoveNotification`
- Background service (`playbackService`):
  - Remote controls (play/pause/seek), ducking handling, errors
  - Interruption handling (iOS): pause on begin, resume conservatively on end
- Platform:
  - iOS `Info.plist` → `UIBackgroundModes: audio`
  - Android: New Architecture disabled for `react-native-track-player` compatibility; Hermes enabled.

## UI / UX
- Glass design system:
  - `GlassCard` (BlurView + gradient + border), `GlassButton`
  - Animations: Audio visualizer and points counter (Reanimated)
- Player modal:
  - Progress bar with smooth width animation
  - ±10s controls, Play/Pause, speed controls
  - Accessibility roles/labels for progress and buttons

### Haptics
- Heavy haptics are used by default for button presses and completion events.
- The previous test toggle for confetti haptics was removed; behavior is always-on for a consistent UX.

## Error Handling & Stability
- Global `ErrorBoundary` around app content with themed fallback
- In services/hooks: try/catch + toasts; errors don’t crash the app
- Cleanup: TrackPlayer cleanup on unmount; animations cancelled on unmount

## TypeScript
- Strict mode enabled; noImplicitAny, noUncheckedIndexedAccess, noFallthrough
- Event payloads typed (ducking/interruption) with safe narrowing; temporary `any` isolated and annotated

## Trade-offs
- No backend: `syncStore.flushNow` is a no-op
- Interruption event typings vary by library version → temporary `any` with TODO

## Future Work
- Extract progress bar as reusable component (used in multiple screens)
- Add tests (unit for hooks, component tests for player)
- Add analytics and crash reporting hooks

## Bonus Features (Extra Credit)
Implemented extras beyond the core rubric:

- Advanced Audio Features
  - Background playback continuation (iOS background mode, Android notification)
  - Audio interruption handling (ducking + iOS interruption resume)
  - Playback speed controls (0.5x, 1x, 1.25x, 2x)
  - Audio visualization (spectrum-like bars) implemented in JS/Reanimated
  - Crossfade between tracks: not implemented

- Enhanced UI/UX
  - Points animation with particles/confetti
  - Gesture-based navigation (swipe to close modal)
  - Dark/light theme system (toggle supported at store level)
  - Custom toast notifications system
  - Haptic feedback integration

- Advanced State Management
  - Offline-first scaffolding (outbox) and optimistic updates with rollback support
  - State persistence with versioning/migrations
  - Real-time sync simulation (feature-flagged; disabled by default)

Note on visualization: Some effects are easier with `expo-av` (e.g., audio waveform data access). Since `react-native-track-player` doesn’t expose raw audio buffers by default, the visualization is implemented purely in JS/Reanimated to keep the integration consistent with TrackPlayer.
