---
change_id: physio-summary
created: 2026-09-08
---

# Plan: Physio summary

## Overview

Let Mateusz build an English, human-readable briefing of injuries that overlapped a chosen time window, preview it on device, then share as plain text or as a PDF. Config defaults to last 6 months, open + archived, description + latest severity on, comments and solutions off. No schema bump, no i18n, no backup-format change.

## Current State

Schema v6: injuries (`status`, `created_at`, `archived_at`), comments, solutions (`removed_at`), events, severity readings. Backup JSON on `/backup` via `expo-sharing`. Home `headerRight`: Backup, Archive, Log injury. No visit summary. Automated gate: `npx tsc --noEmit`. `expo-print` is not installed; `expo-sharing` already is.

## Desired End State

On Android, Mateusz can:

1. Open **Summary** from home → `/summary`.
2. Set window (**1 / 3 / 6 / 12 months** or **All time**; default **6 months**), status scope (**open only** or **open + archived**; default **open + archived**), and section checkboxes (description, latest severity, solutions, comments).
3. Defaults on first open: 6 months; open + archived; description **on**; latest severity **on**; solutions **off**; comments **off**. Config is not remembered across visits.
4. Generate → in-app scrollable English preview of the same content that will be shared.
5. Share text (system share sheet) and/or share a PDF of that briefing.
6. Empty result is an explicit “no injuries in this window” message, not a crash.

## What We're NOT Doing

- App-wide EN/PL i18n (roadmap §9)
- Translating user-authored text
- Custom from/to date picker
- Persisting last-used config
- Schema bump / backup JSON changes
- Illness/disease log content
- Accounts, cloud, multi-user physio
- Diagnosis, advice, sparkline in the export (FR-19)
- `Print.printAsync` printer dialog
- New test runner / Playwright
- Mixing this into `/backup`

## Approach

Pure query + format in domain/db (phase 1), then `/summary` UI + `expo-print` + share (phase 2). Injuries included by **overlap**, then status scope. When solutions/comments are on: active solutions (not date-filtered); comments only inside the window.

## Critical Details

- **Overlap:** injury is in window iff `createdAt ≤ windowEnd` AND (`archivedAt` is null OR `archivedAt ≥ windowStart`). **All time:** no lower bound (`windowStart` null; only `createdAt ≤ windowEnd`, which is “now”).
- **Window math:** rolling calendar months from generate-time `now` via `Date#setMonth` (1/3/6/12). Store bounds as ISO-8601 (`toISOString`) so they compare with SQLite ISO timestamps. `windowEnd` = now.
- **Status scope:** after overlap, keep `open` only, or keep both `open` and `archived`.
- **Sections:**
  - Description: current `injury.description` when checkbox on.
  - Latest severity: newest reading overall (`created_at DESC, id DESC`); line `Severity: N / 10 (timestamp)`; omit line if none.
  - Solutions (when on): all **active** (`removed_at IS NULL`) for that injury, newest first; body + URL if present. Not date-filtered.
  - Comments (when on): comments with `createdAt` in `[windowStart, windowEnd]` (all comments if All time), oldest first.
- **Defaults (interview override of frame):** solutions **off**, comments **off**. Description and latest severity **on**.
- **Generate:** explicit button. Changing config clears the preview. Share / PDF disabled until a preview exists for the current config (ref-guard both actions).
- **Text briefing (English chrome):** title “Physio summary”, generated-at, window label, status-scope label, then injuries grouped by region (existing `REGION_ORDER` / `formatLandmarkLabel`), each with status Open/Archived. User text copied verbatim.
- **HTML for PDF:** same structure; **escape** user-authored strings (`&`, `<`, `>`, `"`) before interpolating. Simple readable CSS (font, margins, headings). No remote images.
- **PDF:** `npx expo install expo-print`. `Print.printToFileAsync({ html })` then `Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Physio summary' })`.
- **Text share:** React Native `Share.share({ message, title: 'Physio summary' })`.
- **Query:** no new tables. Load open + archived lists (existing) or one `SELECT` of all injuries; filter overlap + scope in `src/domain/summary.ts`. Reuse `listSolutionsForInjury`, `listCommentsForInjury`, `listSeverityReadingsForInjury`.
- **Empty:** zero injuries after filter → preview/share body is a single English sentence, still shareable.
- **Nav:** `/summary` file route; home **Summary** `headerRight` with synchronous `navigating` ref (clear on fail + `useFocusEffect`). Do not add `expo-sharing` to plugins (already present; leave `app.json` plugins alone unless `expo-print` docs require a plugin — only add if the installed package’s Expo 57 docs say so).

## Standards to apply

- `context/standards/frontend/navigation.md` — ref guard on Summary push, Generate, Share, PDF
- `context/standards/global/conventions.md` — code next to related modules (`src/domain/`, `src/db/`, `src/app/`); add `expo-print` only via `npx expo install`
- `context/standards/global/minimal-implementation.md` — no config persistence, no date picker, no i18n
- `context/standards/global/coding-style.md` — English UI strings; match existing screen patterns
- `context/standards/global/sqlite.md` — no migrate in this change; do not bump `user_version`

## Lessons in play

- Guard async navigation against double tap (`navigation.md`) — Summary link and share/PDF presses
- SQLite splash / atomic `user_version` lessons do **not** apply (no schema change)

## Phase 1: Summary query and English briefing

### Overview

Domain types for config/window, overlap + section filtering, plain-text and escaped-HTML formatters. DB helper that loads injuries and requested child rows. No UI, no `expo-print` yet.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/summary.ts` | Window presets, overlap, briefing model, `formatSummaryText`, `formatSummaryHtml` | Presets `1m` / `3m` / `6m` / `12m` / `all`. `resolveWindow(preset, now)` → `{ start: string \| null, end: string }`. `injuryOverlapsWindow(injury, window)`. Config type: `{ windowPreset, includeArchived: boolean, includeDescription, includeLatestSeverity, includeSolutions, includeComments }`. `DEFAULT_SUMMARY_CONFIG` as Desired End State. Html escapes user strings. |
| `src/db/summary.ts` | Load rows for a config | `loadSummary(db, config, now): Promise<SummaryDocument>` — filter injuries, attach landmark labels + region, optional children per flags. Fail loud on DB errors. |
| Existing `src/db/*` | Reuse list helpers | Do not change backup/migrate. Add a list-all only if concatenating open+archived is uglier than one SELECT; prefer one `SELECT … FROM injuries` mapped like `mapInjury` if that stays local to `summary.ts`. |

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- Spot-check overlap in a REPL or by reading: still-open old injury included in 6 months; archived before window excluded; archived during window included.

## Phase 2: `/summary` screen, share, PDF

### Overview

Home link, config UI, Generate → preview, text share, PDF via `expo-print`.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `package.json` / lockfile | Add print | `npx expo install expo-print` (SDK 57 pin). |
| `src/app/summary.tsx` | Config + preview + actions | Checkboxes/presets; Generate ref-guard; preview `ScrollView`; Share + PDF ref-guards; clear preview when config changes; English copy only. |
| `src/app/index.tsx` | Entry | `headerRight` **Summary** → `/summary` with existing navigating ref. |
| `app.json` | Plugin only if required | Touch only if Expo 57 `expo-print` requires a config plugin. Do not add iOS-only printer UI. |

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- Device: defaults match plan; generate 6-month open+archived; toggle solutions/comments and regenerate; empty window message; Share sheet shows text; PDF opens/shares and matches preview; double-tap Summary does not stack screens; Backup still JSON-only.

## Testing Strategy

No test runner (same as prior slices). Automated gate is `npx tsc --noEmit` only. Product proof is Phase 2 device list. Do not add jest-expo or Playwright.

## References

- `context/changes/physio-summary/frame.md`
- `context/foundation/roadmap.md` §7
- `context/foundation/prd.md` FR-18, FR-19, FR-20
- `context/archive/2026-08-29-export-backup/plan.md` (share pattern)
- Expo Print: `Print.printToFileAsync` + `expo-sharing` (`https://docs.expo.dev/versions/latest/sdk/print`)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Summary query and English briefing

#### Automated

- [x] 1.1 Domain window, overlap, text + HTML formatters — 3708d5c
- [x] 1.2 loadSummary db helper — 3708d5c
- [x] 1.3 tsc --noEmit passes — 3708d5c

#### Manual

- [ ] 1.4 Spot-check overlap / section flags (no UI)

### Phase 2: `/summary` screen, share, PDF

#### Automated

- [ ] 2.1 Summary screen config + generate + preview
- [ ] 2.2 Home Summary link, text share, expo-print PDF
- [ ] 2.3 tsc --noEmit passes

#### Manual

- [ ] 2.4 Device: defaults, toggles, empty, share, PDF matches preview, no double-push
