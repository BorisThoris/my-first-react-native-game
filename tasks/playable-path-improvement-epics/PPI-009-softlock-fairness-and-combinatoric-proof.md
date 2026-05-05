# PPI-009: Softlock, fairness, and combinatoric proof

## Status
Done

## Priority
P0

## Area
QA / rules safety

## Evidence
- `src/shared/softlock-fairness.test.ts`
- `src/shared/dungeon-combinatoric-matrix.ts`
- `e2e/playable-path-interludes.spec.ts`
- `tasks/user-critis/UC-004-soft-lock.md`
- `tasks/user-critis/UC-005-traps-when-last-pairs-edge-case.md`
- `tasks/refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`

## Problem
Shared tests already cover important softlock cases, but the playable path still needs scenario-level proof for combinations that players actually encounter: route, shop, side room, relic, hazard, objective, and board completion timing.

## Target Experience
Every non-terminal playable state has a visible legal next action or a clearly explained terminal state. Failures are replayable by seed and traceable to a fixture or scenario.

## Suggested Implementation
- Extend the combinatoric matrix with playable-path scenario rows.
- Add deterministic fixtures for high-risk combinations: final hazard pair, decoy near completion, shop after side room, relic draft before next floor, route lock plus objective failure.
- Ensure each scenario records seed/rules version/context in failure output where possible.

## Acceptance Criteria
- P0 playable combinations are represented in the matrix.
- Each P0 row has a unit, integration, or E2E test link.
- E2E failures expose enough seed/context to reproduce the state.
- No scenario strands the player without a legal action.

## Verification
- `yarn test src/shared/softlock-fairness.test.ts`
- `yarn test src/shared/dungeon-combinatoric-matrix.test.ts`
- Focused playable-path E2E scenarios for the highest-risk rows.

## Placeholder and asset contract
Not applicable. Rules and QA coverage only.

## Cross-links
- `../refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`
- `../refined-experience-gaps/REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `../dungeon-epic/tickets/DNG-005-softlock-and-completion-invariants.md`
- `../dungeon-epic/tickets/DNG-070-combinatoric-test-matrix.md`
