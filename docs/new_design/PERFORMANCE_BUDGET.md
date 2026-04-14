# PERF-009 — Performance budget (board + shell)

Targets are **guidelines** for mid-range laptops and phones; actual headroom depends on device thermals and OS compositing.

## Frame budget

| Surface | Target steady FPS | Notes |
|---------|-------------------|--------|
| Game WebGL board | 55–60 | Dominated by card meshes, optional SMAA/bloom, viewport damp |
| Main menu Pixi | 30–60 | Capped resolution via **Graphics quality** (PERF-001 / PERF-006) |
| DOM-only board | 60 | No GL; CSS animations gated by reduce motion |

## Board GPU knobs (`Settings`)

| Setting | Effect |
|---------|--------|
| **Graphics quality** | Caps **tile board DPR** (`getBoardDprCap`) and **menu Pixi renderer resolution** (`getMenuPixiResolutionCap`). |
| **Board bloom** (**FX-015** / **TBF-003**) | Optional `@react-three/postprocessing` **Bloom** on the tile board (`TileBoardPostFx.tsx`). **Default: off** (`save-data` / Settings). **Forced off** on Low quality regardless of the toggle. **Medium / High** with the toggle on runs the bloom pass (intensity ~**0.38**, luminance threshold ~**0.78**, tuned so rim/check burst reads align with tile chrome). On **High** only, `GameScreen` adds a small extra **CSS** `box-shadow` rim under the board (`.boardStageCssBloom`) so the stage reads warmer without another GPU pass at Medium. |
| **Board anti-aliasing** | SMAA vs MSAA vs off (`boardScreenSpaceAA`); see `FX_REDUCE_MOTION_MATRIX.md`. |

## FX caps (cross-reference)

| FX | Budget hook |
|----|-------------|
| FX-005 match particles | Cap count; off when reduce motion |
| FX-015 bloom | Intensity ~0.38; luminance threshold ~0.78; tier-gated (**TBF-003**) |

## WebGL resilience (PERF-005)

`TileBoard` listens for `webglcontextlost` / `webglcontextrestored` on the R3F canvas. Loss switches to the **DOM fallback** grid until restore (or user reload).
