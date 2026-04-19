# Task 010: Final Logo and Emblem Lockup

## Status

Deferred — asset blocked (brand logo/emblem). Exit: drop-in paths in [`DROP_IN_ASSET_CHECKLIST.md`](../DROP_IN_ASSET_CHECKLIST.md) + approval.

## Implementation notes
- **Audit finding:** Current lockup is typographic plus `brandCrest` / `menuEmblem` assets; reference targets a more ornamental logo treatment.
- **Relationship:** Tightens branding vs [`CURRENT_VS_TARGET_GAP_ANALYSIS.md`](../CURRENT_VS_TARGET_GAP_ANALYSIS.md) main-menu rows and [`TASKS_META_AND_SHELL.md`](./TASKS_META_AND_SHELL.md) meta shell work.
- **Done for this pass:** See logo/emblem rows in `docs/new_design/DROP_IN_ASSET_CHECKLIST.md`.

## Priority
Medium

## Objective
Land a final logo or emblem system (raster and/or SVG) and integrate it into the main menu hero and any other approved surfaces (mode select, game over) per art direction.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- `docs/ENDPRODUCTIMAGE.png` (when present in repo)
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/assets/ui/`

## Affected Areas
- `src/renderer/assets/ui/` (new or replaced assets)
- `MainMenu.tsx`, `ChooseYourPathScreen.tsx`, optional `GameOverScreen.tsx`
- Related CSS modules

## Dependencies
- Final brand asset delivery

## Implementation Outcomes
- Single source of truth for logo/emblem used consistently across menu and linked surfaces.
- Accessible contrast and sharpness at `uiScale` extremes.

## Acceptance Criteria
- Side-by-side with reference stills, lockup hierarchy matches product expectation.
- Vitest/a11y smoke still pass where titles and images are asserted.

## Out of Scope
- Full rebrand or name change
- Marketing site assets outside the renderer
