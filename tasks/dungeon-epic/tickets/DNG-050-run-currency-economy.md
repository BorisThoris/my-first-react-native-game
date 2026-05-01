# DNG-050: Run currency economy

## Status
Done

## Priority
P0

## Subsystem
Rewards, economy, builds

## Depends on
- `DNG-002`
- `DNG-021`

## Current repo context
Shop gold, relic favor, combo shards, guard tokens, findables, and score rewards already exist.

## Problem
Dungeon systems create many sources and sinks. Without a unified economy contract, rewards become noisy or exploitable.

## Target experience
Players understand what they earn, what they can spend, and why a route or reward matters.

## Implementation notes
- Define source/sink table for gold, favor, guard, shards, keys, consumables, and score.
- Keep combat, treasure, shop, rest, event, and boss rewards distinct.
- Run balance simulation after changing values.

## Acceptance criteria
- Economy sources and sinks are documented and tested.
- Reward copy names currency consistently.
- Simulation bounds exist for core currencies.

## Tests and verification
- `balance-simulation.test.ts` additions.
- Unit tests for reward application.

## Risks and edge cases
- Risk: too many currencies. Mitigation: hide or merge currencies that do not create decisions.

## Cross-links
- `../../refined-experience-gaps/REG-024-economy-unification.md`
- `../../refined-experience-gaps/REG-072-wallet-run-currency-sinks-and-reward-pacing.md`

## Future handoff notes
Extended the existing run economy taxonomy with dungeon keys and source/sink coverage checks for all core currencies. Future tuning should keep this contract and balance simulation rows aligned.
