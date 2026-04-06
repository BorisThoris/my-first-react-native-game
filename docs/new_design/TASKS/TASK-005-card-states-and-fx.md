# Task 005: Card States and FX

## Status
Done (shipped scope; residuals documented)

## Implementation notes
- Board uses shared card raster pipeline (`tileTextures.ts`, `TileBoard` / CSS). Hidden, flipped, matched, and mismatch/hover treatments are iterated for clearer state language in both 2D and 3D paths.
- **Residual:** Maximum “premium” parity depends on final card-back/face art drops in `assets/textures/cards/` and motion tuning in `MOTION_AND_STATE_SPEC.md`.

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- **Hover:** reference heavy gold bloom vs subtler border/shadow/3D lift—strengthen FX while respecting `reduceMotion`.
- **Matched:** reference large green checkmark overlay vs green tint/pulse only—add glyph or equivalent clear success read.
- **Mismatch:** reference aggressive red pulse/stress vs current resolving treatment—optional intensify.
- Coordinate with [`TASK-011`](TASK-011-final-card-art-and-texture-pipeline.md) / [`TASK-012`](TASK-012-card-interaction-fx-and-celebration.md) for art-dependent states.

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
