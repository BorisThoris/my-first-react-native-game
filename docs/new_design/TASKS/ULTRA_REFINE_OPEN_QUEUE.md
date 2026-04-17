# Ultra refine visuals — open queue snapshot

**Purpose:** Lightweight index of **still-open** parity IDs referenced by the ultra-refine visual plan ([`TASKS_CROSSCUTTING.md`](./TASKS_CROSSCUTTING.md) epic order). Refresh when tasks close.

| Priority | Task IDs | Primary doc |
|----------|-----------|--------------|
| **P0** | `PLAY-010` (evidence / HUD-board captures) | [`TASKS_PLAYING_ENDPRODUCT.md`](./TASKS_PLAYING_ENDPRODUCT.md) |
| **P1 (HUD)** | `HUD-007`–`HUD-014`, `HUD-018`, `HUD-019` | [`TASKS_HUD_PARITY.md`](./TASKS_HUD_PARITY.md) |
| **P1 (playing)** | `PLAY-003`, `PLAY-007` | [`TASKS_PLAYING_ENDPRODUCT.md`](./TASKS_PLAYING_ENDPRODUCT.md) |
| **P1 (cards / WebGL)** | `TBF-001`, `TBF-002`, `CARD-*`, `FX-*` as listed in active tables | [`TASKS_TILE_BOARD_WEBGL_FX_V2.md`](./TASKS_TILE_BOARD_WEBGL_FX_V2.md), [`TASKS_CARDS_VFX_PARITY.md`](./TASKS_CARDS_VFX_PARITY.md) |
| **P1 (design system)** | `DS-005`, `DS-007`, `DS-010` | [`TASKS_DESIGN_SYSTEM.md`](./TASKS_DESIGN_SYSTEM.md) |
| **P1 (meta)** | Open rows in META table (`META-002`, `META-004` …) | [`TASKS_META_AND_SHELL.md`](./TASKS_META_AND_SHELL.md) |

**PLAY-010 baseline commands** (from [`README.md`](./README.md)): `yarn playwright test e2e/hud-inspect.spec.ts e2e/visual-endproduct-parity.spec.ts --workers=1` → inspect `test-results/endproduct-parity/` (`hud-metrics.json`, PNG crops).
