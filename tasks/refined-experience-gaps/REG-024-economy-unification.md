# REG-024: Economy Unification

## Status
Done

## Priority
P0

## Area
Systems

## Evidence
- `src/shared/game.ts`
- `src/shared/save-data.ts`
- `src/shared/relics.ts`
- `src/shared/contracts.ts`
- `docs/COLLECTIBLE_SYSTEM.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`

## Problem
Shards, favor, combo rewards, relic picks, and future shop or cosmetic currencies need one coherent reward model. Without a unified economy plan, each system can add its own token and confuse the player.

## Target Experience
The player should understand what each reward is for: temporary run power, permanent unlock progress, cosmetic collection, mastery status, or score. Rewards should never feel interchangeable unless they actually are.

## Suggested Implementation
- Create an economy map that separates temporary run currency, permanent progression, score, unlock keys, and cosmetics.
- Define conversion rules at run end, if any.
- Make reward names, icons, and summary placement consistent across gameplay and meta screens.
- Store temporary values in `RunState`; durable balances and unlocks in `SaveData` or `PlayerStatsPersisted`.
- Any durable economy shape change must include `SAVE_SCHEMA_VERSION`; score/rule changes may need `GAME_RULES_VERSION`.

## Acceptance Criteria
- Each current and planned currency has a defined purpose, source, sink, and persistence rule.
- UI labels and icons are consistent across run, post-run, shop, and meta screens.
- New shop and progression tasks can reference this model instead of inventing separate economies.
- Existing saves migrate safely when new durable fields are added.

## Verification
- Review all economy references in shared logic and UI copy.
- Add migration tests for any new persisted balances.
- Manual play through earn, spend, post-run conversion, and meta reward display.

## Cross-links
- `REG-015-shop-and-run-currency-system.md`
- `REG-016-meta-progression-upgrades.md`
- `REG-025-collectibles-cosmetics-implementation.md`
