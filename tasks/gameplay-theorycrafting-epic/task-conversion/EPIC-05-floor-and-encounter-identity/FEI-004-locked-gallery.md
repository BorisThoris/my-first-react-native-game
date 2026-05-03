# FEI-004: Locked Gallery

## Status
Done

## Priority
P1

## Source Theory
- Pass 6: Locked Gallery.
- Pass 4: Cache Lock.

## Player Decision
Preserve cache value, spend keys intentionally, and avoid destroying valuable treasure pairs by habit.

## Current System Connection
- Treasure floor identities.
- Key/lock/cache systems.
- Destroy forfeit preview.

## Proposed Behavior
Create a treasure floor slice where cache locks create extraction decisions. Floor 3 should teach clean extraction; floor 10 can use higher stakes or late-build payoff.

## UI / Visual / Audio
Use Reward, Cost, Forfeit, Locked, and Momentum tokens. Destroy preview is required.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 2, UI load 2. Total 4.

## Risks
Treasure value becomes invisible if the player sees only generic gold/score after the decision.

## Acceptance Criteria
- Locked Gallery differentiates early and late treasure floors.
- Cache Lock has visible key and fallback rules.
- Destroy and exit timing show cache forfeits.

## Verification
- E2E treasure floor with key, without key, and destroy use.
- Unit tests for reward branches.

## Cross-links
- `../EPIC-04-safe-card-suite/SCS-004-cache-lock.md`
