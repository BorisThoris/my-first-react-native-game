# Visual review vs reference stills

## Purpose
Describe how to compare the live renderer to `ENDPRODUCTIMAGE.png` / `ENDPRODUCTIMAGE2.png` (or exported crops) using Playwright captures, without implying committed PNGs are required in git.

## Canonical regression gate
- Run `yarn test:e2e:visual` from the repo root (Playwright starts Vite per `playwright.config.ts`).
- Default capture output: `test-results/visual-screens/` (typically gitignored).
- Override output root: set `VISUAL_CAPTURE_ROOT` to a stable folder (for example `docs/visual-capture`) before running the same command.

## Optional documentation captures
- `yarn capture:visual-inventory` — writes under `docs/visual-capture` when `VISUAL_CAPTURE_ROOT` is set in that script.
- `yarn docs:visual-inventory` — regenerates markdown inventory from captured PNGs.

## Review workflow (suggested)
1. Generate captures for the viewport set you care about (mobile + standard projects).
2. Open reference stills beside `test-results/visual-screens/<device>/<orientation>/*.png` (or your `VISUAL_CAPTURE_ROOT` mirror).
3. Use [REFERENCE_VS_SCENARIOS.md](REFERENCE_VS_SCENARIOS.md) to map each reference panel to a scenario name.
4. File gaps under `docs/new_design/TASKS/TASK-009`–`TASK-019` or update [CURRENT_VS_TARGET_GAP_ANALYSIS.md](CURRENT_VS_TARGET_GAP_ANALYSIS.md).

## Policy choice (team)
- **CI-only artifacts:** rely on `test-results/` from pipeline; do not commit large binaries.
- **Committed baselines:** check in a curated subset under `docs/visual-capture` for design review; document the policy here and in TASK-008 notes.

### Recorded default (this repo)
- **Regression / CI:** Treat **`test-results/visual-screens/`** (or the default `VISUAL_CAPTURE_ROOT`) as the normal output—**gitignored**, no binary commit required for green builds.
- **Human audit vs `ENDPRODUCTIMAGE*.png`:** When you need stable paths in docs or PR discussion, regenerate into **`docs/reference-comparison/captures/`** with  
  `cross-env VISUAL_CAPTURE_ROOT=docs/reference-comparison/captures yarn playwright test e2e/visual-screens.standard.spec.ts --workers=1`  
  (see [CURRENT_VS_ENDPRODUCT.md](../reference-comparison/CURRENT_VS_ENDPRODUCT.md)). **Commit those PNGs only** when a change intentionally updates marketing or design-review baselines; otherwise keep them local or attach to the PR as artifacts.
- **Mobile + tablet + desktop:** Full `yarn test:e2e:visual` after mobile flyout/HUD fixes should pass; if a viewport flakes, prefer bumping scenario timeouts in `e2e/visualScenarioSteps.ts` over disabling the scenario.

## Related tasks
- [TASK-014](TASKS/TASK-014-visual-reference-captures-and-diff-process.md)
- [TASK-019](TASKS/TASK-019-reference-stills-and-scenario-audit-matrix.md)
- [TASK-008](TASKS/TASK-008-gap-surfaces-and-regression.md)
- [TASK-020](TASKS/TASK-020-endproduct-screenshot-audit-and-captures.md)
