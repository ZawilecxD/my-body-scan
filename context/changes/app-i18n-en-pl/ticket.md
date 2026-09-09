# Ticket: app-i18n-en-pl

**Source:** roadmap Post-MVP §9 — App i18n (EN / PL) (pasted; no Linear issue)  
**Intent (verbatim):** English and Polish UI locale for the app

## Acceptance criteria

1. The user can run the app **UI chrome** in **English** or **Polish**.
2. Locale follows the **device** language when it is `en` or `pl` (or a clear documented default when neither).
3. The user can also choose locale **in-app** (override device), and the choice persists across force-stop.
4. Shareable summary **chrome** (physio summary labels/headings) respects the active UI locale; **user-authored** injury/illness text stays as written (never machine-translated).
5. Landmark catalog / region names shown in the UI are localized for EN and PL (they are app chrome, not user content).
6. No diagnosis, AI advice, or medical-device framing (FR-19).

## Out of scope (ticket)

- Translating user-authored descriptions, comments, solutions, tactics, or illness names
- Additional languages beyond EN and PL
- iOS-specific store localization polish (roadmap §11)
- UI rebrand / visual redesign (roadmap §10)
- New product features unrelated to locale
- Adding a jest / Playwright / e2e stack if the repo still lacks one
