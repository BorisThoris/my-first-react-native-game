# End-product parity — research-backed task index

This folder holds **refined implementation tasks** derived from **multi-agent codebase audits** (parallel read-only exploration) plus manual consolidation. Use these as the working backlog for closing the gap to `docs/ENDPRODUCTIMAGE.png` and `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`.

## How these tasks were produced

### Pass 1 (four agents)

Gameplay **HUD**, **sidebar** / `gameplayIcons`, **TileBoard** DOM+WebGL / shuffle, **`assets/ui`** & core Playwright specs.

### Pass 2 (six agents)

**Meta screens** (non–GameScreen shell), **Zustand view navigation** & freeze/timer contract, **overlays** / FTUE / toasts / distraction, **design tokens** vs `VISUAL_SYSTEM_SPEC`, **graphics performance** (DPR, SMAA, Pixi), **a11y / i18n / full e2e inventory** & flakes.

### Consolidation rules

- Normalized **ID namespaces** (no collisions).
- Added **acceptance criteria** and **deps** per task.
- **Cross-linked** overlapping work (e.g. `META-009` ↔ `OVR-002`, `SIDE-003` ↔ `NAV-003` / `NAV-013`).

### Specs in repo

- `docs/new_design/SCREEN_SPEC_GAMEPLAY.md`
- `docs/new_design/VISUAL_SYSTEM_SPEC.md`
- `docs/new_design/COMPONENT_CATALOG.md`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/new_design/TASKS/TASK-004-gameplay-hud-and-shell.md` (and sibling TASK-* files)

---

## Task files

### Pass 1

| File | Scope | Primary IDs |
|------|--------|-------------|
| [TASKS_HUD_PARITY.md](./TASKS_HUD_PARITY.md) | Top status bar, mutator meters, layout centering | `HUD-*` |
| [TASKS_SIDEBAR_PARITY.md](./TASKS_SIDEBAR_PARITY.md) | Left rail, flyout, icons, exit affordance | `SIDE-*` |
| [TASKS_CARDS_VFX_PARITY.md](./TASKS_CARDS_VFX_PARITY.md) | DOM/WebGL tiles, flip, match/mismatch FX | `CARD-*`, `FX-*` |
| [TASKS_ASSETS_QA.md](./TASKS_ASSETS_QA.md) | Asset paths, manifests, e2e/visual regression | `AST-*`, `QA-*` |

### Pass 2

| File | Scope | Primary IDs |
|------|--------|-------------|
| [TASKS_META_AND_SHELL.md](./TASKS_META_AND_SHELL.md) | Main menu, mode select, codex/collection/inventory, game over, meta frames | `META-*` |
| [TASKS_NAVIGATION_STATE.md](./TASKS_NAVIGATION_STATE.md) | `ViewState`, return pointers, codex-from-menu, abandon confirm | `NAV-*` |
| [TASKS_OVERLAYS_FTUE.md](./TASKS_OVERLAYS_FTUE.md) | Pause/floor/relic modal, settings modal, toasts, z-index, distraction | `OVR-*` |
| [TASKS_DESIGN_SYSTEM.md](./TASKS_DESIGN_SYSTEM.md) | Tokens, typography, rgba dedupe, spec alignment | `DS-*` |
| [TASKS_PERFORMANCE_GRAPHICS.md](./TASKS_PERFORMANCE_GRAPHICS.md) | Quality presets, DPR, WebGL lifecycle, motion vs GPU cost | `PERF-*` |
| [TASKS_A11Y_I18N_E2E.md](./TASKS_A11Y_I18N_E2E.md) | Landmarks, focus traps, live regions, i18n, extra e2e specs | `A11Y-*`, `E2E-*` |

### Cross-cutting

| File | Purpose |
|------|---------|
| [TASKS_CROSSCUTTING.md](./TASKS_CROSSCUTTING.md) | Epic order, shared risks, duplicate-task matrix, open questions |

---

## Master ID map (quick grep)

`HUD-*` `SIDE-*` `CARD-*` `FX-*` `AST-*` `QA-*` `META-*` `NAV-*` `OVR-*` `DS-*` `PERF-*` `A11Y-*` `E2E-*`

---

## Suggested implementation order (high level)

1. **DS-008**, **DS-009**, **DS-010** — cheap token cleanup reduces rework before big visual passes.
2. **PERF-002** — unblocks honest **reduceMotion** vs quality before **FX-005** / **FX-015**.
3. **HUD-001 → HUD-002**, **SIDE-001 → SIDE-004 → SIDE-006** (same as pass 1).
4. **NAV-002**, **NAV-003**, **NAV-004** — IA and safety before promoting sidebar exit (**SIDE-003**).
5. **META-001 → META-003** then **OVR-001 → OVR-002** — shared chrome for meta + in-run modals.
6. **A11Y-003**, **A11Y-004**, **A11Y-005** — alongside overlay work.
7. **CARD/FX** with **FX-016** before particles/bloom; **AST-** / **QA-** continuous.

See [TASKS_CROSSCUTTING.md](./TASKS_CROSSCUTTING.md) for the phased table and deduplication notes.

## Priority legend

- **P0** — Blocks parity, data already in game with no UI, or dangerous conflation (e.g. motion vs GPU).
- **P1** — Strong mockup alignment, navigation safety, or major a11y gap.
- **P2** — Polish, optional product, Storybook, telemetry.
- **P3** — Future (i18n stack, deep links).

## Agent provenance (internal)

**Pass 1:** HUD; sidebar/icons; TileBoard + shuffle; assets + e2e.  
**Pass 2:** Meta shell screens; `useAppStore` / `App` routing; overlays & FTUE; theme vs VISUAL_SYSTEM_SPEC; TileBoard/Pixi/PostFX/settings; a11y+i18n+e2e inventory.
