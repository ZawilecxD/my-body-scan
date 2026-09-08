# Frame: illness-disease-log

## Problem

Injuries answer “where on the body.” Whole-body / systemic issues (colds, infections, chronic conditions) cannot be pinned to a landmark. Mateusz needs a separate log so he can see episode recurrence and remember what symptom tactics worked last time — without the app diagnosing or advising.

## Chosen direction

Add a parallel **illness** domain (sqlite + screens), not an injury subtype:

- `illnesses` — name (required), optional notes, `created_at`
- `illness_episodes` — dated occurrences for frequency
- `symptom_tactics` — text + optional http(s) URL (mirror injury solutions patterns; reuse `isHttpUrl` + RN `Linking`)

Entry from home header → illnesses list → create + detail (episodes + tactics). Creating an illness also records the first episode at create time. Backup schema bumps to v7 and round-trips the three collections. No landmark / map coupling.

## Not doing

- Landmark or map markers for illnesses
- Diagnosis / advice / clinical taxonomy or severity-of-illness scoring
- Illness archive/reopen
- Edit/delete
- Physio-summary inclusion
- New dependencies or a test runner

## Assumptions

- Roadmap §8 is the AC source (pasted); no Linear ticket.
- One coherent change (not an effort); phases inside the plan only.
- Automated gate remains `npx tsc --noEmit` (repo has no jest/Playwright; do not add).
- English UI labels; domain terms: illness, episode, symptom tactic.
- Old schema-6 backups remain unrestorable under the existing exact-`schemaVersion` rule.
- Optional notes on illness are allowed; no separate “kind” enum (acute vs chronic is just naming).

## Abort-if

- AC cannot be expressed as a runnable Automated criterion this repo already knows (`tsc`) — would block.
- Scope expands into map/landmark coupling or medical advice UI.
- Critical plan/impl review finding remains after one triage pass.
