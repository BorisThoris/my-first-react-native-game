# FEI-005: Boss Trophy Moment

## Status
Planned

## Priority
P2

## Source Theory
- Pass 6: Boss Trophy Moment.
- Pass 4: Boss Trophy Cache.

## Player Decision
Prepare for known boss pressure and connect clean boss performance to tangible payoff.

## Current System Connection
- Boss/elite encounter definitions.
- Boss objective results.
- Floor-clear reward summary.

## Proposed Behavior
Add pre-boss tells and post-boss trophy feedback to make boss floors feel like planned spikes with a reward identity.

## UI / Visual / Audio
Use Objective, Risk, Reward, and Momentum tokens. Boss floor clear should show why trophy was gained, downgraded, or lost.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 1, UI load 2. Total 3.

## Risks
Boss floors remain pressure-only if the payoff appears disconnected from the player’s decisions.

## Acceptance Criteria
- Boss pressure is previewed before the floor starts.
- Trophy condition is visible during or before the floor.
- Floor-clear causality names boss result.

## Verification
- E2E boss floor success/fail snapshots.
- Unit tests for trophy reward branch.

## Cross-links
- `../EPIC-04-safe-card-suite/SCS-006-boss-trophy-cache.md`

