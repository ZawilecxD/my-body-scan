# My Body Scan — UI design handoff

**Audience:** UI/UX designer or AI design agent (Figma, design-to-code tools, etc.)  
**Product:** My Body Scan (Android, Expo)  
**Intent of this file:** Explain *what the product is*, *what users can do*, and *what each screen must support* so you can redesign the UI for clarity and practical daily use — without inventing new product features.

**Design brief (current initiative):** Visual and UX rebrand only. Keep the same features and information. Improve layout, typography, spacing, navigation chrome, and overall cohesion so the app is readable and usable every day.

---

## 1. What this product is

**My Body Scan** is a personal **body map + injury log**. Despite the name, it is **not** a camera scan and **not** a medical device.

It solves a simple gap:

| Need | Why notes / clinical apps fail |
|---|---|
| **Where** on the body | Notes have no body map |
| **Whether it is still current** | Clinical apps are heavy and account-based |
| **What the user is doing about it** | User-authored tactics (text + links), not diagnosis |

**Primary user:** One person on one Android phone (the builder / first production user). Later: sportspeople and anyone working with a physio — but do not design multi-user clinic workflows.

**Tone & personality:** Practical, calm, personal logbook — not clinical, not gamified, not “AI health coach.” The app stores what the user typed; it never interprets pain or recommends treatment.

**Platform:** Android phone, **portrait**. Light and dark follow the system. No tablet-specific layouts required. iOS is out of scope for this design pass (may inherit the system later).

**Data:** Fully on-device. No login, no cloud, no accounts.

---

## 2. Core ideas (domain, in plain language)

- **Region** — Head, torso, arms, or legs (navigation only).
- **Side** — Front or back of the body.
- **Landmark** — Coarse tap target (e.g. forearm, elbow, lower back). Schematic, not medical anatomy. Left/right is **not** a separate tap target; the user can mention “left” in the description.
- **Injury** — A problem pinned to one landmark. Always has a **description**. Status is either **open** (current) or **archived** (healed / not current).
- **Comment** — Timestamped note on an injury (chronological thread).
- **Solution** — User-authored text + optional http(s) link (often a YouTube exercise). No built-in exercise catalog.
- **Severity reading** — Optional 0–10 number over time; shown as a simple trend when there are enough points.
- **Physio summary** — One-way shareable briefing (text or PDF) the user configures and sends; not a shared portal.

---

## 3. What users can do (feature list)

1. **See open injuries** on a home screen via **body graphic** or **grouped list** (both first-class).
2. **Toggle front / back** on the body graphic; see **count badges** on regions that have open injuries.
3. **Drill into a body region** from the map to browse landmarks and open or create injuries.
4. **Log an injury** by picking a landmark from a region-grouped catalog (list path).
5. **Create an injury** with a required description on a chosen landmark.
6. **Open an injury thread**: description, solutions, severity, comments, and a history of status/solution events.
7. **Add / remove solutions** (text + optional URL); open URLs in the system browser.
8. **Record severity** (0–10) and view a simple trend chart when ≥2 readings exist.
9. **Archive** an open injury when healed (it leaves open views); **reopen** from archive on flare-up.
10. **Browse the archive** of healed injuries.
11. **Export / restore** all data as JSON (share sheet / file picker) — local backup, not cloud.
12. **Build a physio summary**: choose time window, open vs open+archived, which sections to include; preview; share as text or PDF.

---

## 4. Primary user journeys (design for these)

### Journey A — Log from the body map

Home (graphic) → front/back if needed → tap a region (head / torso / arms / legs) → region landmark list → create injury (description) → land on injury detail → return home; region badge updates.

### Journey B — Follow current status

Home (graphic **or** list) → open an injury → read solutions / comments / severity → add an update → stay oriented about “what’s wrong now and what I’m doing about it.”

### Journey C — Archive when healed

Injury detail → Archive → injury disappears from home/map → Archive screen → open history → Reopen if it flares again.

### Journey D — Prepare for physio

Home → Summary → set filters/sections → Generate → Share text or PDF.

### Journey E — Don’t lose data

Home → Backup → Export (or Restore with a clear “replace everything” confirmation).

---

## 5. Screens, one by one

Navigation today is a **single stack** (no tab bar). Home is the hub; other screens are pushed with a standard back affordance. Header actions on home are currently text links — redesign may use icons/toolbar as long as the same destinations remain discoverable.

### 5.1 Home — Open injuries

| | |
|---|---|
| **Job** | Answer: what is currently wrong, and how am I dealing with it? |
| **Title (today)** | Open injuries |
| **Must show** | All **open** injuries only |
| **Key controls** | Switch **Graphic \| List**; in graphic mode **Front \| Back**; body silhouette with tappable regions and open-injury **count badges** |
| **Header / global actions** | Summary · Backup · Archive · Log injury |
| **List mode** | Grouped by region; each row: landmark, description preview, latest solution snippet, way to open a solution link |
| **Empty** | Clear empty state + path to log first injury |
| **Goes to** | Region map (graphic tap) · Injury detail (list row) · Landmark catalog (Log injury) · Archive / Backup / Summary |

**Design note:** Graphic and list are **equals**. Do not hide the list as a secondary/settings option.

---

### 5.2 Log injury — Landmark catalog

| | |
|---|---|
| **Job** | Pick **where** on the body without using the graphic |
| **Title (today)** | Log injury |
| **Must show** | Landmarks grouped by region (Head, Torso, Arms, Legs); each row includes landmark name and side (front/back) |
| **Goes to** | Create injury form for the chosen landmark |

---

### 5.3 Map region — Landmarks for one area

| | |
|---|---|
| **Job** | After tapping a body region, choose a landmark or open an existing injury there |
| **Title (today)** | Dynamic, e.g. “Left arm · front”, “Torso · back” |
| **Must show** | Front \| Back toggle; list of landmarks for that region × side; open injuries under each landmark; **+** (or equivalent) to log a new injury on that landmark |
| **Important reality** | Product intent includes a “close-up”; the **current app uses a landmark list**, not a second zoomed illustration. You may propose a closer graphic **or** a clearer list — both are valid if landmark picking stays easy |
| **Goes to** | Create injury · Injury detail · Back to home |

---

### 5.4 Create injury

| | |
|---|---|
| **Job** | Capture a new open injury on a known landmark |
| **Title (today)** | Log injury |
| **Must show** | Landmark context (read-only); **required** multiline description; primary Save (disabled until description is non-empty) |
| **Must not require** | Solutions at create time (optional later on the detail screen) |
| **Goes to** | Injury detail after save |

---

### 5.5 Injury detail — Thread

| | |
|---|---|
| **Job** | Full history and updates for one injury |
| **Title (today)** | Landmark name (e.g. Forearm) |
| **Must show** | Description; created / archived timestamps; **Archive** (if open) or **Reopen** (if archived) |
| **Solutions block** | Cards with text, optional tappable URL, timestamp; on open injuries: remove + add form (text + optional URL) |
| **Severity block** | List of readings; simple trend when ≥2 points; on open injuries: add 0–10 reading |
| **Comments block** | Chronological thread; on open injuries: add comment |
| **History block** | Audit-style events (created, archived, reopened, solution added/removed) |
| **Archived behavior** | Content remains readable; adding comments/solutions/severity is off; Reopen is available |

This is the densest screen — prioritize scanability and clear section hierarchy.

---

### 5.6 Archive

| | |
|---|---|
| **Job** | Find healed injuries without cluttering “current” |
| **Title (today)** | Archive |
| **Must show** | List of archived injuries (landmark, description preview, archived date); empty state |
| **Goes to** | Injury detail (read + reopen) |

---

### 5.7 Backup

| | |
|---|---|
| **Job** | Protect against uninstall / phone swap |
| **Title (today)** | Backup |
| **Must show** | Short explainer that data is local; **Export**; **Restore**; success/error feedback |
| **Critical UX** | Restore must confirm that it **replaces all local data** |

---

### 5.8 Physio summary

| | |
|---|---|
| **Job** | Produce a one-way briefing for a physio visit |
| **Title (today)** | Summary |
| **Must show** | Intro; **time window** (Last 1 / 3 / 6 / 12 months, All time); **status scope** (Open only \| Open and archived); **section toggles** (Description, Latest severity, Solutions, Comments); Generate; Share text / Share PDF; preview of generated content |
| **Language today** | English UI and English summary text |
| **Must not become** | A multi-user physio account or live sync |

---

### 5.9 Landmark injuries (exists in code; currently unused in main flows)

| | |
|---|---|
| **Route exists** | List of open injuries on one landmark + “Log another” |
| **Guidance** | Do not prioritize unless you unify map/list flows; optional consolidation with region map or injury detail |

---

## 6. Shared visuals designers must account for

| Element | Role |
|---|---|
| **Body overview silhouette** | Front and back PNGs with tappable regions and count badges — the product’s visual signature |
| **Region badges** | Show how many **open** injuries are in that zone |
| **List/card rows** | Repeated pattern for injuries across home, archive, region map |
| **Segment controls** | Graphic/List, Front/Back, summary chips |
| **Forms** | Multiline description, single-line URL/severity, primary actions |
| **Empty & error states** | Home, archive, load failures, invalid links |

**Content constraints for visuals:** Schematic art is enough. Do not design medical-grade anatomy, 3D bodies, or muscle-fiber pickers.

---

## 7. Landmark catalog (content for map / lists)

Same idea on left/right limbs — **one target per pair** (not separate left/right hits).

**Head / front:** skull, jaw, neck  
**Head / back:** skull, neck  

**Torso / front:** collarbone, chest, ribs, abdomen  
**Torso / back:** upper back, lower back  

**Arms / front:** shoulder, upper arm, elbow, forearm, wrist, hand  
**Arms / back:** shoulder, upper arm, elbow, forearm, wrist, hand  

**Legs / front:** hip, thigh, knee, shin, ankle, foot  
**Legs / back:** hip, thigh, knee, calf, ankle, foot  

*(Exact names follow the product catalog; keep labels short and human.)*

---

## 8. Out of scope — do not invent

Do **not** add screens or flows for:

- Camera / photo / real body scanning  
- 3D or clinical anatomy  
- Separate left/right tap targets on the graphic  
- Built-in exercise library or embedded video player  
- Accounts, cloud sync, multi-user physio collaboration  
- Diagnosis, AI advice, treatment recommendations, medical-device chrome  
- Illness / disease log (separate future product idea)  
- Localization (EN/PL) for this pass — assume English  
- iOS-specific UI polish as a requirement (Android-first)  
- Web app  

Also do not expand the landmark catalog or invent new injury statuses beyond **open** and **archived**.

---

## 9. Design success criteria

A good redesign lets someone:

1. Find and update an open injury in a few taps without hunting.  
2. Understand open vs archived at a glance.  
3. Use **either** the map **or** the list comfortably.  
4. Read a dense injury thread without visual noise.  
5. Export a physio summary and a backup without fear of data loss.  
6. Feel the app is a **personal log**, not a clinic product or wellness game.

---

## 10. Navigation map (reference)

```text
Home (Open injuries)
├── Graphic → Region landmarks → New injury → Injury detail
├── List row → Injury detail
├── Log injury → Landmark catalog → New injury → Injury detail
├── Archive → Injury detail (reopen)
├── Backup (export / restore)
└── Summary (generate / share)
```

---

## 11. Handoff checklist for Figma / AI design tools

Please deliver (minimum):

- [ ] Design system: color (light/dark), type scale, spacing, radii, elevation, primary/secondary/destructive actions  
- [ ] Components: app bar / header actions, segment control, list row, empty state, text field, primary button, section header, badge, chips  
- [ ] Screens: Home (graphic + list), Region landmarks, Landmark catalog, Create injury, Injury detail (open + archived variants), Archive, Backup, Summary  
- [ ] Key states: empty home, empty archive, injury with/without solutions, severity chart present/absent  
- [ ] Specs exportable as tokens (colors, type, spacing) for implementation — not moodboards only  

**Implementation stack (for implementers, not a design constraint):** Expo / React Native on Android; body map uses static illustrations + overlays; styling is currently a thin custom theme — the rebrand may deepen tokens/components without changing product rules above.
