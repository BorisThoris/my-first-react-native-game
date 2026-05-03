# SCS-005: Trap Workshop Room

## Status
Planned

## Priority
P1

## Source Theory
- Pass 4: Trap Workshop Room.
- Pass 5: The Saboteur and The Seer.

## Player Decision
Use a room action to resolve immediate trap pressure or reveal trap information for later matching.

## Current System Connection
- Room activation.
- Trap armed/resolved state.
- Trap workshop behavior already sketched in shared rules.

## Proposed Behavior
Refine Trap Workshop as a one-shot utility room: resolve one armed trap if present, otherwise reveal one hidden trap family clue if eligible.

## UI / Visual / Audio
Use Safe, Armed, Resolved, Hidden-known, and Cost tokens. The prompt must show which branch will happen before activation.

## Memory-Tax Score
Information bypass 1, spatial disruption 0, mistake recovery 1, hidden punishment 0, board-completion risk 1, UI load 2. Total 5.

## Risks
Workshop can trivialize trap floors if it resolves too many traps or lacks a cost/one-shot limit.

## Acceptance Criteria
- Activation branch is previewed.
- Room cannot repeat unless explicitly designed as reusable.
- Trap objective progress and resolved counters remain consistent.

## Verification
- Unit tests for armed-trap branch, reveal branch, and no-eligible-target branch.
- Trap objective tests for progress accounting.

## Cross-links
- `../../passes/04-card-type-expansion.md`

