# DNG-021: Encounter generation budget

## Status
Done

## Priority
P0

## Subsystem
Board encounter system

## Depends on
- `DNG-020`
- `DNG-012`

## Current repo context
Dungeon card recipes and enemy hazard counts are generated from floor, route, archetype, node, and mode.

## Problem
As content grows, generation needs explicit budgets for threat, reward, utility, exits, and information density.

## Target experience
Floors feel varied but fair: early floors are readable, mid floors combine systems, late floors add pressure without impossible clutter.

## Implementation notes
- Added `inspectDungeonEncounterBudget` to report pair capacity, paired card count, singleton utility count, threat/reward/utility/lock/route/boss counts, objective, boss id, card-kind counts, and readable warnings.
- Blueprint creation now caps paired dungeon card specs to the board's pair capacity instead of relying on silent truncation during tile assignment.
- The cap reserves objective-critical cards first: bosses and exit levers, then route/trap/loot cards when the floor objective depends on them.
- Added deterministic tests for node/archetype budget influence and representative floor capacity coverage.

## Acceptance criteria
- Board generation cannot exceed safe content density for board size.
- Node kind and archetype influence budgets predictably.
- Budget failures produce readable test output.

## Tests and verification
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts src/shared/dungeon-cards.test.ts`
- `yarn typecheck`

## Risks and edge cases
- Risk: rewards crowd out threats or vice versa. Mitigation: budget caps and minimums.

## Cross-links
- `DNG-070`
- `../../refined-experience-gaps/REG-151-floor-archetype-mutator-objective-synergy-coverage.md`

## Future handoff notes
Future balance work should consume `inspectDungeonEncounterBudget` for seed-band summaries before adding new card families or archetype recipes.
