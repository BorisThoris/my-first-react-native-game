# 07 — Typography and palette (`PLAY-011`)

**`PLAY-*` ID:** **PLAY-011** (P2)

## Current delta vs `ENDPRODUCTIMAGE.png`

From [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4**:

- Reference: **warm gold / ember / walnut** with ivory type accents.
- Live gameplay crops: **Cinzel / Inter** hierarchy present but overall skew **cooler teal / charcoal** than the reference board.

## Required end state

- Gameplay shell shifts **warmer** in still captures **without** breaking legibility or green/red/violet **state contrast**.

## Dependencies

- **PLAY-010** (evaluate after chrome and card materials settle).
- **`DS-*`** in [`../TASKS_DESIGN_SYSTEM.md`](../TASKS_DESIGN_SYSTEM.md).
- Tokens: [`theme.ts`](../../../../src/renderer/styles/theme.ts), [`RENDERER_THEME`](../../../../src/renderer/styles/theme.ts).

## Primary runtime files

- [`theme.ts`](../../../../src/renderer/styles/theme.ts)
- [`GameScreen.module.css`](../../../../src/renderer/components/GameScreen.module.css)
- Card texture assets under [`src/renderer/assets/textures/cards/`](../../../../src/renderer/assets/textures/cards/)

## Evidence artifacts

- Full gameplay and HUD crops after palette pass; compare **`top-bar-details.png`**, **`main-game-screen.png`**, card-state PNGs.

## Cross-links

- [`../TASKS_DESIGN_SYSTEM.md`](../TASKS_DESIGN_SYSTEM.md)
- [`../../VISUAL_SYSTEM_SPEC.md`](../../VISUAL_SYSTEM_SPEC.md)
