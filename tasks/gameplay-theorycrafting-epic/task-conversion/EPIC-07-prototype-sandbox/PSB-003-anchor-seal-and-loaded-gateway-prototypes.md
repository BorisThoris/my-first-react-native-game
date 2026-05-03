# PSB-003: Anchor Seal and Loaded Gateway prototypes

## Status
Done

## Priority
P2

## Source Theory
- Pass 4: Anchor Seal and Loaded Gateway.
- Pass 6: anchor, event, and route identity.

## Player Decision
Stabilize a known pressure or reroll route risk with visible tradeoff.

## Current System Connection
- Anchor/n-back floors.
- Route choice and Mystery route.
- Gateway/exit cards.

## Proposed Behavior
Prototype Anchor Seal and Loaded Gateway only in authored sandbox floors. Anchor Seal freezes one previewed movement/pressure. Loaded Gateway presents a known route option and an unknown higher-variance reroll category.

## UI / Visual / Audio
Use Safe, Cost, Resolved, Risk, Reward, and Hidden-known tokens.

## Memory-Tax Score
Information bypass 1, spatial disruption 1, mistake recovery 1, hidden punishment 1, board-completion risk 2, UI load 2. Total 8.

## Risks
Gateway rerolls can feel random; seal can trivialize pressure if the frozen target is too broad.

## Acceptance Criteria
- Both prototypes are sandbox-only.
- Seal target and gateway branch are previewed.
- Route plan remains deterministic and completable.

## Verification
- Fixture tests for seal unused/used and gateway known/unknown branch.
- Softlock review for route dead ends.

## Cross-links
- `../../passes/04-card-type-expansion.md`
- `../../passes/06-floor-and-encounter-identity.md`
