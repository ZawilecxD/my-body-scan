# Handoff: illness-disease-log

Ticket: pasted (roadmap Post-MVP §8 — Illness & disease log)  
Status: mr_ready

No project git/MR skill or MCP is configured. Paste this file as the MR body.

Commits on `main` (ahead of origin): `a38d950`, `f785df0` (+ docs stamp commit below if present).

**After you accept and merge/push to main:** run `/11x-archive illness-disease-log`.

## What landed

- Phase 1: Schema v7, illness APIs, backup — a38d950
- Phase 2: Illnesses UI (list, create, detail) — f785df0

## Assumptions

- Automated gate is `npx tsc --noEmit` (no test runner; do not add one).
- Creating an illness always creates the first episode in the same transaction.
- Episode `notedAt` defaults to now (no date picker).
- Tactics have no soft-delete (unlike injury solutions).
- `formatVersion` stays `1`; `schemaVersion` is `7`; old schema-6 backups remain unrestorable by design.
- Separate illness domain — not pinned to landmarks/map; no diagnosis/advice (FR-19).
- Roadmap §8 treated as pasted ticket AC (no Linear issue).

## Reviewer checklist (manual)

- [ ] 2.4 Android smoke: create illness → list shows 1 episode; log episode → count updates; add tactic with https URL → opens; force-stop persist; export/restore includes illnesses/episodes/tactics
- [ ] 2.4 Prefer also exercising a **v6→v7 upgrade on a populated DB**
- [ ] 2.5 Confirm no diagnosis/advice copy on illness screens
- [ ] Plan-review S3 (parked): backup tactic URL `isHttpUrl` on parse
- [ ] Plan-review S4 (parked): home header crowding (Illnesses + Summary + Backup + Archive + Log injury)
- [ ] Plan-review N5 (parked): optional free-text note on episodes
- [ ] Impl-review S1 (not applied): validate tactic URLs in `parseTactic`
- [ ] Impl-review S2 (not applied): simplify dead `notedAt` empty check in `createEpisode`
- [ ] Impl-review N1 (not applied): empty-state in-body Log illness CTA
- [ ] Impl-review N2 (not applied): detail `useFocusEffect` if future sub-screens mutate

## Automated evidence

- `npx tsc --noEmit` → pass (phases 1–2)

## Follow-ups / out of scope

- Illness archive/reopen; edit/delete; physio-summary inclusion; i18n; map coupling
- Validate tactic URLs on backup parse (S1) if desired as a tiny follow-up

## Context paths

- `context/changes/illness-disease-log/change.md`
- `context/changes/illness-disease-log/plan.md`
- `context/changes/illness-disease-log/ticket.md`
- `context/changes/illness-disease-log/frame.md`
- `context/changes/illness-disease-log/handoff.md`
