# Implementation Sequence

## Purpose
Define a dependency-safe rollout order for the later UI redesign work. This sequence is intended for implementation planning after the docs package is approved.

## Phase 1: Theme Foundation and Asset Intake

### Goals
- establish font loading
- define shared tokens
- land base art folders and asset manifest approach
- set visual-system constraints before screen work starts

### Why First
- Every later screen and primitive depends on the same palette, typography, and asset assumptions.
- Without this phase, per-screen work will duplicate or conflict.

### Main Areas
- `src/renderer/styles/theme.ts`
- `src/renderer/styles/global.css`
- `src/renderer/assets/ui/`

---

## Phase 2: Shared UI Primitives

### Goals
- redesign `UiButton`, `Panel`, title treatments, status cards, icon capsules, and segmented controls
- create the reusable presentation kit for all later screens

### Why Second
- Menu, gameplay, settings, and overlays all need the same primitive vocabulary.

### Main Areas
- `src/renderer/ui/*`
- shared CSS modules or token helpers

---

## Phase 3: Main Menu Redesign

### Goals
- rebuild the hero composition
- introduce the curated CTA stack
- integrate daily/current-run cards
- decide how extra current live modes move to a secondary surface

### Why Third
- The menu is the clearest first impression and best place to validate the new art direction early.

### Main Areas
- `MainMenu.tsx`
- `MainMenuBackground.tsx`
- menu-related CSS modules

---

## Phase 4: Gameplay HUD and Shell

### Goals
- rebuild the top HUD
- rebuild the left rail
- upgrade the board stage and surrounding chrome
- align overlays with the new shell

### Why Fourth
- This is the largest visible redesign surface after the menu.
- It should reuse the primitive system and theme foundation rather than invent its own.

### Main Areas
- `GameScreen.tsx`
- `GameScreen.module.css`
- `OverlayModal.tsx`

---

## Phase 5: Card Visual System and FX

### Goals
- premium hidden and flipped card visuals
- hover, match, mismatch, and score-feedback upgrades
- bring the board states closer to the reference

### Why Fifth
- Card-state and FX work depends on the gameplay shell and design tokens already being stable.

### Main Areas
- `TileBoard.tsx`
- `TileBoard.module.css`
- `tileTextures.ts`
- renderer FX helpers

---

## Phase 6: Settings Shell Redesign

### Goals
- convert settings into category-shell IA
- map current live settings into the new category layout
- document or stage future mockup-only controls cleanly

### Why Sixth
- The settings shell depends on the same primitives as menu and gameplay, but not on card FX.

### Main Areas
- `SettingsScreen.tsx`
- `SettingsScreen.module.css`

---

## Phase 7: Mode Selection and Navigation Gaps

### Goals
- decide whether `Choose Your Path` becomes a real live route
- decide how extra current modes are exposed
- document any future route additions

### Why Seventh
- This phase touches routing and possibly product scope, so it should wait until the visual language is already clear.

### Main Areas
- `App.tsx`
- `useAppStore.ts`
- future route/view additions if approved

---

## Phase 8: Game Over and Remaining Polish

### Goals
- align game-over and summary screens with the final language
- demote debug-heavy information visually without deleting functionality

### Main Areas
- `GameOverScreen.tsx`
- `GameOverScreen.module.css`

---

## Phase 9: Visual Regression Refresh

### Goals
- update Playwright coverage and baselines
- verify the redesigned screens across the existing scenario set

### Existing Scenarios to Revisit
From `e2e/visualScenarioSteps.ts`:
- `01-main-menu`
- `03-settings-page`
- `04-game-playing`
- `05-pause-modal`
- `06-run-settings-modal`
- `07-floor-cleared-modal`
- `08-game-over`

### Possible New Scenario
- `Choose Your Path` if it becomes a real live screen

---

## Dependency Rules
- Do not redesign individual screens before the shared primitive and theme layer is stable.
- Do not implement a literal `Choose Your Path` route until its product mapping is approved.
- Do not let future-scope collection/codex/inventory mockups silently become fake live features.
- Do not treat asset work as optional if close reference fidelity is still the goal.

---

## Exit Criteria for the Real Implementation Effort
- Shared primitives are reused across menu, gameplay, settings, and overlays.
- The menu and gameplay shells visually align with the reference direction.
- Card states are clearly differentiated.
- Current live routes remain functional.
- Visual regression coverage is refreshed for all affected live screens.
