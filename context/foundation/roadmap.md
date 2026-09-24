---
project: My Body State (working title)
created: 2026-08-17
status: active
sequencing: smallest-demoable-first
---

# Roadmap: My Body State

Greenfield Android MVP. Expo SDK 57 scaffold, `expo-sqlite`, and `react-native-svg` are already installed — no bootstrap slice.

**North star:** Mateusz can record a real injury, update its state in seconds, remember what was tried and whether it helped, and bring a clear history to a physio visit.

**Sequencing:** the original MVP shipped list/map, injury history, archive, backup, severity, summary, and illness logging. The next phase consolidates the data model first, then improves daily use, reporting/privacy, presentation, and finally release readiness.

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
- **Status:** done
- **Next:** `/11x-new body-graphic-map front/back SVG map with region close-ups and open-injury markers`

### 3. Injury thread — comments and solutions

- **Outcome:** User can open an injury, read description plus chronological comments and proposed solutions, add a comment or a text+URL solution, and tap a valid http(s) link to leave the app.
- **Layers:** sqlite (comment, solution), injury detail UI, React Native `Linking`
- **PRD:** G2 (solutions on open injuries), J2 (thread), FR-11, FR-12, FR-13, FR-17
- **Status:** done
- **Next:** `/11x-new injury-thread comments plus text-and-url solutions on an open injury`

### 4. Archive when healed, reopen on flare-up

- **Outcome:** User can archive an open injury; it vanishes from the open list and map markers, remains readable with full history in a separate archive, and can be reopened without creating a duplicate.
- **Layers:** injury status (`open` | `archived`), archive screen, reopen action
- **PRD:** G2 (open vs healed split), G3, J3, FR-8, FR-14, FR-15, FR-16
- **Status:** done
- **Next:** `/11x-new archive-and-reopen archive healed injuries and reopen a flare-up`

## Next product phase

The functional MVP and the first post-MVP capabilities are complete. The following slices are the approved sequence for turning the prototype into a focused daily-use product. Each item is a separate change when started; do not implement the whole list as one effort.

### 9. Unified injury updates

- **Outcome:** Replace the split comment + severity workflow with one chronological injury update that accepts severity, note, or both. Migrate existing comments and severity readings without loss.
- **Why first:** Every later screen, reminder, report, and intervention outcome depends on one coherent history model.
- **Scope guard:** The basic form contains no required fields beyond at least one of severity or note. General-health factors remain out.
- **Layers:** schema migration, update repository/domain, injury detail timeline, backup/restore compatibility, summary compatibility
- **Depends on:** completed injury thread, severity trend, backup, and summary
- **Next when ready:** `/11x-new unified-injury-updates merge comments and severity into one lightweight injury update history`

### 10. Edit and safely delete history

- **Outcome:** User can edit injury identity/details, correct an update, and delete accidental entries with confirmation and consistent dependent data.
- **Why next:** Trustworthy trends and reports require a recovery path for input mistakes.
- **Scope guard:** No bulk destructive actions. Prefer recoverable UI behavior where practical.
- **Depends on:** unified update model
- **Next when ready:** `/11x-new edit-delete-injury-history correct injuries and updates with safe deletion semantics`

### 11. Interventions and delayed outcomes

- **Outcome:** User records what they tried and can later mark helped / no change / worsened with an optional note.
- **Why next:** This turns the app from a pain diary into a recovery memory: what actually worked for this injury.
- **Scope guard:** Basic updates stay fast. Intervention and outcome controls are collapsed until requested; no built-in treatment catalog or advice.
- **Depends on:** unified updates and safe editing
- **Next when ready:** `/11x-new intervention-outcomes record lightweight interventions and delayed outcomes without overloading updates`

### 12. Today home

- **Outcome:** Opening the app answers what is active, what changed recently, what is stale, and which intervention needs follow-up. Quick update is available from each active injury.
- **Why next:** The current map is good for location but not for deciding what needs attention today.
- **Scope guard:** Map and grouped list remain first-class tabs or destinations.
- **Depends on:** unified updates and intervention outcomes
- **Next when ready:** `/11x-new today-home active injuries recent change and lightweight follow-up dashboard`

### 13. Gentle reminders

- **Outcome:** Optional reminders support injury check-ins and delayed intervention outcomes.
- **Tone:** Neutral and dismissible. No streaks, guilt, scoring, or required daily logging.
- **Scope guard:** Local notifications only; no account or notification backend.
- **Depends on:** Today and intervention outcomes
- **Next when ready:** `/11x-new gentle-reminders local check-in and intervention follow-ups without streak mechanics`

### 14. English/Polish foundation and physio summary v2

- **Outcome:** UI and reports support EN/PL. The user selects date range, injuries, and report sections, and can include intervention outcomes and questions for the appointment.
- **Why together:** Report copy must be internationalized once, not rebuilt immediately after a separate summary redesign.
- **Scope guard:** User-authored text stays exactly as written; there is no automatic translation.
- **Depends on:** unified update and intervention data
- **Next when ready:** `/11x-new i18n-physio-summary-v2 English Polish UI and configurable physio report`

### 15. Local privacy controls

- **Outcome:** Optional app lock, protected task-switcher preview where supported, explicit export/backup privacy warnings, and a verified delete-all-local-data flow.
- **Why:** Health history is sensitive even without a cloud backend.
- **Scope guard:** Core privacy controls are not premium features. Do not claim encryption guarantees that the implementation does not provide.
- **Next when ready:** `/11x-new local-privacy-controls app lock protected previews export warnings and data deletion`

### 16. Product rebrand and usability pass

- **Outcome:** Validate and, if appropriate, adopt **My Body State**; redesign navigation, Today, timeline, forms, typography, spacing, empty/error states, and accessible map alternatives as one cohesive system.
- **Why now:** The target journeys and information architecture must settle before visual work propagates across screens.
- **Name gate:** Check store/trademark conflicts and test whether users understand “state” and do not expect a camera scan before changing public identifiers.
- **Research first:** Compare implementable Expo/React Native design-system options and produce rendered alternatives from the actual app.
- **Scope guard:** Presentation and interaction clarity only; do not smuggle in new health-tracking domains.
- **Depends on:** slices 9–15
- **Next when ready:** `/11x-new my-body-state-rebrand validate name and redesign the settled daily-use journeys`

### 17. Quality and release readiness

- **Outcome:** Automated coverage protects database migrations, unified-history migration, backup/restore, report generation, and destructive operations. README and release runbook describe the real product.
- **Also includes:** stable Android package ID, EAS preview/production profiles, privacy policy, store data-safety answers, accessibility checks, crash handling, and upgrade testing from current database versions.
- **Scope guard:** No production store submission in this slice.
- **Depends on:** settled schema and rebrand
- **Next when ready:** `/11x-new release-readiness tests migrations backup reports privacy and Android build configuration`

### 18. Android private beta and Play publication

- **Outcome:** Dogfood a standalone build, run a small private beta, address release blockers, then publish through staged Google Play testing when evidence is acceptable.
- **Evidence before production:** successful upgrade and restore tests, no data-loss blocker, usable core journeys, privacy assets complete, and verified store build.
- **Depends on:** quality and release readiness
- **Next when ready:** `/11x-new android-beta-publish private beta staged Play testing and production handoff`

### 19. iOS after Android validation

- **Outcome:** Port the validated product loop and design system to iOS, then prepare App Store-specific privacy and listing assets.
- **Why last:** Avoid polishing two platforms before the product loop and name are validated.
- **Depends on:** Android beta evidence
- **Next when ready:** `/11x-new ios-port ship the validated product loop on iOS`

## Parked

From PRD non-goals — do not pull into a slice (or into Post-MVP without an explicit decision):

- Broad all-purpose health tracking; the existing illness log remains but further expansion is parked
- Streaks, guilt mechanics, or required daily logging
- Web
- Camera, photo, or any real body scan
- 3D, medical-grade anatomy, left/right tap targets, muscle-fiber picking
- Built-in exercise catalog
- Accounts, cloud sync (on-device export/backup is Post-MVP §5, not cloud)
- Multi-user physio collaboration (one-way summary is Post-MVP §7)
- Diagnosis, AI advice, or medical-device presentation

Catalog changes require evidence from real use; do not turn the map into a medical anatomy atlas. Reopen remains part of the injury lifecycle.

## Done

- 2026-08-19 — `log-injury-from-list` → `context/archive/2026-08-17-log-injury-from-list/`
- 2026-08-29 — `archive-and-reopen` → `context/archive/2026-08-29-archive-and-reopen/`
- 2026-08-29 — `body-graphic-map` → `context/archive/2026-08-25-body-graphic-map/`
- 2026-08-29 — `export-backup` → `context/archive/2026-08-29-export-backup/`
- 2026-08-29 — `injuries-history` → `context/archive/2026-08-29-injuries-history/`
- 2026-08-29 — `injury-thread` → `context/archive/2026-08-29-injury-thread/`
- 2026-09-08 — `severity-trend` → `context/archive/2026-08-29-severity-trend/`
- 2026-09-08 — `physio-summary` → `context/archive/2026-09-08-physio-summary/`
