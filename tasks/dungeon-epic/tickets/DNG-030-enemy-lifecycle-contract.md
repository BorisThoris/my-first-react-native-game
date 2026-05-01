# DNG-030: Enemy lifecycle contract

## Status
Done

## Priority
P0

## Subsystem
Enemies and bosses

## Depends on
- `DNG-002`
- `DNG-025`

## Current repo context
Moving enemies are represented by `EnemyHazardState`; dungeon enemy card pairs are separate card content with HP.

## Problem
The game now has two enemy representations. Their relationship must be explicit so future work does not duplicate or conflict.

## Target experience
Enemies are readable board pressure: spawned, hidden/patrolling, revealed by contact or effects, damaged by matches, defeated by HP or floor clear, and summarized in objectives.

## Implementation notes
- Added `getDungeonEnemyLifecycleStatus` as the shared read model for enemy card pairs versus moving enemy patrol hazards.
- Enemy card pairs remain separate passive/HP targets; moving enemy patrols remain `EnemyHazardState` overlays. This ticket does not make card pairs spawn patrols.
- Added `06-enemy-lifecycle-contract.md` with vocabulary, lifecycle state diagram, and counter contract.
- Lifecycle tests cover generated enemy card defeat, moving patrol spawn/contact reveal, and floor-clear patrol defeat.

## Acceptance criteria
- Lifecycle has a state diagram in docs or tests.
- Enemy counters and objective progress are consistent.
- Floor-clear sweep behavior is locked.

## Tests and verification
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`
- `yarn typecheck`

## Risks and edge cases
- Risk: "enemy" term becomes ambiguous. Mitigation: code comments and player copy distinguish patrol enemies from enemy cards where needed.

## Cross-links
- `../02-architecture-diagrams.md`
- `DNG-032`

## Future handoff notes
Future enemy work should use `getDungeonEnemyLifecycleStatus` for counts/copy and keep card-pair enemies separate from moving patrol overlays unless a later ticket explicitly introduces spawning.
