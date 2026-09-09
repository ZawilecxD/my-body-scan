# Frame: app-i18n-en-pl

## Problem

The app ships English-only UI. First production users are PL/EN; physio summary chrome is English until locale lands. Mateusz needs the whole UI chrome switchable without translating anything the user typed.

## Chosen direction

Add app-wide EN/PL UI strings with:

- Device locale detection (`en` / `pl`; default `en` when neither)
- Persisted in-app locale override (settings control)
- One translation catalog for screens, nav chrome, validation messages, and physio-summary chrome
- Landmark/region catalog display names localized; user-authored free text never rewritten

Prefer Expo-aligned localization (`expo-localization` + a small message catalog / `i18n-js` if needed) over a heavyweight framework. Keep persistence in existing sqlite or AsyncStorage only if already in stack — prefer the lightest path that already fits the repo.

## Not doing

- Translating user content
- Languages beyond EN/PL
- UI rebrand
- iOS store listing localization
- Medical advice / diagnosis copy
- New test runner / e2e stack

## Assumptions

- Roadmap §9 is the AC source (pasted); no Linear ticket for this repo.
- One coherent change (not an effort).
- Automated gate remains `npx tsc --noEmit` (and `npm run lint` if it stays green without new infra); do not add jest/Playwright.
- Default when device is neither EN nor PL: English.
- In-app override wins over device until the user picks “System” (or equivalent) again — include a System / English / Polish choice.
- Physio PDF/share chrome uses the active UI locale at generation time.

## Abort-if

- AC cannot be expressed as a runnable Automated criterion this repo already knows (`tsc`) — would block.
- Scope expands into rebrand, new languages, or translating user content.
- Critical plan/impl review finding remains after one triage pass.
