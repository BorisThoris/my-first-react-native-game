# Task 012: Card Interaction FX and Celebration

## Status

Done (shipped) — resolving pulse on DOM hit layer; **`scorePop`** pill with **`scorePopBurst`** keyframes in [`GameScreen.module.css`](../../../src/renderer/components/GameScreen.module.css); animation disabled under **`data-reduce-motion='true'`**.

**Not in v1:** reference-style particle burst / richer celebration beyond the pill — defer unless product adds FX budget.

## Implementation notes
- **Audit finding:** Hidden / hover / flip / matched / mismatch exist; reference implies richer celebration (score pop, burst, clearer mismatch read).
- **Relationship:** Code and motion layer on top of `TASK-005` and `shuffleFlipAnimation.ts`.
- **Landed:** `TileBoard.module.css` — `@keyframes` pulses for `.hitButtonResolvingMatch` / `.hitButtonResolvingMismatch`, gated with `:global([data-reduce-motion='false'])` (animations off when `reduceMotion` is enabled on the app root). **Matched checkmark:** `.hitButtonMatched::after` green ✓ over DOM hit layer for clearer reference-style success read (WebGL path).
- **Score pop:** `GameScreen.tsx` + `GameScreen.module.css` — on each scoring match during `playing`, gold **`+N`** pill on the board toast rail (`.scorePop`, `scorePopBurst`); gated by `matchesFound` / `totalScore` delta; respects `reduceMotion` (no entrance animation, shorter dismiss).

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- **Score pop / burst** and stronger **match celebration** (reference shows +score and particle read) still open vs capture baseline.
- Cross-link **hover bloom** and **matched checkmark** expectations with [`TASK-005`](TASK-005-card-states-and-fx.md).

## Priority
Medium

## Objective
Deepen interaction feedback for match, mismatch, and high-impact moments per `MOTION_AND_STATE_SPEC.md`, staying within `reduceMotion` and performance budgets.

## Source Reference
- `docs/new_design/MOTION_AND_STATE_SPEC.md`
- `docs/new_design/SCREEN_SPEC_GAMEPLAY.md` (Zone E)
- `src/renderer/components/shuffleFlipAnimation.ts`
- `src/renderer/components/TileBoard.tsx`, `TileBoard.module.css`

## Affected Areas
- Tile board CSS and any canvas/WebGL overlay hooks
- `shuffleFlipAnimation.ts`, HUD-adjacent feedback if needed

## Dependencies
- `TASK-005-card-states-and-fx.md`
- Optional coordination with `TASK-011-final-card-art-and-texture-pipeline.md` so FX read on final art

## Implementation Outcomes
- Match and mismatch are unmistakable in under a second on a phone viewport.
- Celebration FX respect `reduceMotion` (instant or simplified).

## Acceptance Criteria
- Design review against reference stills for “success” and “failure” moments.
- No new flakes in `yarn test:e2e:visual` gameplay and game-over paths.

## Out of Scope
- Changing core match rules or scoring
