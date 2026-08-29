# Frame: deploying-publishing-plan

## Problem (observed, not assumed)

Mateusz can run the app in a local Expo/dev loop, but there is no documented path to (1) install a standalone build on his private Android phone, or (2) later ship that same app to the Play Store. `app.json` has no `android.package`, and the repo has no EAS config — so neither path is executable yet. Play Store is explicitly far future; product slices still need to look and work well first.

## Who it affects / impact

Mateusz only (builder + first production user). Without Phase 1 he cannot dogfood a real install (icon, cold start, no Metro). Without a Phase 2 checklist he will rediscover Play Console, signing, and listing requirements under time pressure later.

## Alternatives considered

1. **Docs-only runbook** — write both phases, execute nothing. Cheap, but Phase 1 stays unproven (credentials, package id, first APK).
2. **Runbook + execute Phase 1 (EAS preview on phone); Phase 2 checklist only** — chosen. Proves the install path now; defers store launch.
3. **Execute phone + Play Store end-to-end now** — rejected; product is not “everything working and looking good,” and store listing/policy work is premature.
4. **Expo Go / USB `expo run:android` as “deploy”** — fine for day-to-day coding; does not produce a sideloadable standalone artifact or exercise EAS credentials that Play will need later.
5. **Do nothing** — keeps shipping blocked on tribal knowledge.

## Chosen direction + why

One change, two phases in one plan:

- **Phase 1 (execute in this change):** Wire Expo Application Services — `android.package`, `eas.json` with a **preview** profile that builds an **APK**, EAS project link, **EAS-managed** Android credentials. Produce and install a preview build on Mateusz’s private phone (EAS install link and/or `adb`). Day-to-day coding can stay Expo Go / Metro; preview APK is the “deploy to my phone” proof.
- **Phase 2 (document only, do not run):** Step-by-step Play Store playbook — Google Play Developer account, production `eas.json` profile → **AAB**, same EAS-managed upload key, store listing, content rating, privacy/policy prerequisites, internal/closed testing, then production. Marked deferred until the MVP is polished.

EAS-managed signing from Phase 1 so the upload keystore can graduate to Play without a painful key migration.

## Explicitly not doing

- Submitting or releasing on Google Play in this change
- iOS / TestFlight / App Store
- CI that auto-builds on every push (optional later; not required for Phase 1)
- Privacy policy site, store screenshots, or marketing copy beyond listing them as Phase 2 prerequisites
- Changing product features, schema, or UI polish
- Switching away from Expo managed workflow / bare React Native
- Local keystore files committed to the repo

## Open questions for planning

- Exact `android.package` / applicationId (immutable once Play is live) — propose a default in the plan if unset.
- Whether Mateusz already has an Expo account and Play Console developer registration ($25) — Phase 1 needs Expo; Play account is Phase 2 only.
- Preferred Phase 1 install path on device (EAS build page QR/download vs USB `adb install`) — support both; default to EAS install link.
- How detailed Phase 2 must be (Console click-path vs checklist of prerequisites + EAS submit commands) — prefer actionable checklist with official doc links, not a screenshot tour.
