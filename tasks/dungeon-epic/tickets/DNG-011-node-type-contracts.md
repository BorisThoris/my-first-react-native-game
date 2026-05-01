# DNG-011: Node type contracts

## Status
Not started

## Priority
P1

## Subsystem
Run map and floor journey

## Depends on
- `DNG-010`

## Current repo context
`DungeonRunNodeKind` already influences encounter context, floor tag, archetype, shops, rest, treasure, traps, elites, and bosses.

## Problem
Node types need explicit contracts so generation, rewards, UI, and tests agree.

## Target experience
Each node kind has a promise: combat pressures memory, elite raises stakes, shop spends currency, rest recovers or risks, event offers a choice, treasure pays, boss tests the build.

## Implementation notes
- Create or update a shared node catalog.
- Define minimum and maximum card families per node.
- Define node-specific objective and reward defaults.

## Acceptance criteria
- Every node kind maps to floor tag/archetype/objective/reward policy.
- Tests assert known node kinds are covered.
- UI can render a node without switch fallthrough.

## Tests and verification
- Catalog coverage tests.
- Generation tests per node kind.

## Risks and edge cases
- Risk: too many node kinds before content exists. Mitigation: staged locked copy for deferred nodes.

## Cross-links
- `DNG-010`
- `../../refined-experience-gaps/REG-069-run-map-route-node-system.md`

## Future handoff notes
Use this ticket before adding new map nodes.

