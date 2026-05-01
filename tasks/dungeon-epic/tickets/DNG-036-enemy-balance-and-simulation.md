# DNG-036: Enemy balance and simulation

## Status
Done

## Priority
P1

## Subsystem
Enemies and bosses

## Depends on
- `DNG-031`
- `DNG-032`

## Current repo context
Balance simulation exists but enemy pressure metrics are limited.

## Problem
Enemy HP, damage, count, movement, and reward values need regression baselines.

## Target experience
Enemy pressure scales over the run without causing unavoidable deaths or trivial rewards.

## Implementation notes
- Add metrics: hazards per floor, boss floors, average contact risk, guard-token consumption, enemy defeat rewards.
- Sample by seed, level, node kind, and archetype.
- Keep outputs stable enough for tests.

## Acceptance criteria
- Simulation reports enemy pressure metrics.
- Bounds exist for normal, elite, boss, rest/shop edge cases.
- Failing balance output points to seed/floor.

## Tests and verification
- `balance-simulation.test.ts` additions.
- Optional CLI output for manual tuning.

## Risks and edge cases
- Risk: deterministic bot play underestimates real mistakes. Mitigation: simulate multiple simple behavior profiles.

## Cross-links
- `../../refined-experience-gaps/REG-086-balance-simulation-economy-and-drop-rate-tuning.md`
- `DNG-071`

## Future handoff notes
Added deterministic enemy-pressure metrics for moving patrols, boss patrols, elite samples, threat pairs, and contact risk. Future tuning can widen this into multiple bot profiles under `DNG-071`.
