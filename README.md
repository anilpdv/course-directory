<p align="center">
  <img src="assets/icon.png" width="100" alt="CourseViewer"/>
</p>

<h1 align="center">CourseViewer</h1>

<p align="center">
  A local video course player for iOS and iPad.<br/>
  Import courses from your device, track progress, and pick up where you left off.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20iPadOS-007AFF?style=flat-square" alt="Platform"/>
  <img src="https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React Native"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

---

## Screenshots

### iPhone

<p align="center">
  <img src="assets/screenshots/iphone-welcome.png" width="140"/>
  &nbsp;
  <img src="assets/screenshots/iphone-courses-list.png" width="140"/>
  &nbsp;
  <img src="assets/screenshots/iphone-course-detail.png" width="140"/>
  &nbsp;
  <img src="assets/screenshots/iphone-player.png" width="140"/>
  &nbsp;
  <img src="assets/screenshots/iphone-settings.png" width="140"/>
</p>

### iPad

<p align="center">
  <img src="assets/screenshots/ipad-welcome.png" width="380"/>
  &nbsp;&nbsp;
  <img src="assets/screenshots/ipad-courses-list.png" width="380"/>
</p>
<p align="center">
  <img src="assets/screenshots/ipad-course-detail.png" width="380"/>
  &nbsp;&nbsp;
  <img src="assets/screenshots/ipad-player.png" width="380"/>
</p>

---

## Features

- Import video courses from local folders
- Automatic progress tracking per video
- Resume playback from where you left off
- Auto-play next video with countdown
- Playback speed control (0.5x - 2x)
- Fullscreen landscape mode
- Section-based course organization
- Works completely offline

---

## Build for iOS

### Prerequisites

- macOS
- Node.js 18+
- Xcode 15+ (from App Store)
- Apple Developer account (free or paid)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/CourseViewer.git
cd CourseViewer
npm install
```

### 2. Install iOS Dependencies

```bash
npx pod-install
```

### 3. Run in Simulator

```bash
npm run ios
```

### 4. Build for Physical Device

1. Open `ios/CourseViewer.xcworkspace` in Xcode
2. Select your connected iPhone/iPad as the target
3. Go to **Signing & Capabilities** → Select your Team
4. Click **Play** to build and run

> **Note:** First build requires trusting the developer certificate on your device:
> Settings → General → VPN & Device Management → Trust certificate

---

## Tech Stack

| | |
|---|---|
| **Framework** | React Native / Expo |
| **Video** | expo-video |
| **File System** | expo-file-system |
| **UI** | React Native Paper (Material Design 3) |
| **Storage** | AsyncStorage |

---

<p align="center">
  Made for learning on the go
</p>
