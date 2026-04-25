# REG-040: Save Failure Recovery And Local Data Trust

## Status
Open

## Priority
P0

## Area
Systems

## Evidence
- `src/main/persistence.ts`
- `src/main/persistence-write-error.test.ts`
- `src/renderer/store/persistBridge.ts`
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/SettingsScreen.tsx`
- `docs/refinement-tasks/REF-034.md`

## Problem
Save write failures are surfaced, but the overall recovery story is still thin. As progression grows, the game needs stronger data trust: backups, export/import, reset safety, and clear instructions when writes fail.

## Target Experience
Players should never wonder whether progress was lost. If saving fails, the app should explain the risk, preserve in-memory state where possible, and offer practical recovery actions.

## Suggested Implementation
- Define a save health model: ok, transient write failed, repeated write failed, read failed, corrupted save recovered.
- Add clear surfaces for export backup, retry save, open save location if allowed, and reset confirmation.
- Keep durable fields in `SaveData`; any backup metadata or health flags require `SAVE_SCHEMA_VERSION` if persisted.
- Add main-process error codes that are safe to show to users.
- Coordinate with `DesktopApi` and `IPC_CHANNELS` if new recovery actions are exposed.

## Acceptance Criteria
- Repeated save failures produce actionable user-facing copy.
- Reset and import/export flows protect against accidental loss.
- Corrupted or old saves normalize without crashing.
- Tests cover write failure and migration cases.

## Verification
- Run persistence unit tests.
- Simulate write failure and read/corrupt scenarios.
- Manual test settings save, run end save, achievement save, export, import, and reset.

## Cross-links
- `REG-032-save-profile-cloud-release-shell.md`
- `REG-039-achievement-surface-steam-offline-recovery.md`
- `REG-041-run-export-replay-seed-integrity.md`
