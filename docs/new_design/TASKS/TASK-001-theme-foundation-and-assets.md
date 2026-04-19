# Task 001: Theme Foundation and Assets

## Status

Done (shipped baseline) — theme tokens + global CSS + asset directories wired in renderer.

**Residual / follow-up:** full illustrated menu/gameplay scenes vs `docs/ENDPRODUCTIMAGE*.png` — track in [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) and [`docs/new_design/DROP_IN_ASSET_CHECKLIST.md`](../DROP_IN_ASSET_CHECKLIST.md); no further code until assets land.

## Implementation notes
- Shared tokens live in `src/renderer/styles/theme.ts` and `src/renderer/styles/global.css`; UI raster slots live under `src/renderer/assets/ui/` and card textures under `src/renderer/assets/textures/cards/`.
- **Residual:** Full illustrated menu/gameplay scenes and final logo lockup remain asset-dependent versus `docs/ENDPRODUCTIMAGE*.png` (see `CURRENT_VS_TARGET_GAP_ANALYSIS.md`).

## Priority
High

## Objective
Establish the redesign foundation for typography, shared visual tokens, and asset intake so later screen work uses one coherent system.

## Source Reference
- `docs/ENDPRODUCTIMAGE.png`
- `docs/ENDPRODUCTIMAGE2.png`
- `docs/new_design/VISUAL_SYSTEM_SPEC.md`
- `docs/new_design/ASSET_AND_ART_PIPELINE.md`

## Affected Areas
- `src/renderer/styles/theme.ts`
- `src/renderer/styles/global.css`
- `src/renderer/assets/ui/`

## Dependencies
- None

## Implementation Outcomes
- Add the shared fantasy token system for color, type, glow, frame, and spacing rules.
- Load the approved display and body fonts.
- Create a stable asset folder structure and naming convention.
- Define fallback behavior for missing premium assets.

## Acceptance Criteria
- Fonts, palette, and shared visual tokens are centralized.
- Asset categories are clearly partitioned in the repo.
- Placeholder and final asset swap boundaries are explicit.
- Later screen work does not need to invent its own token system.

## Out of Scope
- Per-screen layout work
- Routing changes
- Gameplay logic changes
