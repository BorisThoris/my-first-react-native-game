# ARM-002: Warden and Saboteur feedback

## Status
Done

## Priority
P1

## Source Theory
- Pass 5: The Warden and The Saboteur.
- Pass 3: action archetype mapping.

## Player Decision
See when protection or trap-control choices mattered.

## Current System Connection
- Guard tokens.
- Trap states.
- Destroy, shuffle, row shuffle, stray remove.
- Trap Bounty Hall.

## Proposed Behavior
Add feedback patterns for guard saves, unused guard value, trap disarms, trap bounty forfeits, and controlled disruption.

## UI / Visual / Audio
Use Safe, Armed, Resolved, Forfeit, and Momentum tokens. Floor-clear should show prevented danger and trap-control value.

## Memory-Tax Score
Information bypass 0, spatial disruption 1, mistake recovery 1, hidden punishment 0, board-completion risk 1, UI load 2. Total 5.

## Risks
Saboteur can become “delete button build” if destroy has weak forfeit feedback.

## Acceptance Criteria
- Guard saves are attributed in HUD or floor-clear.
- Trap disarms and bounty forfeits are visible.
- Destroy and shuffle feedback show opportunity cost.

## Verification
- E2E trap floor with guard save and destroy forfeit.
- Unit tests for guard/trap result summaries where available.

## Cross-links
- `../../passes/05-build-archetypes.md`
- `../EPIC-05-floor-and-encounter-identity/FEI-002-trap-bounty-hall.md`

