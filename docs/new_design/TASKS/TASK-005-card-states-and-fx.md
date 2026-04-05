# Task 005: Card States and FX

## Status
Planned

## Priority
High

## Objective
Upgrade the board card system so hidden, hover, flipped, matched, and mismatch states match the reference's clarity and premium feel.

## Source Reference
- `docs/ENDPRODUCTIMAGE.png`
- `docs/new_design/SCREEN_SPEC_GAMEPLAY.md`
- `docs/new_design/MOTION_AND_STATE_SPEC.md`
- `docs/new_design/ASSET_AND_ART_PIPELINE.md`

## Affected Areas
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/TileBoard.module.css`
- `src/renderer/components/tileTextures.ts`
- `src/renderer/components/shuffleFlipAnimation.ts`
- any related renderer FX helpers

## Dependencies
- `TASK-001-theme-foundation-and-assets.md`
- `TASK-004-gameplay-hud-and-shell.md`

## Implementation Outcomes
- Replace the current card back with premium ornamental art.
- Add a higher-fidelity front face treatment.
- Introduce clear hover, success, and failure visual states.
- Improve flip, match, and mismatch feedback.

## Acceptance Criteria
- Hidden, hover, flipped, matched, and mismatch states are visually distinct at a glance.
- Card visuals fit both fallback and 3D board modes.
- Success and failure feedback are readable without extra explanatory text.

## Out of Scope
- New gameplay mechanics
- New card-theme settings model
