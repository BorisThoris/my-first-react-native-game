# CLG-003: Card and power softlock matrix

## Status
In Progress

## Priority
P0

## Source Theory
- Pass 1: completion is always provable.
- Pass 4: card softlock matrix.

## Player Decision
Ensure tactical choices cannot leave the player in a board state that looks playable but cannot finish.

## Current System Connection
- `isBoardComplete`
- `inspectBoardFairness`
- Destroy, shuffle, peek, stray, wild, route cards, traps, shops, rooms, exits, keys, locks, and singleton utilities.

## Proposed Behavior
Create a matrix that every future card/power task must answer: match behavior, mismatch behavior, destroy eligibility, shuffle behavior, peek result, stray eligibility, wild interaction, route/exit interaction, contract compatibility, and board-complete fallback.

## UI / Visual / Audio
Matrix must require disabled reasons and player-facing fallback copy for any card or power that becomes unavailable.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 1, UI load 1. Total 2.

## Risks
Moving, transforming, duplicating, sealing, or removing cards can break completion if each interaction is not defined before implementation.

## Acceptance Criteria
- Matrix includes every existing card family and current core power.
- Matrix includes required rows for future card suites.
- Any `Prototype` or `Deferred` idea with board-completion risk has explicit blocked shipping status.

## Verification
- `src/shared/dungeon-cards.ts` now records semantic tokens and memory-tax scores for each shipped dungeon card family.
- `src/shared/dungeon-cards.test.ts` asserts token coverage and non-blocked memory-tax review for every shipped family.
- Existing `src/shared/softlock-fairness.test.ts` remains the active board-completion test suite for current powers and card families.
- `yarn test src/shared/dungeon-cards.test.ts`
- `yarn typecheck:shared`

## Cross-links
- `../../passes/01-core-loop-depth.md`
- `../../passes/04-card-type-expansion.md`
