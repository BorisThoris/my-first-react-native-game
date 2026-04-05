# Screen Spec: Settings

## Purpose
Define the target settings shell shown in `ENDPRODUCTIMAGE2.png`, while separating current live settings behavior from mockup-only future controls.

## Target Surface Summary
The settings experience is a premium two-column shell with:
- centered title bar
- left category navigation rail
- right content pane
- framed controls instead of plain form inputs
- footer actions for reset and back

## Visual Hierarchy
1. `Settings` title bar
2. Selected left-nav category
3. Active pane section title
4. Primary controls in the pane
5. Helper copy and footer actions

---

## Layout Zones

### Zone A: Outer Shell
- Large framed panel
- Premium dark material with gold edging
- Close action in the top-right corner

### Zone B: Category Rail
- Vertical list with icon and label
- One selected item at a time

### Zone C: Active Content Pane
- Section title
- Control groups with label, helper text, and premium input treatment

### Zone D: Footer
- Reset to defaults
- Back

---

## Target Categories
Literal categories visible in the reference:
- Gameplay
- Audio
- Video
- Controls
- Accessibility
- About

### Current-App Mapping by Category

#### Gameplay
Can map to current live settings:
- `boardPresentation`
- `tileFocusAssist`
- `resolveDelayMultiplier`
- `weakerShuffleMode`
- `echoFeedbackEnabled`
- `distractionChannelEnabled`
- `shuffleScoreTaxEnabled`

Future mockup-only controls:
- difficulty
- timer mode
- max lives
- card theme

#### Audio
Current live or model-backed fields:
- `masterVolume`
- optionally `musicVolume`
- optionally `sfxVolume`

#### Video
Current live or model-backed fields:
- `displayMode`
- `uiScale`
- `reduceMotion`

#### Controls
Current gap:
- no meaningful live settings category yet

#### Accessibility
Current live candidates:
- `reduceMotion`
- `tileFocusAssist`

#### About
Current gap:
- no dedicated about content surface in the settings flow

---

## Control Types

### Segmented Control
Use for:
- difficulty
- timer mode

Current-app rule:
- do not assume these controls are functional until the `Settings` model expands.

### Toggle Switch
Use for:
- tutorial hints
- reduce motion or other boolean settings where appropriate

### Slider
Use for:
- audio levels
- any numeric settings with a bounded range

### Select or Segmented Hybrid
Use for:
- display mode
- shuffle strength if the final design chooses segmented treatment

### Thumbnail Tile Row
Use for:
- card theme selection

Current-app rule:
- card theme is future scope until model and asset support exist.

### Heart Selector
Use for:
- max lives

Current-app rule:
- max lives is future scope until model and gameplay rules expand.

---

## Current-App Reconciliation Rules

### Rule 1
The later redesign should adopt the shell and category layout even if some categories remain lightly populated at first.

### Rule 2
Do not silently fake live support for difficulty, timer mode, max lives, or card theme. They must be marked as future model work.

### Rule 3
Where the current live app only exposes a subset of fields, the shell should still reserve the category structure cleanly rather than reverting to a flat form layout.

### Rule 4
If settings are shown in a gameplay modal, preserve the same category logic and styling family.

---

## Current Code Mapping
- `src/renderer/components/SettingsScreen.tsx`
- `src/renderer/components/SettingsScreen.module.css`
- `src/shared/contracts.ts`
- `src/renderer/ui/Panel.tsx`
- `src/renderer/ui/UiButton.tsx`
- `src/renderer/ui/ScreenTitle.tsx`

---

## Acceptance Criteria for Later Implementation
- The settings screen reads as a premium game shell, not a utility form.
- Category navigation is visually distinct and supports a selected state.
- Existing live settings can be reorganized into the new shell without ambiguity.
- Future settings that are visible in the reference are clearly marked as requiring model work.
- The page and modal variants share one coherent visual system.

---

## Out of Scope for This Spec
- Final data schema for future controls
- Exact copy for every future settings tooltip
- Full `About` page content
