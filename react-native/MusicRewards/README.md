# MusicRewards (Belong Assessment)

Modern React Native app demonstrating audio playback with points rewards, glass design system, Expo Router navigation, and robust state management using Zustand.

## 🚀 Setup & Run

Prerequisites:
- Node 18+
- Xcode (for iOS), Android Studio (for Android)
- Expo CLI (optional)

Install and run:
```bash
npm install
# iOS (first time)
npx pod-install

# Start Metro
npx expo start

# Run iOS Simulator
npx expo run:ios

# Run Android Emulator / Device
npx expo run:android
```

Notes:
- iOS background audio is enabled via `UIBackgroundModes: audio`.
- Android will continue in background normally; when the app is deliberately closed from recents, playback stops and notification is removed.

## 🧭 How to Use
1. Open the app → Challenges tab.
2. Tap a challenge → Open Player.
3. Play audio, seek with the progress bar or ±10s buttons.
4. Earn points as you listen; progress persists across restarts.
5. Profile tab shows total points and completions.
6. Theme toggle: available on the Profile screen (switch between dark/light).
7. Reset button (Home): included for local testing to quickly reset progress/state during development.

## 📁 Project Structure
```
src/
├── app/
│   ├── (tabs)/              # Tabs & screens
│   ├── (modals)/            # Modal routes (player, details)
│   └── _layout.tsx          # Root layout (ErrorBoundary, providers)
├── components/
│   ├── providers/           # ErrorBoundary, gates, managers
│   ├── ui/                  # Glass design system, visualizations
│   └── challenge/           # Challenge UI
├── hooks/                   # Business logic hooks
├── services/                # TrackPlayer setup, background service
├── stores/                  # Zustand stores with persistence
├── constants/               # Theme & sample data
├── types/                   # TS shared types
└── utils/                   # Haptics, etc.
```

## 🧱 Architecture Overview
- See `ARCHITECTURE.md` for detailed design decisions.
- Highlights:
  - Zustand stores (`musicStore`, `userStore`, `syncStore`) with selective persistence.
  - Hooks (`useMusicPlayer`, `useChallenges`, `usePointsCounter`) isolate business logic.
  - TrackPlayer configured with background service and interruption handling.
  - Glass design system using `expo-blur` and `expo-linear-gradient`.

## ⚙️ Platform Notes
- iOS: `Info.plist` includes `UIBackgroundModes` → `audio`.
- Android: `appKilledPlaybackBehavior` set to `StopPlaybackAndRemoveNotification` (deliberate kill stops playback).

## 🧪 Known Issues / Limitations
- No backend; `syncStore.flushNow` is a placeholder.
- Interruption event typing uses a temporary any due to library typings; code is isolated and annotated.
- Demo tracks are remote URLs; ensure connectivity.

## 📹 Demo Video
Please provide a 3–4 minute video (or link) covering:
- App launch and navigation
- Playing audio, seeking, and earning points
- Closing/reopening app (persistence)
- Switching tracks, viewing profile

## 📝 Submission
- Public or private GitHub repo
- Include this README and `ARCHITECTURE.md`
- Attach demo video file or link in the README

## 📄 License
For assessment purposes only.