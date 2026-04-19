# Task 018: Mode Select Card Illustrations

## Status

Deferred — optional per-mode poster rasters (card chrome + Daily border landed). Re-open when poster assets exist under [`src/renderer/assets/ui/`](../../../src/renderer/assets/ui/) or product prioritizes parity stills.

## Implementation notes
- **Audit finding:** `ChooseYourPathScreen` structure matches reference; mode cards can gain illustration panels, stronger frames, and timer/badge polish vs stills.
- **Relationship:** Visual layer on `TASK-007-mode-selection-and-menu-ia.md`.
- **Landed:** `ChooseYourPathScreen.module.css` — subtle top highlight + inset sheen on `.card`; **Daily** card (`.cardDaily`) stronger purple border + outer glow toward reference “featured” chrome. Mode-card asset row in `docs/new_design/DROP_IN_ASSET_CHECKLIST.md`. Per-mode **poster rasters** still optional.

### Reference audit ([`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md))
- **Poster illustrations** per mode (blue gate, purple crystal, fire gate) inside **ornate gold frames** vs flat gradient cards in `01a-choose-your-path.png`.
- **Stronger featured selection glow** (purple rim) vs current modest treatment—CSS and/or assets.

## Priority
Medium

## Objective
Add approved per-mode art (or shared ornamental frames with mode iconography) to mode cards without cluttering compact viewports; align lock and daily countdown presentation with reference.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md` (Mode Selection)
- `src/renderer/components/ChooseYourPathScreen.tsx`, `ChooseYourPathScreen.module.css`
- `docs/ENDPRODUCTIMAGE.png` when available

## Affected Areas
- `ChooseYourPathScreen.tsx`, module CSS
- `src/renderer/assets/ui/` or new raster folder for mode art

## Dependencies
- Final illustrations or frame assets
- `TASK-007-mode-selection-and-menu-ia.md`

## Implementation Outcomes
- Cards feel premium and distinct at a glance; locked Endless remains honest.
- Layout stable across tablet and mobile visual scenarios (`01a`).

## Acceptance Criteria
- `yarn test:e2e:visual` choose-your-path scenarios remain green.
- Reference still review sign-off.

## Out of Scope
- New game modes or rule changes
