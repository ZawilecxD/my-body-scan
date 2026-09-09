---
topic: expo-rn-ui-libraries-and-design-tooling
kind: codebase
source: repo + https://docs.expo.dev/versions/v57.0.0/sdk/ui/ + https://expo.dev/blog/expo-ui-stable-sdk-56 + https://www.nativewind.dev/docs/getting-started/installation + https://tamagui.dev/docs/intro/installation + https://callstack.github.io/react-native-paper/ + https://unistyl.es/v3/guides/expo-router/ + https://www.figma.com/developers/ + community Figma MCP writeups (2026-09-08 fetch)
gathered: 2026-09-08
git_commit: 4a0f4c49abc5a3721155f68481c146dc8054c449
---

# Expo / RN UI libraries and design tooling

What fits a **visual-only** rebrand of My Body Scan (Android-first Expo SDK 57) so the app is readable and practical day to day — without new product slices or schema work.

## Prior decisions in context/

**No prior library or design-tool choice.** Under `context/changes/`, `context/archive/`, and `context/foundation/research/` there is no evaluation of `@expo/ui`, Tamagui, Paper, NativeWind, Figma, or design MCPs.

What *does* exist:

- Roadmap §10 states the outcome and explicitly calls for this research before implement: `@expo/ui` vs Tamagui / Paper / NativeWind / others, plus design tools/MCPs/AI platforms that produce **implementable** screens ([`context/foundation/roadmap.md`](../../../foundation/roadmap.md)).
- Archived MVP plans repeatedly say **reuse** template theming (`ThemedText` / `ThemedView` / `constants/theme`) — e.g. `context/archive/2026-08-17-log-injury-from-list/plan.md`: “Reuse ThemedText / ThemedView / theme colors.”
- Frames use “Shared UI-kit / cross-app contract change — none” as a **scope guard**, not a design-system decision.
- `context/standards/frontend/` has only navigation double-tap rules — **no visual standards** yet.

## Current UI stack (as-built)

| Layer | Reality | Anchors |
|---|---|---|
| Component library | **None in use.** `@expo/ui` is in `package.json` (`~57.0.11`) but has **zero** app imports | `package.json:6`; no `@expo/ui` under `src/` |
| Styling | React Native `StyleSheet` everywhere | e.g. `src/app/index.tsx`, `src/app/injuries/[id].tsx` |
| Tokens | Thin light/dark palette (5 colors), `Spacing` scale, platform `Fonts` map; web CSS vars in `src/global.css` | `src/constants/theme.ts:10–62`; comment there already names NativeWind / Tamagui / Unistyles |
| Primitives | `ThemedText`, `ThemedView` + `useTheme()` | `src/components/themed-*.tsx`, `src/hooks/use-theme.ts` |
| Navigation chrome | Default Expo Router `Stack` + RN `ThemeProvider` (Default/Dark) — not a custom design system | `src/app/_layout.tsx:27–35` |
| Accent debt | Hardcoded `#3c87f7` in link/map accents (not a token) | `src/components/themed-text.tsx:66`; body-map plans cite same |
| Map / chart | `expo-image` + `react-native-svg` (product visuals, keep regardless of UI kit) | `src/components/body-overview-map.tsx` |

**Screens with most rebrand surface:** home (`index`), body map component, injury detail, region map; then summary / landmarks / archive / create / backup; shell (`_layout`, splash/icons in `app.json`).

**Implication:** the rebrand starts from Expo template chrome + ad-hoc styles, not from an existing third-party design system. Any library adoption is greenfield relative to app code (deps may already be present).

## What each library is for

Expo’s own guidance (SDK 56+ stable `@expo/ui`, still the model on v57 docs) is the key distinction:

> Custom / branded UI → React Native `View` / `Text` (+ a styling library if wanted).  
> OS-native controls (settings, pickers, sheets) → `@expo/ui`.  
> These compose in one tree.

Sources: [Expo UI overview (v57)](https://docs.expo.dev/versions/v57.0.0/sdk/ui/), [Expo blog: Expo UI stable](https://expo.dev/blog/expo-ui-stable-sdk-56), [Universal components](https://docs.expo.dev/versions/v57.0.0/sdk/ui/universal/).

| Option | Category | Ships components? | Fit for *this* rebrand | Cost / risk |
|---|---|---|---|---|
| **Deepen current StyleSheet + tokens + shared primitives** | In-house | You build Button/Input/Card/ListRow | Highest control; matches “visual only”; smallest dependency risk; continues archived pattern | You own all chrome; slower first pass unless designs are concrete |
| **`@expo/ui` (universal / jetpack-compose)** | Native platform primitives | Yes — Material3 / SwiftUI-backed | Strong for **native** controls & Android Material chrome; **weak as the sole brand system** (Expo: not a design system). Universal `Host` + `Button`/`List`/`FieldGroup` could speed list/settings UIs but branded body-map shell still needs RN | Already installed; learning Host/layout model; web experimental; look becomes “OS settings”, not a product brand |
| **NativeWind** | Utility styling (Tailwind) | No (ecosystem / NativewindUI optional) | Good if iteration speed + utility classes matter; pairs with RN custom UI and Expo’s “use RN for brand” advice | Babel/Tailwind config; className discipline; no ready injury-thread patterns |
| **Tamagui** | Tokens + compiler + optional UI kit | Yes (`tamagui` kit) | Strong if you want a full tokenized design system and cross-platform compiler story | Highest setup/coupling; migration away is hard; overkill for solo dogfood unless tokens are a deliberate bet |
| **React Native Paper** | Material Design 3 kit | Yes (mature) | Fast Android-looking screens (lists, FABs, text fields, dialogs); theming via `PaperProvider` | Visual identity leans Material/Google unless heavily customized; another theme provider beside Expo Router |
| **Unistyles 3** | Enhanced StyleSheet + themes | No | Closest API to current `StyleSheet.create`; theme/breakpoint without rewriting to className; mentioned in `theme.ts` comment | Needs Nitro / New Arch discipline; Expo Router entry wiring (`index.ts` before router); **no Expo Go** path if native modules force prebuild — check against how this app is run today |

### Practical recommendation (research, not a frame decision)

For roadmap wording — *readable, practical, cohesive on Android*, polish before iOS, visual/UX only:

1. **Do not** treat `@expo/ui` as the entire rebrand. Use it later, selectively, where OS-native affordances help (sheets, switches, pickers) once the brand shell exists in RN.
2. **Default low-risk path:** expand `src/constants/theme.ts` (promote accent, type scale, radii, elevation) + extract shared primitives (`Button`, `ListRow`, `SectionHeader`, `TextField`) on `StyleSheet` / `Themed*`. Matches prior MVP practice and keeps i18n/iOS later cheap.
3. **If DX on styling is the bottleneck:** NativeWind **or** Unistyles as a styling layer — pick one; don’t stack both with Tamagui.
4. **Paper** only if “looks like Material Android quickly” beats unique product brand — useful for a spike, risky as the long-term brand.
5. **Tamagui** only if you explicitly want a compiler-backed design system and accept setup cost.

A short **spike** (one home list + one form row in 2 candidates) will beat more paper comparison: e.g. (A) tokenized StyleSheet primitives vs (B) NativeWind **or** Paper on the same screen.

## Design tools, MCPs, and AI platforms

Goal from roadmap: tooling that yields **implementable** screens (tokens, layout, type), not moodboards alone.

| Tooling | What it gives | Implementable? | Notes for this repo |
|---|---|---|---|
| **Figma + Dev Mode / official Figma MCP** | Structured variables, spacing, typography, node tree for agents | **Yes** — best path: export tokens → `theme.ts`, agent implements StyleSheet screens against frames | Requires a Figma file + token; not configured in this workspace today |
| **Community Figma MCPs** (e.g. Figma Context, “Cursor Talks to Figma”, [`figma-rn`](https://github.com/itsklimov/figma-rn)) | Read/modify designs; some emit RN scaffolding | Mixed — useful for handoff; generated code still needs Expo Router / domain wiring | Extra MCP install + `FIGMA_TOKEN`; treat output as draft |
| **Full-screen AI converters** (Builder, Codia, RapidNative-class) | Fast layout scaffolding from frames or prompts | Scaffold only — expect refactor for FlatList, navigation, a11y, theme tokens | Fine for spike wireframes; not source of truth |
| **Cursor `GenerateImage` / generic image models** | Mood / reference imagery | **No** for production UI | Use for direction only |
| **Context7 MCP** (already available) | Current library docs for Expo / candidates | Docs only | Use during implement/plan for API truth |
| **Design-in-code** (no Figma) | Tokens + 1–2 reference screens authored in-repo | **Yes** | Fits solo workflow if no designer; pair with screenshots in PRs |

**Reliable workflow (industry consensus in 2026 writeups):** Figma (or a written token sheet) as **reference** → typed theme object → agent/IDE generates Expo screens using that theme → human pass for lists, touch targets, and product logic. One-click “Figma → production RN” is not trustworthy for this app’s map + injury thread density.

## Open questions (for `/11x-frame` or plan)

1. **Brand vs Material:** Prefer a distinct product look, or “feels like stock Android Material” for daily familiarity?
2. **Library bet:** Stay on StyleSheet + primitives, or adopt NativeWind / Unistyles / Paper for the change?
3. **Design source:** Existing/new Figma file + MCP, or design-in-code with a short token doc under this change?
4. **`@expo/ui` scope:** Shell-only later, or early adoption for list/form controls on Android?
5. **Expo Go vs dev client:** If Unistyles (or other native modules) is chosen, does the current run path allow prebuild/dev client?

## Suggested next command

`/11x-frame ui-rebrand` — lock brand vs Material, styling approach, and design handoff before `/11x-plan ui-rebrand`.
