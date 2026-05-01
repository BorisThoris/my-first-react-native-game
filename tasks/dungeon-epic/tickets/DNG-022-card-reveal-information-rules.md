# DNG-022: Card reveal and information rules

## Status
Done

## Priority
P1

## Subsystem
Board encounter system

## Depends on
- `DNG-020`

## Current repo context
Dungeon pairs can reveal on flip, peek, trap effects, rooms, and alarm/hex effects.

## Problem
Players need fair information rules. Hidden dungeon content should feel mysterious, not arbitrary.

## Target experience
Players understand what is known, unknown, peeked, revealed, armed, resolved, and claimed.

## Implementation notes
- Added `getDungeonCardKnowledge` to classify dungeon tile knowledge as hidden, revealed, resolved, or none.
- The selector reports family-known, effect-known, claimable, family label, effect label, and state label without mutating or claiming rewards.
- `TileBoard` ARIA dungeon copy now uses the shared knowledge selector, keeping hidden/revealed/resolved label decisions aligned with shared rules.
- Added tests for hidden, face-up, revealed, and resolved knowledge behavior.

## Acceptance criteria
- Reveal rules are documented and tested for each card family.
- Peek/scry/room effects cannot accidentally claim rewards.
- Hidden/revealed/resolved copy is consistent.

## Tests and verification
- `yarn test src/shared/dungeon-cards.test.ts src/shared/game.test.ts src/renderer/components/TileBoard.test.tsx`
- `yarn typecheck`

## Risks and edge cases
- Risk: too much information removes tension. Mitigation: reveal family first, exact reward only when appropriate.

## Cross-links
- `DNG-064`
- `../../refined-experience-gaps/REG-064-player-facing-copy-glossary-and-rules-language.md`

## Future handoff notes
Codex/help can now build reveal-state language from `getDungeonCardKnowledge` plus the taxonomy rows. Future reveal effects should update the selector tests if they introduce partial knowledge beyond family/effect visibility.
