---
change_id: body-graphic-map
created: 2026-08-25
---

# Plan: Log and browse from the body graphic

## Overview

Add the schematic body graphic as a co-equal view next to the existing grouped list. Mateusz can toggle Graphic/List on home (Graphic default), flip front/back, tap a region close-up, tap a landmark to create or pick among open injuries, and see open-injury markers on overview and close-up. Catalog, sqlite schema, comments, solutions, and archive stay as they are.

## Current State

Stack app with four product routes: open-injury list (`/`), catalog (`/landmarks`), create (`/injuries/new?landmarkId=`), read-only detail (`/injuries/[id]`). Frozen §5 catalog in `src/domain/landmarks.ts` with stable ids `{region}-{side}-{slug}`. `injuries` v1 has no unique on `landmark_id`; multiple open injuries per landmark are allowed. `react-native-svg` 15.15.4 is installed and unused. No graphic, no front/back, no close-up, no markers.

## Desired End State

On Android, Mateusz can:

1. Open the app on the **Graphic** segment (front overview). Switch to **List** and back; neither is hidden.
2. Toggle **Front** / **Back** on the overview. Four regions (head, torso, arms, legs) are tappable.
3. Tap a region → that region's close-up for the current side. Front/Back on the close-up swaps to the same region on the other side (no extra stack entry).
4. Close-up shows only that region × side's §5 landmarks as labeled tap targets.
5. Tap a landmark with **0** open injuries → create form (existing `/injuries/new`). Tap a landmark with **1+** → chooser of those injuries plus **Log another**.
6. Landmarks with ≥1 open injury are marked on the overview (dots; region remains the tap target) and on the close-up (distinct fill). Markers follow force-stop because they read the same `open` rows as the list.
7. Header **Log injury** still opens the catalog from home (both segments). List segment is the existing grouped list, unchanged in behavior.

## What We're NOT Doing

- Comments, solutions, URLs (slice 3)
- Archive / reopen / `archived_at` (slice 4)
- Schema migration or new tables
- Trimming or growing the §5 catalog; no left/right split
- Bundled `.svg` assets, `react-native-svg-transformer`, Skia, canvas, 3D
- NativeTabs / a second navigator
- Test runner / jest-expo
- New dependencies
- iOS / web polish
- Diagnosis, scoring, or suggested exercises (FR-19)

## Approach

Keep sqlite and the catalog. Add a static layout module (viewBox coordinates per overview region and per close-up landmark) plus one query, `listOpenInjuriesForLandmark`. Home stays `/` with local segment state (Graphic default) and local `side` (`front` default). Close-up is `/map/[region]` with `side` as a search param updated via `router.setParams`. Split `landmarks.tsx` into a folder so `/landmarks/[id]` can be the chooser. Maps are TypeScript `react-native-svg` components: overview = 4 region `Path`s + non-interactive marker `Circle`s; close-up = labeled `Circle`/`G` tap targets. Android-only: `pointerEvents="box-none"` on overlapping paths so hits follow the drawn shape.

## Critical Details

- **No schema change.** Markers and the chooser derive from existing `status = 'open'` rows and `landmark_id`.
- **Landmark ids** stay `{region}-{side}-{slug}`. Layout keys are those ids — do not invent a parallel id space.
- **View switch** is two `Pressable`s (Graphic | List) on `/`, not tabs. Graphic is the default segment. List is the current grouped list inlined on the same screen. `side` state is kept when switching segments.
- **Routes:** `/` home; `/map/[region]?side=front|back` close-up; `/landmarks` catalog (file moves to `landmarks/index.tsx`); `/landmarks/[id]` chooser (`id` = landmark id); reuse `/injuries/new` and `/injuries/[id]`. Unknown `region` or `side` or landmark id → fail loud, no silent fallback.
- **Close-up side toggle:** `router.setParams({ side })` (SDK 57 Router — updates query params, does not push). Do not `push` a second close-up.
- **Landmark tap:** `listOpenInjuriesForLandmark`; length 0 → `router.push` create; else `router.push` `/landmarks/[id]`. From the map, `push` (not `replace`) so Back returns to the close-up. Catalog path keeps today's `replace` onto create.
- **Chooser:** rows are that landmark's open injuries (newest first, description preview); tap → `/injuries/[id]`. **Log another** → `/injuries/new?landmarkId=`. Empty chooser should not be the happy path (home tap already branched on 0).
- **Overview markers:** one `Circle` per open landmark on the current side, `pointerEvents="none"` so they do not steal region presses. Close-up marks the same ids with a distinct fill (`backgroundSelected` vs default `backgroundElement`) plus the same accent used for overview dots (`linkPrimary` / `#3c87f7`).
- **Hit targets:** close-up circles large enough to tap on a phone (aim ≥44 dp on screen). List remains the accessible alternative (NFR). Each tappable path/circle gets `accessibilityRole="button"` and `accessibilityLabel` (region name or `{name} · {side}`).
- **Copy:** Graphic, List, Front, Back, Head, Torso, Arms, Legs, Log another. No clinical wording (FR-19).
- **Android SVG hits:** set `pointerEvents="box-none"` on the `Svg` and on overlapping `Path`s so only the drawn region receives the press (react-native-svg Android uses the full bounding box otherwise).

## Standards to apply

- `context/standards/global/conventions.md` — new code under `src/` next to existing layout (`src/domain`, `src/db`, `src/app`, `src/components`); fail loud on unknown region/side/landmark; no new dependency.
- `context/standards/global/minimal-implementation.md` — this slice only; no archive column, no solutions, no SVG loader, no tab navigator, no extra repository class.
- `context/standards/global/coding-style.md` — match `ThemedText` / `ThemedView` / `@/` paths; English UI; delete the leftover `landmarks.tsx` file after the folder split; domain terms from the PRD (region, side, landmark, injury, open).
- `context/standards/global/sqlite.md` — do not touch `migrate.ts` or `user_version`. New read uses parameterized `getAllAsync` like the existing store.

## Lessons in play

- Hide the splash on DB init failure — not in play (layout/`onInit` unchanged).
- Make schema version bumps atomic with DDL — not in play (no migration).

## Phase 1: Map layout and landmark injury query

### Overview

Encode schematic coordinates for every overview region and every §5 landmark, and add the chooser's read. No UI.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/map-layout.ts` (create) | ViewBox + tap/marker geometry | Export `OVERVIEW_VIEWBOX` `{ width, height }`. Export `overviewRegionPaths(side: Side): { region: Region; d: string }[]` — exactly the four regions, schematic silhouette, stable path `d` strings. Export `overviewMarkerPoints(side: Side): { landmarkId: string; cx: number; cy: number }[]` — one point per catalog landmark on that side, ids must match `LANDMARKS`. Export `closeUpTargets(region: Region, side: Side): { landmarkId: string; cx: number; cy: number; r: number; label: string }[]` — exactly the catalog rows for that region × side, `label` = landmark `name`, `r` large enough for a phone tap. No extra/missing ids vs `LANDMARKS`. |
| `src/db/injuries.ts` | Chooser read | Add `listOpenInjuriesForLandmark(db, landmarkId): Promise<Injury[]>`. Unknown landmark id → throw (same style as `createInjury`). `WHERE status = 'open' AND landmark_id = ? ORDER BY created_at DESC`. Parameterized `getAllAsync`. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Layout helpers cover every §5 landmark exactly once (front and back kept as separate ids). Four regions per side on the overview. `listOpenInjuriesForLandmark` matches the contract (no UI yet).

## Phase 2: Graphic/List home and region overview

### Overview

Home becomes Graphic | List. Graphic shows the front/back overview with four region taps and open-injury marker dots. List segment is today's grouped list. Region tap pushes the close-up route (screen can be a fail-loud stub until phase 3, but the route file must exist so navigation does not 404).

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/components/body-overview-map.tsx` (create) | Front/back 4-region SVG | Props: `side`, `openLandmarkIds: ReadonlySet<string>`, `onRegionPress(region)`. `Svg` with `viewBox` from layout; four `Path`s with `onPress`, `pointerEvents="box-none"`, `accessibilityRole="button"`, `accessibilityLabel` = region name. Marker `Circle`s for ids in `openLandmarkIds` that have an overview point on this side; `pointerEvents="none"`. Uses theme colors; selected/open accent `#3c87f7`. |
| `src/app/map/[region].tsx` (create) | Close-up route placeholder | Read `region` and `side` via `useLocalSearchParams`. Invalid region (`not` in `REGION_ORDER`) or side (not `front`/`back`) → fail-loud message. Valid: title `{Region} · {side}` and short placeholder copy. Real close-up lands in phase 3. |
| `src/app/index.tsx` | Segmented home | Local `view: 'graphic' \| 'list'` default `'graphic'`; local `side: Side` default `'front'`. Two `Pressable`s Graphic \| List; on Graphic, Front \| Back. Header **Log injury** unchanged → `/landmarks`. Graphic: `BodyOverviewMap`; tap region → `router.push({ pathname: '/map/[region]', params: { region, side } })`. List: existing grouped list + empty state. Reload open injuries on focus (keep `useFocusEffect`). Title: Open injuries. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Cold start shows Graphic, front overview, four tappable regions, Front/Back and Graphic/List controls. List segment is the existing grouped list (empty CTA and rows unchanged).
- Front/Back swaps the silhouette. Switching to List and back keeps the selected side.
- Tap a region pushes a close-up screen titled `{Region} · {side}`. Back returns to the overview.
- With at least one open injury, a marker dot appears on that landmark's overview point for the matching side; the other side is unmarked unless it has its own open row. Force-stop: markers still match open rows.

## Phase 3: Close-ups, chooser, and landmark tap routing

### Overview

Replace the close-up placeholder with labeled landmark targets, side toggle via `setParams`, and FR-5 routing (create vs chooser). Split the catalog route so the chooser can live at `/landmarks/[id]`.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/components/body-close-up-map.tsx` (create) | Region × side landmark SVG | Props: `region`, `side`, `openLandmarkIds`, `onLandmarkPress(landmarkId)`. Renders `closeUpTargets` as labeled circles (`Circle` + `Text`); `onPress` on the circle/group; `pointerEvents="box-none"`; `accessibilityLabel` = `{name} · {side}`. Open ids use distinct fill. |
| `src/app/map/[region].tsx` | Real close-up | Valid region + side only. `BodyCloseUpMap` with open ids from `listOpenInjuries`. Header Front \| Back calls `router.setParams({ side: next })` — same region, no extra stack entry. Landmark tap: `listOpenInjuriesForLandmark`; 0 → `router.push` `/injuries/new?landmarkId=`; 1+ → `router.push` `/landmarks/[id]`. Reload open injuries on focus. |
| `src/app/landmarks.tsx` → `src/app/landmarks/index.tsx` | Catalog stays at `/landmarks` | Move the existing screen. Delete `src/app/landmarks.tsx`. Behavior unchanged (`replace` onto create). |
| `src/app/landmarks/[id].tsx` (create) | Open-injury chooser | `id` is landmark id via `useLocalSearchParams`. Unknown landmark → fail loud. Title: `{name} · {side}`. List `listOpenInjuriesForLandmark` (focus reload). Row: description preview; tap → `/injuries/[id]`. **Log another** → `router.push` create with that `landmarkId`. |

### Success Criteria

#### Automated

- `npx tsc --noEmit` passes.

#### Manual

- Close-up shows only that region × side's landmarks, labeled, tappable. Front/Back on the close-up swaps the same region's other side without an extra Back step.
- Landmark with no open injury opens the create form; Back from the form returns to the close-up. Save still `replace`s onto detail.
- Landmark with one or more open injuries opens the chooser (those rows + Log another). Tapping a row opens detail. Log another opens create for that landmark.
- Open landmarks are marked on both overview and close-up; after creating from the map, Back to the close-up/overview shows the new marker without a restart.
- Catalog from header **Log injury** still works. Airplane mode + force-stop: map, markers, chooser, and list still agree.

## Testing Strategy

No test runner this slice (same as slice 1). Automated gate is `npx tsc --noEmit` only. Product proof is the phase 2–3 manual lists: J1 on a phone, markers vs list after force-stop (G1 / FR-18), Graphic/List equally reachable (FR-1).

## References

- PRD: G1, G4 (graphic/list/close-up), J1, FR-1–FR-5, FR-7, FR-9, FR-18, FR-19; catalog §5; map quality NFR
- Roadmap slice 2
- `context/foundation/tech-stack.md` — Expo SDK 57, `react-native-svg`, one SVG per view, `Path`/`onPress`, no Skia/canvas, no second navigator
- [Expo Router SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/) — `useLocalSearchParams`, `router.push` href object, `router.setParams` (query update, no stack push)
- [react-native-svg touch events](https://github.com/software-mansion/react-native-svg) — `onPress` on `Path`/`Circle`; Android `pointerEvents="box-none"` so hits follow the drawing

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Map layout and landmark injury query

#### Automated

- [x] 1.1 `npx tsc --noEmit` passes — 8b01043

#### Manual

- [x] 1.2 Layout covers every §5 landmark; query matches the contract — 8b01043

### Phase 2: Graphic/List home and region overview

#### Automated

- [ ] 2.1 `npx tsc --noEmit` passes

#### Manual

- [ ] 2.2 Cold start Graphic front; List unchanged; Front/Back and Graphic/List work
- [ ] 2.3 Region tap pushes `{Region} · {side}`; Back returns to overview
- [ ] 2.4 Open-injury marker dots match open rows per side after force-stop

### Phase 3: Close-ups, chooser, and landmark tap routing

#### Automated

- [ ] 3.1 `npx tsc --noEmit` passes

#### Manual

- [ ] 3.2 Close-up landmarks labeled; side toggle swaps region without extra Back
- [ ] 3.3 Zero open → create; Back from form returns to close-up
- [ ] 3.4 One or more open → chooser + Log another; rows open detail
- [ ] 3.5 New map-created injury marks close-up and overview; catalog header path still works
- [ ] 3.6 Airplane mode + force-stop: map, markers, chooser, and list still agree
