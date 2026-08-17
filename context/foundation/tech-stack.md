---
project: My Body Scan
created: 2026-08-17
status: confirmed
product_type: mobile
platform: Android (Expo; iOS/web unused)
---

# Tech stack: My Body Scan

Confirmed with Mateusz: Expo + TypeScript, because builder fluency beats a Kotlin-native fit for this MVP. The body map is SVG tap targets, not a 3D/native canvas requirement.

## Starter

```bash
npx create-expo-app@latest . --template default@sdk-57
```

- **Template:** Expo SDK 57 default (TypeScript + Expo Router).
- **If `.` is rejected as non-empty** (this repo already has `context/`): scaffold in a temp directory, then merge into the repo root. **Never overwrite or delete `context/`.**

Post-scaffold (SDK-aligned versions, do not pin by hand):

```bash
npx expo install expo-sqlite react-native-svg
```

Run target: Android (`npx expo start --android`). Do not build or polish iOS/web.

## Key libraries

| Piece | Choice | Version / pin |
|---|---|---|
| Runtime | Expo | SDK **57** (`default@sdk-57`) |
| Language | TypeScript | template default (strict) |
| UI | React Native + Expo Router | ships in default template |
| Body map | `react-native-svg` | `npx expo install` (SDK-aligned) |
| Persistence | `expo-sqlite` | `npx expo install` (SDK-aligned) |
| Open YouTube/links | React Native `Linking` | in RN; no YouTube SDK |
| Navigation | Expo Router file-based | one convention; do not add React Navigation |

No backend, no auth, no analytics. No Hilt/Room/Kotlin. No Skia/GL/Three.js for the map — SVG paths are enough for schematic landmarks.

**Map approach:** one SVG per view (body front, body back, each region close-up). Each landmark is a `<Path>` (or group) with `onPress`. Open injuries change fill/stroke. Extra specificity stays in the injury description, not in the artwork.

## Agent-friendly gates (chosen stack)

| Gate | Result | Notes |
|---|---|---|
| Typed | Pass | TypeScript |
| Convention-based | Pass (locked) | Expo Router + expo-sqlite + SVG only — do not add a second nav, ORM, or canvas library |
| Popular | Pass | Large Expo/RN/TS corpus; agents typically stronger here than Kotlin for this builder |
| Well-documented | Pass | expo.dev, SDK 57, official Expo skills |

## Rejected alternatives

| Stack | Why not |
|---|---|
| **Kotlin + Jetpack Compose + Room** (`android create compose-room-agp-9`) | Best *product* fit (Android-only, Room, Material 3, Intent). Rejected because the builder does not know Kotlin and would ship slower. Compose Canvas is not required for coarse SVG landmarks. |
| **Flutter** (`flutter create --platforms android`) | Passes the four gates, but adds Dart and a cross-platform engine the PRD does not need. |
| **Bare React Native** (no Expo) | Same UI model, more native config, no gain for a local-only MVP. |
| **Kotlin Multiplatform / Compose Multiplatform** | iOS is a non-goal; extra surface. |
