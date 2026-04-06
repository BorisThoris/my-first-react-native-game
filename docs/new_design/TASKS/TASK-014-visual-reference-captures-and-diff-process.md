# Task 014: Visual Reference Captures and Diff Process

## Status
Done (review process documented)

## Implementation notes
- **Audit finding:** Canonical Playwright output lives under `test-results/` (gitignored); optional committed captures use `VISUAL_CAPTURE_ROOT` / `capture:visual-inventory`. Product policy for “compare to reference PNGs” is not fully documented as a single workflow.
- **Relationship:** Complements `TASK-008-gap-surfaces-and-regression.md`.
- **Landed:** `docs/new_design/VISUAL_REVIEW.md`
- **Comparison artifact:** Row-level deltas vs `ENDPRODUCTIMAGE*.png` live in [`docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`](../../reference-comparison/CURRENT_VS_ENDPRODUCT.md). Regenerate committed baselines with e.g. `VISUAL_CAPTURE_ROOT=docs/reference-comparison/captures` and `yarn playwright test e2e/visual-screens.standard.spec.ts --workers=1` (see that doc).

## Priority
Low (process)

## Objective
Define and document how reviewers generate stable captures and diff them against `ENDPRODUCTIMAGE*.png` (or exported crops), including whether commits live under `docs/visual-capture` or CI artifacts only.

## Source Reference
- `package.json` scripts: `test:e2e:visual`, `capture:visual-inventory`, `docs:visual-inventory`
- `e2e/visualScenarioSteps.ts`
- `docs/new_design/TASK-008-gap-surfaces-and-regression.md`

## Affected Areas
- `docs/new_design/TASKS/README.md` or a short `docs/new_design/VISUAL_REVIEW.md` (if added)
- Optional CI notes in `.github/` if applicable

## Dependencies
- `TASK-008-gap-surfaces-and-regression.md`
- Reference stills available in repo (see `TASK-019`)

## Implementation Outcomes
- Written steps: how to run captures, where files land, how to compare to reference.
- Agreed policy: committed baselines vs CI-only artifacts.

## Acceptance Criteria
- A new contributor can reproduce a review pass in under 15 minutes using the doc.
- No change required to product code if policy is docs-only; otherwise minimal script tweaks.

## Out of Scope
- Pixel-diff automation product unless explicitly desired later
