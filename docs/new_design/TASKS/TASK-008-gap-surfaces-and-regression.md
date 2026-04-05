# Task 008: Gap Surfaces and Regression

## Status
Planned

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
- Visual baselines cover menu, mode select, collection, inventory (in-run), codex (in-run), settings (including new categories), gameplay, overlays, and game-over across standard and mobile viewports.

## Acceptance Criteria
- Every redesigned live screen has updated visual coverage.
- Future-only UI (mock settings, locked Endless card) stays labeled honestly in copy and tests.
- The test suite still anchors the current renderer flow after redesign changes.

## Out of Scope
- Rewriting unrelated e2e infrastructure
- Balance or gameplay validation beyond visual flow checks
