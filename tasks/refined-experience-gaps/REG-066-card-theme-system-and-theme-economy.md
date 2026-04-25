# REG-066: Card Theme System And Theme Economy

## Status
Open

## Priority
P2

## Area
Meta

## Evidence
- `src/renderer/assets/textures/cards/`
- `src/renderer/components/tileTextures.ts`
- `docs/new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md`
- `docs/COLLECTIBLE_SYSTEM.md`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`

## Problem
Card theme appears as a reference setting, and card art is central to product feel, but there is no full theme selection, ownership, or economy system yet.

## Target Experience
Card themes should be a meaningful cosmetic layer: owned, previewable, equippable, readable in gameplay, and compatible with performance and accessibility.

## Suggested Implementation
- Define theme slots: card back, card front, board rim, face palette, or full deck skin.
- Decide whether themes live in `Settings`, `SaveData.unlocks`, or a typed cosmetics structure.
- Add preview and equipped states in settings or inventory.
- Ensure theme assets meet readability, contrast, and mobile performance standards.
- Bump `SAVE_SCHEMA_VERSION` for owned/equipped theme persistence.

## Acceptance Criteria
- Card theme UI is not enabled until themes are real and persisted.
- Equipped theme appears in gameplay and is reversible.
- Locked themes explain unlock source.
- Fallback theme works if an asset is missing.

## Verification
- Test theme save/load and reset.
- Capture gameplay, settings, and inventory with default and alternate themes.
- Run card face DOM/WebGL visual specs after theme changes.

## Cross-links
- `REG-012-card-materials-and-interaction-fx.md`
- `REG-025-collectibles-cosmetics-implementation.md`
- `REG-036-reference-settings-controls-model-plan.md`
