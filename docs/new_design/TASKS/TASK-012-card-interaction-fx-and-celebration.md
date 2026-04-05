# Task 012: Card Interaction FX and Celebration

## Status
Partial (resolving-state pulse on DOM hit layer; score-pop / burst still future)

## Implementation notes
- **Audit finding:** Hidden / hover / flip / matched / mismatch exist; reference implies richer celebration (score pop, burst, clearer mismatch read).
- **Relationship:** Code and motion layer on top of `TASK-005` and `shuffleFlipAnimation.ts`.
- **Landed:** `TileBoard.module.css` — `@keyframes` pulses for `.hitButtonResolvingMatch` / `.hitButtonResolvingMismatch`, gated with `:global([data-reduce-motion='false'])` (animations off when `reduceMotion` is enabled on the app root).

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
