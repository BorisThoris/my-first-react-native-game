# DNG-073: Save migration and fuzzing

## Status
Not started

## Priority
P0

## Subsystem
QA and release readiness

## Depends on
- `DNG-003`
- `DNG-052`

## Current repo context
Persistence and save tests exist. Dungeon systems may add persisted state.

## Problem
New run/map/inventory/journal fields can break old saves or corrupted local data.

## Target experience
Players can update builds and resume safely, or receive a recoverable local-data path.

## Implementation notes
- Add migrations only when persisted shape changes.
- Fuzz optional/missing/null dungeon fields.
- Preserve current run or recover gracefully.

## Acceptance criteria
- Old saves normalize into valid state.
- Partial corruption does not crash startup.
- Migration tests cover new persisted dungeon fields.

## Tests and verification
- Persistence tests.
- Save-data fuzz tests.

## Risks and edge cases
- Risk: migrating active runs with obsolete rules. Mitigation: finish, reset, or safe-abandon policy documented.

## Cross-links
- `../../refined-experience-gaps/REG-089-final-rules-versioning-save-migration-gate.md`
- `../../refined-experience-gaps/REG-139-migration-fuzzing-and-partial-corruption.md`

## Future handoff notes
Run whenever `SaveData` or persisted `RunState` shape changes.

