# DNG-064: Codex glossary and help

## Status
Done

## Priority
P0

## Subsystem
Presentation, audio, UX

## Depends on
- `DNG-020`
- `DNG-024`

## Current repo context
Mechanics encyclopedia, Codex screen, and copy tests exist.

## Problem
Deep dungeon mechanics will be misunderstood unless glossary, Codex, HUD, and card copy use the same language.

## Target experience
Players can look up every dungeon term and trust that in-game copy matches rules.

## Implementation notes
- Add dungeon glossary terms for enemy, patrol, trap, key, lock, exit, room, shrine, treasure, route, boss, elite, objective.
- Keep terminology aligned with hazard vocabulary.
- Add drift tests where constants are referenced.

## Acceptance criteria
- Every shipped dungeon mechanic has Codex/help coverage.
- Copy avoids conflicting terms.
- Rules changes update encyclopedia tests.

## Tests and verification
- Mechanics encyclopedia tests.
- Copy-tone and glossary tests.

## Risks and edge cases
- Risk: long copy in play surfaces. Mitigation: short HUD copy, detailed Codex copy.

## Cross-links
- `../../refined-experience-gaps/REG-064-player-facing-copy-glossary-and-rules-language.md`
- `../../refined-experience-gaps/REG-138-rules-encyclopedia-drift-and-forbidden-combos.md`

## Future handoff notes
Dungeon glossary terms now cover enemies, patrols, trap cards, keys, locks/exits, rooms, rest shrines, treasure caches, route cards, boss floors, elite anchors, and objectives. The mechanics encyclopedia version was bumped and the Codex board guide now includes a compact dungeon glossary row; future shipped mechanics should add glossary IDs and update the drift test.
