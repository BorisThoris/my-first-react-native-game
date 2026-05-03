# SCS-002: Guard Shrine Pair

## Status
Done

## Priority
P1

## Source Theory
- Pass 4: Guard Shrine Pair.
- Pass 5: The Warden.

## Player Decision
Decide when to claim protection instead of treating shrine value as passive background economy.

## Current System Connection
- Shrine/room reward logic.
- Guard token cap.
- Favor and floor-clear reward summaries.

## Proposed Behavior
Add a matched shrine pair that grants guard and optional Favor/value once. The player should see whether guard is capped and whether claiming now matters.

## UI / Visual / Audio
Use Safe, Reward, Momentum, and Resolved tokens. Floor clear should show when guard prevented damage or remained unused.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 1, hidden punishment 0, board-completion risk 1, UI load 1. Total 3.

## Risks
Guard can feel invisible if later damage prevention is not attributed back to the shrine.

## Acceptance Criteria
- Shrine pair grants guard within cap and resolves once.
- Cap/full-state copy is visible before reward claim.
- Floor-clear can show guard value when relevant.

## Verification
- Unit tests for guard cap and one-shot reward.
- UI test for capped guard copy.

## Cross-links
- `../../passes/04-card-type-expansion.md`
- `../../passes/05-build-archetypes.md`
