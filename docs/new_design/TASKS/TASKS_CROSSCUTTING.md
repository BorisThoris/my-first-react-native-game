# Cross-cutting: epic order, risks, open questions

## Epic sequence (refined)

| Phase | Epics | Rationale |
|-------|--------|-----------|
| 1 | `HUD-001` (residual), `HUD-002`, `HUD-005`, **`PLAY-010`→`PLAY-003`** | Centered bar + gauntlet dedupe; **ENDPRODUCT** HUD density vs mock (`PLAY-*`). **Note:** `HUD-006` / **score parasite** UI shipped — see [`TASKS_ARCHIVE_PARITY.md`](./TASKS_ARCHIVE_PARITY.md). |
| 2 | `SIDE-002`, `SIDE-004` | **`SIDE-001` shipped** (toolbar extracted). IA doc + circular chrome before **`PLAY-001`**. |
| 3 | `SIDE-006`, **`PLAY-001`** | Inventory/codex on rail + icons manifest shipped (**`SIDE-005`**, **`SIDE-017`** archived). Remaining: **rail order vs mock**. |
| 4 | `HUD-007`, `HUD-008` | Parasite **art** pass + mutator variants (**`HUD-006`** meter shipped). |
| 5 | `CARD-001`, `FX-004`, `FX-005`, `CARD-003` | Tile parity: DOM checkmark, mismatch shake, match particles, flip pop (gated by `FX-016`). |
| 6 | `AST-*`, `QA-*` | Run continuously; **baseline refresh** after HUD and tile chrome land. |
| 7 | `DS-008`, `DS-009`, `DS-010` | Stray font + backdrop + UI rgba dedupe **before** wide META/OVR/CSS churn. |
| 8 | `PERF-002`, `PERF-001` | Split **motion** from **GPU/AA**; add quality preset before **FX-005** / **FX-015**. |
| 9 | `NAV-002`, `NAV-003`, `NAV-004`, `NAV-013` | Menu codex, abandon confirm, pointer reset — **before** or **with** **SIDE-003** exit. |
| 10 | `META-001`, `META-003`, `OVR-001`, `OVR-002`, `OVR-008` | Shared meta stage + frame language + z-index ladder for shell/modals. |
| 11 | `A11Y-003`, `A11Y-004`, `A11Y-005` | Intro trap, settings trap, toast live regions — ship with overlay tranche. |

## Overlapping tasks (do not double-count)

| Topic | Primary ID | Also see |
|-------|----------------|----------|
| Ornate pause/floor/relic chrome | `OVR-002` | `META-009`, `PLAYING_ENDPRODUCT/04-environment-stage.md` (`PLAY-006`) |
| Unified modal visual system | `OVR-001` | `META-009`, `DS-010` |
| Exit / abandon run | `SIDE-003` | `NAV-003`, `NAV-013` |
| Codex from menu | `NAV-002` | `SIDE-006` (promote to rail after entry exists) |
| Graphics quality / bloom | `PERF-001` | `FX-015`, `CARD-*` celebration |
| reduceMotion vs SMAA | `PERF-002` | `FX-016`, settings schema |
| Toast / achievement UX | `OVR-004` | `A11Y-005`, `E2E-004` |
| Z-index / distraction | `OVR-008`, `OVR-007` | `HUD-020` |

## Shared risks

- **`data-testid="game-hud"`** — Used in `e2e/mobile-layout.spec.ts` and `e2e/navigation-flow.spec.ts`; splitting the header requires `QA-003` in the same PR as layout changes.
- **`data-mobile-camera-mode="true"`** — Hard-coded `cameraViewportMode` in `GameScreen.tsx`; mobile layout tests assume full-bleed board + Fit board. Any change to camera strategy needs `HUD-012` + `QA-002`.
- **Z-index stack** — `.mobileCameraLeftToolbar` is `z-index: 8` above `.mobileCameraHud` (`z-index: 3`) so rail controls stay above the HUD on mobile camera layout; new HUD layers must preserve ordering (`HUD-013`).
- **Tile fingerprints** — `e2e/tile-card-face-dom.spec.ts` asserts `reference-back.png` when hidden and `front-face.png` when face-up (shared size/position/repeat); update spec if asset names or layout stack change (`QA-004`).

## Decision log (shipping defaults — P0–P2 parity)

These defaults unblock implementation without blocking future product reversals. Update this table when design formally changes.

| # | Topic | Decision | Affects |
|---|--------|----------|---------|
| 1 | **Exit / main menu (`SIDE-003`, `NAV-003`, `SIDE-014`)** | **Abandon run with confirmation** when a run is active and the user chooses main menu / exit from the gameplay rail. No silent drop to menu. Subscreen return (`closeSubscreen`, inventory/codex) stays non-destructive. | `GameLeftToolbar`, `useAppStore` abandon flow |
| 2 | **DOM flip arc (`CARD-002`)** | **Optional** CSS face-reveal: **on** when `data-reduce-motion='false'`; **instant / no arc** when `reduceMotion` or `prefers-reduced-motion` applies. No arc-only path required for SR beyond that. | `TileBoard.module.css`, `App` root `data-reduce-motion` |
| 3 | **Bloom (`FX-015`) vs quality (`PERF-001`)** | **Bloom and heavy celebration post-FX** are gated by **graphics quality ≥ medium** (or dedicated “effects” tier once split). **Off** on low quality. Persisted setting wins over default. | settings schema, `TileBoard` / composer |
| 4 | **Body font (`DS-001`)** | **Keep Source Sans 3** as the live body stack; **update `VISUAL_SYSTEM_SPEC.md`** if it still names Inter, so spec matches code. Inter migration is a separate design milestone. | theme CSS, spec doc |
| 5 | **Nested meta (`NAV-009`)** | **No separate navigation stack library** for P0–P2. Continue **`ViewState` + return pointers + freeze contract** documented in navigation tasks; true stack is deferred unless product rescopes. | `useAppStore`, `App.tsx` |
| 6 | **i18n (`A11Y-008`)** | **Out of scope** for P0–P2 closure (English-only). Re-open when shipping additional locales. | — |

Historical prompts (pre-decision) are preserved in git history; this section is the source of truth going forward.

## Doc maintenance

After shipping a major epic, update `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md` and refresh capture `04-game-playing` references (`QA-001`).
