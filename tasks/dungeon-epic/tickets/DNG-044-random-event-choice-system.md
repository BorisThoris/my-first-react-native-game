# DNG-044: Random event choice system

## Status
Done

## Priority
P1

## Subsystem
Rooms, shops, treasure, events

## Depends on
- `DNG-011`
- `DNG-004`

## Current repo context
Run event room logic exists with event choices.

## Problem
Events need deterministic choice presentation, outcome tracking, and balance boundaries.

## Target experience
Events provide interesting run decisions: take risk, gain reward, alter next floor, or decline.

## Implementation notes
- Define event catalog rows with id, conditions, choices, outcomes, and copy.
- Store chosen event outcomes in run history.
- Keep events local/offline and seed-stable.

## Acceptance criteria
- Event choices are deterministic for a run.
- Outcomes are applied once.
- Decline/cancel behavior is safe.

## Tests and verification
- Event catalog coverage tests.
- Outcome unit tests.

## Risks and edge cases
- Risk: event outcomes bypass economy limits. Mitigation: simulate rewards and costs.

## Cross-links
- `../../refined-experience-gaps/REG-074-random-event-room-system.md`
- `DNG-015`

## Future handoff notes
Implemented v1 event catalog rows with seed-stable condition copy, bounded choice result copy, safe decline coverage, and side-room idempotence tests. Run-history surfacing remains for journal/result tickets.
