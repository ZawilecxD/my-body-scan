# Ticket: illness-disease-log

**Source:** roadmap Post-MVP §8 — Illness & disease log (pasted; no Linear issue)  
**Intent (verbatim):** log illnesses and chronic conditions with episode frequency and symptom tactics

## Acceptance criteria

1. The user can log an illness or chronic condition that is **not** pinned to a body landmark (e.g. colds, internal infections, chronic diseases) with a required name/title.
2. The user can record **episodes** for that illness and see how often they recur (at least episode count and chronological episode dates).
3. The user can keep **user-authored symptom tactics** for that illness: required text and optional http(s) URL; valid URLs open via the system handler (same Linking rules as injury solutions).
4. Illness data persists across force-stop (FR-18).
5. Export/restore includes illnesses, episodes, and symptom tactics (schema bump; backup payload updated).
6. The app does not diagnose, interpret symptoms, or advise treatment (FR-19) — it only stores and displays what the user entered. No medical-device framing.

## Out of scope (ticket)

- Pinning illnesses to landmarks or the body map
- Diagnosis, AI advice, suggested treatments, clinical scoring
- Archive/reopen lifecycle for illnesses (injury archive stays as-is)
- Edit/delete of illnesses, episodes, or tactics
- Folding illness data into physio summary PDF
- Sharing/sync/accounts
- Test runner / jest-expo / Playwright
- New chart library or other dependencies
- i18n (roadmap §9)
