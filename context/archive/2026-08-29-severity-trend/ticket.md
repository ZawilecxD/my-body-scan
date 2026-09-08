# Ticket: severity-trend

**Source:** roadmap Post-MVP §6 — Severity trend  
**Intent (verbatim):** severity readings over time on an injury

## Acceptance criteria

1. On an open injury, the user can record a simple numeric severity/pain reading (integer 0–10) with a timestamp.
2. On injury detail, the user can see prior readings for that injury in chronological order and a simple trend visualization.
3. Archived injuries remain readable (history + trend) but cannot add new readings.
4. Readings persist across force-stop (FR-18).
5. Export/restore includes severity readings (schema bump; backup payload updated).
6. The app does not interpret readings, diagnose, or advise treatment (FR-19) — it only stores and displays what the user entered.

## Out of scope (ticket)

- Diagnosis, AI advice, medical-device presentation
- Physio summary PDF (slice 7)
- Comment/event folding of readings into lifecycle History
- Edit/delete readings
- Global cross-injury severity screen
- New chart library dependency
- Test runner / jest-expo / Playwright
