# PSB-005: Pin Lattice prototype

## Status
Done

## Priority
P2

## Source Theory
- Pass 4: Pin Lattice Card.
- Pass 5: The Seer and The Warden.

## Player Decision
Use pin capacity deliberately to set up a memory-skill payoff.

## Current System Connection
- Pin action.
- Pin cap relics/contracts.
- Match resolution.

## Proposed Behavior
Prototype a card/relic interaction where matching a pinned or adjacent planned pair refunds limited pin value or grants a small reward. The payoff must require correct memory, not random marking.

## UI / Visual / Audio
Use Hidden-known, Momentum, Cost, and Build tokens. Pin-safe Perfect Memory language must remain clear.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 1, UI load 2. Total 3.

## Risks
Pin refunds can become busywork if players pin everything for value instead of planning.

## Acceptance Criteria
- Prototype is sandbox-only.
- Reward requires deliberate pin relation.
- Pin cap/refund limits are visible.

## Verification
- Unit tests for valid/invalid pin reward.
- UI tests for pin lattice feedback.

## Cross-links
- `../../passes/04-card-type-expansion.md`
- `../../passes/05-build-archetypes.md`
