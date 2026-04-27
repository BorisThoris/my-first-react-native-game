# Visual capture improvement workqueue (`UI-*`)

This folder tracks **discrete UI fixes** discovered while reviewing Playwright screenshots under [`docs/visual-capture/`](../README.md). It complements the large parity encyclopedia in [`docs/new_design/TASKS/`](../../new_design/TASKS/README.md): each `UI-NNN.md` should **link** an existing `PLAY-*`, `META-*`, or `HUD-*` row when the finding matches, or stand alone for harness/tooling gaps.

**Visual target:** Prefer *premium cleaner fantasy* (lighter elevation, less nested chrome) over maximal ornate parity; full-grid captures include **shop** via `07a-shop-screen` in [`e2e/visualScenarioSteps.ts`](../../../e2e/visualScenarioSteps.ts).

## Workflow

1. Run `yarn capture:ui-audit` then `yarn docs:visual-inventory` (see root [`package.json`](../../../package.json)).
2. Compare local PNGs (gitignored) and [`../INVENTORY.md`](../INVENTORY.md) against [`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) and [`VISUAL_SYSTEM_SPEC.md`](../../new_design/VISUAL_SYSTEM_SPEC.md).
3. Add or update [`INDEX.md`](./INDEX.md) and a [`UI-NNN.md`](./UI-001.md) file per issue.
4. Implement in `src/renderer/` with tests; gate with `yarn verify` and targeted Playwright when layout changes.

**Canonical desktop baseline for spot review:** `desktop-1280/landscape/` (see [`../README.md`](../README.md)).
