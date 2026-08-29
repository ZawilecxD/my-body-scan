# Ticket: Injury thread — comments and solutions

Source: pasted (roadmap slice 3). No Linear issue matched.

## Slice (verbatim)

### 3. Injury thread — comments and solutions

- **Outcome:** User can open an injury, read description plus chronological comments and proposed solutions, add a comment or a text+URL solution, and tap a valid http(s) link to leave the app.
- **Layers:** sqlite (comment, solution), injury detail UI, React Native `Linking`
- **PRD:** G2 (solutions on open injuries), J2 (thread), FR-11, FR-12, FR-13, FR-17
- **Status:** ready
- **Next:** `/11x-new injury-thread comments plus text-and-url solutions on an open injury`

## Cited PRD (verbatim)

- **G2.** Open injuries are distinguishable from healed ones without opening the archive; each open injury shows its latest proposed solutions (text and links).
- **J2 — Follow current status (list or map):** Toggle to the **list** (first-class, grouped by body part) **or** stay on the graphic. See only **open** injuries. Open one → read description, chronological comments, and proposed solutions. Add a comment and/or another solution link (usually YouTube). The point of this journey: what is wrong now, and how it is being dealt with.
- **FR-11.** A proposed solution is user-authored **text** plus an optional **http(s) URL**. There is no exercise picker.
- **FR-12.** The user can add solutions to an existing open injury after creation.
- **FR-13.** The user can add timestamped comments to an open injury. Comments form a chronological thread (oldest first).
- **FR-17.** Tapping a solution URL leaves the app via the system handler (browser or YouTube). The app does not embed video.

Also from PRD §5–§6 (constraints, not summarized away):

- **Comment** — Timestamped text on one injury. Ordered by time ascending.
- **Solution** — User text + optional `url` on one injury. Not a catalog item.
- The only external interaction: open a user-supplied `http` or `https` URL with the Android system handler. Invalid or empty URLs are not opened.
- **FR-18.** All of the above data survives process death and app restart on the same device.
- **FR-19.** The app does not interpret symptoms, suggest exercises, or score pain. It stores what the user typed.

## Acceptance

- [ ] Open an existing injury and see its description, comments (oldest first), and proposed solutions.
- [ ] Add a timestamped comment; it appears in the thread and survives force-stop.
- [ ] Add a solution (required text, optional http(s) URL); it appears on the injury and the open list shows the latest solution.
- [ ] Tap a valid http(s) solution URL; the system handler opens it (app does not embed).
- [ ] Invalid or empty URLs are not opened. Whitespace-only comment or solution text is refused.
