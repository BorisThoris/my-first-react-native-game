# Renderer assets

## Procedural card illustration

Face-up overlays draw a pair-key–seeded procedural panel (`cardFace/proceduralIllustration/`); **symbols, rank digits, and callsign labels are not rasterized on the card**—pair identity is visual (illustration + frame) only. Wild/decoy tiles use the same pipeline from their `pairKey` seeds. When roll tables, geometry, or paint paths change, bump **`ILLUSTRATION_GEN_SCHEMA_VERSION`** (`illustrationSchemaVersion.ts`) and **`GAMEPLAY_CARD_VISUALS.textureVersion`** (`gameplayVisualConfig.ts`) so bitmap caches invalidate; then regenerate illustration E2E fixtures. Archetypes include **`cinderDrift`** among others; motifs include **`thornCrown`** among others; optional **noiseStrength** overlays and **`mirrorV`** symmetry apply as rolled.

**Accessibility:** picture-only faces may not expose distinct text per tile to assistive tech; pairing remains memory and visual recall unless a future HUD adds textual pair cues.

## Matched-card rim fire (`matchedCardRimFireMaterial.ts`)

The victory rim uses a **procedural shader** only. There is no cube env map or separate fire texture on disk; colors come from `GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect` in `gameplayVisualConfig`. Card faces may still use raster normal maps under `textures/cards/` as elsewhere in `tileTextures`.
