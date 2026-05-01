# DNG-020: Dungeon card taxonomy

## Status
Done

## Priority
P0

## Subsystem
Board encounter system

## Depends on
- `DNG-002`
- `DNG-005`

## Current repo context
`DungeonCardKind` is already defined, but behavior and presentation are distributed across rules and UI.

## Problem
Card families need a single taxonomy so new mechanics do not blur enemy, trap, treasure, room, key, lock, exit, lever, shrine, shop, and gateway responsibilities.

## Target experience
Players can learn each dungeon card family once and then recognize its role on future floors.

## Implementation notes
- Added `src/shared/dungeon-cards.ts` as the shared taxonomy for card families and effect ids.
- Each `DungeonCardKind` now has a rule/copy row covering reveal timing, match reward role, mismatch consequence, objective contribution, help text, and whether it is card-pair content or singleton utility content.
- Each `DungeonCardEffectId` now has a typed row with its owning kind, label, rules role, and help text.
- `getDungeonCardCopy` now uses taxonomy family labels for gateway and fallback card copy.

## Acceptance criteria
- Every `DungeonCardKind` has a rule row and copy row.
- Tests cover catalog completeness.
- Codex/help can render from shared data or stable selectors.

## Tests and verification
- `yarn test src/shared/dungeon-cards.test.ts src/shared/softlock-fairness.test.ts src/shared/game.test.ts`
- `yarn typecheck`

## Risks and edge cases
- Risk: overcentralizing logic. Mitigation: catalog describes behavior; rules modules still execute behavior.

## Cross-links
- `../../refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md`
- `DNG-064`

## Future handoff notes
When adding card kinds or effects, update `src/shared/dungeon-cards.ts` and `src/shared/dungeon-cards.test.ts` in the same change. Rule execution can stay in `game.ts`, but the family/effect vocabulary should remain catalog-backed.
