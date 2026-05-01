# DNG-051: Relic build archetypes

## Status
Done

## Priority
P1

## Subsystem
Rewards, economy, builds

## Depends on
- `DNG-050`

## Current repo context
Relic catalog, relic offers, favor, and relic pick services exist.

## Problem
Relics need stronger synergy with dungeon mechanics so runs develop identity.

## Target experience
Players can build toward styles: guard tank, trap control, treasure greed, boss hunter, route gambler, reveal/scout, combo shard engine.

## Implementation notes
- Group existing relics into archetypes.
- Identify missing relic hooks for dungeon cards/enemies/rooms.
- Keep relic power bounded through simulation.

## Acceptance criteria
- Each archetype has at least two support hooks or explicit deferral.
- Relic copy names dungeon interactions clearly.
- Exploit tests cover top synergy risks.

## Tests and verification
- Relic behavior tests.
- Balance/exploit tests for high-value combos.

## Risks and edge cases
- Risk: relics become required. Mitigation: keep baseline run finishable without build luck.

## Cross-links
- `../../refined-experience-gaps/REG-019-relic-build-archetypes.md`
- `DNG-055`

## Future handoff notes
Relic archetypes now use dungeon-facing build identities: guard tank, trap control, treasure greed, boss hunter, route gambler, reveal/scout, and combo shard engine. Shared archetype summaries include support hooks, dungeon interactions, and explicit deferrals for direct treasure/boss payout relics.
