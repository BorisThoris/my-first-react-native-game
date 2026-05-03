# FEI-003: Recovery Study Room

## Status
Planned

## Priority
P1

## Source Theory
- Pass 6: Recovery Study Room.
- Pass 4: Scout Room and Guard Shrine.

## Player Decision
Use a lower-threat floor to rebuild information and protection for upcoming pressure.

## Current System Connection
- Rest/shop/breather node logic.
- Scout Room.
- Guard Shrine Pair.
- Safe route recovery.

## Proposed Behavior
Create a breather/rest slice that combines limited scouting and guard gain, then previews how it helps the next pressure floor.

## UI / Visual / Audio
Use Safe, Hidden-known, Reward, and Momentum tokens. Floor-clear should mention next-floor prep value.

## Memory-Tax Score
Information bypass 1, spatial disruption 0, mistake recovery 1, hidden punishment 0, board-completion risk 1, UI load 2. Total 5.

## Risks
Recovery floors can feel empty if the next-floor payoff is not visible.

## Acceptance Criteria
- Recovery choices affect current or next-floor decisions.
- Scout and guard feedback are visible immediately and at floor clear.
- Safe route promise remains lower variance, not best reward.

## Verification
- E2E flow through recovery floor into next floor.
- Unit tests for scout/guard rewards.

## Cross-links
- `../EPIC-04-safe-card-suite/SCS-002-guard-shrine-pair.md`
- `../EPIC-04-safe-card-suite/SCS-003-scout-room.md`

