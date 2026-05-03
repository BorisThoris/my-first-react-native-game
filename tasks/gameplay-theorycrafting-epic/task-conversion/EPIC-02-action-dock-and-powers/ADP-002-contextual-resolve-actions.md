# ADP-002: Contextual resolve actions

## Status
Planned

## Priority
P1

## Source Theory
- Pass 3: resolve-window action family.
- Pass 7: surface contract.

## Player Decision
Make undo and gambit feel like temporary rescue windows, not permanent tools to press whenever.

## Current System Connection
- Resolving status.
- Undo resolving logic.
- Gambit third-flip logic.

## Proposed Behavior
Move resolve-only actions into a contextual strip that appears only while a pending resolve can be changed. The strip should show cost, result risk, Perfect Memory impact, and timeout/availability.

## UI / Visual / Audio
Use Risk, Cost, and Locked tokens. Include focus management and live-region copy when the strip appears or disappears.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 2, hidden punishment 0, board-completion risk 1, UI load 2. Total 5.

## Risks
If resolve actions feel permanent, players learn to flip carelessly and wait for rescue options.

## Acceptance Criteria
- Resolve strip appears only when undo/gambit can legally act.
- Strip disappears after resolve, use, or invalidation.
- Copy states Perfect Memory impact before commitment.

## Verification
- Unit tests for availability rules.
- E2E flow for mismatch -> contextual strip -> action use/no use.

## Cross-links
- `../../passes/03-powers-and-action-buttons.md`
- `../../passes/07-ui-and-feedback-language.md`

