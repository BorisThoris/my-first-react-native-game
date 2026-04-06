# Cross-cutting: epic order, risks, open questions

## Epic sequence (refined)

| Phase | Epics | Rationale |
|-------|--------|-----------|
| 1 | `HUD-001`, `HUD-002`, `HUD-005` | Establish **true centered bar** and remove duplicate gauntlet/time noise before art passes. |
| 2 | `SIDE-001`, `SIDE-002`, `SIDE-004` | Extract toolbar component **before** adding icons and circular layout (easier review). |
| 3 | `SIDE-006`, `SIDE-005`, `SIDE-017` | Promote inventory/codex + illustrated assets + `assets/ui/icons/` manifest. |
| 4 | `HUD-006`, `HUD-007`, `HUD-008` | **Score parasite** and other mutator widgets depend on stable HUD grid. |
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
| Ornate pause/floor/relic chrome | `OVR-002` | `META-009`, `TASK-004` |
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
- **Z-index stack** — `.mobileCameraLeftToolbar` is `z-index: 8` above `.mobileCameraHud` (`z-index: 3`) so the utility flyout stays clickable; new HUD layers must preserve ordering (`HUD-013`).
- **Tile fingerprints** — `e2e/tile-card-face-dom.spec.ts` asserts `reference-back.png` when hidden and `front-face.png` when face-up (shared size/position/repeat); update spec if asset names or layout stack change (`QA-004`).

## Open product questions

1. **Exit / X** — Should `SIDE-003` abandon run with confirm, or only appear when paused? Affects `goToMenu` and `subscreenReturnView` (`SIDE-014`). Align with **`NAV-003`**.
2. **DOM flip arc** — `CARD-002` may fight accessibility (instant reveal preference); confirm with `reduceMotion` as default-off animation path.
3. **Post-process bloom** — `FX-015` needs **`PERF-001`** quality tier (or explicit off-default).
4. **Body font** — **`DS-001`**: Inter per spec vs keep Source Sans 3 and update spec.
5. **Nested meta** — **`NAV-009`**: does product need a true navigation stack?
6. **i18n** — **`A11Y-008`**: only if shipping beyond English.

## Doc maintenance

After shipping a major epic, update `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md` and refresh capture `04-game-playing` references (`QA-001`).
