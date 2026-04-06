# Task 020: End-product screenshot audit and captures

## Status
Done (audit doc, mobile visual fixes, and **recorded capture policy** in [`VISUAL_REVIEW.md`](../VISUAL_REVIEW.md) § Recorded default; re-open if policy changes)

## Implementation notes
- **Purpose:** Own the **living** row-level comparison in [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md): Playwright capture commands, viewport folders (`desktop/landscape`, `tablet/portrait`), scenario basename map, and when to refresh after reference stills or [`e2e/visualScenarioSteps.ts`](../../../e2e/visualScenarioSteps.ts) changes.
- **Relationship:** Complements [`TASK-014-visual-reference-captures-and-diff-process.md`](TASK-014-visual-reference-captures-and-diff-process.md) (process) and [`TASK-019-reference-stills-and-scenario-audit-matrix.md`](TASK-019-reference-stills-and-scenario-audit-matrix.md) (scenario id matrix). **REFERENCE_VS_SCENARIOS** maps panels to scenario IDs; **CURRENT_VS_ENDPRODUCT** documents pixel-level / composition deltas vs `ENDPRODUCTIMAGE*.png`.
- **Capture policy:** **Recorded** in [`VISUAL_REVIEW.md`](../VISUAL_REVIEW.md) — default CI/gitignored output; optional committed captures under `docs/reference-comparison/captures/` only for intentional baseline updates. [`CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) links the same.
- **Engineering fixes (mobile visual):** (1) `startClassicRunFromModeSelect` used `toBeVisible` on the **sr-only** `Level 1` heading — switched to **`toBeAttached`** in `e2e/visualScreenHelpers.ts`. (2) Utility flyout clicks were blocked by the HUD on mobile camera layout — **`z-index: 8`** on `.mobileCameraLeftToolbar` in `GameScreen.module.css` so the flyout stacks above `.mobileCameraHud`. (3) Scenarios `01d` / `01e` use **90s** test timeout and **20s** flyout/region waits plus explicit **`aria-label`** on Inventory/Codex flyout actions in `GameScreen.tsx`.

## Priority
Low (enablement and parity traceability)

## Objective
Keep the screenshot audit accurate, reproducible, and linked from task residuals; stabilize optional full-viewport visual runs.

## Source Reference
- [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md)
- [`docs/ENDPRODUCTIMAGE.png`](../../ENDPRODUCTIMAGE.png), [`docs/ENDPRODUCTIMAGE2.png`](../../ENDPRODUCTIMAGE2.png)
- [`e2e/visualScreenHelpers.ts`](../../../e2e/visualScreenHelpers.ts) (`getVisualCaptureRoot`, `buildVisualSaveJson`)

## Affected Areas
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md` (content updates)
- Optional: `e2e/visualScenarioSteps.ts`, `e2e/visualScreenHelpers.ts` (timeouts / waits)
- [`docs/new_design/VISUAL_REVIEW.md`](../VISUAL_REVIEW.md) (cross-link if policy shifts)

## Dependencies
- [`TASK-014`](TASK-014-visual-reference-captures-and-diff-process.md)
- [`TASK-019`](TASK-019-reference-stills-and-scenario-audit-matrix.md)

## Implementation Outcomes
- Contributors can regenerate desktop/tablet captures and compare to reference stills using one doc.
- Mobile visual suite completes reliably or the audit doc states the supported command explicitly.

## Acceptance Criteria
- `CURRENT_VS_ENDPRODUCT.md` stays in sync when new visual scenarios are added (map table updated).
- Decision recorded: committed captures vs CI-only (one paragraph in audit doc or `VISUAL_REVIEW.md`).
- `yarn test:e2e:visual` passes locally or remaining flake is documented with tracking issue / timeout bump.

## Out of Scope
- Automated pixel diff product
- Changing reference PNGs (design ownership)
