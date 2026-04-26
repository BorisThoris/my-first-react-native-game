# REG-021: Quests Contracts Objective Board

## Status
Done

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/contracts.ts`
- `src/shared/game.ts`
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/GameScreen.tsx`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`

## Problem
Objectives and contracts need a clearer player-facing mastery surface. If contract logic exists but is not presented as an intentional board of goals, players miss a major source of direction and replay value.

## Target Experience
Players should be able to see active objectives before a run, track progress during play, and understand rewards after completion. Contracts should feel like optional mastery goals, not hidden bookkeeping.

## Suggested Implementation
- Add an objective board in menu or meta flow.
- Show active contract progress in a compact gameplay HUD or pause sheet.
- Add post-run completion and reward summary.
- Store durable objective state in `SaveData` or `PlayerStatsPersisted`.
- Use `GAME_RULES_VERSION` when objective rules affect scoring or seeded challenge validity.

## Acceptance Criteria
- Players can inspect active, completed, and locked objectives.
- Objective progress updates are visible in run and post-run.
- Rewards or unlocks from objectives are explicit.
- Objective UI has empty and completed states.

## Verification
- Unit test contract progress and completion conditions.
- Manually complete at least one objective and verify persistence.
- Capture objective board, in-run progress, and post-run reward states.

## Cross-links
- `REG-011-meta-screens-reward-value.md`
- `REG-016-meta-progression-upgrades.md`
- `REG-030-telemetry-and-balance-playtest-loop.md`
