# Handoff: app-i18n-en-pl

Ticket: roadmap §9 — App i18n (EN / PL) (pasted; no Linear issue)  
Status: mr_ready  
MR: https://github.com/ZawilecxD/my-body-scan/pull/3

## What landed
- Phase 1: Locale core, catalogs, settings persist — 1b45def
- Phase 2: Landmark + summary chrome localization — 86cc780
- Phase 3: Screens + Language settings UI — b5c672b

## Assumptions
- Default when device is neither EN nor PL: English
- Locale preference stored in SQLite `app_settings`, not in backup JSON
- `BACKUP_SCHEMA_VERSION` stays 7 while DB is 8 so existing backups restore
- `expo-localization` + `i18n-js` per Expo SDK 57 guide
- Thrown DB/domain `Error` messages stay English; UI chrome + Alerts use `t()`
- Typed EN/PL catalogs so missing PL keys fail `tsc`

## Reviewer checklist (manual)
- [ ] 1.5 Confirm preference persists after force-stop
- [ ] 1.6 Upgrade from v6/v1 DB reaches `user_version` 8 with `app_settings`
- [ ] 1.7 Restore a schemaVersion-7 backup after DB v8 upgrade
- [ ] 2.3 Spot-check PL summary chrome with verbatim user text
- [ ] 3.3 Language matrix: System / EN / PL on Android
- [ ] 3.4 Confirm share/PDF dialog titles follow locale
- [ ] S1 Polish plurals for count strings (`%{count} epizodów` / urazów) — grammar for 2–4
- [ ] S2 Dead `layout.dbError` catalog key (DB error screen is pre-provider English)
- [ ] S3 Unused `ready` on locale context; possible first-frame flash on override
- [ ] S4 `npm run lint` / `expo lint` has no ESLint config in repo (pre-existing); gate used was `npx tsc --noEmit`
- [ ] Plan-review deferred: prefer `useLocales()` over AppState if it covers System refresh (N1)

## Automated evidence
- `npx tsc --noEmit` → pass

## Follow-ups / out of scope
- UI rebrand (§10), iOS (§11), more languages
- Translating user-authored content
- Putting locale preference into backup export
- Adding eslint/jest/Playwright stacks

## Context paths
- `context/changes/app-i18n-en-pl/change.md`
- `context/changes/app-i18n-en-pl/plan.md`
- `context/changes/app-i18n-en-pl/ticket.md`
