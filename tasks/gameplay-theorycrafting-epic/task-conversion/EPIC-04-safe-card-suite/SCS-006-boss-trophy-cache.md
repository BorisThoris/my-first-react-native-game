# SCS-006: Boss Trophy Cache

## Status
Done

## Priority
P2

## Source Theory
- Pass 4: Boss Trophy Cache.
- Pass 6: Boss Trophy Moment.

## Player Decision
Complete boss objectives cleanly for an upgraded payoff instead of treating boss floors as only punishment spikes.

## Current System Connection
- Boss objective state.
- Floor result rewards.
- Trophy/cache reward hooks.

## Proposed Behavior
Add a boss-floor reward cache that upgrades if the boss objective was completed and downgrades or disappears if failed. The requirement must be visible before or during the boss floor.

## UI / Visual / Audio
Use Objective, Reward, Momentum, and Forfeit tokens. Floor-clear should connect boss performance to trophy result.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 1, UI load 2. Total 3.

## Risks
Boss payoff can feel arbitrary if the cache appears only after the fact with no prior objective tell.

## Acceptance Criteria
- Boss trophy condition is previewed.
- Success and failure branches are deterministic.
- Floor-clear explains the result cause.

## Verification
- Unit tests for objective success/fail reward branch.
- E2E floor-clear snapshot for boss trophy payoff.

## Cross-links
- `../../passes/04-card-type-expansion.md`
- `../../passes/06-floor-and-encounter-identity.md`
