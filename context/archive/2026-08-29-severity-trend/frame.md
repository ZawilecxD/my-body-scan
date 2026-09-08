# Frame: severity-trend

## Problem (observed, not assumed)

Mateusz can log injuries, comments, solutions, and lifecycle History, but has no way to record how bad an injury feels over time as discrete readings. Free-text comments are not a trend.

## Who it affects / impact

Solo user (Mateusz). Without readings, flare-up cycles are hard to see at a glance; physio summary (slice 7) would lack optional enrichment.

## Alternatives considered

1. **Do nothing** — keep using comments for “how it feels.” Rejected: not trendable; roadmap §6 exists for this gap.
2. **Single current severity on the injury row** — loses history. Rejected: outcome is “over time.”
3. **Append-only `severity_readings` table + detail UI (compose, list, SVG sparkline)** — Chosen: matches comments pattern, FR-19 (store user input), no new chart dep (`react-native-svg` already present), backup can include the table.
4. **Fold readings into `injury_events` History** — Rejected for this change: History is lifecycle audit; mixing scores clutters it. Readings get their own section.

## Chosen direction + why

Schema v6 `severity_readings` (injury_id, value 0–10, created_at). Open injury: add reading. Detail: chronological list + minimal SVG polyline trend. Update backup dump/parse/replace for the new table. No diagnosis copy.

## Explicitly not doing

- App-computed scores, advice, color-coded “risk”
- Edit/delete readings; confirm dialogs
- Chart library; jest/Playwright
- Lifecycle History events for readings
- iOS polish; physio PDF

## Assumptions

- Scale is integer **0–10** (inclusive), user-typed — not clinical scoring by the app (FR-19).
- Automated gate: `npx tsc --noEmit`.
- `formatVersion` stays `1`; `schemaVersion` tracks `DATABASE_VERSION` (6); old schema-5 backups remain unrestorable by existing design.
- Open-only writes; archived read-only for readings (same as comments).

## Abort-if

- Cannot express a runnable Automated Success Criterion with existing tooling.
- Product fork that would require inventing a clinical scale or advice UX.
