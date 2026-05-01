# DNG-023: Traps, hazards, and status effects

## Status
Done

## Priority
P1

## Subsystem
Board encounter system

## Depends on
- `DNG-020`
- `DNG-005`

## Current repo context
Trap effects include alarm, snare, hex, and mimic-like behavior. Hazard tile planning exists in REG-157 through REG-160.

## Problem
Trap and hazard language can collide with enemy hazards, glass decoys, and accessibility focus traps.

## Target experience
Trap cards create tactical pressure with clear arming/disarming rules and no vocabulary confusion.

## Implementation notes
- Added `DungeonThreatStatus` and `getDungeonThreatStatus` to summarize trap card pairs separately from moving enemy hazards.
- `DungeonBoardStatus` now carries the shared threat status so HUD/copy can read the same vocabulary-safe state.
- Alert copy now distinguishes armed trap cards from moving enemy patrols.
- Added tests that resolved trap effects remain fair/completeable and that trap card counts do not collide with moving enemy hazard counts.
- No new status-effect slots were added; current effects are immediate or already represented by existing run fields.

## Acceptance criteria
- Trap outcomes are deterministic and tested.
- Trap copy uses approved vocabulary.
- Trap effects cannot softlock completion.

## Tests and verification
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts src/shared/dungeon-cards.test.ts`
- `yarn test src/renderer/components/GameScreen.test.tsx src/renderer/components/TileBoard.test.tsx`

## Risks and edge cases
- Risk: trap chains become opaque. Mitigation: cap chained triggers and show alert text.

## Cross-links
- `../../refined-experience-gaps/REG-148-hazard-and-trap-vocabulary.md`
- `../../refined-experience-gaps/REG-157-hazard-tile-type-taxonomy-and-outcomes.md`

## Future handoff notes
Future persistent status effects should add explicit `RunState`/`BoardState` fields and update `getDungeonThreatStatus`; avoid overloading `enemyHazards` for trap-card state.
