# Playing endproduct task pack (`PLAY-*`)

Gameplay parity work targets the **top-left gameplay composite** in [`docs/ENDPRODUCTIMAGE.png`](../../../ENDPRODUCTIMAGE.png): HUD, sidebar, stage, cards, interactions, typography.

## Source of truth for open gaps

- **Screenshot audit:** [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4** (differences table, capture paths, artifact basenames).
- **Execution backlog:** this directory — decision-complete area files below. Do not duplicate long tables in [`TASKS_PLAYING_ENDPRODUCT.md`](../TASKS_PLAYING_ENDPRODUCT.md) (thin landing only).

Named parity tables (**`HUD-*`**, **`SIDE-*`**, **`CARD-*`**, **`FX-*`**, **`TBF-*`**, **`DS-*`**) stay authoritative in their existing files; each area doc links to them where relevant.

---

## Priority order

1. **PLAY-010** — Evidence loop and working comps (`01-evidence-and-working-comps.md`).
2. **PLAY-001** → **PLAY-002** — Sidebar IA / flyout decision, then medallion + icon family (`02-sidebar.md`).
3. **PLAY-003** + **PLAY-005** — HUD IA and floor-badge hierarchy (`03-hud.md`).
4. **PLAY-004** — Lives presentation vs mock (`03-hud.md`).
5. **PLAY-006** — Stage / dais / torch (`04-environment-stage.md`).
6. **PLAY-007** → **PLAY-008** — Card back warmth, then face / hover / match / mismatch grammar (`05-cards.md`, `06-interactions.md`).
7. **PLAY-009** — Tutorial / pair markers in parity stills (`06-interactions.md`).
8. **PLAY-011** — Typography and palette temperature after materials settle (`07-typography-palette.md`).

---

## Area index

| File | `PLAY-*` IDs |
|------|----------------|
| [01-evidence-and-working-comps.md](./01-evidence-and-working-comps.md) | **PLAY-010** |
| [02-sidebar.md](./02-sidebar.md) | **PLAY-001**, **PLAY-002** |
| [03-hud.md](./03-hud.md) | **PLAY-003**, **PLAY-004**, **PLAY-005** |
| [04-environment-stage.md](./04-environment-stage.md) | **PLAY-006** |
| [05-cards.md](./05-cards.md) | **PLAY-007** |
| [06-interactions.md](./06-interactions.md) | **PLAY-008**, **PLAY-009** |
| [07-typography-palette.md](./07-typography-palette.md) | **PLAY-011** |

---

## Audit §4 → `PLAY-*` → primary file

Each **§4** gameplay row maps to exactly one **`PLAY-*`** ID; each ID is owned by exactly one area file.

| §4 topic (CURRENT_VS_ENDPRODUCT §4) | `PLAY-*` | Primary file |
|-------------------------------------|----------|---------------|
| HUD segmentation | PLAY-003 | `03-hud.md` |
| Daily / parasite proportions | PLAY-003 | `03-hud.md` |
| Sidebar composition | PLAY-001, PLAY-002 | `02-sidebar.md` |
| Board framing / dais | PLAY-006 | `04-environment-stage.md` |
| Card backs | PLAY-007 | `05-cards.md` |
| Hover | PLAY-008 | `06-interactions.md` |
| Card faces | PLAY-008 | `06-interactions.md` |
| Flip interaction | PLAY-008 | `06-interactions.md` |
| Matched state | PLAY-008 | `06-interactions.md` |
| Match interaction | PLAY-008 | `06-interactions.md` |
| Mismatch | PLAY-008 | `06-interactions.md` |
| Tutorial / pair markers | PLAY-009 | `06-interactions.md` |
| Typography / palette temperature | PLAY-011 | `07-typography-palette.md` |
| Evidence / captures / doc sync | PLAY-010 | `01-evidence-and-working-comps.md` |

**Note:** Floor badge vs mock (shield / hex) is **PLAY-005** (`03-hud.md`). Lives count vs hearts mock is **PLAY-004** (`03-hud.md`).

---

## Cross-links

- [`../TASKS_SIDEBAR_PARITY.md`](../TASKS_SIDEBAR_PARITY.md) (`SIDE-*`)
- [`../TASKS_HUD_PARITY.md`](../TASKS_HUD_PARITY.md) (`HUD-*`)
- [`../TASKS_CARDS_VFX_PARITY.md`](../TASKS_CARDS_VFX_PARITY.md) (`CARD-*`, `FX-*`)
- [`../TASKS_TILE_BOARD_WEBGL_FX_V2.md`](../TASKS_TILE_BOARD_WEBGL_FX_V2.md) (`TBF-*`)
- [`../TASKS_DESIGN_SYSTEM.md`](../TASKS_DESIGN_SYSTEM.md) (`DS-*`)
- Completed `HUD-*` / `SIDE-*` rows: [`../TASKS_ARCHIVE_PARITY.md`](../TASKS_ARCHIVE_PARITY.md)
- Parity evidence cadence (commands): [`../README.md`](../README.md) — `PLAY-010` / `QA-001`
- Deferred art (stage / menu): [`../TASK-009-final-menu-and-gameplay-illustrations.md`](../TASK-009-final-menu-and-gameplay-illustrations.md)
