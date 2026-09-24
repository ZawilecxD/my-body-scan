---
context_type: greenfield
created: 2026-08-15
---
# Shape notes: My Body State

**Preferred working title:** My Body State. Validate store uniqueness and user comprehension before the public rename. The product is not a camera scan — it is a private body-state map plus injury and recovery log.

## Problem & who has it

Tracking physical issues (injuries, niggles) needs *where* on the body, *current status*, and *what to do about it*. A notes app has no body. Clinical/physio apps are heavy.

First user: Mateusz (builder). After MVP: anyone who wants to track body problems — especially sportspeople and people working with a physio.

## Why now

Mateusz has injuries to track now. Generic notes and clinical apps don't fit; the missing middle is a body map + status log.

## Core journey

1. Open the app. Toggle **body graphic** or **list grouped by body part**.
2. Graphic: front/back toggle. Tap a region (legs, arms, torso, head) → close-up of that region's major muscles and joints (limited set, biggest landmarks only).
3. Tap a landmark to attach an injury (e.g. forearm, elbow). The graphic is schematic, not precise: a specific forearm muscle is marked on the forearm; something very specific around the elbow is marked on the elbow; the description carries the rest.
4. On an injury: add a lightweight **update**. An update combines the observation that used to be split between a severity reading and a comment. Severity and note are individually optional, but an update must contain at least one of them.
5. Optionally record an intervention (text + link, usually YouTube) and later attach a simple outcome: helped, no change, or worsened. Advanced fields stay collapsed unless the user asks for them.
6. When healed, archive the injury. Archive stays readable and the injury can be reopened on a flare-up.
7. The point of the Today/status view: current open problems, what changed recently, what is being tried, and which intervention needs a follow-up.

List view is a first-class alternative to the graphic, not a fallback buried in settings.

## Out of scope

- iOS
- Camera / photo / real body scan
- 3D, medical-grade anatomy, or picking individual muscle fibers
- Built-in exercise catalog (user writes text and pastes links)
- Accounts or cloud sync
- Live sharing, clinician accounts, or any multi-user workflow
- Diagnosis, AI advice, or presenting as a medical device

## Riskiest assumption

A schematic 2D front/back map with a small set of tap targets is clear enough to log real injuries. Mitigated on purpose: coarse landmarks + description for specifics, and a togglable list grouped by body part so the graphic is not a single point of failure.

## Constraints

- Android only
- On-device only, no account
- Polished enough to show others (not a throwaway weekend hack)
- Schematic art is fine; it does not need to be an atlas
- Limited landmarks: biggest muscles and joints per region
- Solo builder; first production user is the builder

## Product direction decisions — 2026-09-24

- **Positioning:** an injury and recovery journal for active people and people working with a physio; do not broaden into an all-purpose health tracker.
- **History:** the injury timeline is composed primarily of updates. Legacy comments and severity readings are migrated into that timeline.
- **Low-friction input:** severity and note live in one update; no long required questionnaire. Intervention and outcome fields use progressive disclosure.
- **Home:** a Today view leads with active injuries, recent change, stale items, and follow-ups. Map and grouped list remain first-class ways to browse and locate an injury.
- **Interventions:** keep user-authored text and links, then add a delayed outcome rather than asking whether something helped at the moment it was tried.
- **Control:** injuries and timeline entries can be corrected and safely deleted.
- **Reports:** physio summaries become configurable and work in English and Polish.
- **Privacy:** remain local-first and add app lock, protected task-switcher preview, clear export warnings, and full local-data deletion.
- **Tone:** no streaks, guilt, or required daily logging.
- **Brand:** My Body State is the leading name candidate; final adoption waits for store/name validation during the rebrand slice.
- **Scope restraint:** the existing illness log may remain, but further expansion is parked until the injury/rehab loop is validated.
