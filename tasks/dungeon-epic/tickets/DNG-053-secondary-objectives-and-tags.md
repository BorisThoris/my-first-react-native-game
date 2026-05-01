# DNG-053: Secondary objectives and result tags

## Status
Done

## Priority
P1

## Subsystem
Rewards, economy, builds

## Depends on
- `DNG-024`

## Current repo context
Secondary objectives, featured objectives, level result tags, and bonus rewards exist.

## Problem
Dungeon objectives and result tags need one coherent reward/reporting contract.

## Target experience
Players see what optional goals they completed, why they got bonuses, and what failed.

## Implementation notes
- Normalize objective result tags in `LevelResult`.
- Include dungeon-specific tags: boss defeated, traps disarmed, treasure claimed, route claimed, perfect scout.
- Keep copy short in floor-clear modal and expanded in journal/Codex.

## Acceptance criteria
- Tags are generated from rules state.
- Floor-clear results show major dungeon achievements.
- No duplicate reward payout from tags.

## Tests and verification
- Unit tests for tag generation.
- Floor-clear renderer tests if UI changes.

## Risks and edge cases
- Risk: tag spam. Mitigation: prioritize top 3 visible tags and journal the rest.

## Cross-links
- `../../refined-experience-gaps/REG-155-secondary-objectives-and-tags-deep-contract.md`
- `DNG-015`

## Future handoff notes
Secondary objectives now share a result-tag catalog with dungeon tags for boss defeated, traps disarmed, treasure claimed, route claimed, and perfect scout. Tags are generated from rules state, carry reward-bearing metadata, and are deduped before floor-clear display.
