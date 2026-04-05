# Task 008: Gap Surfaces and Regression

## Status
Done (process + coverage; see notes)

## Implementation notes
- Playwright visual scenarios in `e2e/visualScenarioSteps.ts` include main flow, Choose Your Path (`01a`), collection (`01b`), menu inventory empty state (`01c-inventory-empty`), in-run inventory (`01d-inventory-active`), in-run codex (`01e-codex`), settings, gameplay, overlays, and game over. Navigation flow tests cover the new routes.
- **Snapshot policy:** Default Playwright output is under `test-results/` (gitignored). CI and local runs compare snapshots from that tree. Optional committed reference captures can be produced with `VISUAL_CAPTURE_ROOT` (see `package.json` scripts `capture:visual-inventory` / `docs:visual-inventory`) for documentation review; the canonical regression gate remains `yarn test:e2e:visual` with the project’s snapshot path configuration.

## Priority
Medium

## Objective
Resolve how future-scope surfaces are represented in the redesign work and refresh visual regression coverage for the affected live screens.

## Source Reference
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`
- `docs/new_design/IMPLEMENTATION_SEQUENCE.md`
- `e2e/visualScenarioSteps.ts`

## Affected Areas
- future gap documentation
- Playwright visual coverage
- updated acceptance snapshots for redesigned screens

## Dependencies
- All live-screen redesign work that is actually implemented

## Implementation Outcomes
- Collection, inventory, codex, and Choose Your Path are live routes with Playwright visual scenarios and flow tests.
- Visual baselines cover main menu, mode select, collection, **menu-route inventory (empty `01c-inventory-empty`)**, in-run inventory (`01d-inventory-active`), in-run codex (`01e-codex`), settings (including new categories), gameplay, overlays, and game-over across standard and mobile viewports.

## Acceptance Criteria
- Every redesigned live screen has updated visual coverage.
- Future-only UI (mock settings, locked Endless card) stays labeled honestly in copy and tests.
- The test suite still anchors the current renderer flow after redesign changes.

## Out of Scope
- Rewriting unrelated e2e infrastructure
- Balance or gameplay validation beyond visual flow checks
