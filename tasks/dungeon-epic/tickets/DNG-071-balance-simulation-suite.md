# DNG-071: Balance simulation suite

## Status
Done

## Priority
P0

## Subsystem
QA and release readiness

## Depends on
- `DNG-036`
- `DNG-054`

## Current repo context
Balance simulation exists and is tested.

## Problem
Dungeon depth needs long-run numerical confidence for pressure, reward, recovery, and build pacing.

## Target experience
Developers can run a deterministic simulation and see whether changes made runs too punishing, too rich, or too flat.

## Implementation notes
- Add profiles: cautious, greedy, average, high-skill.
- Track floors cleared, lives lost, guard use, currency, rewards, boss outcomes, shops visited.
- Keep runtime small for tests; allow larger CLI runs manually.

## Acceptance criteria
- Simulation metrics include dungeon-specific pressure and economy.
- Bounds are documented.
- Failures identify seed/floor/profile.

## Tests and verification
- Unit tests for default sample.
- Optional script for long-run sample.

## Risks and edge cases
- Risk: fake player model misleads tuning. Mitigation: use broad trends, not exact win-rate claims.

## Cross-links
- `../../refined-experience-gaps/REG-141-balance-regression-baseline-snapshots.md`
- `DNG-054`

## Future handoff notes
Balance simulation now includes deterministic cautious, average, greedy, and high-skill dungeon profiles. Profile metrics track floors cleared, lives lost, guard use, shop gold, reward claims, boss wins/attempts, shops visited, and first risk sample context; profile bound failures include profile/seed/floor details. Run after major reward, shop, relic, enemy, or boss tuning.
