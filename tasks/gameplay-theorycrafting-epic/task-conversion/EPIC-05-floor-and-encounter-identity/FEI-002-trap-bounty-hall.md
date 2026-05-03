# FEI-002: Trap Bounty Hall

## Status
Done

## Priority
P1

## Source Theory
- Pass 6: Trap Bounty Hall.
- Pass 4: Disarm Bounty and Trap Workshop.

## Player Decision
Choose between safe trap control and clean disarm rewards on a trap-focused floor.

## Current System Connection
- Trap node/floor generation.
- Trap objective progress.
- Disarm Bounty and Trap Workshop tasks.

## Proposed Behavior
Create a floor/node slice where trap pressure, bounty reward, and workshop utility are presented as one coherent encounter.

## UI / Visual / Audio
Use Armed, Risk, Reward, Resolved, Forfeit, and Safe tokens. Floor-clear should report trap rewards and prevented damage.

## Memory-Tax Score
Information bypass 1, spatial disruption 0, mistake recovery 1, hidden punishment 1, board-completion risk 1, UI load 2. Total 6.

## Risks
Too many trap states can overwhelm the player if armed/resolved/bounty/workshop signals compete.

## Acceptance Criteria
- Floor intro explains trap bounty decision.
- Disarm and workshop actions have clear cause/result feedback.
- Trap objective and completion remain deterministic.

## Verification
- E2E trap floor clear and failed trap run.
- Softlock tests with trap bounty and workshop together.

## Cross-links
- `../EPIC-04-safe-card-suite/SCS-001-disarm-bounty.md`
- `../EPIC-04-safe-card-suite/SCS-005-trap-workshop-room.md`
