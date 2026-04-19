# 05 — Cards — hidden back (`PLAY-007`)

**`PLAY-*` ID:** **PLAY-007** (P1)

## Current delta vs `ENDPRODUCTIMAGE.png`

From [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4** — **Card backs:**

- Reference: **leather / walnut**, symmetric **gold filigree**, glowing diamond center.
- Live **`card-face-down.png`**: authored back is detailed but still skews **cool teal / charcoal** vs warmer leather/walnut mock ([`authored-card-back.svg`](../../../../src/renderer/assets/textures/cards/authored-card-back.svg), [`ASSET_SOURCES.md`](../../../../src/renderer/assets/ASSET_SOURCES.md)).

## Required end state

- One approved **back treatment** spans **DOM and WebGL**; face-down crop **warms** toward the reference board.

## Accept shipped baseline + optional raster path

Runtime uses hand-authored SVG paths (**shipped**). Optional **AI / photographic rasters** follow [`CARD_TEXTURE_AI_BRIEF.md`](../../CARD_TEXTURE_AI_BRIEF.md) (aspect **~0.74∶1.08**, normalize via `scripts/card-pipeline/normalize-card-texture.ps1`). Drop-in table: [`DROP_IN_ASSET_CHECKLIST.md`](../../DROP_IN_ASSET_CHECKLIST.md) — card raster rows.

## Dependencies

- **PLAY-010**.
- **`CARD-*`**, **`TBF-*`** where WebGL/DOM parity overlaps: [`../TASKS_CARDS_VFX_PARITY.md`](../TASKS_CARDS_VFX_PARITY.md), [`../TASKS_TILE_BOARD_WEBGL_FX_V2.md`](../TASKS_TILE_BOARD_WEBGL_FX_V2.md).
- Future **card theme** picker (reference-only rows today): [`SETTINGS_REFERENCE_CONTROLS_MATRIX.md`](../../SETTINGS_REFERENCE_CONTROLS_MATRIX.md).

## Primary runtime files

- [`authored-card-back.svg`](../../../../src/renderer/assets/textures/cards/authored-card-back.svg), [`authored-card-front.svg`](../../../../src/renderer/assets/textures/cards/authored-card-front.svg)
- [`tileTextures.ts`](../../../../src/renderer/components/tileTextures.ts)
- [`TileBoardScene.tsx`](../../../../src/renderer/components/TileBoardScene.tsx)

## Evidence artifacts

- `card-face-down.png`

## Cross-links

- [`../TASKS_CARDS_VFX_PARITY.md`](../TASKS_CARDS_VFX_PARITY.md)
- [`../../MOTION_AND_STATE_SPEC.md`](../../MOTION_AND_STATE_SPEC.md) — state grammar vs asset swaps
