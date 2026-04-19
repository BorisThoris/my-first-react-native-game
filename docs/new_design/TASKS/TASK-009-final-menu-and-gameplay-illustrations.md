# Task 009: Final Menu and Gameplay Illustrations

## Status

Deferred — asset blocked. Exit criteria: populate [`DROP_IN_ASSET_CHECKLIST.md`](../DROP_IN_ASSET_CHECKLIST.md) rows + visual sign-off vs reference stills.

## Implementation notes
- **Audit finding:** Live menu uses `MainMenuBackground` (Pixi) plus `UI_ART.menuScene` / `gameplayScene` SVGs; reference comps expect painted dungeon/tavern hero and a cinematic gameplay stage (see `SCREEN_SPEC_GAMEPLAY.md` Zone A).
- **Relationship:** Aligns main menu / gameplay illustrated layers with [`CURRENT_VS_TARGET_GAP_ANALYSIS.md`](../CURRENT_VS_TARGET_GAP_ANALYSIS.md); gameplay stage framing ties to **`PLAY-006`** in [`PLAYING_ENDPRODUCT/04-environment-stage.md`](./PLAYING_ENDPRODUCT/04-environment-stage.md) once approved art lands.
- **Done for this pass:** `docs/new_design/DROP_IN_ASSET_CHECKLIST.md` lists drop-in paths for menu/gameplay scene slots.

## Priority
High (visual parity)

## Objective
Replace or heavily layer approved illustrated key art for the main menu hero and gameplay stage so the live renderer approaches `ENDPRODUCTIMAGE*.png` environment fidelity without breaking performance or the existing asset slot pattern.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md` (Main Menu / Gameplay mapping)
- `docs/new_design/SCREEN_SPEC_GAMEPLAY.md`
- `docs/new_design/ASSET_AND_ART_PIPELINE.md`
- `src/renderer/assets/ui/` and `MainMenuBackground.tsx`

## Affected Areas
- `src/renderer/components/MainMenu.tsx`, `MainMenu.module.css`
- `src/renderer/components/MainMenuBackground.tsx`
- `src/renderer/components/GameScreen.tsx`, `GameScreen.module.css`
- `src/renderer/assets/ui/` imports

## Dependencies
- Approved final illustrations exported to repo-standard sizes and formats ([`ASSET_AND_ART_PIPELINE.md`](../ASSET_AND_ART_PIPELINE.md))

## Implementation Outcomes
- Menu and gameplay backgrounds read as intentional illustrated stages, not placeholder abstract fields.
- `reduceMotion` and low-end paths retain a readable fallback.

## Acceptance Criteria
- Visual review against committed reference stills shows clear alignment on composition, vignette, and board framing.
- No regression in `yarn test`, `yarn test:e2e:visual` for scenarios touching menu and gameplay.

## Out of Scope
- New gameplay mechanics
- Rewriting the entire Pixi atmosphere system unless required for art integration
