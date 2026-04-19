# Task 003: Main Menu Redesign

## Status

Done (shipped baseline) — hero-first main menu, Choose Your Path flow, desktop quit.

**Residual / follow-up:** embossed wordmark vs display title, illustrated `MainMenuBackground` vs abstract shell — [`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) + [`DROP_IN_ASSET_CHECKLIST.md`](../DROP_IN_ASSET_CHECKLIST.md).

## Implementation notes
- Main menu uses hero-first layout, vertical primary actions, secondary “more run types,” Collection entry, and Play → Choose Your Path. Exit uses desktop `quitApp` where available.
- **Residual:** Text title versus ornamental logo lockup; abstract `MainMenuBackground` versus full illustrated scene (asset direction).

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- Top strip: reference shows level badge, dual currency, journal/mail/quick-settings; live uses Build / best score / daily streak / Steam meta cards—align with [`TASK-016`](TASK-016-profile-and-meta-menu-strip.md) when profile/currency is in scope.
- Title / PLAY CTA: reference embossed gold wordmark and icon-forward primary button vs current cream display title and text CTA—tie to [`TASK-010`](TASK-010-final-logo-and-emblem-lockup.md) and button polish.
- Bottom region: reference daily + current-run widgets + socials vs live alternate-descents + run archive—[`TASK-017`](TASK-017-social-and-community-strip.md) for socials; bottom card layout remains a composition gap vs stills.
- Procedural **grid overlay** on the menu scene (visible in captures) is absent from reference; tune `MainMenuBackground` / scene layers to reduce or remove for still parity.

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
