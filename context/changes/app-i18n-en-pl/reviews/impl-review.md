---
change_id: app-i18n-en-pl
review: impl-review
reviewer: code-reviewer
created: 2026-09-09
verdict: approve-with-suggestions
critical_count: 0
commits_reviewed: [1b45def, 86cc780, b5c672b]
range: main..HEAD (4588b1c..b5c672b)
triage: 2026-09-09
triage_applied: []
triage_deferred: [S1, S2, S3, S4, N1]
---

# Impl review: app-i18n-en-pl

## Summary

Strong, faithful implementation of the plan across three phases. The two Critical issues
flagged in `plan-review.md` (C1 migration catch-up, C2 backup `schemaVersion` coupling) are
both correctly resolved, and every deferred plan-review suggestion that touched correctness
(S1 typed catalogs, S2 side/limb keys, S3 locale-aware timestamps, S4 single `regionLabel`,
S5 hook-only `t()` access) is implemented as described. All UI chrome routes through
`t()` via the `useLocale()` hook; user-authored text (descriptions, comments, solutions,
tactics, illness names, notes) is rendered verbatim and HTML-escaped in the summary.

**Automated gate:** `npx tsc --noEmit` exits **0** — verified. Because both catalogs are
typed as `Record<MessageKey, string>`, a missing or extra PL key is a compile error, so the
green `tsc` run also proves EN/PL key parity. See S4 for the `npm run lint` gate.

**No Critical issues.** Findings below are quality/hygiene improvements; none block the
Automated Success Criteria.

Verified against the Expo SDK 57 localization guide (via Context7): the `expo-localization`
config plugin accepts `supportedLocales` as either an array or a `{ ios, android }` object —
`app.json`'s object form is valid.

## Coverage vs Acceptance Criteria

| AC | Status | Notes |
|---|---|---|
| 1. EN/PL UI chrome | ✅ | All screens + nav + Alerts + summary chrome via `t()`. |
| 2. Device language, documented default | ✅ | `resolveLocale` → `en`/`pl`, else `en`; `AppState` refresh for System. |
| 3. In-app override persists force-stop | ✅ (code) | SQLite `app_settings.locale_preference`; manual persistence test still pending (plan 1.5). |
| 4. Summary chrome localized, user text verbatim | ✅ | `formatSummaryText/Html` take `t` + locale; descriptions/bodies escaped, never translated; share/PDF `dialogTitle` uses `t('summary.physioTitle')`. |
| 5. Landmark/region names localized | ✅ | `landmarkName`/`regionLabel`/`overviewZoneLabel` keyed by stable id; `landmark.id` unchanged. |
| 6. No diagnosis/medical framing | ✅ | No such copy added; blurb reworded locale-neutrally. |

Migration safety (plan Critical detail) re-verified in `src/db/migrate.ts`:
`V7_FROM_V6` stamps a literal `PRAGMA user_version = 7`; `V8_FROM_V7` (app_settings DDL +
stamp 8) is appended to every catch-up branch v1→v6, the new `currentDbVersion === 7`
branch exists, and the fresh-install (`=== 0`) block includes `APP_SETTINGS_DDL` before its
final stamp. WAL runs outside the transaction; DDL + `user_version` are in one
`withTransactionAsync` (matches `sqlite.md`). `BACKUP_SCHEMA_VERSION = 7` is decoupled from
`DATABASE_VERSION = 8` and used for export stamp + parse + restore checks, so existing v7
backups still restore.

---

## 🔴 Critical

None.

---

## 🟡 Suggestions

### S1 — Polish plural forms are grammatically wrong for count-interpolated strings

Count strings use a single fixed noun form with bare `%{count}` interpolation instead of
i18n-js pluralization. Polish has distinct `one` / `few` / `many` forms, so these read
incorrectly for most counts:

- `illnesses.episodeCount`: `'%{count} epizodów'` → correct for 5+, wrong for 1 (`epizod`)
  and 2–4 (`epizody`).
- `backup.exported` / `backup.restored`: `'... %{count} urazów.'` → wrong for 1 (`uraz`)
  and 2–4 (`urazy`).
- `backup.replaceBody`: same `%{count} urazów` inside the sentence.

```125:125:/home/zawilecxd/Projects/my-body-scan/src/i18n/messages/pl.ts
  'illnesses.episodeCount': '%{count} epizodów',
```

**Fix:** Use i18n-js pluralization for these keys (pass a plural object `{ one, few, many,
other }` and rely on the `pl` plural rules i18n-js ships), or, if staying minimal, reword
to a count-agnostic PL phrasing (e.g. `Epizody: %{count}`, `Wyeksportowano urazy: %{count}`).
EN is fine as-is. This is the most user-visible quality gap for the PL target.

### S2 — Dead catalog key `layout.dbError`; DB-error screen stays hardcoded English

`_layout.tsx` renders the init-failure fallback with a hardcoded English string, while a
matching catalog key exists in both `en.ts` and `pl.ts` but is never referenced:

```30:32:/home/zawilecxd/Projects/my-body-scan/src/app/_layout.tsx
        <ThemedView style={styles.screen}>
          <ThemedText>Cannot open the injury database: {dbError.message}</ThemedText>
        </ThemedView>
```

```8:8:/home/zawilecxd/Projects/my-body-scan/src/i18n/messages/en.ts
  'layout.dbError': 'Cannot open the injury database: %{message}',
```

The error branch renders *outside* `LocaleProvider` (the provider needs the DB that just
failed to open), so it genuinely cannot use `t()` — keeping it English is the right,
fail-loud behavior. But the unused key is dead code (`coding-style.md`: "Delete unused
code … in the same change").

**Fix:** Remove `layout.dbError` from both catalogs (preferred), or add a short comment on
the fallback explaining it is intentionally pre-provider English so a future reader doesn't
try to localize it.

### S3 — `ready` context field is never consumed; in-app-override first-frame flash unaddressed

`LocaleContext` exposes `ready`, but no consumer reads it and `_layout.tsx` renders the
`Stack` immediately, so `ready` is dead API surface (`minimal-implementation.md`: no unused
fields). It also leaves plan-review N2 open: a user with a PL in-app override on an EN
device sees one EN frame before the preference load flips locale.

```91:100:/home/zawilecxd/Projects/my-body-scan/src/i18n/locale-context.tsx
  const value = useMemo(
    () => ({
      preference,
      resolvedLocale,
      setPreference,
      t,
      ready,
    }),
```

**Fix:** Either consume `ready` (e.g. render `null`/keep splash until it is `true` to avoid
the flash) or drop the field until a caller needs it.

### S4 — `npm run lint` gate is non-operational; progress note "lint clean" is inaccurate

The plan's Phase 3 Automated criterion and progress line 3.2 ("Replace screen chrome with
t(); lint + tsc clean — b5c672b") claim a passing lint gate, but `npm run lint` (`expo
lint`) exits non-zero with `ESLint output (JSON parse failed …)`: there is no `eslint`
dependency in `package.json`, no `eslint`/`eslint-config-expo` in `node_modules`, and no
`eslint.config.*`/`.eslintrc*`. This is a **pre-existing** repo condition (not introduced by
this change), and `tsc` — which does pass — is the real automated gate.

**Fix (report-only):** Correct the progress claim to reflect that lint is not wired in this
repo, or wire `eslint-config-expo` if a lint gate is actually wanted. No product-code change
required for this change to be considered done, since its stated automated gate (`tsc`)
passes.

---

## 💭 Nice-to-have

### N1 — Empty-state "Log injury" CTA lacks the nav double-tap guard (pre-existing)

Every navigating press handler uses the `navigating.current` ref guard except the list
empty-state CTA, which navigates unguarded:

```232:233:/home/zawilecxd/Projects/my-body-scan/src/app/index.tsx
              onPress={() => router.push('/landmarks')}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
```

`git diff main...HEAD` shows this line predates the change (it only shifted position), so
it is out of this change's scope per `minimal-implementation.md`. Worth a follow-up to align
with `navigation.md`.

### N2 — `createI18n` instantiates a fresh `I18n` on every locale change

`t` is memoized on `resolvedLocale`, which is correct for re-render, but each switch builds a
new `I18n` from the catalogs. Harmless at two locales; could memoize one instance per locale
if this ever grows.

### N3 — `formatTimestamp` relies on Hermes `Intl`

`date.toLocaleString('pl-PL' | 'en-US')` is correct on RN 0.86 (Hermes ships `Intl` on
Android; iOS uses JSC). No action needed — noting the dependency for the manual matrix
(plan 3.4 / 2.3).

---

## What's good

- Migration and backup Critical fixes are exactly as the plan prescribed and verified atomic.
- Typed `Messages = Record<MessageKey, string>` turns `tsc` into a real translation-parity
  gate — the strongest automated coverage available without a test runner.
- Consistent hook-only `t()` access and locale-threaded date formatting across every screen;
  user content is never translated and stays HTML-escaped in the summary.
- Landmark IDs untouched; display fully keyed — DB/backup stay stable.
- Standards honored: `sqlite.md` atomicity, `coding-style.md` English thrown errors, nav
  double-tap guards on all newly added navigation (Settings, Illnesses, etc.).
