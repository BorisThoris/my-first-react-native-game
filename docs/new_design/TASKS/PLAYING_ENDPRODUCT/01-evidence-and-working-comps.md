# 01 — Evidence and working comps (`PLAY-010`)

**`PLAY-*` ID:** **PLAY-010** (P0)

## Current delta vs `ENDPRODUCTIMAGE.png`

The **audit** is not a single screenshot: it is the **reproducible set** of live crops and section 4 tables in [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) **§4**. When `hud-inspect` or `visual-endproduct-parity` output or the doc drifts, evidence is stale and downstream `PLAY-*` work is unverifiable.

## Required end state

- `hud-inspect` + `visual-endproduct-parity` run on demand; **stable basenames** under `test-results/endproduct-parity/` (or `VISUAL_CAPTURE_ROOT`) match the table in **§4** “Quick captures”.
- **§4** row text and **Tracking** links stay aligned with this pack and the live app.
- **WIP reference extraction:** `yarn wip:extract-endproduct` outputs under [`docs/wip-assets/png/`](../../../wip-assets/png/), [`docs/wip-assets/svg/`](../../../wip-assets/svg/), [`docs/wip-assets/index.json`](../../../wip-assets/index.json) for designer side-by-side review ([`docs/wip-assets/README.md`](../../../wip-assets/README.md)).

## Acceptance criteria

- Anyone can regenerate evidence with the commands in [`../README.md`](../README.md) (parity cadence) and match filenames listed below.
- After gameplay chrome changes, **§4** is updated or the PR states why not.

## Dependencies

- None (gates other `PLAY-*`).

## Primary files / specs

- [`e2e/hud-inspect.spec.ts`](../../../../e2e/hud-inspect.spec.ts)
- [`e2e/visual-endproduct-parity.spec.ts`](../../../../e2e/visual-endproduct-parity.spec.ts)
- [`e2e/visualScreenHelpers.ts`](../../../../e2e/visualScreenHelpers.ts)
- [`src/renderer/dev/runFixtures.ts`](../../../../src/renderer/dev/runFixtures.ts)

## Evidence artifacts to regenerate

**Command:** `yarn playwright test e2e/hud-inspect.spec.ts e2e/visual-endproduct-parity.spec.ts --workers=1` → `test-results/endproduct-parity/` (override with `VISUAL_CAPTURE_ROOT`).

| Artifact | Purpose |
|----------|---------|
| `main-game-screen.png` | Full gameplay shell vs main panel in `ENDPRODUCTIMAGE.png` |
| `top-bar-details.png` | HUD chrome vs top-bar detail panel |
| `sidebar-menu.png` | Collapsed in-game rail vs sidebar panel |
| `card-face-down.png`, `card-hover.png`, `card-flipped.png`, `card-matched.png` | Card-state grammar |
| `interaction-flip.png`, `interaction-match.png`, `interaction-mismatch.png` | Motion / resolve language |
| `hud-metrics.json`, `hud-fragment.html` | Layout diagnostics |
| `hud-1280x720.png`, `hud-1440x900.png`, `hud-1440x900-arcade.png` | Legacy HUD crops (HUD parity) |
| `tile-board-*.png` | Legacy board crops (board / FX parity) |

Full scenario stills for **§1–§3** of the audit: see [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) “How the captures were produced” and **§6** regeneration (`visual-screens.standard.spec.ts`, `VISUAL_CAPTURE_ROOT=docs/reference-comparison/captures`).

## Process notes (reference captures and scenario matrix)

- **Scenario ↔ panel matrix:** [`REFERENCE_VS_SCENARIOS.md`](../../REFERENCE_VS_SCENARIOS.md); harness: [`e2e/visualScenarioSteps.ts`](../../../../e2e/visualScenarioSteps.ts).
- **Living diff doc owner:** [`CURRENT_VS_ENDPRODUCT.md`](../../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) — viewport folders, scenario basename map, refresh when scenarios or reference stills change.
- **Capture policy:** default CI / gitignored output; optional committed baselines under `docs/reference-comparison/captures/` per [`VISUAL_REVIEW.md`](../../VISUAL_REVIEW.md). Long runs may flake — retry `--workers=1`; see audit **§6**.

## Cross-links

- `QA-001` gate described alongside **PLAY-010** in [`../README.md`](../README.md).
- Namespaced tables: use [`../TASKS_HUD_PARITY.md`](../TASKS_HUD_PARITY.md), [`../TASKS_ARCHIVE_PARITY.md`](../TASKS_ARCHIVE_PARITY.md) for completed row history.
