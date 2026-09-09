---
name: Somatic Journal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#893a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#af4c00'
  on-tertiary-container: '#ffe6da'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.02em
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  gutter-mobile: 1rem
  margin-mobile: 1rem
  gutter-tablet: 1.5rem
  margin-tablet: 2rem
---

## Brand & Style

This design system establishes a reflective, personal somatic notebook. It balances the analytical clarity of an anatomical chart with the tactile intimacy of a physical leather-bound field log. The user experience avoids cold clinical detachment and noisy gamification tropes; instead, it provides a quiet, focused environment for tracking physical recovery, aches, chronic symptoms, and daily bodily check-ins.

The visual direction merges **Modern Material 3 Utility** with **Warm Editorial Tactility**:
- **Atmosphere**: Restorative, deliberate, grounded, and trustworthy.
- **Physicality**: Crisp surface planes, disciplined 1px borders, subtle tonal shifts, and mechanical monospace accents that lend precision to pain scales and date stamps.
- **Audience**: Individuals managing physical rehabilitation, chronic pain, athletic recovery, or seeking body awareness through low-friction visual logging.

## Colors

The system uses a grounded foundation of slate neutrals layered over soft, warm porcelain tints, complemented by restorative teal-sage tones and functional diagnostic accents.

### Palette Architecture
- **Primary (`#0F766E`, Deep Pine/Teal)**: The primary anchor for interactive touchpoints, key active states, app bar actions, and resolved recovery states.
- **Secondary (`#0F172A`, Deep Slate)**: Structural chrome, high-contrast headings, primary button states, and deep interactive containers.
- **Tertiary (`#F97316`, Amber Coral)**: Reserved for acute active injuries, flare-ups, pain ratings from 7–10, and high-priority reminders.
- **Neutral (`#64748B`, Slate Grey)**: Secondary typography, structural rules, inactive boundaries, and supporting metadata.

### System Token Extensions
- **Surface Canvas**: `#F8FAFC` (Warm Slate Light)
- **Surface Card/Elevated**: `#FFFFFF` (Pure White)
- **Surface Subtle/Container**: `#F1F5F9` (Muted Slate Fill)
- **Border Default**: `#E2E8F0` (Crisp separation)
- **Border Focus/Active**: `#0D9488` (Teal Luminescence)
- **Status - Open / High Severity**: `#F97316` (Amber Coral) / `#E11D48` (Acute Crimson)
- **Status - Healed / Resting**: `#10B981` (Damp Sage Green)
- **Status - Landmark / Observation**: `#CCFBF1` (Soft Teal Tint) with `#0F766E` icon

## Typography

The typographic hierarchy distinguishes between narrative record-keeping and technical metric data:

- **Manrope**: Delivers solid, warm geometry for primary titles, section headers, and screen names, maintaining an editorial identity.
- **Inter**: Supplies high-legibility, neutral clarity for user notes, medical descriptions, symptom logs, and standard navigation items.
- **JetBrains Mono**: Serves as the quantitative counterpoint. Used strictly for pain indices (e.g., `LVL 06/10`), anatomical coordinates, timestamps (`2024-03-29T14:32`), and recovery duration values.

## Layout & Spacing

This system implements an intentional vertical rhythm centered around an 8pt base grid with a 4pt subgrid for compact UI data chips.

### Grid & Form Factors
- **Mobile (Handheld Log)**: Single-column fluid view. 16px lateral page margins (`margin-mobile`), 12px component stack gap. Body map view dominates the top 50–60% viewport with interactive bottom pull-sheets for region inspections.
- **Tablet / Large Screen**: Split 12-column dual pane. Columns 1–6 lock the 2D/3D anatomical projection canvas; Columns 7–12 present chronologically stacked log cards, symptom charts, and diagnostic timelines with 24px gutters.

### Spatial Disciplines
- Dense clusters (chips, metric indicators, anatomical landmark tags) use `space-xs` (8px) and `space-sm` (12px).
- Card interiors enforce a constant `space-md` (16px) or `space-lg` (20px) inner clearance.
- Content groups maintain an uncrowded `space-xl` (24px) separation to avoid visual anxiety during high-pain entries.

## Elevation & Depth

Visual depth follows a Material 3-inspired tonal layer strategy with subtle, low-opacity, tinted ambient shadows rather than stark drop-shadows.

### Surface Hierarchy
1. **Level 0 (Canvas Base)**: `#F8FAFC`. The foundational backdrop for the entire viewport.
2. **Level 1 (Structural Cards / Panels)**: Pure White (`#FFFFFF`) with a hairline border (`1px solid #E2E8F0`). Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
3. **Level 2 (Active Injury Pins / Filter Sheets)**: Pure White with a 1px border (`#CBD5E1`). Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
4. **Level 3 (Modal Dialogues / Body Region Popovers)**: `#FFFFFF`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.

### Anatomical Pin Lighting
Body markers use micro-elevation: an idle pin uses a 1.5px white halo ring, while a selected pin renders a concentric pulse ring using its status tint (e.g., `#F97316` at 20% opacity, spread 6px).

## Shapes

The interface balances soft organic boundaries with precise mechanical control edges.

- **Primary Cards & Modals**: `12px` to `16px` border radius (`rounded-lg` to `rounded-xl`). Soft enough to feel personal and approachable; structured enough to look credible.
- **Segmented Selectors & Data Badges**: `8px` (`rounded`). Keeps data-dense panels clean and legible.
- **Action Buttons & Chips**: `8px` for buttons, fully rounded (`9999px` / pill) for anatomical status filters and anatomical landmark flags.
- **Target Touch Zones**: Anatomical touch nodes maintain a minimum hit boundary of 44x44px, masking an inner visible circle of 12px to 24px.

## Components

### 1. App Bar (Android Top Bar)
- **Structure**: Surface `#F8FAFC` without heavy drop shadows. Uses a clean 56px height.
- **Content**: Left-aligned headline in `headline-md` (`Manrope`, 20px, `#0F172A`). Right edge hosts action icons (e.g., Anterior/Posterior flip icon, Calendar filter, Settings) styled with 24px icon sizes enclosed in 40x40px touch targets with a pressed ripple of `#0F766E14`.

### 2. Interactive Body Map Viewport
- **Canvas**: Centered anatomical silhouette rendered in `#CBD5E1` outline with `#F1F5F9` vector fill.
- **Hotspot Pins**:
  - *Acute Injury*: `#F97316` center dot, `#FFEDD5` outer perimeter ring.
  - *Chronic / Stable*: `#0D9488` center dot, `#CCFBF1` outer ring.
  - *Healed / Dormant*: `#10B981` center dot, `#D1FAE5` ring.
- **Interactions**: Tapping a node displays a Level 2 floating micro-card with region name (`title-md`), current pain level (`JetBrains Mono` badge), and quick-log prompt.

### 3. Segmented Controls
- **Container**: 44px height, `#F1F5F9` background, 8px radius, 4px inner padding.
- **Segments**: Equal width. Active segment has a `#FFFFFF` fill, 6px radius, Level 1 shadow, and text set in `label-md` (`#0F172A`). Inactive segment displays `#64748B` text.

### 4. Chips & Landmark Filters
- **Filter Chip**: 32px height, 8px corner radius. Inactive: `#F1F5F9` with `#475569` text. Selected: `#CCFBF1` fill, `#0F766E` 1px border, and `#0F766E` text with a checkmark glyph.
- **Severity Badge**: Pill shape (`9999px`), `JetBrains Mono` 11px uppercase text with a 6px status dot.

### 5. Data Cards (Log Entries)
- **Container**: White surface, 12px corner radius, 1px border (`#E2E8F0`). 16px internal padding.
- **Header**: Region name (`title-md`), date string (`data-sm` `#64748B`), and status pill on the right.
- **Body Content**: Freeform notes (`body-md` in `#334155`), optional tags (e.g., `Stabbing`, `Dull Ache`, `Mobility Restricted`), and thumbnail previews of visual range-of-motion photos.

### 6. Buttons
- **Primary**: Deep Teal (`#0F766E`), 48px height, 8px radius. Text: 15px `label-md` `#FFFFFF`. Active state transitions to `#0F5B54`.
- **Secondary**: `#F1F5F9` fill, no border. Text: `#0F172A`.
- **Destructive/Acute**: Outlined `#E11D48` border with tinted hover `#FFF1F2`.

### 7. Form Inputs & Severity Sliders
- **Inputs**: Outlined text fields with 1px border (`#CBD5E1`), 12px radius, resting state label in `#64748B`. Focus transitions border to 2px `#0F766E`.
- **Pain Scale Slider**: 10-step discrete segmented track transitioning visually from `#0D9488` (0–3) to `#F97316` (4–7) to `#E11D48` (8–10), anchored with a numerical readout in `data-lg`.