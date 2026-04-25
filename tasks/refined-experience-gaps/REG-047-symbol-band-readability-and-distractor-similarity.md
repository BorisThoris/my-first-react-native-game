# REG-047: Symbol Band Readability And Distractor Similarity

## Status
Open

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/tile-symbol-catalog.ts`
- `src/shared/tile-symbol-catalog.test.ts`
- `src/renderer/cardFace/`
- `docs/BALANCE_NOTES.md`
- `docs/gameplay-depth/05-app-specific-idea-backlog.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`

## Problem
Difficulty is shaped not only by pair count, but by symbol similarity, label length, silhouette, and card face readability. High-floor symbol bands can become unfair if distractors are too similar or too small on mobile.

## Target Experience
Symbol progression should increase cognitive load deliberately. Players should fail because they forgot, not because symbols are muddy, visually confusable, or poorly scaled.

## Suggested Implementation
- Audit each symbol band for shape, label length, color, silhouette, and mobile readability.
- Define target difficulty per band and per mutator.
- Add a visual or scriptable lint for duplicate/confusable labels where practical.
- Keep puzzle fixed boards synced with global symbol renames.
- Bump `GAME_RULES_VERSION` when symbol generation semantics change.

## Acceptance Criteria
- Each symbol band has a documented readability and difficulty purpose.
- First transition into letters/callsigns is playtested.
- Mobile card faces remain legible at smallest supported board size.
- Puzzle imports and built-ins do not drift from catalog names.

## Verification
- Run tile symbol catalog tests.
- Capture card faces for early, mid, and late bands on mobile and desktop.
- Playtest fixed seeds across band boundaries.

## Cross-links
- `REG-012-card-materials-and-interaction-fx.md`
- `REG-056-cognitive-accessibility-and-older-player-comfort.md`
- `REG-030-telemetry-and-balance-playtest-loop.md`
