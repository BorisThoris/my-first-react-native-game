# DNG-032: Enemy contact and combat resolution

## Status
Done

## Priority
P0

## Subsystem
Enemies and bosses

## Depends on
- `DNG-030`
- `DNG-005`

## Current repo context
Enemy contact applies damage and can still allow tile flipping. Revealed enemies can be damaged by safe matches.

## Problem
Contact, guard tokens, flipping, resolving, and movement timing must remain consistent across input methods and edge cases.

## Target experience
Clicking or selecting an occupied card is risky but fair: the enemy hits, the card action continues when valid, and movement timing is predictable.

## Implementation notes
- Added `07-enemy-contact-combat-order.md` documenting contact order, combat order, movement timing, and singleton/power exceptions.
- Added shared tests for guard token absorption and fatal contact stopping the tile action before flip.
- Existing shared/store tests already cover first flip contact, second flip deferred movement, safe-match damage, boss defeat, and floor-clear defeat.

## Acceptance criteria
- Contact + flip works for first and second flip.
- Guard token absorption is tested.
- Game over from contact stops further action.
- No double hazard advance.

## Tests and verification
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`
- `yarn typecheck`

## Risks and edge cases
- Risk: powers accidentally bypass contact. Mitigation: explicit power priority tests.

## Cross-links
- `DNG-031`
- `DNG-065`

## Future handoff notes
Use `07-enemy-contact-combat-order.md` as the regression reference for keyboard/controller/power input work.
