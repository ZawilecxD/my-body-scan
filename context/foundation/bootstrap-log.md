---
created: 2026-08-17
starter: create-expo-app@4.0.0
template: default@sdk-57
---

# Bootstrap log

## Command run

Repo root was not empty (`context/`, `.git/`, `.cursor/`), and `create-expo-app` refuses a non-empty directory. Scaffolded in a temp dir, then merged.

```bash
npx create-expo-app@latest ./_scaffold --template default@sdk-57 --yes
rsync -a --exclude '.git' _scaffold/ ./
rm -rf _scaffold
npx expo install expo-sqlite react-native-svg
```

`context/` and `.git/` were not overwritten or deleted.

## Versions installed

| Package | Version |
|---|---|
| expo | ~57.0.14 |
| expo-router | ~57.0.14 |
| react | 19.2.3 |
| react-native | 0.86.2 |
| typescript | ~6.0.3 |
| expo-sqlite | ~57.0.1 |
| react-native-svg | 15.15.4 |

App identity after merge (temp folder had named the app `_scaffold`):

- `package.json` name: `my-body-scan`
- `app.json` name / slug: `My Body Scan` / `my-body-scan`
- scheme: `mybodyscan`
- `expo-sqlite` config plugin added by `expo install`

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` (before Metro types) | Fail: CSS module / `global.css` types missing (`expo-env.d.ts` not generated yet) |
| `npx expo start --non-interactive` | Metro listened on `:8081`; `GET /status` → 200 |
| `npx tsc --noEmit` (after types) | Pass, 0 errors |
| `context/` intact | Pass — foundation notes, standards, changes/archive/efforts unchanged |

Metro was stopped after the smoke check. `npm run android` was not run (no emulator required for this log).

`npm audit` on the template reported 22 vulnerabilities (8 moderate, 14 high). Not addressed.

## Manual resolution

1. First `npx` in the sandbox failed with `ENOTFOUND registry.npmjs.org`. Retried outside the sandbox.
2. Scaffolded into `./_scaffold` because `.` is not empty; merged with rsync; removed `_scaffold`.
3. CLI asked whether to skip `git init` (already a repo). New git repo was not created. No destructive git commands.
4. Renamed app from `_scaffold` / `scaffold` to `my-body-scan`.
5. `tsc` needs Expo-generated `expo-env.d.ts` / `.expo/types` (created on first `expo start`). Those files are gitignored; CI or a fresh clone must run Expo once (or equivalent) before `tsc`.
