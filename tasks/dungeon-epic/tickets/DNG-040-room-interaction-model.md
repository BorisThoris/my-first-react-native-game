# DNG-040: Room interaction model

## Status
Done

## Priority
P1

## Subsystem
Rooms, shops, treasure, events

## Depends on
- `DNG-020`

## Current repo context
Room cards and `revealDungeonRoom` exist with several room effects.

## Problem
Rooms need consistent activation, one-shot/resolved state, reward/risk copy, and relationship to the board.

## Target experience
Rooms feel like dungeon spaces inside the board: matching or opening them gives a clear service, clue, or risk.

## Implementation notes
- Define room effects as catalog rows.
- Decide which rooms activate on reveal, match, or player confirmation.
- Ensure room use updates state once.

## Acceptance criteria
- Room effects are listed with trigger, cost, reward, and resolved state.
- UI copy shows when a room is used or blocked.
- Tests cover each room effect.

## Tests and verification
- Shared tests for `revealDungeonRoom`.
- Renderer tests for room prompt/copy if UI changes.

## Risks and edge cases
- Risk: room opens interrupt board flow. Mitigation: use lightweight confirmation only when choices exist.

## Cross-links
- `../../refined-experience-gaps/REG-074-random-event-room-system.md`
- `DNG-044`

## Future handoff notes
Implemented v1 room effect catalog/read model with trigger, cost, reward, resolved-state, blocked/used copy, and coverage for all shipped room effects. Branching/choice rooms remain deferred to event and side-room tickets.
