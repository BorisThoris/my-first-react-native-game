# SCS-001: Disarm Bounty

## Status
Planned

## Priority
P0

## Source Theory
- Pass 4: Safe Near-Term Suite.
- Pass 6: Trap Bounty Hall.

## Player Decision
Choose whether to destroy a dangerous trap for safety or match it cleanly for a bounty.

## Current System Connection
- Trap card family.
- Trap armed/resolved state.
- Destroy power and reward forfeit rules.

## Proposed Behavior
Add a trap variant that pays a visible reward when matched while armed/eligible. Destroying or bypassing the pair resolves the danger but forfeits the bounty.

## UI / Visual / Audio
Use Risk, Reward, Armed, Forfeit, and Resolved tokens. Destroy targeting must preview bounty forfeit.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 1, board-completion risk 1, UI load 2. Total 4.

## Risks
The bounty becomes unfair if the player cannot see the trap state before choosing destroy vs match.

## Acceptance Criteria
- Bounty reward is visible before the player commits to destroy or match.
- Matching pays once and resolves the trap.
- Destroy resolves danger and explicitly forfeits bounty.
- No floor can require bounty for completion.

## Verification
- Unit tests for match reward, destroy forfeit, and resolved state.
- Softlock fairness test with Disarm Bounty generated on trap floor.

## Cross-links
- `../../passes/04-card-type-expansion.md`
- `../../passes/06-floor-and-encounter-identity.md`

