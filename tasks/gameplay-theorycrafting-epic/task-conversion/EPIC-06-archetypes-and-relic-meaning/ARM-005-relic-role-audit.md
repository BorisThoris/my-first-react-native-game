# ARM-005: Relic role audit

## Status
Done

## Priority
P1

## Source Theory
- Pass 2: relic meaning audit.
- Pass 5: archetype matrix.

## Player Decision
Draft relics because they change board, route, action, or risk decisions, not because they are random numeric bumps.

## Current System Connection
- Relic IDs and offer pools.
- Contextual draft guarantees.
- Contracts that disable powers.

## Proposed Behavior
Audit every shipped relic against archetype fit, decision change, UI surface, and memory-tax impact. Mark generic effects for copy rescue, mechanical rescue, or retirement.

## UI / Visual / Audio
Relic offers should show decision impact and build fit, not just stat text.

## Memory-Tax Score
Information bypass 1, spatial disruption 1, mistake recovery 1, hidden punishment 0, board-completion risk 1, UI load 2. Total 6.

## Risks
Relics remain a random pile if their changed decisions are not visible at draft time and during floors.

## Acceptance Criteria
- Every current relic has archetype fit and decision-change classification.
- Generic relics have rescue direction or de-prioritization.
- Contract conflicts are documented.

## Verification
- Relic catalog review.
- Draft UI snapshot after implementation.

## Cross-links
- `../../passes/02-talents-traits-relics.md`
- `../../passes/05-build-archetypes.md`

