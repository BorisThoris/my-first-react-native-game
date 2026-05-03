# SCS-003: Scout Room

## Status
Planned

## Priority
P0

## Source Theory
- Pass 4: Scout Room.
- Pass 5: The Seer.

## Player Decision
Spend a revealed room action to gain fair information without fully solving the board.

## Current System Connection
- Room card activation.
- Peek information boundaries.
- Mystery route and hidden-known feedback.

## Proposed Behavior
Add a room action that reveals one family/category label or route-relevant clue, not an exact pair solution. It should be one-shot unless a future room variant explicitly says otherwise.

## UI / Visual / Audio
Use Hidden-known, Cost, and Reward tokens. The board should distinguish known family from exact identity.

## Memory-Tax Score
Information bypass 1, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 1, UI load 2. Total 4.

## Risks
Scout can become a solver if it reveals exact pair identity or too many labels.

## Acceptance Criteria
- Scout Room reveals scoped information only.
- Used room state is persistent.
- Screen reader copy announces known/unknown split.

## Verification
- Unit tests for reveal scope and one-shot state.
- A11y label check for hidden-known state.

## Cross-links
- `../../passes/04-card-type-expansion.md`
- `../../passes/07-ui-and-feedback-language.md`

