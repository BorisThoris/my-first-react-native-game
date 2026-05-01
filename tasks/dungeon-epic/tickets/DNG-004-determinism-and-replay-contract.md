# DNG-004: Determinism and replay contract

## Status
Not started

## Priority
P0

## Subsystem
Foundation and contracts

## Depends on
- `DNG-003`

## Current repo context
Generation uses seeded helpers and named hash domains. Balance simulation and tests already assume repeatable output.

## Problem
New dungeon systems can accidentally use implicit array order, current time, UI state, or unseeded randomness.

## Target experience
Given run seed, rules version, mode, and route choices, the same floor content and outcomes are reproducible locally.

## Implementation notes
- Audit any new random selection for named seed domain.
- Keep UI animations nondeterministic only when they do not affect rules.
- Record route/event/shop choices in `RunState` if they influence future floors.

## Acceptance criteria
- New generation APIs include deterministic tests.
- Replay-sensitive choices are stored or derivable from stored state.
- No dungeon rules code calls unseeded randomness.

## Tests and verification
- Repeat-build tests for representative floors and routes.
- Replay/fairness tests for enemy movement and rewards.

## Risks and edge cases
- Risk: daily/run seeds diverge after route nodes. Mitigation: include route choice id in seed domain.

## Cross-links
- `../../refined-experience-gaps/REG-041-run-export-replay-seed-integrity.md`
- `../../refined-experience-gaps/REG-121-rng-determinism-replay-drift-audit.md`

## Future handoff notes
Use this ticket when introducing new procedural dungeon content.

