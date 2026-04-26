# REG-023: Daily Weekly Results Loop

## Status
Done

## Priority
P1

## Area
Meta

## Evidence
- `src/shared/run-mode-catalog.ts`
- `src/shared/save-data.ts`
- `src/renderer/components/ChooseYourPathScreen.tsx`
- `src/renderer/components/GameOverScreen.tsx`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`

## Problem
Daily and weekly play lacks a full results loop: share strings, history, leaderboards, or comparison. The mode promise is weaker if the player cannot compare results or remember previous attempts.

**Scope note:** A **fully refined** v1 can ship **local** history, personal bests, and **share strings** without any **online** leaderboard integration. True online rankings and server hooks remain gated by [`REG-052`](REG-052-leaderboards-trust-model-and-online-deferral.md) and [`REG-068`](REG-068-complete-product-definition-of-done.md) (see `README` *Current product scope*).

## Target Experience
Daily and weekly runs should feel communal and repeatable within constraints. Players should see seed identity, attempt history, personal bests, streaks, and a shareable result summary.

## Suggested Implementation
- Add seeded challenge metadata and display it in mode and post-run screens.
- Persist personal daily/weekly history in `SaveData` or `PlayerStatsPersisted`.
- Generate share strings with score, floor, seed/date, mode, and key achievements.
- Define leaderboard interface expectations even if backend is deferred.
- Bump `GAME_RULES_VERSION` when challenge scoring or seed generation changes.

## Acceptance Criteria
- Daily/weekly results show personal best and current attempt summary.
- Share string is deterministic, readable, and copyable.
- Repeat attempts explain whether they count for leaderboard or personal history.
- Offline-only behavior is explicit if no backend exists.

## Verification
- Unit test seed/date result formatting and share string generation.
- Manual play daily and weekly flows across date boundaries using test clocks where available.
- Capture Choose Path and game-over daily/weekly states.

## Cross-links
- `REG-018-endless-mode-shipping-plan.md`
- `REG-030-telemetry-and-balance-playtest-loop.md`
- `REG-032-save-profile-cloud-release-shell.md`
- `REG-052-leaderboards-trust-model-and-online-deferral.md`
- `REG-068-complete-product-definition-of-done.md`
- `README.md`
