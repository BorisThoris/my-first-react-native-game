# Task 011: Final Card Art and Texture Pipeline

## Status
**Shipped (SVG):** Runtime card faces use hand-authored **`authored-card-back.svg`** / **`authored-card-front.svg`** (leather + filigree + diamond / stone panel) wired through `tileTextures.ts`, DOM CSS, and WebGL URLs — see `ASSET_SOURCES.md`. Legacy multi-MB traced `back.svg` / `front.svg` remain on disk for tooling only.

**Optional:** AI rasters per `CARD_TEXTURE_AI_BRIEF.md` if art direction wants photographic detail beyond vectors.

## Implementation notes
- **Audit finding:** `tileTextures.ts` centers on `reference-back.png` and procedural layers; reference implies distinct premium backs and readable faces per pair theme.
- **Relationship:** Deepens `TASK-005-card-states-and-fx.md` on the **asset** side.
- **Done for this pass:** Card texture drop-in table in `docs/new_design/DROP_IN_ASSET_CHECKLIST.md`.

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- **Backs:** reference filigree + centered glowing gem on leather/walnut vs `reference-back.png` + procedural hatch in [`tileTextures.ts`](../../../src/renderer/components/tileTextures.ts)—final authored backs and optional **card theme** sets (see [`TASK-015`](TASK-015-settings-schema-for-reference-controls.md) phase 2).
- **Faces:** reference 3D relic + gold title + effect line vs symbol/emoji-centric tiles—product decision whether to adopt item-card faces or keep memory glyphs.

## Priority
High

## Objective
Integrate approved final card back (and face, if distinct from generated faces) through the existing texture preload and CanvasTexture pipeline without breaking DOM or WebGL paths.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- `docs/new_design/ASSET_AND_ART_PIPELINE.md`
- `src/renderer/components/tileTextures.ts`
- `src/renderer/assets/textures/cards/`

## Affected Areas
- `tileTextures.ts`, `TileBoard.tsx`, `TileBoardScene.tsx`
- Card raster assets under `src/renderer/assets/textures/cards/`
- E2E specs that assert card faces (`e2e/tile-card-face-*.spec.ts`)

## Dependencies
- Final card art delivery at agreed resolution
- `TASK-005-card-states-and-fx.md` (state logic stays stable while swapping art)

## Implementation Outcomes
- Final backs/faces load via existing preload; fallback remains if an asset fails.
- 2D and 3D presentations both respect the same art direction.

## Acceptance Criteria
- Visual parity with reference for card silhouette and back ornament at a glance.
- `yarn test` and tile-related Playwright specs remain green.

## Out of Scope
- New card-theme settings model (see `TASK-015-settings-schema-for-reference-controls.md`)
