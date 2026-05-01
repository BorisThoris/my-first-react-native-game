# DNG-054: Reward pacing and drop rates

## Status
Done

## Priority
P1

## Subsystem
Rewards, economy, builds

## Depends on
- `DNG-050`
- `DNG-071`

## Current repo context
Balance simulation samples shop gold, findables, boss floors, breather floors, and relic weights.

## Problem
Deep dungeon rewards need pacing baselines so tuning does not regress silently.

## Target experience
Players regularly receive meaningful rewards, but no route or loop floods currency or trivializes danger.

## Implementation notes
- Track reward rate by source and floor band.
- Simulate node paths and simple player profiles.
- Create lower/upper bounds for core metrics.

## Acceptance criteria
- Reward pacing report includes gold, favor, shards, guard, relic offers, consumables, and treasure.
- Bounds are documented and reviewed.
- Tests fail on obvious runaway or starvation.

## Tests and verification
- Extend balance simulation.
- Add deterministic sample seeds.

## Risks and edge cases
- Risk: brittle numerical tests. Mitigation: use broad bounds and named fixture seeds.

## Cross-links
- `../../refined-experience-gaps/REG-086-balance-simulation-economy-and-drop-rate-tuning.md`
- `DNG-036`

## Future handoff notes
Balance simulation now reports deterministic reward pacing for shop gold, Favor, combo shards, guard, relic offers, consumables, treasure/cache pairs, and early/mid/late reward spread. Bounds are broad guardrails for starvation/runaway checks, not final tuning targets.
