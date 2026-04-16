# Tile board WebGL FX v2 — reference audit (`TBF-001`)

**Purpose:** Map capture scenarios to visual tolerances for diffing against `docs/ENDPRODUCTIMAGE.png` / `CURRENT_VS_ENDPRODUCT.md`.

**Stills:** Store 6–8 PNGs under `docs/reference-comparison/captures/tile-board-webgl-fx-v2/` (directory tracked empty via `.gitkeep`; or your team `VISUAL_CAPTURE_ROOT`) when running the **PLAY-010** cadence.

| Scenario | What to check | Edge crispness | Outer glow radius | Corner gap | Noise tolerance |
|----------|----------------|----------------|-------------------|------------|-----------------|
| Idle hidden | No rim / no hover | Sharp card silhouette | None | Match SVG bezel | Low |
| Hover hidden | Gold strips + emissive | Strips align to card rect | Subtle (emissive + lights) | Strips meet corners | Medium (AA) |
| Resolving match | Dual rim + hue | Inner rounded rect vs halo | Halo > inner | Rims follow rounded card | Medium |
| Resolving mismatch | Red/cyan stack | Same | Same | Same | Medium |
| Resolving gambit | Neutral tint + rim | Same | Same | Same | Medium |
| Matched | Ember rim + matched glow | Inner rim reads crisp, outer band stays edge-bound | Glow sits under the rim instead of washing the face | Rounded corners stay attached to card silhouette | Medium |
| Keyboard focus | Gold ring pulse | Ring smooth | Optional bloom | N/A | Low–medium |
| Bloom on/off (optional) | Post-FX | — | Bloom visible on rims/check | — | Compare two runs |

**Notes:** Baseline bumps for Playwright screenshots require **QA-005** justification. Bloom tuning: `TileBoardPostFx.tsx` (`luminanceThreshold` / `intensity`).
