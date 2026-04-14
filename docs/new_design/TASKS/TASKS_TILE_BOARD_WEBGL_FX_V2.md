# Tasks: Tile board WebGL rim & celebration v2 (`TBF-*`)

**Context:** After the canvas-only board (`TileBoard` + `TileBoardScene`), per-tile chrome moved from CSS `.hitButton*` to GPU meshes (rings, burst, check, hover strips). This backlog closes the gap to **layered rim reads**, **corner-faithful bezels**, **richer celebration**, and **post-FX alignment** vs `docs/ENDPRODUCTIMAGE.png` / `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`.

**Primary code:** `src/renderer/components/TileBoardScene.tsx`, `TileBoardPostFx.tsx`, `tileResolvingSelection.ts`, `docs/new_design/FX_REDUCE_MOTION_MATRIX.md`, `docs/new_design/HOVER_DOM_WEBGL_TOKENS.md`

**Related existing IDs:** `FX-006`, `FX-011`, `FX-015`, `FX-017`, `CARD-018`, `PLAY-010` (evidence cadence)

---

## Task table

| ID | P | Title | Goal | Acceptance criteria | Deps |
|----|---|--------|------|---------------------|------|
| **TBF-001** | P1 | Reference captures & audit matrix | Lock **6–8** stills (or clips): idle hidden, hover hidden, resolving match/mismatch/gambit, matched, keyboard focus; optional bloom on/off. | Stills stored under team path (e.g. `docs/reference-comparison/captures/` or `VISUAL_CAPTURE_ROOT`); short markdown table maps scenario → **edge crispness**, **outer glow radius**, **corner gap**, **noise tolerance** for diffs. | `TASK-014`, `TASK-019`, `PLAY-010` |
| **TBF-002** | P1 | Dual-layer rim (inner + outer halo) | Replace single flat `MeshBasicMaterial` ring with **crisp inner** rim + **soft outer** glow (second ring, larger radii, lower alpha, or radial-gradient-style shader quad). | Visually closer to old stacked `box-shadow` read; no z-fighting; `graphicsQuality` scales opacity/segment count; `reduceMotion` keeps static or simplified pulse per matrix. | TBF-001 |
| **TBF-003** | P2 | Bloom / post-FX integration | Ensure FX layers **read in bloom** when `TileBoardPostFx` + high quality: rims/check/burst contribute via **emissive-compatible** values or additive pass. | Side-by-side screenshot with bloom on/off; document threshold tuning in `PERFORMANCE_BUDGET.md` or FX notes if needed. | TBF-002, `FX-015` |
| **TBF-004** | P2 | Corner-faithful rim geometry | `RingGeometry` is circular; cards are **rounded-rect** bezels. Implement **rounded-rect ring** (Shape+extrude, edge strips+corner arcs, or shader mask) so rims hug silhouette at shallow camera angles. | Visual review on **mobile camera** + desktop; perf OK on `low` preset (simplify mesh or shader). | TBF-002 |
| **TBF-005** | P2 | Match burst v2 | Old CSS used **conic / multi-hue** burst. Upgrade from single-color scaling ring to **multi-segment** or **shader** burst (conic angle → color, radial mask, one-shot `uProgress`). | `reduceMotion`: shorten or static flash per `FX_REDUCE_MOTION_MATRIX.md`; no extra allocations per frame after trigger. | TBF-001 |
| **TBF-006** | P2 | Matched ✓ polish | Add **outer glow** behind check (second plane, blurred texture, or emissive halo) to echo CSS `text-shadow`. | Check remains readable; no regression in `e2e/tile-card-face-webgl.spec.ts` threshold without intentional baseline bump (`QA-005`). | TBF-003 optional |
| **TBF-007** | P3 | Keyboard focus ring v2 | Gold focus ring: optional **slow pulse** or **double-line** when `keyboardFocused` && `!reduceMotion`. | Focus visible without competing with resolving/hover; a11y spot-check with screen reader + live region unchanged. | — |
| **TBF-008** | P3 | Hover variants for non-hidden pickables | Today hover strips mirror **hidden-back** parity; define lighter/suppressed rim when **face-up** but still pickable (e.g. gambit third pick) so board doesn’t feel “dead”. | Document states in `HOVER_DOM_WEBGL_TOKENS.md`; manual test on gambit-capable run. | `CARD-012` |
| **TBF-009** | P2 | Quality & reduce-motion matrix pass | Align all new uniforms/meshes with **`graphicsQuality`** and **`reduceMotion`** (disable pulses, reduce segments, skip shader path on low). | Rows added or updated in `FX_REDUCE_MOTION_MATRIX.md`; unit smoke if applicable. | TBF-002–TBF-007 |
| **TBF-010** | P2 | Regression & e2e | After visual changes: run **`PLAY-010`** cadence; update pixel-diff thresholds only with justification in PR; extend Playwright if board crops need new masks. | CI green; `TASKS_ASSETS_QA.md` / `QA-005` notes updated if screenshot ratios change. | TBF-002–TBF-006 |

---

## Suggested implementation order

1. **TBF-001** — establishes targets and diff tolerance for everything else.  
2. **TBF-002** + **TBF-009** — largest perceived upgrade (stacked rim) with quality gates.  
3. **TBF-003** — makes rims “pop” under bloom preset.  
4. **TBF-005** — celebration richness.  
5. **TBF-004** — geometry pass once rim stack is stable.  
6. **TBF-006**, **TBF-007**, **TBF-008** — polish.  
7. **TBF-010** — close out evidence and CI.

---

## ID prefix

**`TBF-*`** — **T**ile **b**oard **F**X (WebGL path). Grep alongside `CARD-*`, `FX-*` in `docs/new_design/TASKS/`.

---

## Implementation status (2026-04)

**Shipped in renderer:** `tileBoardRimGeometry.ts` (rounded-rect rim + shared ring geoms); `TileBoardScene.tsx` (dual halo + crisp rim, burst v2 tiers, matched ✓ glow plane, focus pulse, face-up hover strips); `TileBoardPostFx.tsx` bloom tuning; docs: `FX_REDUCE_MOTION_MATRIX.md`, `HOVER_DOM_WEBGL_TOKENS.md`, `PERFORMANCE_BUDGET.md`, `docs/reference-comparison/TILE_BOARD_WEBGL_FX_V2_AUDIT.md`.

**TBF-001 / TBF-010:** `docs/reference-comparison/captures/tile-board-webgl-fx-v2/` is reserved for stills; `e2e/tile-card-face-webgl.spec.ts` green (keyboard flip + `data-board-run-status=playing` gate). Add PNGs under that folder during **PLAY-010** when locking baselines.
