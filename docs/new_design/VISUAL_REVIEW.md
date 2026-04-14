# Visual review vs reference stills

## Purpose
Describe how to compare the live renderer to `ENDPRODUCTIMAGE.png` / `ENDPRODUCTIMAGE2.png` (or exported crops) using Playwright captures, without implying committed PNGs are required in git.

## Canonical regression gate
- Run `yarn test:e2e:visual` from the repo root (Playwright starts Vite per `playwright.config.ts`).
- This is the full named-device grid across every visual scenario, not just the smaller smoke viewports.
- Default capture output: `test-results/visual-screens/` (typically gitignored).
- Override output root: set `VISUAL_CAPTURE_ROOT` to a stable folder (for example `docs/visual-capture`) before running the same command.

## Optional documentation captures
- `yarn capture:ui-audit` writes under `docs/visual-capture` when `VISUAL_CAPTURE_ROOT` is set in that script.
- `yarn docs:ui-audit` regenerates the audit index and per-folder Markdown from captured PNGs.
- `cross-env VISUAL_CAPTURE_ROOT=test-results/visual-screens yarn docs:ui-audit` builds the workbook from the default gitignored capture output instead of the docs export folder.
- `yarn test:e2e:visual:smoke` runs the old 4-viewport suite as a faster local check.

## Review workflow (suggested)
1. Generate captures for the viewport set you care about.
2. Open reference stills beside `test-results/visual-screens/<device>/<orientation>/*.png` (or your `VISUAL_CAPTURE_ROOT` mirror).
3. Use [REFERENCE_VS_SCENARIOS.md](REFERENCE_VS_SCENARIOS.md) to map each reference panel to a scenario name.
4. File gaps under `docs/new_design/TASKS/TASK-009` through `TASK-019` or update [CURRENT_VS_TARGET_GAP_ANALYSIS.md](CURRENT_VS_TARGET_GAP_ANALYSIS.md).

## Policy choice (team)
- CI-only artifacts: rely on `test-results/` from pipeline; do not commit large binaries.
- Committed baselines: check in a curated subset under `docs/visual-capture` for design review; document the policy here and in TASK-008 notes.

### Recorded default (this repo)
- Regression / CI: treat `test-results/visual-screens/` (or the default `VISUAL_CAPTURE_ROOT`) as the normal output, gitignored, with no binary commit required for green builds.
- Human audit vs `ENDPRODUCTIMAGE*.png`: when you need stable paths in docs or PR discussion, regenerate into `docs/reference-comparison/captures/` with:

  `cross-env VISUAL_CAPTURE_ROOT=docs/reference-comparison/captures yarn test:e2e:visual:smoke`

  Commit those PNGs only when a change intentionally updates marketing or design-review baselines; otherwise keep them local or attach them to the PR as artifacts.
- **Windows shells:** if `cross-env` is not found, use `npx cross-env …` (from repo root), `.\node_modules\.bin\cross-env.cmd …`, or PowerShell: `$env:VISUAL_CAPTURE_ROOT='docs/reference-comparison/captures'; yarn test:e2e:visual:smoke`. That folder is **not** gitignored when files are tracked—treat regenerated PNGs like optional baselines (commit or revert deliberately); see [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../reference-comparison/CURRENT_VS_ENDPRODUCT.md) §6.
- Full named-device coverage: `yarn test:e2e:visual` is the acceptance gate. Use `test:e2e:visual:device-grid:shard1` through `:shard4` in CI to spread the work.

## HUD-019 / release checklist (visual baseline refresh)

Use this before release or after any epic that moves **HUD**, **GameScreen** chrome, **settings shell**, or **visual scenario steps** (`e2e/visualScenarioSteps.ts`).

1. **Full grid:** Run `yarn test:e2e:visual` from repo root (named-device matrix + every visual scenario). If a scenario flakes, retry with `--workers=1`; for desktop-only marketing stills, `-g "desktop-landscape"` on `e2e/visual-screens.standard.spec.ts` is a narrower pass (may still differ from the full grid).
2. **Stable local HUD/board gate (`PLAY-010` / `QA-001`):** `yarn playwright test e2e/hud-inspect.spec.ts e2e/visual-endproduct-parity.spec.ts --workers=1` → artifacts under `test-results/endproduct-parity/` (gitignored). Sync narrative rows in [`CURRENT_VS_ENDPRODUCT.md`](../reference-comparison/CURRENT_VS_ENDPRODUCT.md) §4–§6 when outputs or chrome change.
3. **`mobile-layout` / `[data-app-scrollport]`:** Scrollport “no vertical overflow” uses a **10px** slack in [`expectAppScrollportHasNoVerticalOverflow`](../../e2e/visualScreenHelpers.ts) (`epsilon` default). “Fully in viewport” checks use **6px**. Board/HUD geometry tolerances and settings footer slack are documented in the header comment of [`e2e/mobile-layout.spec.ts`](../../e2e/mobile-layout.spec.ts) (**QA-002**). Re-read those values after layout or safe-area changes.
4. **Committed PNGs:** Prefer CI/gitignored `test-results/visual-screens/`. Do **not** bulk-commit regenerated files under `docs/reference-comparison/captures/` unless intentionally refreshing design-review baselines—that path is **not** listed in root `.gitignore`, so refreshes show up as git changes (see [`CURRENT_VS_ENDPRODUCT.md`](../reference-comparison/CURRENT_VS_ENDPRODUCT.md) §6).

## Related tasks
- [TASKS_HUD_PARITY.md — HUD-019](TASKS/TASKS_HUD_PARITY.md) (visual baselines before release)
- [TASK-014](TASKS/TASK-014-visual-reference-captures-and-diff-process.md)
- [TASK-019](TASKS/TASK-019-reference-stills-and-scenario-audit-matrix.md)
- [TASK-008](TASKS/TASK-008-gap-surfaces-and-regression.md)
- [TASK-020](TASKS/TASK-020-endproduct-screenshot-audit-and-captures.md)
