# Playable Path Improvement Epics

## Status
Implemented closeout pack

## Purpose
This pack turns the expanded playable-path audit into implementation-ready epics. It is focused on what the live app still needs after proving broad click-through coverage.

This pack complements, but does not replace:

- `tasks/dungeon-epic/` for dungeon systems and long-run mechanics.
- `tasks/refined-experience-gaps/` for the complete product refinement backlog.
- `tasks/gameplay-theorycrafting-epic/` for theory-first gameplay design work.
- `e2e/playable-path-*.spec.ts` for the current executable acceptance harness.

## Current Audit Baseline
The expanded playable-path harness now runs across deterministic navigation, mode starts, interludes, readability, visual state feedback, and post-run actions.

- `yarn typecheck`: passed.
- `yarn vitest run src/shared/playable-path-fixtures.test.ts src/shared/dungeon-combinatoric-matrix.test.ts src/shared/softlock-fairness.test.ts src/renderer/components/TileBoard.test.tsx src/renderer/components/GameOverScreen.test.tsx`: passed.
- `yarn playwright test e2e/playable-path-navigation.spec.ts --workers=1 --retries=0 --reporter=list`: passed.
- `yarn playwright test e2e/playable-path-mode-matrix.spec.ts` was verified in deterministic shards with `--workers=1 --retries=0`.
- `yarn playwright test e2e/playable-path-interludes.spec.ts` was verified in deterministic shards with `--workers=1 --retries=0`.
- `yarn playwright test e2e/gameplay-readability.spec.ts --workers=1 --retries=0 --reporter=list`: passed.
- `yarn playwright test e2e/gameplay-visual-audit.spec.ts -g "captures live gameplay card states" --workers=1 --retries=0 --reporter=list`: passed.
- The full interlude spec is intentionally validated in shards on this machine because the first browser/WebGL fixture boot can consume more than a minute.

## North Star
The app should be provably playable as a complete offline-first memory roguelite path:

- A new player can start, learn, play, clear, fail, restart, and understand why each transition happened.
- Major modes are not only reachable; each has visible identity and a distinct run contract.
- Route, shop, side-room, relic, objective, hazard, and reward systems are deterministic enough to test and readable enough to trust.
- The board remains the primary gameplay object on desktop, mobile, and short viewports.
- The expanded E2E harness stays useful, bounded, and reliable enough for renderer QA.

## Epic Index
| Epic | Priority | Focus |
| --- | --- | --- |
| [PPI-001](PPI-001-deterministic-playable-path-fixtures.md) | P0 | Seeded/dev fixtures for route, shop, relic, side-room, and post-run states |
| [PPI-002](PPI-002-route-shop-side-room-loop.md) | P0 | Full route/shop/side-room decision loop in UI |
| [PPI-003](PPI-003-first-run-onboarding-to-first-clear.md) | P0 | Fresh-profile onboarding through first clear |
| [PPI-004](PPI-004-gameplay-board-hud-readability.md) | P0 | Board-first layout and HUD hierarchy |
| [PPI-005](PPI-005-card-feedback-and-state-impact.md) | P0 | Card state, match/miss feedback, reduced-motion equivalents |
| [PPI-006](PPI-006-mode-identity-and-start-contracts.md) | P1 | Distinct mode identity after start |
| [PPI-007](PPI-007-relic-draft-build-visibility.md) | P1 | Relic draft automation and build visibility |
| [PPI-008](PPI-008-meta-screens-reward-value.md) | P1 | Collection, Profile, Inventory, Codex, Settings value |
| [PPI-009](PPI-009-softlock-fairness-and-combinatoric-proof.md) | P0 | Scenario-level fairness and replayable seed proof |
| [PPI-010](PPI-010-e2e-runtime-flake-and-ci-budget.md) | P0 | Runtime, flake, and renderer-QA budget |

## Recommended Order
1. `PPI-001` - deterministic fixtures first, because later epics need stable setup.
2. `PPI-002` - route/shop/side-room loop, the largest current gameplay proof gap.
3. `PPI-003` - first-run onboarding to first clear.
4. `PPI-010` - flake/runtime budget before the harness becomes too expensive.
5. `PPI-004` and `PPI-005` - gameplay readability and feedback.
6. `PPI-006` through `PPI-009` - mode identity, relic/build value, meta value, and deeper scenario coverage.

## How Future Runs Should Use This Pack
1. Re-run or inspect the playable-path specs before selecting an epic.
2. Pick one regression or release gap and implement only the smallest complete acceptance slice.
3. Prefer deterministic state setup over long live burn-down paths.
4. Keep visual coverage separate from behavioral coverage.
5. Update this README if an epic is completed, split, or superseded by REG/DNG work.

## Done Bar
The PPI pack is complete for this pass: the harness proves the full app path without relying on nondeterministic first-floor content, major game loops have deterministic fixtures, and follow-up product work should move into the wider REG/DNG release backlog.
