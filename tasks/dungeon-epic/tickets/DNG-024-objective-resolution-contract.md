# DNG-024: Objective resolution contract

## Status
Done

## Priority
P0

## Subsystem
Board encounter system

## Depends on
- `DNG-005`
- `DNG-020`

## Current repo context
`getDungeonObjectiveStatus` computes progress for several objectives, including boss, pacify, loot, reveal, exit, and traps.

## Problem
Objectives must remain honest as more dungeon systems affect board state.

## Target experience
The HUD objective always tells players what is required, what is done, and why an exit or reward is blocked.

## Implementation notes
- Normalized trap and enemy objective progress around board-derived resolved pairs first.
- Run counters now only fill gaps for pairs that have been removed or had dungeon metadata cleared, preventing double-counting when resolved board state and counters overlap.
- Added objective contract coverage for find exit, bonus exit, disarm traps, pacify floor, claim route, loot cache, reveal unknowns, defeat boss, and boss-blocked exits.

## Acceptance criteria
- Every objective has completed/progress/required/detail semantics.
- Objective status cannot be UI-only.
- Boss, exit, lock, treasure, reveal, and pacify objectives are covered by tests.

## Tests and verification
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`
- `yarn typecheck`

## Risks and edge cases
- Risk: counters drift from board state. Mitigation: prefer board-derived progress where possible.

## Cross-links
- `../../refined-experience-gaps/REG-155-secondary-objectives-and-tags-deep-contract.md`
- `DNG-053`

## Future handoff notes
New objective types must add a `getDungeonObjectiveStatus` branch and tests covering incomplete, partial, completed, and blocked states where applicable.
