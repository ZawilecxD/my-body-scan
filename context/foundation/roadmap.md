---
project: My Body Scan
created: 2026-08-17
status: active
sequencing: smallest-demoable-first
---

# Roadmap: My Body Scan

Greenfield Android MVP. Expo SDK 57 scaffold, `expo-sqlite`, and `react-native-svg` are already installed — no bootstrap slice.

**North star:** Mateusz can pin a real injury to a coarse landmark and still see it after restart (G1 / M1). The schematic map is slice 2 so the graphic cannot stall the first log (R3).

**Sequencing:** list + persist first (smallest demoable). Then the other view, then the injury thread, then archive.

## Slices

### 1. Log an injury from the grouped list

- **Outcome:** User can pick a landmark from a list grouped by region, create an injury with a required description, and see it again after force-stop.
- **Layers:** landmark catalog, sqlite (injury), Expo Router list + create screens
- **PRD:** G1, J2 (list), FR-6, FR-9, FR-10 (description), FR-18, FR-19, FR-20
- **Status:** done
- **Next:** `/11x-new log-injury-from-list grouped list + sqlite persist for an injury on one landmark`

### 2. Log and browse from the body graphic

- **Outcome:** User can toggle graphic vs list, flip front/back, tap a region close-up, tap a landmark to create or open an injury, and see open-injury markers on the schematic map.
- **Layers:** react-native-svg maps, navigation (region → close-up), markers on existing injuries
- **PRD:** G1, G4 (graphic/list/close-up), J1, FR-1–FR-5, FR-7
- **Status:** ready
- **Next:** `/11x-new body-graphic-map front/back SVG map with region close-ups and open-injury markers`

### 3. Injury thread — comments and solutions

- **Outcome:** User can open an injury, read description plus chronological comments and proposed solutions, add a comment or a text+URL solution, and tap a valid http(s) link to leave the app.
- **Layers:** sqlite (comment, solution), injury detail UI, React Native `Linking`
- **PRD:** G2 (solutions on open injuries), J2 (thread), FR-11, FR-12, FR-13, FR-17
- **Status:** ready
- **Next:** `/11x-new injury-thread comments plus text-and-url solutions on an open injury`

### 4. Archive when healed, reopen on flare-up

- **Outcome:** User can archive an open injury; it vanishes from the open list and map markers, remains readable with full history in a separate archive, and can be reopened without creating a duplicate.
- **Layers:** injury status (`open` | `archived`), archive screen, reopen action
- **PRD:** G2 (open vs healed split), G3, J3, FR-8, FR-14, FR-15, FR-16
- **Status:** ready
- **Next:** `/11x-new archive-and-reopen archive healed injuries and reopen a flare-up`

## Post-MVP

Ordered wishlist after the Android MVP slices above. Each item is a **separate change** when started (`/11x-new`), not one effort. Do not pull these into MVP.

### 5. Export / backup

- **Outcome:** User can export injury data (and restore or re-import on the same or a new device) so uninstall or phone swap does not lose the log.
- **Why next:** Local-only SQLite has no recovery path today; needed before a wider audience or Play publish.
- **Status:** ready
- **Next when ready:** `/11x-new export-backup on-device export and restore of injury data`

### 6. Severity trend

- **Outcome:** User can record a simple severity/pain reading over time on an injury and see the trend without the app diagnosing or advising treatment.
- **Next when ready:** `/11x-new severity-trend severity readings over time on an injury`

### 7. Physio-ready summary

- **Outcome:** User can produce a one-way shareable summary (e.g. PDF or share sheet) of open injuries and latest solutions for a physio — no accounts or multi-user sync.
- **Depends on:** export format from slice 5 helps; severity from slice 6 is optional enrichment.
- **Next when ready:** `/11x-new physio-summary shareable status summary for a physio`

### 8. iOS

- **Outcome:** Same product loop runs as a polished iOS build (Expo already supports 16.4+); store listing and platform polish as needed.
- **Next when ready:** `/11x-new ios-port ship the MVP product loop on iOS`

## Parked

From PRD non-goals — do not pull into a slice (or into Post-MVP without an explicit decision):

- Web
- Camera, photo, or any real body scan
- 3D, medical-grade anatomy, left/right tap targets, muscle-fiber picking
- Built-in exercise catalog
- Accounts, cloud sync (on-device export/backup is Post-MVP §5, not cloud)
- Multi-user physio collaboration (one-way summary is Post-MVP §7)
- Diagnosis, AI advice, or medical-device presentation

Catalog trim (§5) is allowed at plan time; do not expand. Default FR-16 (reopen) is in slice 4.

## Done

- 2026-08-19 — `log-injury-from-list` → `context/archive/2026-08-17-log-injury-from-list/`
