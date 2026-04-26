# REG-011: Meta Screens Reward Value

## Status
Done

## Priority
P1

## Area
Meta

## Evidence
- `src/renderer/components/CollectionScreen.tsx`
- `src/renderer/components/InventoryScreen.tsx`
- `src/renderer/components/CodexScreen.tsx`
- `src/shared/save-data.ts`
- `src/shared/honorUnlocks.ts`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`

## Problem
Collection, Inventory, and Codex are useful information screens, but they can feel read-only and low-reward. They do not yet strongly communicate mastery, progress, collection value, or reasons to return after runs.

## Target Experience
Meta screens should make the player feel that runs create lasting progress. They should reveal goals, celebrate discoveries, explain builds, and point back to meaningful next runs.

## Suggested Implementation
- Add progress meters, recent unlocks, missing discoveries, and next-goal cards.
- Connect inventory and collection entries to run history or unlock conditions.
- Add codex deep links from relics, mutators, modes, and post-run summaries.
- Store durable discovery and progress data in `SaveData` or `PlayerStatsPersisted`.
- Increment `SAVE_SCHEMA_VERSION` if new persisted collections or discovery flags are added.

## Acceptance Criteria
- Each meta screen has at least one active progress or reward signal.
- Newly unlocked or newly discovered content is highlighted.
- Empty states explain how to earn or discover content.
- Meta screens link naturally back to modes, objectives, or next runs.

## Verification
- Test fresh profile, mid-progression profile, and near-complete profile states.
- Capture screenshots for empty, partial, and completed collections.
- Verify save migration preserves existing profiles.

## Cross-links
- `REG-016-meta-progression-upgrades.md`
- `REG-021-quests-contracts-objective-board.md`
- `REG-025-collectibles-cosmetics-implementation.md`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`
