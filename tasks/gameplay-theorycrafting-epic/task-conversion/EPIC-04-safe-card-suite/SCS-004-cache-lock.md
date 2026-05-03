# SCS-004: Cache Lock

## Status
Done

## Priority
P1

## Source Theory
- Pass 4: Cache Lock.
- Pass 5: The Vaultbreaker.

## Player Decision
Spend a key or accept lesser value from a treasure/cache interaction.

## Current System Connection
- Key and lock state.
- Treasure rewards.
- Shop/economy hooks.

## Proposed Behavior
Add a lock/cache variant with a visible key spend branch. With a key, the player can claim upgraded cache value; without a key, the card offers a lesser fallback or remains locked according to floor rules.

## UI / Visual / Audio
Use Reward, Cost, Forfeit, and Locked tokens. HUD key count and prompt copy must agree.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 2, UI load 2. Total 4.

## Risks
Key-gated cards can block completion or hide value loss if fallback rules are not explicit.

## Acceptance Criteria
- Key spend, no-key fallback, and locked state are all visible.
- Destroy/exit interactions preview cache forfeit.
- Board completion does not require an unavailable key.

## Verification
- Unit tests for key spend and no-key fallback.
- Softlock test with locked cache and no key.

## Cross-links
- `../../passes/04-card-type-expansion.md`
