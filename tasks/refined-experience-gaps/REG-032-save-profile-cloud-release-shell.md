# REG-032: Save Profile Cloud Release Shell

## Status
Open

## Priority
P1

## Area
Systems

## Evidence
- `src/shared/save-data.ts`
- `src/renderer/components/SettingsScreen.tsx`
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/ProfileSummary.tsx`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`

## Problem
Save slots, profile level, cloud-save behavior, backups, reset flows, and release shell expectations are not fully defined. As meta progression grows, save trust becomes part of the core user experience.

## Target Experience
Players should understand where progress lives, how to reset or export it, whether cloud sync exists, and what profile identity or level means. Release builds should avoid accidental data loss and ambiguous profile states.

## Suggested Implementation
- Define save-slot scope: single profile, multiple local profiles, or platform profile only.
- Add profile summary expectations for level, honors, cosmetics, history, and settings.
- Define export/import, reset, backup, and cloud sync states.
- Keep durable fields in `SaveData` and aggregate profile stats in `PlayerStatsPersisted`.
- Any persistence shape changes require `SAVE_SCHEMA_VERSION` and migration tests.

## Acceptance Criteria
- Settings or profile UI explains local save, reset, export/import, and cloud availability.
- Destructive reset flows require confirmation and explain consequences.
- Profile summary uses real persisted data, not placeholder values.
- Save migration tests cover current and previous schema versions.

## Verification
- Test fresh install, migrated save, export/import, reset, and corrupted save handling.
- Verify settings and profile screens show accurate save state.
- Add persistence and migration tests for new schema fields.

## Cross-links
- `REG-016-meta-progression-upgrades.md`
- `REG-023-daily-weekly-results-loop.md`
- `REG-024-economy-unification.md`
