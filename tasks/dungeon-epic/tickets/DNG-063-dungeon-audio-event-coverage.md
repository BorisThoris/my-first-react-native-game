# DNG-063: Dungeon audio event coverage

## Status
Done

## Priority
P1

## Subsystem
Presentation, audio, UX

## Depends on
- `DNG-020`
- `DNG-034`

## Current repo context
Game SFX and audio coverage tests exist. Dungeon-specific events need richer coverage.

## Problem
Enemies, bosses, traps, rooms, shops, treasure, exits, and route choices need audio identity without mix clutter.

## Target experience
Important dungeon events have clear audio confirmation and priority: contact, reveal, trap trigger, enemy defeat, boss defeat, treasure, shop purchase, exit open.

## Implementation notes
- Add an audio event matrix.
- Reuse placeholders until final assets.
- Duck or suppress overlapping sounds during resolution.

## Acceptance criteria
- Dungeon event callsites are covered by tests or inventory rows.
- Audio respects settings and gain.
- No critical event is silent unless intentionally visual-only.

## Tests and verification
- Audio interaction coverage tests.
- Manual smoke with SFX enabled/disabled.

## Risks and edge cases
- Risk: sound spam on chained resolution. Mitigation: priority/merge policy.

## Cross-links
- `../../refined-experience-gaps/REG-114-audio-final-mix-event-coverage-and-ducking.md`
- `DNG-062`

## Future handoff notes
Dungeon audio coverage now has a tested event matrix for contact, reveal, trap trigger, enemy defeat, boss defeat, treasure, shop purchase, exit open, and route choice. Rows map to existing sampled/procedural cues or explicit placeholder mappings, include gain multipliers, ducking lanes, and merge policy so final asset work can replace cue mappings without changing event semantics.
