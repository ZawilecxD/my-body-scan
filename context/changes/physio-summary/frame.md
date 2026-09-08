# Frame: physio-summary

## Problem (observed, not assumed)

Mateusz can track open/archived injuries, solutions, and severity on-device, but before a physio visit there is no way to produce a one-way briefing of recent status. He mostly needs to **read it himself before the meeting** or **read it aloud to the therapist** — not send it often. Backup JSON (§5) is a restore format, not a human-readable visit summary.

## Who it affects / impact

Mateusz (builder + first production user), and later anyone who brings the log to a physio. Without this, they improvise from the in-app thread or memory under time pressure. Multi-user physio accounts stay out of scope (Parked / roadmap).

## Alternatives considered

1. **Do nothing** — keep using injury detail + backup JSON. Rejected: not briefable in a visit.
2. **Fixed dump of all open injuries** (no config) — cheap, but too rigid for “last 6 months including recently closed” therapist context.
3. **Share sheet text only** — enough for occasional send; weaker for calm on-device reading before a visit.
4. **PDF only** — good for reading/print; awkward for the rare WhatsApp/email handoff.
5. **Configurable summary → in-app preview, then share sheet and/or PDF** — chosen. Matches rare share + primary read-aloud/read-ahead use.
6. **Bundle full-app EN/PL i18n in this change** — rejected; stalls the summary outcome. i18n is a separate roadmap slice; this summary stays English.

## Chosen direction + why

One change: a **summary export config** screen, then generate an English human-readable briefing.

**Config knobs (v1):**

- **Time window** (presets including last 6 months; exact preset list at plan time)
- **Status scope:** open only **or** open + archived that fall in the window
- **Section checkboxes:** description, latest severity, solutions, comments

**Defaults on first open:** last 6 months; open + archived in window; description + latest severity + solutions **on**; comments **off**.

**Outputs:** in-app readable result, plus **system share sheet** and **optional PDF** of the same content (English chrome/labels). `expo-sharing` is already in the project; PDF library choice is a plan detail.

Primary success: Mateusz can skim or read aloud a recent briefing at a physio visit without accounts or cloud sync.

## Explicitly not doing

- App-wide i18n / EN–PL UI (separate Post-MVP slice)
- Translating user-authored injury text
- Accounts, cloud sync, or multi-user physio collaboration
- Diagnosis, AI advice, or medical-device framing (FR-19 / Parked)
- Changing backup JSON restore format except reading existing data for the summary
- Illness/disease log (§8) content in this summary
- Remembering last-used config across sessions (defaults only in v1; can revisit later)

## Open questions for planning

- How “in window” is defined for open vs archived (e.g. `createdAt` / `updatedAt` / archived timestamp) — pick one rule in the plan.
- Exact time-window presets (1 / 3 / 6 / 12 months vs custom date range).
- PDF approach on Expo 57 (e.g. `expo-print` vs other) and where the entry point lives in navigation.
- Whether “latest severity” means one reading or a short list/sparkline text in the export.
