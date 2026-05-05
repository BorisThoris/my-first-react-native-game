# PPI-010: E2E runtime, flake, and CI budget

## Status
Done

## Priority
P0

## Area
QA / CI

## Evidence
- `package.json`
- `playwright.config.ts`
- `e2e/playable-path-navigation.spec.ts`
- `e2e/playable-path-mode-matrix.spec.ts`
- `e2e/playable-path-interludes.spec.ts`
- `tasks/refined-experience-gaps/REG-062-e2e-flake-budget-and-ci-visual-sharding.md`

## Problem
The expanded playable-path harness is valuable but heavy. The full run took about 13 minutes locally, with one flaky test that passed on retry and one expected skip. If left unmanaged, the suite can become too slow or noisy for routine renderer QA.

## Target Experience
Playable-path coverage is split into fast smoke, targeted deep flows, and optional visual/deep audit runs. CI catches regressions without making every small UI change pay the full long-run cost.

## Suggested Implementation
- Classify playable specs into `smoke`, `mode-matrix`, `interlude-deep`, and `visual` tiers.
- Keep `renderer-qa` focused on stable smoke and representative deep flows.
- Move long exhaustive mode/interlude coverage behind a separate script if needed.
- Replace conditional skips with deterministic fixtures from `PPI-001`.
- Add a short flake note to the E2E README documenting known causes and recovery.

## Acceptance Criteria
- Package scripts clearly separate fast renderer QA from deep playable-path audit.
- The interlude shop test no longer conditionally skips once deterministic fixtures exist.
- Known flaky paths either become deterministic or are documented with owner and next fix.
- Failure artifacts remain trace/video-on-failure.

## Verification
- `yarn typecheck`
- Fast renderer QA command selected by this epic.
- Deep playable-path command selected by this epic.

## Placeholder and asset contract
Not applicable. Test orchestration only.

## Cross-links
- `PPI-001-deterministic-playable-path-fixtures.md`
- `../refined-experience-gaps/REG-062-e2e-flake-budget-and-ci-visual-sharding.md`
- `../refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`
