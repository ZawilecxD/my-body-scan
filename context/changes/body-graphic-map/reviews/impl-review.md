---
change_id: body-graphic-map
created: 2026-08-25
---

# Implementation review: body-graphic-map

- **Plan:** `context/changes/body-graphic-map/plan.md`
- **Type:** feature
- **Commits:** `8244eb7`, `5d517a9`, `5b1ad3c`
- **Date:** 2026-08-25

The graphic loop matches the plan (layout + query, Graphic/List home, close-ups, chooser, map `push` vs catalog `replace`, no schema/tabs/new deps). `npx tsc --noEmit` passes. No Critical safety gaps. Front/Back does not change the overview outline; double-taps can stack duplicate screens.

## Facets

| Facet | Result |
|---|---|
| Drift | Phase 1–3 contracts met except: identical front/back paths vs “swaps the silhouette”; close-up Front/Back is in-body not header; SVG tappables have labels but not `accessibilityRole`. |
| Safety | SQL parameterized; unknown region/side/landmark fail loud; migrate/`_layout` untouched. Double-tap navigation unguarded; failed reads replace the map with no retry. |
| Patterns & standards | Placement, English UI, leftover `landmarks.tsx` gone, no extra deps/abstractions, `migrate.ts` not touched. |
| Type gate | N/A (`type: feature`). |
| Coverage | Automated gate exercised and green. Device manuals 2.2–2.4 and 3.2–3.6 still `[ ]` (deferred); the routes and queries they need exist. |

## Critical

None.

## Suggestion

### S1 — Double tap on a region or landmark stacks a duplicate screen

- **Where:** `src/app/map/[region].tsx` (`onLandmarkPress`); `src/app/index.tsx` (region `router.push`)
- **Why:** Neither press handler guards re-entry. `onLandmarkPress` awaits `listOpenInjuriesForLandmark` then pushes, so a second tap during the await pushes again. Two close-ups make the first Back look like a no-op. Two different landmarks during the await can leave a leftover create form under the saved detail. The map is a new, easier path into the still-deferred double-save row bug (prior S3).
- **Fix:** A ref set synchronously before navigate, cleared on failure and when the screen refocuses. Same guard on region press.

### S2 — A failed read replaces the map with no retry

- **Where:** `src/app/index.tsx`; `src/app/map/[region].tsx`
- **Why:** `error` is rendered *instead of* the graphic. Home effect deps are `[db]` only, so Graphic/List does not recover; the user must leave and come back. Close-up recovers only by toggling Front/Back (effect identity changes). That reads as a hang, not fail-loud (`conventions.md`).
- **Fix:** Keep the map visible, show the error above it, and add Retry — or at least a Retry that re-runs the read.

### S3 — Front and Back overview silhouettes are the same paths

- **Where:** `src/domain/map-layout.ts` (`FRONT_REGION_PATHS` / `BACK_REGION_PATHS`)
- **Why:** The four `d` strings are identical. Phase 2 success criterion 2.2 is “Front/Back swaps the silhouette.” Side only changes the selected control and which marker ids show. Front vs back catalogs really differ (jaw vs no jaw, thigh vs hamstring); the only overview cue is the segment highlight.
- **Fix:** Give the back overview a distinct outline. If a distinct back drawing is out of scope, delete the duplicate table and return one shared path set so the code does not imply a difference.

### S4 — Close-up labels stick out past the tap circle

- **Where:** `src/components/body-close-up-map.tsx`; `CLOSE_UP_RADIUS` in `src/domain/map-layout.ts`
- **Why:** Labels are centered on `r = 18` circles. Longer names (Collarbone, Upper arm) extend past the circle. SVG text is not hittable on Android, so a tap on the visible word is a no-op.
- **Fix:** Put labels outside the circle, or size the hit shape to the label so the whole word is pressable.

### S5 — Empty chooser is a blank body

- **Where:** `src/app/landmarks/[id].tsx`
- **Why:** `injuries == null` renders nothing; `[]` renders an empty `ScrollView`. Only **Log another** in the header. Not the happy path from the map (0 open goes to create), but the scheme `mybodyscan://landmarks/<id>` can open it, and slice 4 archive will make empty-on-focus real.
- **Fix:** Explicit empty copy (“No open injuries here yet”) plus the Log another action in the body.

## Nice-to-have

### N1 — Close-up Front/Back is in-body, not the header

- **Where:** `src/app/map/[region].tsx`
- **Why:** Phase 3 contract said header Front \| Back. Routing is correct (`setParams`, no extra stack). Home already uses in-body segments.
- **Fix:** Move the pair into `headerRight`, or leave in-body and treat the contract as equivalent.

### N2 — `pointerEvents="box-none"` on leaf shapes does nothing

- **Where:** `src/components/body-overview-map.tsx`, `src/components/body-close-up-map.tsx`; plan Critical Details
- **Why:** Installed `react-native-svg` 15.15.4 hit-tests Android paths via `Region.setPath` (shape, not bounding box). `BOX_NONE` on `Path`/`Circle`/`G` is treated like `auto`. The root `Svg` value still matters. `pointerEvents="none"` on overview marker circles *is* honored and should stay.
- **Fix:** Drop `pointerEvents` on the leaves; keep it on the root `Svg` and `none` on markers. Correct the plan claim if this change is still open.

### N3 — Plan asked for `accessibilityRole="button"` on SVG targets

- **Where:** plan Critical Details; `body-overview-map.tsx` / `body-close-up-map.tsx` (`accessibilityLabel` only)
- **Why:** `react-native-svg` 15.15.4 `PathProps` has `accessibilityLabel` / `accessible`, not `accessibilityRole` — adding the role fails `tsc`. The List remains the accessible alternative (NFR).
- **Fix:** No type-breaking add. Wrap targets in `Pressable` if TalkBack on the map matters; otherwise keep the List as the a11y path.

### N4 — Stale comment on close-up arm columns

- **Where:** `src/domain/map-layout.ts` (comment above `CLOSE_UP_LAYOUT`)
- **Why:** Comment says arms use left (front) / right (back) columns; every close-up target is `cx: 100`.
- **Fix:** Delete or correct the comment.

### N5 — Hand marker sits just below the arm path

- **Where:** `src/domain/map-layout.ts` (`arms-*-hand` `cy: 215` vs arm path ending at y=210)
- **Why:** Open-injury dot can float in empty space under the limb.
- **Fix:** Nudge hand (and similarly foot) points inside the silhouette.

## Coverage

- Automated: `npx tsc --noEmit` — pass (re-run during this review).
- Progress automated SHAs (`8b01043`, `4237696`, `c740fcb`) are **not ancestors of HEAD**; the product trees match `8244eb7` / `5d517a9` / `5b1ad3c`. Same messages; SHA written before `--amend`.
- Manual 1.2 `[x]`: catalog/layout coverage is statically true (35/35 ids). Not a device check.
- Manual 2.2–2.4 and 3.2–3.6 `[ ]`: deferred to PR. Code enables them (Graphic default, `setParams`, `push` create/chooser, markers from `listOpenInjuries`, catalog header still `/landmarks`).
- No test runner, as planned — not a finding.

## Out of scope (verified absent)

Comments, solutions, archive/`archived_at`, schema bump, NativeTabs, new dependencies, bundled SVG assets, diagnostic copy. `migrate.ts` and `_layout.tsx` unchanged (lessons not in play).

## Prior review (not re-opened)

Deferred from `log-injury-from-list`: S1 catalog `replace`, S2 unknown `landmark_id` dropped on the list (now also unmarked on the graphic — N5-adjacent), S3 double-save, S4 `allowBackup`, S5 dead theme exports.

## Triage — 2026-08-25

Applied: **S1**. Region and landmark presses use a synchronous `navigating` ref, cleared on failure and on focus. `npx tsc --noEmit` passes.

Deferred: S2, S3, S4, S5, N1, N2, N3, N4, N5.
