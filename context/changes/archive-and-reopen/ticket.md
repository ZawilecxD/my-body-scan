# Ticket: Archive when healed, reopen on flare-up

Source: pasted (roadmap slice 4). No Linear issue matched.

## Slice (verbatim)

### 4. Archive when healed, reopen on flare-up

- **Outcome:** User can archive an open injury; it vanishes from the open list and map markers, remains readable with full history in a separate archive, and can be reopened without creating a duplicate.
- **Layers:** injury status (`open` | `archived`), archive screen, reopen action
- **PRD:** G2 (open vs healed split), G3, J3, FR-8, FR-14, FR-15, FR-16
- **Status:** ready
- **Next:** `/11x-new archive-and-reopen archive healed injuries and reopen a flare-up`

## Cited PRD (verbatim)

- **G2.** Open injuries are distinguishable from healed ones without opening the archive; each open injury shows its latest proposed solutions (text and links).
- **G3.** Archiving an injury removes it from the current/open views and leaves it readable in the archive.
- **J3 — Archive when healed, find it later:** On an open injury, archive it as healed. It disappears from current/open map markers and from the open list. Open the archive, find that injury, read its history. It cannot be lost; it is no longer "current."
- **FR-8.** Archive is a separate screen listing archived injuries; the user can open any of them read-plus-history (comments and solutions remain visible).
- **FR-14.** An injury is either **open** or **archived**. There is no other status flag in MVP.
- **FR-15.** Archiving is an explicit user action on an open injury. Archived injuries do not appear in the open list or as open markers.
- **FR-16.** The user can reopen an archived injury (move it back to open) from the archive. (Needed so a "healed then flared" problem does not require a duplicate; if this is dropped, archive is write-once.)

Also from PRD §5–§6 (constraints, not summarized away):

- **Injury** — A problem attached to one landmark. `description` (required), `status` (`open` \| `archived`), `created_at`, `archived_at` (set when archived, cleared if reopened).
- **FR-16 default:** reopen is in. It is the cheap way to handle a flare-up without a second injury on the same landmark.
- **FR-18.** All of the above data survives process death and app restart on the same device.
- **FR-19.** The app does not interpret symptoms, suggest exercises, or score pain. It stores what the user typed.
- **M3. Status split** — After archiving, the open list and map markers match "what's current"; the archive still shows the healed item.

## Acceptance

- [ ] From an open injury, archive it as healed (explicit user action).
- [ ] Archived injury disappears from the open list and from open map markers.
- [ ] Archive screen lists archived injuries; opening one shows full history (description, comments, solutions).
- [ ] From an archived injury, reopen it; it returns to open list/markers without creating a duplicate; `archived_at` is cleared.
- [ ] Status is only `open` | `archived`; data survives force-stop / restart.
