# MusicRewards (Belong Assessment)

Modern React Native app demonstrating audio playback with points rewards, glass design system, Expo Router navigation, and robust state management using Zustand.

## 🚀 Setup & Run

Prerequisites:
- Node 18+
- Xcode (for iOS), Android Studio (for Android)
- JDK 17
- Expo CLI (optional)

Install and run:
```bash
npm ci
# iOS (first time)
npx pod-install

# Start dev server
npm run start

# iOS Simulator
npm run ios

# Android Emulator / Device
npm run android
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
8. Haptics: Button presses and completion events use heavy haptics by default.

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
  - `settingsStore`: persisted test setting for enabling haptic feedback during confetti.
  - Hooks (`useMusicPlayer`, `useChallenges`, `usePointsCounter`) isolate business logic.
  - TrackPlayer configured with background service and interruption handling.
  - Glass design system using `expo-blur` and `expo-linear-gradient`.

## ⚙️ Platform Notes
- iOS: `Info.plist` includes `UIBackgroundModes` → `audio`.
- Android:
  - New Architecture disabled (`newArchEnabled=false`) for `react-native-track-player` compatibility.
  - Hermes enabled.
  - `appKilledPlaybackBehavior=StopPlaybackAndRemoveNotification` (deliberate kill stops playback).

## 🛠 Android Environment
Set up Android SDK and JDK 17:
```bash
# Example paths – adjust to your machine
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$PATH"

# Ensure Java 17 is active
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
```

Build & install (emulator must be running):
```bash
# One-liner from project root
cd android && ./gradlew clean app:assembleDebug && adb install -r app/build/outputs/apk/debug/app-debug.apk && cd ..
```

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