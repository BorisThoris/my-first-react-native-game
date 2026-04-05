# Screen Spec: Gameplay

## Purpose
Define the target gameplay shell implied by `ENDPRODUCTIMAGE.png`, including the board environment, top HUD, left sidebar, card presentation, and overlay alignment.

## Target Surface Summary
The gameplay screen is a cinematic dungeon board stage with:
- illustrated environment backdrop
- fixed segmented top HUD
- fixed left icon rail
- premium 3x4 board presentation at the reference level sample
- strong card-state and interaction feedback
- overlays that still fit the same ornamented system

## Visual Hierarchy
1. Score segment
2. Board
3. Card-state and feedback effects
4. Sidebar and remaining HUD
5. Environment and ambient light

---

## Layout Zones

### Zone A: Environment
- Stone arena or floor ring under the board
- Dungeon walls, alcoves, candles, torches
- Deep vignette at edges
- Centralized light bias toward the board

### Zone B: Top HUD
- Single horizontal strip with separated segments
- Score centered and larger than surrounding segments
- Mutator or run-condition segment visually distinct

### Zone C: Left Rail
- Icon-only rail by default
- Supports expanded labeled flyout behavior

### Zone D: Board Stage
- Board sits in the middle of the environment
- Strong empty space around cards
- Cards are large, premium, and clearly stateful

### Zone E: Secondary Feedback Layers
- Achievement toasts
- Rule hints
- Match/no-match feedback
- Pause and floor-cleared modals

---

## HUD Spec

### Segment Order
Recommended order based on the reference:
1. Floor
2. Lives
3. Shards
4. Score
5. Daily seed/date
6. Mutator or run modifier

### Segment Rules
- Each segment has its own frame and width logic.
- Labels are small uppercase.
- Values are either numeric or icon-led.
- Score is the largest numeric element in the strip.
- Daily and mutator segments should read as context, not equal peers to score.

### Current Data Mapping
Current live gameplay already exposes most needed data:
- `run.board.level`
- `run.lives`
- `run.stats.comboShards`
- `run.stats.totalScore`
- `run.dailyDateKeyUtc`
- `run.activeMutators`

---

## Left Rail Spec

### Default Collapsed State
- Vertical stack of medallion buttons
- Minimal labels in the default state
- Strong active and hover feedback

### Expanded State
- Text flyout listing icon, title, and subtitle
- Supports at least:
  - Pause
  - Settings
  - Collection
  - Inventory
  - Codex

### Current-App Reconciliation
- `Pause` and `Settings` already exist live.
- `Collection`, `Inventory`, and `Codex` do not.
- The expanded design should be documented, but later implementation must treat those destinations as future scope until routes exist.

---

## Board Stage Spec

### Placement
- Board is centered in the playable frame.
- The environment should visually point toward it through lighting and composition.
- The board should not feel glued to the HUD or rail.

### Board Density
- The reference sample uses a 3x4 grid with generous spacing.
- The live game supports different board sizes; the styling system must scale without losing premium framing.

### Card Presentation
- Hidden state uses a premium ornamental back.
- Flipped state uses a framed face with actual content treatment.
- Matched state uses green success coding.
- Hover uses gold emphasis.

### Current Code Areas
- `TileBoard.tsx`
- `TileBoard.module.css`
- `tileTextures.ts`
- `TileBoardScene.tsx`

---

## Card-State Summary

### Hidden
- Bronze/gold ornamental back
- Dark surface material
- Moderate rim highlight

### Hover / Focus
- Gold bloom
- Slight tilt or depth change allowed
- No aggressive scale jump

### Flipped
- Premium face frame
- Content art or symbol treatment
- Neutral success state until resolution

### Matched
- Green glow
- Check or resolved-success framing
- Optional lingering particles

### Mismatch
- Red failure treatment
- Brief recoil or tilt
- No lingering ambiguity

Detailed motion behavior lives in `MOTION_AND_STATE_SPEC.md`.

---

## Overlay Alignment

### Pause Modal
- Must use the same premium frame family as the rest of the shell.
- Modal should feel like a carved or plated interruption layer, not floating text over gameplay.

### Floor Cleared Modal
- Should visually harmonize with the gameplay frame system.
- Reward information should inherit success-state language.

### Run Settings Modal
- If settings open over gameplay, the shell should preserve the same category-based structure defined in `SCREEN_SPEC_SETTINGS.md`.

### Achievement Toasts and Rule Hints
- Keep them secondary to board and score.
- Use premium framing only when necessary; do not let secondary hints overpower the scene.

---

## Current-App Reconciliation

### What Can Be Implemented with Existing Live Data
- HUD stat structure
- Pause and settings actions
- Most gameplay state feedback
- Daily and mutator context

### What Needs New Routes or Future Scope
- Collection
- Inventory
- Codex

### What Needs Asset Work
- environment scenes
- card back and face art
- ornate HUD framing
- sidebar medallion icon family

---

## Current Code Mapping
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/TileBoard.module.css`
- `src/renderer/components/tileTextures.ts`
- `src/renderer/components/OverlayModal.tsx`
- `src/renderer/components/MainMenuBackground.tsx`

---

## Acceptance Criteria for Later Implementation
- The gameplay shell reads as environment-first rather than control-panel-first.
- Score is the clearest stat in the HUD.
- Sidebar actions feel like a designed part of the world, not generic utility buttons.
- Hidden, hover, flipped, matched, and mismatch card states are visually unambiguous.
- Pause and floor-cleared overlays fit the same design language as the HUD and board shell.

---

## Out of Scope for This Spec
- Redesigning gameplay rules
- Rebalancing stat semantics
- Creating full designs for collection/inventory/codex beyond documenting their placement and future-scope nature
