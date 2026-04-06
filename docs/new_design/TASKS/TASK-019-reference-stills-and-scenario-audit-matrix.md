# Task 019: Reference Stills and Scenario Audit Matrix

## Status
Done (scenario matrix landed; commit reference PNGs when available)

## Implementation notes
- **Audit finding:** UI-vs-reference audits are weaker when `ENDPRODUCTIMAGE*.png` are not in-repo; mapping reference panels to Playwright scenario IDs is manual.
- **Relationship:** Supports all reference-driven tasks and `TASK-014-visual-reference-captures-and-diff-process.md`.
- **Landed:** `docs/new_design/REFERENCE_VS_SCENARIOS.md`
- **Detailed diff companion:** [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md) — scenario basenames vs `ENDPRODUCTIMAGE` / `ENDPRODUCTIMAGE2` panels and row-level UI deltas. Ongoing refresh: [`TASK-020`](TASK-020-endproduct-screenshot-audit-and-captures.md).

## Priority
Low (enablement)

## Objective
(1) Ensure reference stills live under `docs/` (or linked path) with stable names. (2) Add a short matrix document mapping each major reference panel to `e2e/visualScenarioSteps.ts` scenario `fileBase` / name and viewport sets.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- `e2e/visualScenarioSteps.ts`
- `docs/ENDPRODUCTIMAGE.png`, `docs/ENDPRODUCTIMAGE2.png` (target paths)

## Affected Areas
- `docs/` image files (add if missing and license permits)
- New markdown under `docs/new_design/` e.g. `REFERENCE_VS_SCENARIOS.md` (optional filename—keep short)

## Dependencies
- Access to final product PNGs for commit
- `TASK-014` for how captures are produced

## Implementation Outcomes
- Every major reference screen has at least one corresponding scenario id for regression capture.
- Onboarding doc answers “where is the reference?” in one paragraph.

## Acceptance Criteria
- Repo search finds `ENDPRODUCT` or documented external URL if binaries are too large for git.
- Matrix reviewed by design once.

## Out of Scope
- Replacing TASK-008 snapshot policy
