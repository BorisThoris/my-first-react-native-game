# REG-016: Meta Progression Upgrades

## Status
Open

## Priority
P1

## Area
Meta

## Evidence
- `src/shared/save-data.ts`
- `src/shared/honorUnlocks.ts`
- `src/renderer/components/CollectionScreen.tsx`
- `src/renderer/components/InventoryScreen.tsx`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`
- `docs/COLLECTIBLE_SYSTEM.md`

## Problem
`unlocks[]` and honors exist, but there is no meaningful upgrade, cosmetic, or long-tail progression economy. Meta progress can feel like a checklist instead of a reason to keep playing.

## Target Experience
The player should see durable goals and rewards that respect game balance. Progression should create motivation, customization, and mastery without turning core runs into mandatory grind.

## Suggested Implementation
- Decide which progression rewards are gameplay-neutral cosmetics and which are gameplay-affecting upgrades.
- Add a progression board or profile track with unlock previews and completed milestones.
- Store durable progression in `SaveData` and aggregate stats in `PlayerStatsPersisted`.
- Add migration coverage for any new progression fields via `SAVE_SCHEMA_VERSION`.
- Keep balance-sensitive upgrades gated by mode rules and `GAME_RULES_VERSION` if they alter run logic.

## Acceptance Criteria
- Players can see current level, next reward, and at least one long-term goal.
- Unlocks have clear sources and visible rewards.
- Progression does not silently alter run balance without mode explanation.
- Existing saves migrate without losing current unlocks or honors.

## Verification
- Test fresh, migrated, and advanced save states.
- Verify unlock notifications, meta screen display, and post-run progress updates.
- Add persistence tests for new fields and migrations.

## Cross-links
- `REG-011-meta-screens-reward-value.md`
- `REG-024-economy-unification.md`
- `REG-025-collectibles-cosmetics-implementation.md`
