# ARM-004: Gambit, Seer, and Catalyst engines

## Status
Done

## Priority
P2

## Source Theory
- Pass 5: The Gambit, The Seer, and The Catalyst.
- Pass 3: actions and contextual surfaces.

## Player Decision
Understand risk manipulation, fair information, and clean-play momentum as distinct build paths.

## Current System Connection
- Route wager and Mystery route.
- Pin, peek, stray, scout, hidden-known state.
- Combo shards, parasite hooks, featured objectives.

## Proposed Behavior
Create UI and rule hooks that distinguish risk-taking from scouting from engine momentum. Gambit should show risk before acceptance; Seer should avoid full-solver information; Catalyst should show shard/clean-play state.

## UI / Visual / Audio
Use Risk, Hidden-known, Cost, Reward, Objective, Build, and Momentum tokens.

## Memory-Tax Score
Information bypass 1, spatial disruption 0, mistake recovery 1, hidden punishment 1, board-completion risk 1, UI load 2. Total 6.

## Risks
These builds can overlap too much if route risk, scout info, and shard rewards are not separated clearly.

## Acceptance Criteria
- Gambit prompts show downside and payoff before commitment.
- Seer tools state information scope.
- Catalyst state shows why momentum changed.

## Verification
- E2E flows for route wager, scout reveal, and shard gain/spend once implemented.
- Copy review for build differentiation.

## Cross-links
- `../../passes/05-build-archetypes.md`

