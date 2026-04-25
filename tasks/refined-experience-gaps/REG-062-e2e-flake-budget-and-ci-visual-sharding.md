# REG-062: E2E Flake Budget And CI Visual Sharding

## Status
Open

## Priority
P0

## Area
QA

## Evidence
- `package.json`
- `playwright.config.ts`
- `e2e/visual-screens.mobile.spec.ts`
- `e2e/visual-screens.standard.spec.ts`
- `e2e/visual-inventory-capture.spec.ts`
- `docs/reference-comparison/CURRENT_VS_ENDPRODUCT.md`
- `docs/new_design/TASKS/TASKS_A11Y_I18N_E2E.md`

## Problem
Long visual suites can time out or flake, and the current audit already hit a timeout while producing partial screenshots. Without a flake budget and sharding policy, visual regression coverage will be too slow or unreliable for bots.

## Target Experience
Visual and e2e checks should be reliable, targeted, and fast enough for iterative work. Failures should distinguish product regressions from flaky harness behavior.

## Suggested Implementation
- Define a flake budget and retry policy per spec group.
- Split visual smoke into smaller shards by viewport or screen group.
- Prefer deterministic fixtures over long interactive setup.
- Add docs for when to run smoke, full visual inventory, a11y, renderer QA, and package smoke.
- Keep screenshot outputs in gitignored locations unless intentionally refreshing tracked baselines.

## Acceptance Criteria
- P0 screen coverage can run in focused chunks.
- Long visual runs do not block bots from getting useful partial verification.
- Timeout notes and retry commands are documented.
- CI/local command names are clear.

## Verification
- Run targeted visual smoke shards after implementation.
- Confirm screenshot output location and git status behavior.
- Track timeout/flake rate over several runs.

## Cross-links
- `REG-027-visual-baseline-refresh.md`
- `REG-028-mobile-short-viewport-regression-hardening.md`
- `REG-033-bot-handoff-sequencing-and-dependency-map.md`
