# Drop-in asset checklist (renderer)

Use this when final art is ready. Swap files **or** update imports in `src/renderer/assets/ui/index.ts` / `tileTextures.ts` to point at new URLs. Keep fallbacks until assets are verified on device.

## Menu and gameplay scenes (TASK-009)
| Role | Typical import / usage |
|------|-------------------------|
| Menu hero layer | `UI_ART.menuScene` — `src/renderer/assets/ui/menu-scene.svg` (replace or add raster + change import) |
| Gameplay stage | `UI_ART.gameplayScene` — `gameplay-scene.svg` |
| Stage ring (optional) | `UI_ART.stageRing` |
| Ambient field | `MainMenuBackground.tsx` — procedural; optional texture pass |

## Logo / emblem (TASK-010)
| Role | Typical import |
|------|----------------|
| Crest | `UI_ART.brandCrest` |
| Menu emblem | `UI_ART.menuEmblem` |
| Divider | `UI_ART.dividerOrnament` |

## Card raster (TASK-011)
| Role | File / import |
|------|----------------|
| Primary back / face reference | `src/renderer/assets/textures/cards/reference-back.png` via `tileTextures.ts` |
| Edge / roughness | `edge.png`, `panel-roughness.png`, `edge-roughness.png` |

## Mode cards (TASK-018)
| Role | Implementation |
|------|------------------|
| Per-mode illustration | Add assets under `src/renderer/assets/ui/` (or `backgrounds/`) and mount inside `ChooseYourPathScreen` cards |

## Naming (see also)
[ASSET_AND_ART_PIPELINE.md](ASSET_AND_ART_PIPELINE.md) — recommended filenames and formats.

## After swap
- Run `yarn test` and `yarn test:e2e:visual` (or targeted specs).
- Check `reduceMotion` and low-DPR laptops for load and sharpness.
