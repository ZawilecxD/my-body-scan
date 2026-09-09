---
change_id: app-i18n-en-pl
created: 2026-09-09
---

# Plan: App i18n (EN / PL)

## Overview

Ship English and Polish UI chrome across the Expo app: device locale when `en`/`pl`, persisted in-app override (System / English / Polish), localized landmark/region labels, and physio-summary chrome in the active locale. User-authored free text is never translated. Automated gate: `npx tsc --noEmit`.

## Current State

- All screens, landmark catalog names, and summary formatters are hardcoded English (`src/app/**`, `src/domain/landmarks.ts`, `src/domain/summary.ts`).
- No `expo-localization`, no message catalog, no settings/prefs table. Schema **v7** (injuries + illness domain). Persistence is SQLite only.
- Physio summary screen copy states the briefing is English.
- Repo gates: `npx tsc --noEmit`, `npm run lint` (`expo lint`). No jest/Playwright.

## Desired End State

On Android, Mateusz can:

1. See UI chrome in **English** or **Polish** based on device language (`languageCode` `en` or `pl`; otherwise **en**).
2. Open a **Language** control and pick **System** / **English** / **Polish**; the choice survives force-stop.
3. See localized region, overview-zone, side/limb, and landmark display names (stable `landmark.id` unchanged in DB/backup).
4. Generate physio text/PDF with chrome (title, meta, section labels, empty message, share dialog titles) in the active UI locale; descriptions/comments/solutions stay verbatim.
5. Navigate every existing screen with translated chrome (titles, buttons, empty states, form labels, user-visible fallbacks and Alerts). Thrown `Error` messages from DB/domain stay English (coding-style).

## What We're NOT Doing

- Translating user-authored content
- Languages beyond EN/PL
- UI rebrand (§10) or iOS store polish (§11)
- RTL layout work (neither locale is RTL)
- Putting locale preference into backup JSON / schema bump of backup `schemaVersion` (settings are local prefs only)
- New test runner / Playwright / jest
- Medical advice / diagnosis copy

## Approach

Follow Expo SDK 57 localization guide: `expo-localization` + `i18n-js`. Persist preference in a tiny SQLite `app_settings` row (schema **v8**). React context re-renders the tree when locale changes. Translate by message keys; landmark names keyed by `landmark.id`.

## Critical Details

- **Resolved locale:** if preference is `en` or `pl`, use that; if `system`, take `getLocales()[0]?.languageCode` when it is `en` or `pl`, else `en`. On Android, refresh device locale when app returns to foreground (`AppState`) so System mode tracks OS changes.
- **Catalog:** nested or flat keys under `en` / `pl` (e.g. `home.archive`, `landmark.head-front-skull`, `summary.title`). `i18n.enableFallback = true` with default `en`.
- **Landmarks:** keep English `name` on `Landmark` as the stable English label for code/debug if useful, but all UI display goes through `t('landmark.<id>')` (and region/side/limb helpers that take a translator or locale). Do not change `id`s.
- **Summary:** `formatSummaryText` / `formatSummaryHtml` accept an active locale (or `t` function) so chrome is localized; escape user strings as today.
- **Settings storage:** `app_settings(key TEXT PRIMARY KEY, value TEXT NOT NULL)` with key `locale_preference` values `system` | `en` | `pl`. Default missing row = `system`. **Do not** add settings to backup payload.
- **Migrate v8 (must not break catch-up):** Today `V7_FROM_V6` stamps `PRAGMA user_version = ${DATABASE_VERSION}`. Before bumping the constant:
  1. Change `V7_FROM_V6` to stamp a **literal** `PRAGMA user_version = 7`.
  2. Add shared `V8_FROM_V7` = `app_settings` DDL + `PRAGMA user_version = 8`; append it to **every** catch-up branch (v1…v6) and add `currentDbVersion === 7`.
  3. Add `app_settings` DDL to the `currentDbVersion === 0` fresh-install block before its final stamp (`DATABASE_VERSION` = 8).
  4. Each branch: one `withTransactionAsync`; WAL outside (per `sqlite.md`).
- **Backup schemaVersion (payload shape unchanged):** Decouple `BACKUP_SCHEMA_VERSION = 7` in `src/db/backup.ts` (or `domain/backup.ts`) and use it for export stamp + parse/restore checks instead of `DATABASE_VERSION`. Existing v7 backups keep restoring; new exports stay `schemaVersion: 7` while the DB can be v8. Do **not** widen to `{7,8}` stamping 8 — that would still move the format. Touch `backup.ts` in Phase 1.
- **In-app UI:** Language picker on a small `/settings` route linked from home `headerRight` — System / English / Polish. Changing preference updates i18n locale and context immediately (no full reload needed for LTR).
- **Deps:** `npx expo install expo-localization i18n-js`. Config plugin: `expo-localization` with `supportedLocales: ["en", "pl"]` (and `supportsRTL: false` optional).
- **Coding-style vs UI:** public thrown errors stay English; Alerts and on-screen copy use `t()`.

## Assumptions

- Pasted roadmap §9 is AC; no Linear issue for this repo.
- Default non-en/pl device → English.
- Preference not exported in backup.
- `i18n-js` + `expo-localization` per Expo guide (not lingui/i18next).
- `/settings` with three options is enough; no per-screen language.
- Translate all user-visible chrome including illnesses + backup Alerts; skip exhaustive polish of rare English `Error.message` surfaces when shown raw.

## Standards to apply

- `context/standards/global/minimal-implementation.md` — EN/PL only; no extra prefs framework
- `context/standards/global/conventions.md` — code next to related modules; deps via `npx expo install`
- `context/standards/global/coding-style.md` — thrown errors English; match screen patterns
- `context/standards/global/sqlite.md` — WAL outside txn; DDL + `user_version` atomic
- `context/standards/frontend/navigation.md` — ref-guard Language/Settings navigation

## Lessons in play

- Atomic schema bump with DDL (`sqlite.md` / lessons)
- Splash hide on init failure still applies if `_layout` changes wrap migrate
- Async nav double-tap guard for new Settings link

## Phase 1: Locale core, catalogs skeleton, settings persist

### Overview

Install localization deps, add EN/PL message modules (screens + shared chrome keys; landmark keys can be stubbed then filled in phase 2), resolve locale, SQLite settings, and a root `LocaleProvider` that exposes `{ preference, resolvedLocale, setPreference, t }`.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `package.json` / lockfile | Add deps | `npx expo install expo-localization i18n-js` |
| `app.json` | Plugin | `expo-localization` with `supportedLocales` `en` + `pl` |
| `src/i18n/messages/en.ts`, `pl.ts` | Catalogs | Typed or plain objects covering UI keys used in later phases; landmark.* and summary.* included |
| `src/i18n/index.ts` | I18n instance | `I18n` with fallback `en`; `resolveLocale(preference, deviceLanguageCode)` |
| `src/db/migrate.ts` | Schema v8 | Literal stamp 7 in `V7_FROM_V6`; `V8_FROM_V7` on all branches + fresh install; `DATABASE_VERSION = 8` |
| `src/db/backup.ts` | Keep backup format | Use `BACKUP_SCHEMA_VERSION = 7` for export/parse/restore (not `DATABASE_VERSION`) |
| `src/db/settings.ts` | CRUD | `getLocalePreference` / `setLocalePreference` (`system` \| `en` \| `pl`) |
| `src/i18n/locale-context.tsx` | Provider + hook | Load preference after DB ready; `t(key, options?)`; update on set; AppState refresh for system |
| `src/app/_layout.tsx` | Wire provider | Wrap children once SQLite is available; keep splash/`onError` lessons |

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- Cold start on a PL device/emulator with System preference shows Polish once screens are wired (phase 3); preference row readable after set.
- Upgrade from a seeded v6 (and a v1) DB: `app_settings` exists and `user_version = 8`.
- Export on v7 build (or a v7-stamped file), upgrade app, restore succeeds.

## Phase 2: Domain labels + physio summary chrome

### Overview

Localize landmark/region/zone/side helpers and summary text/HTML chrome without translating user content.

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/domain/landmarks.ts` | Display helpers | `formatLandmarkLabel`, `overviewZoneLabel`, region labels accept translator or look up via keys; IDs unchanged |
| `src/domain/summary.ts` | Chrome locale | `formatSummaryText` / `formatSummaryHtml` take `t` (or locale); user fields untouched; HTML escape unchanged |
| `src/db/summary.ts` | Pass-through | Supply labels via localized helpers when building the document |
| `src/i18n/messages/*` | Fill landmark + summary keys | Complete PL translations for catalog + summary chrome |

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.

Manual:

- Preview/share in PL shows Polish chrome; injury description remains original language.

## Phase 3: Screens + Language settings UI

### Overview

Replace hardcoded chrome on all routes with `t()`, add `/settings` Language picker, link from home. Remove “English briefing” framing from summary blurb (locale-aware copy instead).

### Changes Required

| File | Intent | Contract |
|---|---|---|
| `src/app/settings.tsx` | Language UI | System / English / Polish; persists via context |
| `src/app/index.tsx` | Entry + chrome | Settings link (ref-guard); translate home chrome |
| `src/app/**/*.tsx` | Screen chrome | All user-visible strings via `t()` |
| `src/components/body-overview-map.tsx` | a11y labels | Localized zone labels |
| `src/i18n/messages/*` | Remaining keys | Cover illnesses, backup Alerts, injury detail, etc. |

### Success Criteria

Automated:

- `npx tsc --noEmit` exits 0.
- `npm run lint` exits 0 (or only pre-existing unrelated issues — prefer 0).

Manual:

- Toggle System → English → Polish; UI updates; kill app; preference held.
- Device language PL + System → Polish chrome.
- Summary PDF/share titles match active locale.
- Typed injury text unchanged after locale switch.

## Testing Strategy

- Automated: TypeScript compile (+ Expo lint). No new test runner.
- Manual: language matrix on Android emulator (EN device, PL device, override). Spot-check summary + landmark list + one injury detail + backup Alert.

## Migration / Rollback

- Forward: v7→v8 creates `app_settings` only.
- Rollback: uninstall/reinstall or manual DB delete; no backup format change. Preference loss is acceptable.

## References

- https://docs.expo.dev/versions/v57.0.0/sdk/localization/
- https://docs.expo.dev/guides/localization/
- Roadmap §9; `context/changes/app-i18n-en-pl/ticket.md`, `frame.md`
- Prior summary plan (English-only chrome now superseded)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Locale core, catalogs skeleton, settings persist

#### Automated

- [ ] 1.1 Install expo-localization + i18n-js and configure app.json plugin
- [ ] 1.2 Add message catalogs, resolveLocale, and i18n instance
- [ ] 1.3 Schema v8 app_settings on all migrate paths + BACKUP_SCHEMA_VERSION=7 + settings repository
- [ ] 1.4 LocaleProvider wired in root layout; tsc clean

#### Manual

- [ ] 1.5 Confirm preference persists after force-stop (after UI exists)
- [ ] 1.6 Upgrade from v6/v1 DB reaches user_version 8 with app_settings
- [ ] 1.7 Restore a schemaVersion-7 backup after DB v8 upgrade

### Phase 2: Domain labels + physio summary chrome

#### Automated

- [ ] 2.1 Localize landmark/region/zone helpers
- [ ] 2.2 Localize summary text/HTML chrome; tsc clean

#### Manual

- [ ] 2.3 Spot-check PL summary chrome with verbatim user text

### Phase 3: Screens + Language settings UI

#### Automated

- [ ] 3.1 Add /settings Language picker and home entry
- [ ] 3.2 Replace screen chrome with t(); lint + tsc clean

#### Manual

- [ ] 3.3 Language matrix: System / EN / PL on Android
- [ ] 3.4 Confirm share/PDF dialog titles follow locale
