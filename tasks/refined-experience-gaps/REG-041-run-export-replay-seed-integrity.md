# REG-041: Run Export Replay Seed Integrity

## Status
Open

## Priority
P1

## Area
Systems

## Evidence
- `src/shared/game.ts`
- `src/shared/contracts.ts`
- `src/shared/puzzle-import.ts`
- `src/renderer/components/GameOverScreen.tsx`
- `docs/FINDABLES.md`
- `docs/LEADERBOARDS_DEFERRAL.md`
- `docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md`

## Problem
Run export and replay are useful, but they become risky as generation, mutators, findables, relics, and floor schedules evolve. A copied result is only valuable if the seed and rules reproduce the right run or fail clearly.

## Target Experience
Exports should be versioned, readable, and honest. Players can share a run or puzzle without leaking private data, and imports should explain incompatibility instead of producing wrong gameplay.

## Suggested Implementation
- Define or audit `RunExportPayload` fields: mode, seed, date key, `GAME_RULES_VERSION`, `FLOOR_SCHEDULE_RULES_VERSION`, mutators, puzzle id or tiles, and result summary.
- Validate imported payloads against current rules and supported modes.
- Keep exports free of PII and account identifiers.
- If export history is persisted, store it in `SaveData` or `PlayerStatsPersisted` with `SAVE_SCHEMA_VERSION`.
- Document how findables and floor schedules reproduce from seed and rules version.

## Acceptance Criteria
- Exported runs include enough version data to reproduce or reject safely.
- Import errors are player-readable.
- Daily/weekly share strings do not include private data.
- Rule-version changes are documented in export tests.

## Verification
- Unit test export/import round trips and incompatible version errors.
- Manual copy/paste export from game over.
- Test puzzle import errors and valid fixed-board imports.

## Cross-links
- `REG-023-daily-weekly-results-loop.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`
- `REG-063-privacy-telemetry-consent-and-pii-scrubbing.md`
