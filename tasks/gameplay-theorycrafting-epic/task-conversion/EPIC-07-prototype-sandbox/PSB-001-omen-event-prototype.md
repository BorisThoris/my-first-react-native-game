# PSB-001: Omen Event prototype

## Status
Prototype

## Priority
P2

## Source Theory
- Pass 4: Omen Pair.
- Pass 6: Omen Event.

## Player Decision
Remember a marked future pair or target sequence around a visible warning.

## Current System Connection
- Event/script/shadow floor identities.
- Hidden-known token.
- Objective progress reminders.

## Proposed Behavior
Prototype an Omen Pair in sandbox floors only. Revealing/matching it marks a future pair as dangerous or valuable, with persistent reminder until resolved.

## UI / Visual / Audio
Use Hidden-known, Objective, Risk, and Reward tokens. The marker must persist after animation.

## Memory-Tax Score
Information bypass 1, spatial disruption 0, mistake recovery 0, hidden punishment 2, board-completion risk 2, UI load 2. Total 7.

## Risks
Omen becomes unfair if the target is hidden without a persistent reminder or if the mark changes too often.

## Acceptance Criteria
- Prototype is gated to dev/sandbox fixtures.
- Omen target and consequence are visible.
- Target cleanup cannot softlock completion.

## Verification
- Sandbox unit tests for marker persistence and cleanup.
- Visual/a11y review for persistent marker.

## Cross-links
- `../../passes/04-card-type-expansion.md`

