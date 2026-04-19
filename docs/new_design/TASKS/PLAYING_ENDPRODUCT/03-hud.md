# 03 — HUD (`PLAY-003`, `PLAY-004`, `PLAY-005`)

**`PLAY-*` IDs:** **PLAY-003** (P1), **PLAY-004** (P2), **PLAY-005** (P2)

## Current delta vs `ENDPRODUCTIMAGE.png`

From [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4**:

| §4 row | Summary |
|--------|---------|
| HUD segmentation | Mock: distinct gold-trimmed modules, hex-like floor badge, score parasite bar. Live `top-bar-details.png`: dual-row deck; chrome flatter than mock; **secondary row competes with hero score**. |
| Daily / parasite | Data present; **Daily and Score Parasite modules wider/heavier** than reference — utility-strip density. |
| Floor badge | Mock: shield-like / hex-heavy badge. Live: **rectangular** floor segment — needs stronger shield/medallion read or explicit accept. |

**Residual polish (from shipped HUD segment pass):** segment **ornament density** and **hex-like floor** treatment vs flat modules; **score parasite** strip reference-only unless gameplay spec adopts it. Optional **ornamental HUD frame rasters** defer with final menu/gameplay illustrated art ([`TASK-009`](../TASK-009-final-menu-and-gameplay-illustrations.md)).

**Interaction / celebration** that sits on the board toast / score pop (not top HUD chrome) lives in [`06-interactions.md`](./06-interactions.md).

| ID | Title | Delta vs reference | Acceptance criteria |
|----|--------|-------------------|---------------------|
| PLAY-003 | HUD information architecture | Mock: slim segmented strip, score dominance; live dual-row gives context row too much weight | Tune Daily/parasite/context so **score stays emotional center**; top bar reads closer to mock |
| PLAY-004 | Lives presentation | Mock: three hearts; contract uses **five** slots (`MAX_LIVES`) | Product picks mock-accurate vs honest max; UI matches cleanly |
| PLAY-005 | Floor badge / shield | Mock: shield/hex floor badge; live: rectangular segment | Stronger shield/medallion read **or** explicit product acceptance |

## Required end state

- Score-first hierarchy on narrow (~390px) viewports; mutator/daily context **subordinate** to score ([`SCREEN_SPEC_GAMEPLAY.md`](../../SCREEN_SPEC_GAMEPLAY.md)).
- Floor badge reads **shield/medallion** or waiver recorded.

## Dependencies

- **PLAY-010**.
- **`HUD-*`** in [`../TASKS_HUD_PARITY.md`](../TASKS_HUD_PARITY.md).
- Optional stage/contrast: **TASK-009** art for ornament tuning.

## Primary runtime files

- [`GameplayHudBar.tsx`](../../../../src/renderer/components/GameplayHudBar.tsx)
- [`GameScreen.tsx`](../../../../src/renderer/components/GameScreen.tsx), [`GameScreen.module.css`](../../../../src/renderer/components/GameScreen.module.css)
- [`contracts.ts`](../../../../src/shared/contracts.ts) (lives / caps)

## Evidence artifacts

- `top-bar-details.png`, `main-game-screen.png`; legacy `hud-*.png` as listed in **§4** quick-captures.

## Cross-links

- [`../TASKS_HUD_PARITY.md`](../TASKS_HUD_PARITY.md) (`HUD-*`)
- [`../TASKS_ARCHIVE_PARITY.md`](../TASKS_ARCHIVE_PARITY.md)
