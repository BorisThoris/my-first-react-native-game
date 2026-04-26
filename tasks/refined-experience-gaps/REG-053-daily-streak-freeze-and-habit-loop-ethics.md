# REG-053: Daily Streak Freeze And Habit Loop Ethics

## Status
Done

## Priority
P2

## Area
Meta

## Evidence
- `src/shared/save-data.ts`
- `src/shared/utc-countdown.ts`
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/ChooseYourPathScreen.tsx`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`

## Problem
Daily streaks can motivate return play, but they can also become punitive or manipulative. The current streak surface needs a principled plan for freezes, missed days, rewards, and copy tone.

## Target Experience
Dailies should feel like a friendly habit, not a shame loop. Players should understand streak status, rewards, and missed-day behavior.

## Suggested Implementation
- Define daily streak rules: UTC date, completion criteria, missed day reset, freeze support, and reward limits.
- Decide if streak freezes are earned, automatic, or not supported.
- Store durable streak fields in `PlayerStatsPersisted` or `SaveData`; bump `SAVE_SCHEMA_VERSION` for new fields.
- Avoid dark-pattern copy that pressures players.
- Coordinate streak rewards with economy unification.

## Acceptance Criteria
- Daily streak UI explains current streak, next reset, and missed-day behavior.
- Rewards are clear and not required for core fairness.
- Time zone and UTC handling are documented.
- Existing saves migrate safely.

## Verification
- Unit test UTC boundary behavior and streak updates.
- Manual test daily completion, missed day, and reset states.
- Capture menu and Choose Path daily surfaces.

## Cross-links
- `REG-023-daily-weekly-results-loop.md`
- `REG-024-economy-unification.md`
- `REG-016-meta-progression-upgrades.md`
