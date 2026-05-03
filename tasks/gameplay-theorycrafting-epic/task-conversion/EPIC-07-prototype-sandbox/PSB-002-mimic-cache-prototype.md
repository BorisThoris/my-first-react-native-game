# PSB-002: Mimic Cache prototype

## Status
Prototype

## Priority
P2

## Source Theory
- Pass 4: Mimic Cache.

## Player Decision
Use scout/control tools before claiming a suspicious treasure.

## Current System Connection
- Treasure/cache cards.
- Trap state.
- Scout Room and peek boundaries.

## Proposed Behavior
Prototype a dual treasure/trap cache in sandbox floors only. The floor or route must telegraph mimic possibility before the card can punish.

## UI / Visual / Audio
Use Risk, Reward, Armed, Hidden-known, and Forfeit tokens.

## Memory-Tax Score
Information bypass 1, spatial disruption 0, mistake recovery 0, hidden punishment 2, board-completion risk 2, UI load 2. Total 7.

## Risks
Mimic is functionally an invisible trap if suspicion is not established before harm.

## Acceptance Criteria
- Mimic possibility is route/floor-told.
- Scout/control counterplay exists.
- No first-time hidden punishment occurs without a tell.

## Verification
- Sandbox tests for telegraph, trigger, disarm, and fallback.
- E2E prototype floor with mimic suspicion shown.

## Cross-links
- `../../passes/04-card-type-expansion.md`

