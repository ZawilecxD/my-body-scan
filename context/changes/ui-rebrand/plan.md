---
change_id: ui-rebrand
created: 2026-09-09
---

# Plan: UI rebrand (Stitch)

## Overview

Restyle the shipped Android app to the Stitch “Somatic Journal” visual system (teal/slate, Manrope/Inter/JetBrains Mono, cards, chips, icon chrome) so daily logging is clearer. Keep the **existing body-map PNG + SVG hit targets**. Introduce a three-tab shell for existing destinations: **Injuries · Illnesses · Archive**. No schema work, no new product slices, no app rename.

## Current State

- Expo SDK 57, Expo Router **single `Stack`**, `StyleSheet` + thin `ThemedText` / `ThemedView` / `Colors` in `src/constants/theme.ts`.
- `@expo/ui` is installed but unused. No NativeWind/Paper/Tamagui.
- Injury loop: home graphic/list (`src/app/index.tsx`), region list (`src/app/map/[region].tsx`), create (`src/app/injuries/new.tsx`), detail (`src/app/injuries/[id].tsx`), archive, backup, summary, landmark catalog.
- Illness loop (on `main`, now in this branch): `src/app/illnesses/index.tsx`, `new.tsx`, `[id].tsx`; home header text link.
- Body graphic: `src/components/body-overview-map.tsx` + `assets/body-map/*`.
- Stitch kit vendored at `context/changes/ui-rebrand/research/stitch/` (home, region+create sheet, injury detail, physio summary, `somatic_journal/DESIGN.md`). Stitch also draws a 4-tab bar and a different silhouette — **not** followed (see Approach).
- Run target: **Expo Go SDK 57** via `npm run android` / `scripts/android-emu.sh` (no `android/` tree, no dev client).
- Automated gate: `npx tsc --noEmit` only. `npm run lint` / `expo lint` is **not** installed (no ESLint in the lockfile); do not run it — it is an interactive installer.

## Desired End State

On Android (system light/dark):

1. **Injuries** tab = open-injuries home. Stitch layout: title + active-count pill; header icons Summary + Backup; Graphic | List; Front | Back; **current** body graphic in a card with restyled region badges; optional “Immediate Focus” horizontal cards of open injuries; list mode = grouped cards. **Log injury** FAB → landmark catalog / create.
2. **Illnesses** tab = current illness list. Same card/type language. Log illness in that tab’s header (or matching FAB). Create + detail restyled.
3. **Archive** tab = archived injuries list, same row/card language.
4. Pushed screens (region, create, injury detail, summary, backup, catalogs) use Stitch app bars (back + title + status chips). Injury create from a region **Log** control opens as a **bottom sheet** (Stitch Rapid Log) with required description only. Injury detail matches Stitch sections that map to existing data (description, severity trend, solutions+URL, comments, collapsible history, sticky comment field). Physio summary matches Stitch generator chrome; share actions unchanged.
5. Fonts and tokens from `DESIGN.md` / HTML Tailwind config live in `theme.ts` (light + a derived dark set). Shared primitives replace duplicated Pressable rows.
6. Force-stop persistence and all existing actions still work. Double-tap navigation guards remain.

## What We're NOT Doing

- Replacing or redrawing the body-map PNGs / SVG paths (`map-layout.ts` geometry stays).
- Stitch 4-tab bar (Body Map / Log / History / Settings) or a Settings screen.
- Renaming the app to “Somatic Journal”.
- New fields: hashtags, editable description, 200-char cap, initial pain-on-create, photos, 3D/atlas, “insights” screen.
- NativeWind, Tamagui, Paper, Unistyles, `@expo/ui` as the design system.
- Schema / migrate / backup format changes; physio-summary payload changes.
- iOS/web polish, i18n, tablet split pane.
- Drive-by refactors outside screens/primitives this change restyles.

## Approach

Translate Stitch **HTML + DESIGN.md** into RN `StyleSheet` tokens and primitives (research default: branded UI stays RN View/Text). Expo Router `(tabs)` group for the three roots; remaining routes stay **siblings of `(tabs)` on the root Stack** so a push covers the tab navigator (no `tabBarStyle: { display: 'none' }`). Icons: reuse already-pinned **`expo-symbols`** (`SymbolView`, already used in `src/app/map/[region].tsx`) and `react-native-svg` for any extra glyph — do **not** add `@expo/vector-icons` (not in the lockfile; Expo Go must keep working). Load Manrope / Inter / JetBrains Mono with `expo-font` (already a dependency) + `@expo-google-fonts/*` via `npx expo install` (SDK 57 / Expo Go compatible).

**IA (decided):**

| Tab | Route | Primary action |
|---|---|---|
| Injuries | `/(tabs)` home | FAB **Log injury** → `/landmarks` |
| Illnesses | `/(tabs)/illnesses` | Header **Log illness** → `/illnesses/new` |
| Archive | `/(tabs)/archive` | Open archived injury |

Header overflow on Injuries: **Summary**, **Backup** (icon buttons). Graphic tap still → `/map/[region]`.

**Stitch extras that *are* in scope (existing data only):** Immediate Focus carousel; OPEN/archived chips; severity 0–10 chip bar; solutions cards; comments timeline + sticky composer; summary chips/checkboxes/preview card; create as modal sheet.

## Critical Details

- **Tokens:** Map `DESIGN.md` + HTML `tailwind.config` colors (`background #f8f9ff`, `primary` / `primary-container #0f766e`, `tertiary` amber for open/active, `error`, outline/surface containers). Promote today’s hardcoded `#3c87f7` into tokens; map-open badges use **tertiary** (amber) per Stitch, not the old blue. Spacing/radii from DESIGN (`space-*`, 12–16px cards). Dark: invert surfaces (`on-surface` light text, `background` near `#0b1c30`) keeping primary teal.
- **Typography:** `ThemedText` `type` values map to DESIGN roles (`headline-md`, `title-md`, `body-md`, `label-md`, `data-sm`, `data-lg`). Do not keep the 48px template `title`.
- **Body map:** Keep `BodyOverviewMap` image + zone math. Restyle the wrapping card (grid/legend optional), badge chips (amber when count > 0, muted when 0). Do not use Stitch’s remote silhouette URL.
- **Create sheet (Android `formSheet`):** Present `/injuries/new` as `presentation: 'formSheet'` with **numeric** detents (e.g. `[0.6, 1]` — max three on Android). Do **not** use `fitToContents` (forbids `flex: 1`; clashes with the description field + keyboard). Android form sheets **do not render** native stack headers — remove both `<Stack.Screen>` blocks from `new.tsx`; put Stitch title, Cancel, Save, and the missing-landmark error **inside the sheet body**.
- **Create navigation:** Sheet-everywhere (region Log and catalog share one route option). Catalog (`src/app/landmarks/index.tsx`) must **`push`** `/injuries/new` (stop `replace`). After `createInjury`, **dismiss the sheet** then `push` detail (`router.dismissTo('/(tabs)')` then `router.push` to `/injuries/{id}`). Do **not** `replace` from the sheet onto `/injuries/[id]` (cross-presentation replace can keep sheet geometry or drop the stack). `unstable_settings.anchor = '(tabs)'` on the root layout so the screen behind the sheet is not wiped.
- **Splash/icons:** Optional later; not required this change unless a token clash makes splash `#208AEF` look broken — then tint splash to primary. Out of critical path.
- **Illnesses screens** have no Stitch frame: apply the same primitives (app bar, cards, primary buttons, inputs) as injury list/detail.

## Phase 1: Tokens, fonts, primitives

### Overview

Install fonts, expand `theme.ts`, add shared UI primitives, wire font loading in root layout without changing screen IA yet. Vendored Stitch files stay in `research/stitch/` as the visual contract.

### Changes Required

- File: `package.json` / lockfile
  - Intent: Add `@expo-google-fonts/manrope`, `@expo-google-fonts/inter`, `@expo-google-fonts/jetbrains-mono` via `npx expo install` (SDK 57 compatible).
  - Contract: App still starts on Android; no NativeWind.

- File: `src/constants/theme.ts`
  - Intent: Replace the 5-color template palette with Stitch tokens (light + dark), type roles, radii, spacing. Keep `Spacing` keys used today or alias them so call sites can migrate in later phases.
  - Contract: `useTheme()` returns the active scheme’s token object; `ThemeColor` covers surfaces, on-surface, primary, tertiary, error, outline.

- File: `src/components/themed-text.tsx`, `src/components/themed-view.tsx`
  - Intent: Map types to DESIGN type roles; drop hardcoded `#3c87f7`.
  - Contract: Existing screens still compile (temporary mapping of old `title`/`small`/`linkPrimary` onto new roles until phases 3–5 restyle them).

- File: `src/components/ui/` (new, only primitives with ≥2 callers planned)
  - Intent: `AppButton`, `SegmentedControl`, `Card`, `Chip`, `TextField`, `IconButton` using StyleSheet + tokens.
  - Contract: No navigation side effects; pressable `hitSlop` ≥ 4.

- File: `src/app/_layout.tsx`
  - Intent: `useFonts` + keep splash hidden in `finally` (lesson). ThemeProvider colors aligned with new tokens. Icons via `expo-symbols` (already a dependency); no new icon package.
  - Contract: DB error still visible if migrate fails; splash does not stick; Expo Go still loads.

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- App launches on Android emulator (Expo Go); existing screens render (may look mixed until later phases).
- Light and dark both produce readable text on background.

## Phase 2: Tab shell and chrome

### Overview

Introduce Injuries / Illnesses / Archive tabs. Move home, illness list, and archive onto tab routes. Header icons + injury FAB. Detail/push routes stay **siblings** of `(tabs)` so the tab bar never renders over them.

### Changes Required

- File: `src/app/_layout.tsx`
  - Intent: Root `Stack` wrapping `(tabs)` plus existing modal/push routes (`injuries/*`, `map/[region]`, `summary`, `backup`, `landmarks/*`, `illnesses/new`, `illnesses/[id]`). Declare screens explicitly.
  - Contract:
    - `<Stack.Screen name="(tabs)" options={{ headerShown: false }} />` so tabs do not get a second root header.
    - `export const unstable_settings = { anchor: '(tabs)' };` so form-sheet create keeps the tab screen behind it.
    - SQLiteProvider still wraps the tree; splash/onError unchanged.

- File: `src/app/(tabs)/_layout.tsx` (new)
  - Intent: Expo Router `Tabs` with a **custom tabBar** styled like Stitch (surface, outline hairline, selected pill using `secondary-container` / primary). Three items: Injuries, Illnesses, Archive. Icons from `expo-symbols` (`SymbolView`), not `@expo/vector-icons`.
  - Contract: Switching tabs does not remount SQLite; double-tap on a tab does not push duplicates. Header config lives here / on `Tabs.Screen`, not a second root Stack header.

- File: `src/app/index.tsx` → `src/app/(tabs)/index.tsx` (move)
  - Intent: Same home screen; strip Archive / Illnesses / Log injury from the text header cluster; keep Summary + Backup as `IconButton`s in `headerRight`. Replace `<Stack.Screen>` with `<Tabs.Screen>` (nearest navigator is Tabs; `tsc` will not catch this).
  - Contract: Graphic/list and data loading behavior unchanged this phase if restyle slips — chrome first, full Stitch home in phase 3 is OK if this file is touched once; prefer **one restyle pass in phase 3** and this phase only rewires navigation + placeholder FAB.

- File: `src/app/archive.tsx` → `src/app/(tabs)/archive.tsx` (move)
  - Intent: Archive is a tab root. Use `<Tabs.Screen>` for title options.
  - Contract: Rows still open `/injuries/[id]`.

- File: `src/app/illnesses/index.tsx` → `src/app/(tabs)/illnesses.tsx` (or `(tabs)/illnesses/index.tsx`)
  - Intent: Illness list is a tab root; keep Log illness header action. Use `<Tabs.Screen>` for title / headerRight.
  - Contract: Rows still open `/illnesses/[id]`; Log illness still `/illnesses/new`.

- File: `src/app/(tabs)/index.tsx` (FAB)
  - Intent: Extended FAB “Log injury” → `/landmarks` with existing `navigating` ref guard (`navigation.md`).
  - Contract: FAB does not show on Illnesses/Archive; does not cover the tab bar (padding `pb` on home).

### Success Criteria

Automated:

- Start Metro once so `.expo/types` regenerates (typed routes; `app.json` `experiments.typedRoutes: true`), then `npx tsc --noEmit` exits 0.

Manual:

- Three tabs reachable; Injuries FAB opens landmark catalog; Illnesses header opens log-illness; Archive lists archived injuries.
- Each tab shows **exactly one** header.
- Opening injury/illness detail covers `(tabs)` (tab bar not visible); no `tabBarStyle` hide hack.
- Double-tap FAB or header icons does not stack two screens.

## Phase 3: Injury daily loop (home, region, create, detail)

### Overview

Apply Stitch layouts to the injury path. Keep `BodyOverviewMap` internals.

### Changes Required

- File: `src/app/(tabs)/index.tsx`
  - Intent: Match `research/stitch/home_open_injuries_body_map_list/` except silhouette and 4-tab. Active-count pill, Graphic | List, Anterior/Posterior, map card + badges, Immediate Focus carousel from `listOpenInjuries`, list grouped cards with latest solution + Open link.
  - Contract: Zone tap still `router.push` `/map/[region]?side=&limb=`; list row → `/injuries/[id]`; empty state still offers log path.

- File: `src/components/body-overview-map.tsx`
  - Intent: Tokenize badge colors (tertiary when count > 0); do not change PNG or path geometry.
  - Contract: Same `OverviewZoneId` taps and counts as today.

- File: `src/app/map/[region].tsx`
  - Intent: Stitch region screen: back + “Arms · Front” title, Front/Back control, landmark cards with Log, active flare card when open injuries exist. Locator **text card only** (no new anatomy SVG).
  - Contract: Log → create sheet with `landmarkId` + `limb`; row → injury detail; Front/Back updates params.

- File: `src/app/injuries/new.tsx` + `src/app/_layout.tsx` screen options
  - Intent: Rapid Log **formSheet**: locked landmark chip, required description, helper text, in-sheet title / Cancel / Save. No initial pain. No `<Stack.Screen>` header (Android will not show it).
  - Contract: `presentation: 'formSheet'`, `sheetAllowedDetents: [0.6, 1]`. Save: `createInjury` then **dismiss sheet + `push` `/injuries/${id}`** (not `replace`). Empty description cannot save; missing-landmark error renders in the sheet body.

- File: `src/app/injuries/[id].tsx`
  - Intent: Stitch thread: OPEN/archived chip, Archive/Reopen, description card (read-only), severity current + chart + 0–10 chips (open only), solutions cards + add, comments timeline + sticky composer, collapsible history. Drop mock hashtags/edit.
  - Contract: Same DB writes as today; URL tap uses `Linking` + `isHttpUrl`; archived hides add forms.

- File: `src/app/landmarks/index.tsx` (and `[id].tsx` if still reachable)
  - Intent: Catalog uses same landmark-row cards as region (grouped list).
  - Contract: Row **`push`es** `/injuries/new` with `landmarkId` (stop `replace`).

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- Log from FAB → catalog → **push** create sheet → save → sheet dismisses → detail card.
- Log from graphic region → sheet → save (same dismiss+push).
- Front/back map badges still match open injuries; current PNG is the silhouette.
- Injury detail: add comment, add solution+URL, add severity, archive and reopen.
- Immediate Focus / list cards open the correct injury.

## Phase 4: Illness screens

### Overview

Restyle illness list (tab), create, and detail with the same primitives. No Stitch mock — mirror injury list/thread density.

### Changes Required

- File: `src/app/(tabs)/illnesses.tsx` (or tab index)
  - Intent: Cards: name, episode count, latest episode date; empty state; Log illness.
  - Contract: Same queries as today.

- File: `src/app/illnesses/new.tsx`
  - Intent: Sheet or stacked form using `TextField` + primary Save (required name, optional notes).
  - Contract: `createIllness` then `replace` `/illnesses/[id]`; double-tap guard.

- File: `src/app/illnesses/[id].tsx`
  - Intent: Header name; notes card; episode list + log episode; tactics cards (text + optional URL) + add form; sticky add if it fits without blocking log-episode.
  - Contract: Same APIs; URL handling matches solutions.

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- Illnesses tab lists rows; create; add episode; add tactic; open http(s) tactic URL.
- Illness create/detail are root-stack siblings of `(tabs)` (tab bar not visible).

## Phase 5: Archive, backup, summary, leftover chrome

### Overview

Finish remaining surfaces so nothing is left on template chrome.

### Changes Required

- File: `src/app/(tabs)/archive.tsx`
  - Intent: Stitch-style list rows (landmark, preview, archived date); empty state.
  - Contract: Row → injury detail (reopen still on detail).

- File: `src/app/backup.tsx`
  - Intent: Explainer card, Export / Restore buttons, confirm Alert copy unchanged.
  - Contract: Same `expo-sharing` / picker / restore replace-all behavior.

- File: `src/app/summary.tsx`
  - Intent: Match `research/stitch/physio_summary_generator/`: intro card, time-window segments, scope pills, section checkboxes, preview card, bottom Share text / Export PDF.
  - Contract: Same generate/share functions and options; ignore Insights icon (no-op omit).

- File: `src/app/_layout.tsx` / stack `screenOptions`
  - Intent: Default header uses surface background, `headline-md`, back icon; no leftover Expo default blue.
  - Contract: DB error screen uses tokens.

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- Archive, Backup export/restore confirm, Summary generate + share text/PDF look like Stitch and still function.
- Walk J1–J3 (map log, list follow, archive) plus illness create and summary share on the emulator (Expo Go).
- Dark mode: all five tab/stack families remain readable.

## Testing Strategy

- **Automated:** `npx tsc --noEmit` each phase. After route-file moves (Phase 2), start Metro first so `.expo/types` refreshes. Do **not** run `expo lint` (not installed). No new Jest/Playwright stack.
- **Manual:** Android emulator **Expo Go** (`npm run android`). Exercise injury map/list/create/detail/archive, illness list/create/detail, backup, summary. Confirm body PNG unchanged. Confirm double-tap guards. Confirm create is a form sheet with in-sheet chrome.

## Standards to apply

- `context/standards/global/minimal-implementation.md` — Stitch visual on existing features only; no extra architecture.
- `context/standards/global/coding-style.md` — match `src/` naming; delete dead header links this change replaces.
- `context/standards/global/conventions.md` — `expo install` for font packages only; no `@expo/vector-icons`; no machine paths.
- `context/standards/frontend/navigation.md` — ref-guard navigate/save.
- `context/standards/global/sqlite.md` — do not touch migrate.

## Lessons in play

- Hide splash in `finally` when pairing splash + `SQLiteProvider` (`src/app/_layout.tsx`).
- Guard async navigation / save with a ref (FAB, tabs, Log buttons, Save).

## References

- `context/changes/ui-rebrand/research/expo-rn-ui-libraries-and-design-tooling.md`
- `context/changes/ui-rebrand/research/stitch/somatic_journal/DESIGN.md`
- `context/changes/ui-rebrand/research/stitch/home_open_injuries_body_map_list/`
- `context/changes/ui-rebrand/research/stitch/region_landmarks_create_injury/`
- `context/changes/ui-rebrand/research/stitch/injury_detail_forearm_thread/`
- `context/changes/ui-rebrand/research/stitch/physio_summary_generator/`
- `context/changes/ui-rebrand/design-handoff.md`
- `context/foundation/roadmap.md` §10
- Expo Router tabs: https://docs.expo.dev/versions/v57.0.0/sdk/router/

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.
> After triage (C1): Automated gate is `npx tsc --noEmit` only. Progress titles that still say “lint” are frozen names; do not run `expo lint`.

### Phase 1: Tokens, fonts, primitives

#### Automated

- [x] 1.1 Font packages installed and typecheck/lint pass — 6353c32
- [x] 1.2 Theme tokens and Themed* mapping compile — 6353c32
- [x] 1.3 Shared primitives compile — 6353c32

#### Manual

- [ ] 1.4 App launches light and dark after font load

### Phase 2: Tab shell and chrome

#### Automated

- [x] 2.1 Tab routes typecheck and lint — 8cc4f6d
- [x] 2.2 Header/FAB navigation compiles — 8cc4f6d

#### Manual

- [ ] 2.3 Three tabs + injury FAB + illness log header work; detail hides tabs
- [ ] 2.4 Double-tap does not stack screens

### Phase 3: Injury daily loop

#### Automated

- [ ] 3.1 Home/region/create/detail typecheck and lint

#### Manual

- [ ] 3.2 Map uses existing PNG; badges and zone taps work
- [ ] 3.3 Create sheet saves; detail thread actions work
- [ ] 3.4 Graphic and list both open the correct injury

### Phase 4: Illness screens

#### Automated

- [ ] 4.1 Illness screens typecheck and lint

#### Manual

- [ ] 4.2 List/create/episode/tactic/URL flows work on the Illnesses tab

### Phase 5: Archive, backup, summary, leftover chrome

#### Automated

- [ ] 5.1 Remaining screens typecheck and lint

#### Manual

- [ ] 5.2 Archive, backup, summary match Stitch chrome and still share/restore
- [ ] 5.3 Full J1–J3 + illness + dark-mode pass on emulator
