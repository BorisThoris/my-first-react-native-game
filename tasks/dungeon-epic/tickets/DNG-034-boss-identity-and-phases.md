# DNG-034: Boss identity and phases

## Status
Done

## Priority
P1

## Subsystem
Enemies and bosses

## Depends on
- `DNG-030`
- `DNG-012`

## Current repo context
Boss ids exist: trap warden, rush sentinel, treasure keeper, spire observer. Boss hazards have higher HP and objective handling.

## Problem
Bosses need memorable mechanics, not just more HP.

## Target experience
Boss floors introduce a named pressure pattern with clear objective, stronger telegraphy, and a satisfying defeat result.

## Implementation notes
- Define per-boss phase or behavior modifier.
- Keep phase changes deterministic and readable.
- Add boss-specific reward hooks without breaking economy.

## Acceptance criteria
- Each boss has identity, rule hook, reward hook, and copy.
- Boss objective completion is tested.
- Boss visual/audio placeholders are listed.

## Tests and verification
- Boss-specific shared tests.
- Renderer smoke for boss marker/copy.

## Risks and edge cases
- Risk: phase rules become too complex. Mitigation: one signature modifier per boss for v1.

## Cross-links
- `../../refined-experience-gaps/REG-076-boss-elite-encounter-identity.md`
- `DNG-063`

## Future handoff notes
Implemented v1 boss identity as shared definitions/read models for all four boss ids. Visual/audio work remains placeholder-only for `DNG-063`, `DNG-061`, and `DNG-062`.
