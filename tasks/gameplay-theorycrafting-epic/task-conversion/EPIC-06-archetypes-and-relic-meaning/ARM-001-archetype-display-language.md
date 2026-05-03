# ARM-001: Archetype display language

## Status
Done

## Priority
P1

## Source Theory
- Pass 5: build archetypes.
- Pass 2: talents parked, traits internal.

## Player Decision
Recognize the run's emerging identity without needing a separate talent screen.

## Current System Connection
- Relic draft.
- Run inventory.
- Codex/mechanics encyclopedia.
- HUD/floor-clear build triggers.

## Proposed Behavior
Use player-facing archetype names as descriptive build language: The Warden, The Saboteur, The Vaultbreaker, The Slayer, The Gambit, The Seer, and The Catalyst. Keep source IDs stable until implementation needs renamed identifiers.

## UI / Visual / Audio
Use Build and Momentum tokens. Show archetype fit in relic offers and floor-clear summaries without creating separate build toolbars.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 2. Total 2.

## Risks
Archetype names become empty flavor if not connected to changed decisions.

## Acceptance Criteria
- Each archetype has canonical display name, fantasy, and decision verbs.
- Relic/card/action tasks can tag archetype fit consistently.
- UI copy avoids exposing internal trait jargon as primary language.

## Verification
- Copy inventory review.
- Relic draft and Codex snapshot review after implementation.

## Cross-links
- `../../passes/05-build-archetypes.md`

