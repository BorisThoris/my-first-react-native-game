# Current vs Target Gap Analysis

## Purpose
This document maps the reference images against the current live renderer and classifies each area as:
- `Restylable existing surface`
- `Structurally mismatched existing surface`
- `Missing screen`
- `Missing model support`
- `Asset-only dependency`

## Current Live App Boundaries

### Active Views Today
From `src/shared/contracts.ts`, current live view coverage is:
- `boot`
- `menu`
- `settings`
- `playing`
- `gameOver`

### Key Current Screens and Systems
- `MainMenu`
- `GameScreen`
- `SettingsScreen`
- `GameOverScreen`
- `OverlayModal`
- `TileBoard`
- shared primitives under `src/renderer/ui/`

### Current Visual Test Coverage
From `e2e/visualScenarioSteps.ts`, the current visual workflow already captures:
- startup intro
- main menu
- main menu with how-to
- settings page
- gameplay
- pause modal
- run settings modal
- floor cleared modal
- game over

That coverage should anchor later redesign regression work.

---

## Main Menu Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Illustrated hero background | `MainMenuBackground` exists but is abstract and procedural | Structurally mismatched existing surface | Needs scene art direction, not just particle grid polish |
| Large logo lockup with emblem | Current title is text-only | Asset-only dependency | Needs logo/emblem treatment |
| Vertical CTA stack | Current menu uses horizontal hero actions plus multi-row mode buttons | Structurally mismatched existing surface | IA and layout both need change |
| Curated primary menu | Current menu exposes many run types directly | Structurally mismatched existing surface | Extra modes need secondary treatment |
| Collection destination | No live route | Missing screen | Must remain future scope unless new routing is added |
| Daily challenge card | Daily exists as an action, not as a premium promo card | Restylable existing surface | Can map to current daily mode with new shell |
| Current run card | Last-run and best-score info exists | Restylable existing surface | Needs different composition and wording |
| Player profile/meta strip | No live profile/currency layer | Missing model support | Future product layer |
| Social/community strip | No live equivalent | Missing screen or external-link feature | Not required for initial live parity |

### Main Menu Summary
- The current main menu is live and functional, but its structure does not match the reference.
- This is not a simple theme pass. It is a menu IA and composition rebuild.
- Collection and meta-resource areas should be documented as future scope unless routes and product data are added.

---

## Gameplay Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Illustrated dungeon stage | Gameplay background exists but is abstract | Structurally mismatched existing surface | Needs stronger illustrated environment |
| Ornate segmented top HUD | Current HUD is live but flatter and more utilitarian | Restylable existing surface | Data mostly exists already |
| Score-centered hierarchy | Current score is present but not visually dominant enough | Restylable existing surface | Design issue, not model issue |
| Left icon rail | Current toolbar exists | Restylable existing surface | Must become more art-directed |
| Sidebar flyout with labels | No live expanded rail pattern | Structurally mismatched existing surface | Needs new interaction shell |
| Collection/inventory/codex entries | No live routes | Missing screen | Future-only unless routing expands |
| Premium card back/front treatment | Tile system exists | Structurally mismatched existing surface | Needs new assets and state language |
| Hover, flip, matched, mismatch FX | Partial support exists | Restylable existing surface | Must be upgraded significantly |
| Score popup and celebratory burst | Partial feedback exists | Structurally mismatched existing surface | Requires stronger FX layer |

### Gameplay Summary
- Most gameplay data and basic interaction scaffolding already exist.
- The gap is primarily presentational plus some UI structure.
- Card-state visuals and feedback are the highest-impact mismatch.

---

## Settings Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Framed settings shell | `SettingsScreen` exists | Restylable existing surface | Overall shell can be rebuilt |
| Left category rail | Not present | Structurally mismatched existing surface | Requires new layout and nav model |
| Gameplay section pane | Current settings are split into simple sections | Structurally mismatched existing surface | Needs shell conversion |
| Difficulty selector | Not in current `Settings` model | Missing model support | Future schema decision |
| Timer mode selector | Not in current `Settings` model | Missing model support | Future schema decision |
| Max-lives selector | Not in current `Settings` model | Missing model support | Future schema decision |
| Card theme selector | Not in current `Settings` model | Missing model support | Future schema decision |
| Tutorial hints toggle | Current onboarding/hint behavior exists partially | Structurally mismatched existing surface | Needs explicit mapping decision |
| Audio, Video, Controls, Accessibility, About tabs | Only some underlying settings exist | Structurally mismatched existing surface | Category structure can still be spec'd |

### Current Live Settings Model Notes
Current `Settings` model supports:
- `masterVolume`
- `musicVolume`
- `sfxVolume`
- `displayMode`
- `uiScale`
- `reduceMotion`
- `boardPresentation`
- `tileFocusAssist`
- `resolveDelayMultiplier`
- `weakerShuffleMode`
- `echoFeedbackEnabled`
- `distractionChannelEnabled`
- `shuffleScoreTaxEnabled`

### Settings Summary
- The settings reference is broader than the current live product.
- The shell and IA are redesign work.
- Several visible controls require future contract expansion and must be documented as such.

---

## Mode Selection Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Dedicated `Choose Your Path` screen | No live view | Missing screen | Requires new route/view |
| Classic Run card | Can map to current `startRun` | Missing screen | Behavior exists, surface does not |
| Daily Challenge card | Can map to current `startDailyRun` | Missing screen | Behavior exists, surface does not |
| Endless Mode card | No distinct live mode with separate identity from arcade | Missing screen and possible model gap | Needs product decision |
| Featured mode-card state | No current equivalent | Missing screen | Requires new component system |
| Timer badge on daily card | Daily date exists, countdown presentation does not | Structurally mismatched existing surface | Likely UI-only if countdown is acceptable |

### Extra Live Modes Not Present in the Reference
Current app exposes additional live modes:
- `gauntlet`
- `puzzle`
- `meditation`
- `wild`
- `practice`
- `scholar`
- run import

These need a redesign IA decision. Recommended direction:
- Keep the reference's clean hero flow.
- Move extra live modes into a secondary surface instead of cluttering the main entry flow.

---

## Game Over and Overlays Mapping

| Reference Element | Current App Status | Classification | Notes |
|---|---|---|---|
| Premium summary shell | `GameOverScreen` exists | Restylable existing surface | Good candidate for shared panels/cards |
| Premium overlay language | `OverlayModal` exists | Restylable existing surface | Needs frame system alignment |
| Dense debug/export block demotion | Current game-over screen exposes export/debug details prominently | Structurally mismatched existing surface | Reprioritize presentation, keep functionality |

---

## Shared Primitive Mapping

| Current Primitive | Reference Need | Classification |
|---|---|---|
| `UiButton` | Premium beveled CTA and menu button family | Structurally mismatched existing surface |
| `Panel` | Ornamental premium panel family | Restylable existing surface |
| `ScreenTitle` | Display and section title hierarchy | Restylable existing surface |
| `StatTile` | Premium status card family | Structurally mismatched existing surface |

---

## Asset Gaps

### Required for Close Fidelity
- Illustrated menu scene
- Illustrated gameplay scene
- Logo lockup or logo-support emblem
- Icon family
- Card back art
- Card face frame or face overlays
- Optional mode-card art
- Display font files

### Conclusion
The redesign cannot be treated as CSS-only work. Asset onboarding is a hard dependency.

---

## Contract and Routing Gaps to Record

### Future Routing Gaps
- `Choose Your Path` surface
- `Collection`
- `Inventory`
- `Codex`

### Future Model Gaps
- Distinct settings for difficulty, timer mode, max lives, and card theme
- Optional meta/profile data for top menu strip
- Optional currencies if the menu should mirror the reference literally

### Current Package Rule
These gaps should be explicitly documented. They should not be silently treated as already supported.

---

## Final Gap Summary
- Main menu: live, but structurally mismatched
- Gameplay shell: live, mostly restylable but card system needs major upgrade
- Settings: live, but structurally mismatched and partially model-limited
- Game over/modals: live, restylable with some prioritization cleanup
- Mode selection: missing screen
- Collection/inventory/codex: missing screens
- Asset pipeline: hard dependency
