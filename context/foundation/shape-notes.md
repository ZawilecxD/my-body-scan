---
context_type: greenfield
created: 2026-08-15
---
# Shape notes: My Body Scan

Working name from the repo. Not a camera scan — a body map plus injury log.

## Problem & who has it

Tracking physical issues (injuries, niggles) needs *where* on the body, *current status*, and *what to do about it*. A notes app has no body. Clinical/physio apps are heavy.

First user: Mateusz (builder). After MVP: anyone who wants to track body problems — especially sportspeople and people working with a physio.

## Why now

Mateusz has injuries to track now. Generic notes and clinical apps don't fit; the missing middle is a body map + status log.

## Core journey

1. Open the app. Toggle **body graphic** or **list grouped by body part**.
2. Graphic: front/back toggle. Tap a region (legs, arms, torso, head) → close-up of that region's major muscles and joints (limited set, biggest landmarks only).
3. Tap a landmark to attach an injury (e.g. forearm, elbow). The graphic is schematic, not precise: a specific forearm muscle is marked on the forearm; something very specific around the elbow is marked on the elbow; the description carries the rest.
4. On an injury: create a note, add comments over time, propose solutions as **text + links** (usually YouTube).
5. When healed, archive it. Archive stays readable.
6. The point of the home/status view: current open problems and how they are being dealt with.

List view is a first-class alternative to the graphic, not a fallback buried in settings.

## Out of scope

- iOS
- Camera / photo / real body scan
- 3D, medical-grade anatomy, or picking individual muscle fibers
- Built-in exercise catalog (user writes text and pastes links)
- Accounts, cloud sync, backup
- Sharing with a physio or any multi-user flow
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

## Open questions

- Exact MVP landmark list per region (front and back)
- Injury fields beyond note/comments/links (dates, severity, status tags?)
- Whether comments are a chronological thread on one injury
- Where the illustrations come from (custom vs asset pack)
- Whether "current status" is a dedicated home list of open injuries, the body map with markers, or both
- Export/backup later vs forever local-only
