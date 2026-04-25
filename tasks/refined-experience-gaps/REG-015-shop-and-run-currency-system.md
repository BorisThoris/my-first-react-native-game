# REG-015: Shop And Run Currency System

## Status
Open

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/game.ts`
- `src/shared/save-data.ts`
- `src/shared/relics.ts`
- `src/renderer/components/FloorClearOverlay.tsx`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
- `docs/COLLECTIBLE_SYSTEM.md`

## Problem
No shop, vendor, or run-currency loop exists yet, despite docs and genre expectations pointing toward one. Relic picks and rewards can create some run texture, but they do not give the player a recurring spend/save decision.

## Target Experience
Runs should include a clear temporary economy: earn during play, spend at shops or vendors, choose between immediate power and future flexibility, and leave the run with a readable reward summary.

## Suggested Implementation
- Define temporary run currency, likely stored on `RunState`.
- Add currency reward events from floor clear, contracts, combo thresholds, or special cards.
- Add a shop node or overlay with relics, consumables, rerolls, healing/rest equivalents, or mode-specific offers.
- Keep permanent economy separate from temporary run economy in `SaveData` and `PlayerStatsPersisted`.
- Any persisted currency or shop history requires `SAVE_SCHEMA_VERSION`; rules-affecting shop behavior may require `GAME_RULES_VERSION`.

## Acceptance Criteria
- The player can earn a run currency and spend it at least once per eligible run.
- Shop offers create meaningful choices and show clear costs.
- Currency resets or converts according to documented rules at run end.
- UI explains why an item is affordable, unavailable, owned, or incompatible.

## Verification
- Unit test currency earn/spend rules where shared logic is added.
- Manual run through shop entry, purchase, insufficient funds, reroll, and run end.
- Capture shop overlay on phone and desktop.

## Cross-links
- `REG-017-between-floor-route-choice.md`
- `REG-024-economy-unification.md`
- `REG-019-relic-build-archetypes.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
