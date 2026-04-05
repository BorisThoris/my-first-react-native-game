# Task 003: Main Menu Redesign

## Status
Planned

## Priority
High

## Objective
Rebuild the main menu around the reference hero composition, centered CTA stack, and bottom meta cards while preserving current live functionality.

## Source Reference
- `docs/ENDPRODUCTIMAGE2.png`
- `docs/new_design/SCREEN_SPEC_MAIN_MENU.md`
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`

## Affected Areas
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/MainMenu.module.css`
- `src/renderer/components/MainMenuBackground.tsx`

## Dependencies
- `TASK-001-theme-foundation-and-assets.md`
- `TASK-002-shared-ui-primitives.md`

## Implementation Outcomes
- Replace the current menu layout with a centered hero composition.
- Introduce the vertical CTA stack.
- Reframe daily and current-run information as bottom status cards.
- Move extra current live modes into a secondary surface instead of the main hero.

## Acceptance Criteria
- The main menu reads as a scene-first hero screen.
- `Play` is clearly the dominant action.
- Daily and current-run summaries are visually distinct and lower priority than the hero.
- Extra current live modes no longer clutter the main menu composition.

## Out of Scope
- Shipping a real collection screen
- Adding profile/currency systems if those models do not yet exist
- Implementing social links
