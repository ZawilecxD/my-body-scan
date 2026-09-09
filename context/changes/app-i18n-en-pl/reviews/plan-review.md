---
change_id: app-i18n-en-pl
review: plan-review
reviewer: code-reviewer
created: 2026-09-09
verdict: changes-required
critical_count: 2
triage: 2026-09-09
triage_applied: [C1, C2]
triage_deferred: [S1, S2, S3, S4, S5, N1, N2, N3]
---

# Plan review: app-i18n-en-pl

## Summary

The plan is substantive and well-scoped: it names concrete files/contracts, honors the
minimal-implementation and coding-style standards (EN/PL only, `npx expo install`, thrown
errors stay English), and cites the SDK 57 localization guide correctly. I validated the
Expo API surface against the localization docs — `getLocales()[0]?.languageCode`, the
`expo-localization` config plugin with `supportedLocales`, and pairing with `i18n-js` are
all real and current.

Two **Critical** issues will break real upgrade/restore paths as written, because the plan
treats the `DATABASE_VERSION` bump as a self-contained "v7→v8" step, but that constant is
(a) reused by every catch-up branch in `migrate.ts` and (b) re-exported as the backup
`schemaVersion`. Both need explicit handling before Phase 1 starts. The rest are
suggestions to tighten correctness and to make the sole automated gate (`tsc`) actually
protect the translations.

---

## 🔴 Critical

### C1 — Bumping `DATABASE_VERSION` to 8 silently breaks every migration path except a literal v7→v8

`src/db/migrate.ts` uses a "catch-up" structure where each starting-version branch runs all
DDL up to current and stamps the version once via the shared `V7_FROM_V6`, which ends with:

```104:105:/home/zawilecxd/Projects/my-body-scan/src/db/migrate.ts
PRAGMA user_version = ${DATABASE_VERSION};
`;
```

Because that stamp uses the **constant**, simply setting `DATABASE_VERSION = 8` and adding a
new `V8_FROM_V7` block is not enough:

- Branches for v1–v6 all include `${V7_FROM_V6}`, which would now stamp `user_version = 8`
  **without creating `app_settings`** → those users land on version 8 with no settings
  table, and `getLocalePreference` throws `no such table: app_settings`.
- The `currentDbVersion === 0` fresh-install block creates tables through v7 and stamps
  `${DATABASE_VERSION}` (=8) but never creates `app_settings` unless it is added there too
  → **every new install is broken.**
- Only a device already on exactly `user_version = 7` would work.

The plan's Phase 1 contract ("Create `app_settings`; bump `DATABASE_VERSION` to 8
atomically") does not surface any of this, and it contradicts the "atomic v7→v8" claim and
the `sqlite.md` / `lessons.md` atomicity rule.

**Fix (make explicit in the Phase 1 contract):**
1. Change `V7_FROM_V6` to stamp a **literal** `PRAGMA user_version = 7` (mirroring the
   existing "V5/V6 shape only — no user_version stamp" pattern).
2. Add a shared `V8_FROM_V7` = `app_settings` DDL + `PRAGMA user_version = 8`, and append it
   to **every** catch-up branch (v1→ … v6→) plus a new `currentDbVersion === 7` branch.
3. Add the `app_settings` DDL to the `currentDbVersion === 0` fresh-install block before its
   final stamp.
4. Keep each branch's DDL + stamp inside a single `withTransactionAsync`; WAL pragma stays
   outside (per `sqlite.md`).
Add a manual success criterion: upgrade from a seeded v6 (and a v1) DB and confirm
`app_settings` exists and `user_version = 8`.

### C2 — The `DATABASE_VERSION` bump changes the backup `schemaVersion` and rejects all existing v7 backups, contradicting the plan's "no backup format change"

The plan lists as **NOT doing**: "schema bump of backup `schemaVersion`" and states under
Migration/Rollback "no backup format change." But `schemaVersion` is derived directly from
`DATABASE_VERSION`:

```107:109:/home/zawilecxd/Projects/my-body-scan/src/db/backup.ts
    formatVersion: 1,
    schemaVersion: DATABASE_VERSION,
    exportedAt: new Date().toISOString(),
```

and both parse and restore reject any mismatch with strict equality:

```138:141:/home/zawilecxd/Projects/my-body-scan/src/db/backup.ts
  if (record.schemaVersion !== DATABASE_VERSION) {
    throw new Error(
      `Cannot parse backup: schemaVersion ${String(record.schemaVersion)} does not match app schema ${DATABASE_VERSION}`,
    );
  }
```

So bumping to 8 will: (a) start stamping exports with `schemaVersion: 8`, and (b) make the
new build **refuse to restore any backup taken on v7** ("schemaVersion 7 does not match app
schema 8"), even though the backup payload shape is byte-identical (settings are
deliberately excluded). This is a data-availability regression for existing users the plan
believes it is avoiding.

**Fix:** Decide and document one of:
- Decouple the two: introduce a `BACKUP_SCHEMA_VERSION` constant left at `7` and use it in
  `backup.ts` instead of `DATABASE_VERSION` (payload is unchanged, so the backup format
  genuinely does not move); **or**
- Widen the parse/restore check to accept the compatible set `{7, 8}` (payload shape
  unchanged), and keep stamping the current version.
Add `src/db/backup.ts` (+ `src/domain/backup.ts` if the constant moves) to the Phase 1
changed-files table, and add a manual criterion: export on v7, upgrade, restore succeeds.

---

## 🟡 Suggestions

### S1 — Make missing PL keys fail `tsc` (the only automated gate)

The plan allows catalogs as "Typed or plain objects" and sets `i18n.enableFallback = true`
with default `en`. With plain objects + fallback, a missing Polish key silently renders
English and **`npx tsc --noEmit` — the sole automated gate — catches nothing.** Since this
change adds no test runner, typing is the only automated coverage for translation
completeness.

**Fix:** Define one key-shape type (e.g. `type MessageKey = keyof typeof en`) and declare
`const pl: Record<MessageKey, string> = { … }` (or `en satisfies …` / a shared
`Messages` type on both). Then an omitted PL key is a compile error. State this in the
Phase 1 contract for `en.ts`/`pl.ts`.

### S2 — Side/limb and separator are interpolated in English, not just the landmark name

`formatLandmarkLabel` builds the visible label from raw English words:

```118:120:/home/zawilecxd/Projects/my-body-scan/src/domain/landmarks.ts
export function formatLandmarkLabel(landmark: Landmark, limb?: Limb | null): string {
  return limb == null ? `${landmark.name} · ${landmark.side}` : `${landmark.name} · ${limb} · ${landmark.side}`;
}
```

The plan localizes `t('landmark.<id>')` (the name) but `side` (`front`/`back`) and `limb`
(`left`/`right`) are still English literals, and PL word order may differ. The plan mentions
"region/side/limb helpers that take a translator" but no success criterion verifies these
words are actually translated.

**Fix:** Add explicit `side.*` and `limb.*` keys, route them through the helper, and add a
manual check that a limbed landmark (e.g. a left knee) reads fully in Polish.

### S3 — `formatTimestamp` uses device locale, not the active app locale

Summary chrome is supposed to follow the active UI locale, but timestamps use the
uncontrolled device locale:

```306:311:/home/zawilecxd/Projects/my-body-scan/src/domain/summary.ts
  return date.toLocaleString();
}
```

With a PL in-app override on an EN device, headings render Polish but dates render English —
an inconsistent PDF/share output. The plan's Phase 2 signature change (`formatSummaryText`/
`Html` take `t`/locale) should also thread the resolved locale into `formatTimestamp`
(`date.toLocaleString(resolvedLocale)`).

### S4 — Duplicate `regionLabel` in `index.tsx` is not covered by the plan

Phase 2 localizes `regionLabel` in `summary.ts`, and Phase 3 says "translate home chrome,"
but `src/app/index.tsx` has its own independent implementation:

```343:345:/home/zawilecxd/Projects/my-body-scan/src/app/index.tsx
function regionLabel(region: Region): string {
  return region.charAt(0).toUpperCase() + region.slice(1);
}
```

If Phase 3 only swaps string literals it may miss this helper, leaving list-view region
headers in English. **Fix:** Call out this duplicate explicitly — route both it and the
`summary.ts` version through one localized region-label helper keyed by region id.

### S5 — React Compiler is on; live locale switch requires access via context only

`app.json` sets `"reactCompiler": true`. The plan's "update i18n locale and context
immediately (no full reload)" only works if `t`/`resolvedLocale` reach every consumer
**through the provider hook** and `t`'s identity changes on locale change. Any component that
imports the module-level `i18n`/`t` singleton directly will be memoized against unchanged
inputs and won't re-render on switch.

**Fix:** In the Phase 1 provider contract, require all UI `t()` access via the
`useLocale()` hook (forbid direct `i18n` imports in components), and make the context value
recompute `t` when `resolvedLocale` changes.

---

## 💭 Nice-to-have

### N1 — Consider `useLocales()` instead of manual `AppState` re-read for System mode
expo-localization exposes a `useLocales()` hook that already reacts to device locale
changes. Per minimal-implementation ("do not introduce a new mechanism when existing code
covers the need"), prefer it over hand-wiring an `AppState` `active` listener if it covers
the foreground-refresh requirement; keep `AppState` only if a gap is proven.

### N2 — Guard the first-frame flash for in-app overrides
Loading the preference after DB-ready means an EN-device user with a PL override sees one EN
frame before the flip. It's already behind the splash/DB gate, so impact is small — but
consider not rendering the tree until the preference read resolves, to avoid a visible
flicker.

### N3 — Progress hygiene is good; keep the `updated:` field moving
`plan.md` Progress uses a clear `[ ]/[x]` + commit-sha convention and phase-scoped
automated/manual criteria — solid. Minor: `change.md` `updated: 2026-09-09` should advance
as phases land so status reflects reality.

---

## What's good
- Clear NOT-doing list and abort-if in `frame.md`; user content is consistently protected.
- Correct SDK 57 API usage (verified against the localization docs).
- Landmark IDs kept stable while display goes through keys — right call for DB/backup safety.
- Standards mapping is explicit and accurate (sqlite atomicity, nav double-tap guard for the
  new Settings link, minimal deps).
