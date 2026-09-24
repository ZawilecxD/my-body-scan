# Ticket: roadmap-§9-unified-injury-updates

Source: `context/foundation/roadmap.md` slice 9, plus the product rules that slice names as already approved. Quoted, not paraphrased.

## Roadmap §9 (verbatim)

### 9. Unified injury updates

- **Outcome:** Replace the split comment + severity workflow with one chronological injury update that accepts severity, note, or both. Migrate existing comments and severity readings without loss.
- **Why first:** Every later screen, reminder, report, and intervention outcome depends on one coherent history model.
- **Scope guard:** The basic form contains no required fields beyond at least one of severity or note. General-health factors remain out.
- **Layers:** schema migration, update repository/domain, injury detail timeline, backup/restore compatibility, summary compatibility
- **Depends on:** completed injury thread, severity trend, backup, and summary
- **Next when ready:** `/11x-new unified-injury-updates merge comments and severity into one lightweight injury update history`

Roadmap preface for this phase: "Each item is a separate change when started; do not implement the whole list as one effort."

## Product rules this slice must satisfy (verbatim)

From `context/foundation/prd.md` §9:

- **PDR-1.** An injury has one chronological history composed primarily of timestamped **updates**.
- **PDR-2.** An update combines the concepts currently stored as a severity reading and a comment. It may contain severity (0–10), a note, or both; at least one must be present.
- **PDR-3.** Creating a basic update must not require treatment, trigger, medication, duration, mood, sleep, or other general-health fields.
- **PDR-4.** Existing comments and severity readings are migrated without data loss and rendered coherently in the unified history.
- **PDR-6.** Lifecycle events such as created, archived, and reopened remain visible in the history but are not presented as user updates.

From PRD open questions (unresolved there; this change must pick a rule and record it):

- Exact migration and display rules when legacy comments and severity readings have nearby or identical timestamps.

Out of this ticket (later slices): PDR-5 edit/delete, PDR-7–10 interventions, PDR-11 Today, reminders, i18n, privacy, rebrand.

## Acceptance

1. On an open injury, one form adds an update with severity, a note, or both. Save stays disabled when both are absent. No other fields are required.
2. Injury detail shows those updates in one chronological list. Severity trend still draws from severity-bearing points when there are at least two.
3. Existing comment text and severity values survive upgrade and appear in that list with their original timestamps.
4. Backup export/restore round-trips updates on the new schema. Summary still reports latest severity and the written notes.
5. Archived injuries stay readable and do not accept new updates. Solutions and lifecycle history stay as they are.
