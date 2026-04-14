# Tasks: Playing screen vs `ENDPRODUCTIMAGE.png` (top-left) — `PLAY-*`

**Reference:** [`docs/ENDPRODUCTIMAGE.png`](../../ENDPRODUCTIMAGE.png) — main gameplay mock (HUD, sidebar, board, card treatments in the composite).  
**Living diff:** [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) §4.  
**Evidence:** `yarn playwright test e2e/hud-inspect.spec.ts e2e/visual-endproduct-parity.spec.ts --workers=1` → `test-results/endproduct-parity/` (`hud-context-fullpage.png`, `hud-element.png`, `hud-metrics.json`, `hud-fragment.html`, `hud-*.png`, `tile-board-*.png`; override with `VISUAL_CAPTURE_ROOT`). **PLAY-010:** keep [`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) §4 + this list aligned when outputs or HUD structure change.

These IDs are **orthogonal** to `HUD-*` / `SIDE-*` / `CARD-*` tables so completed parity rows can stay archived without renumbering.

---

## Task table

| ID | P | Title | Delta vs reference (playing still) | Acceptance criteria | Primary files | Deps |
|----|---|--------|-------------------------------------|----------------------|---------------|------|
| PLAY-003 | P1 | HUD information architecture | Reference: slim strip (floor, lives, shards, score, daily, parasite). Live: adds **Mode**, **mutator chips**, **stat rail** in the top deck. | Either second slim row for meta/context, relocation (e.g. flyout), or product-approved “Steam” density; **PLAY-010** shows before/after height. | [`GameplayHudBar.tsx`](../../../src/renderer/components/GameplayHudBar.tsx), [`GameScreen.module.css`](../../../src/renderer/components/GameScreen.module.css) | PLAY-010 |
| PLAY-004 | P2 | Lives presentation | Mock shows **three** hearts; game uses **five** slots (`MAX_LIVES` in [`contracts.ts`](../../../src/shared/contracts.ts)). | Product picks mock-accurate vs honest max; UI matches contract. | [`GameplayHudBar.tsx`](../../../src/renderer/components/GameplayHudBar.tsx), [`contracts.ts`](../../../src/shared/contracts.ts) | — |
| PLAY-005 | P2 | Floor badge / shield | Mock: shield-like / hex-heavy **floor** badge. Live: rectangular `floorBadge` segment. | Visual review vs COMPONENT_CATALOG; optional art from **TASK-013**. | `GameScreen.module.css`, assets | **TASK-013** |
| PLAY-006 | P2 | Stage and board framing | Mock: circular **stone dais**, strong torch staging. Live: `stageBackdrop` + `UI_ART.gameplayScene` + grid board. | Art direction lock; board stage reads as “arena” without shrinking playfield. | [`GameScreen.tsx`](../../../src/renderer/components/GameScreen.tsx), stage CSS, **TASK-009** art | PLAY-010 |
| PLAY-007 | P1 | Card back parity | Mock: warm **leather/walnut**, symmetric **gold filigree**, **diamond** center. Live: [`back.svg`](../../../src/renderer/assets/textures/cards/back.svg) + cool gradients in DOM/WebGL paths. | Single approved back treatment across DOM + WebGL; ASSET_SOURCES updated. | [`TileBoard.module.css`](../../../src/renderer/components/TileBoard.module.css), `tileTextures` / WebGL materials | **TASK-011**, PLAY-010 |
| PLAY-010 | P0 | Evidence loop | Captures and metrics drift from docs over time. | Regenerate `hud-inspect` + `visual-endproduct-parity` outputs; attach `hud-metrics.json` + PNGs to reviews; **§4** in CURRENT_VS_ENDPRODUCT stays aligned. | [`e2e/hud-inspect.spec.ts`](../../../e2e/hud-inspect.spec.ts), [`e2e/visual-endproduct-parity.spec.ts`](../../../e2e/visual-endproduct-parity.spec.ts), [`visualScreenHelpers.ts`](../../../e2e/visualScreenHelpers.ts) | — |

---

## Suggested implementation order

1. **PLAY-010** — Refresh captures and doc §4 (including stale bullets, e.g. parasite strip now exists).  
2. **PLAY-001** → **PLAY-002** — Sidebar IA then circular chrome (with **SIDE-004** / **SIDE-018**).  
3. **PLAY-003** + **HUD-005** — HUD density and gauntlet dedupe.  
4. **PLAY-004** / **PLAY-005** — Lives UX + floor ornament.  
5. **PLAY-006** — Stage / dais (often blocked on **TASK-009**).  
6. **PLAY-007** → **PLAY-008** — Card backs then motion/VFX.  
7. **PLAY-009** — Tutorial / pair markers last (product).

---

## Cross-links

- Sidebar table: [`TASKS_SIDEBAR_PARITY.md`](./TASKS_SIDEBAR_PARITY.md)  
- HUD table: [`TASKS_HUD_PARITY.md`](./TASKS_HUD_PARITY.md)  
- Card / FX tables: [`TASKS_CARDS_VFX_PARITY.md`](./TASKS_CARDS_VFX_PARITY.md)  
- Completed `HUD-*` / `SIDE-*` rows: [`TASKS_ARCHIVE_PARITY.md`](./TASKS_ARCHIVE_PARITY.md)
