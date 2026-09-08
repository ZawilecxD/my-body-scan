# Impl review: illness-disease-log

**Change:** `illness-disease-log` · **Commits:** `a38d950` (phase 1), `f785df0` (phase 2)  
**Automated gate:** `npx tsc --noEmit` → exit 0

## Verdict

Approve — ready to ship pending manual Android smoke (2.4 / 2.5). No Critical findings.

## Summary

Schema v7 is atomic on all upgrade paths (never stamps `user_version = 7` without the three illness tables). `createIllness` writes illness + first episode in one transaction. Linking is gated by `isHttpUrl` (no `canOpenURL`). Boundaries fail loud. Screens and backup match plan contracts.

## Findings

### Critical

(none)

### Suggestion

1. **Backup parse doesn't re-validate tactic URLs** — `parseTactic` accepts any nullable string; write path rejects non-http(s). Prefer `isHttpUrl` on non-null parse, or document intentional solutions-parity.  
   **Fix:** After `requireNullableString`, if non-empty and `!isHttpUrl(url)` throw.

2. **Dead / soft `notedAt` check in `createEpisode`** — `input.notedAt?.trim() || createdAt` makes the empty-length throw unreachable; whitespace-only input silently becomes "now".  
   **Fix:** Drop the unreachable guard (v1 UI never passes `notedAt`), or branch explicitly when `notedAt` was provided blank.

### Nice-to-have

1. Empty-state in-body **Log illness** CTA (header already has it).
2. Detail uses `useEffect` not `useFocusEffect` — fine today; note for future sub-screens.

## Triage (unattended)

- **Applied (Critical):** none.
- **Deferred to handoff:** S1, S2, N1, N2.
