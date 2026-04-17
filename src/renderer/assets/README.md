# Renderer assets

## Matched-card rim fire (`matchedCardRimFireMaterial.ts`)

The victory rim uses a **procedural shader** only. There is no cube env map or separate fire texture on disk; colors come from `GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect` in `gameplayVisualConfig`. Card faces may still use raster normal maps under `textures/cards/` as elsewhere in `tileTextures`.
