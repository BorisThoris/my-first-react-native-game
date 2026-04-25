# REG-039: Achievement Surface Steam Offline Recovery

## Status
Open

## Priority
P1

## Area
Systems

## Evidence
- `src/shared/achievements.ts`
- `src/shared/contracts.ts`
- `src/main/steam.ts`
- `src/renderer/store/achievementPersistence.ts`
- `src/renderer/components/GameOverScreen.tsx`
- `docs/refinement-tasks/REF-069.md`

## Problem
Achievements unlock locally and bridge to Steam, but the player-facing surface for Steam offline, rejected unlocks, retry, and local-vs-Steam status can still be clearer.

## Target Experience
Players should trust that local achievements are saved even if Steam is offline, and they should understand whether a Steam sync failed, retried, or is unavailable in the current build.

## Suggested Implementation
- Audit `AchievementUnlockResult` handling from main process to renderer notices.
- Add clear status in Collection or profile surfaces: local unlocked, Steam synced, Steam unavailable, or retry needed.
- Define retry behavior for failed bridge attempts.
- Keep achievement truth in `SaveData.achievements`; do not let Steam failures roll back local progress.
- If sync state is persisted, extend `SaveData` and bump `SAVE_SCHEMA_VERSION`.

## Acceptance Criteria
- Local achievement unlocks survive Steam offline.
- Steam failure notices are non-blocking and understandable.
- Duplicate toasts do not appear after retry or reload.
- Collection or game over distinguishes earned achievements from bridge status when needed.

## Verification
- Unit test achievement persistence and failure handling.
- Manual test with Steam unavailable and connected states.
- Capture game over and collection achievement states.

## Cross-links
- `REG-011-meta-screens-reward-value.md`
- `REG-040-save-failure-recovery-and-local-data-trust.md`
- `REG-060-steam-package-installer-and-runtime-smoke.md`
