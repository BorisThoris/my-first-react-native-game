# REG-049: Findables Pickup Readability And Reward Tuning

## Status
Done

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/contracts.ts`
- `src/shared/game.ts`
- `src/renderer/components/TileBoardScene.tsx`
- `src/renderer/components/GameplayHudBar.tsx`
- `docs/FINDABLES.md`
- `docs/gameplay-tasks/GP-FINDABLES.md`

## Problem
Findables are implemented, but pickups can still become visual noise or feel under-rewarded if players do not understand what they are, when they appear, and what matching them gives.

## Target Experience
A findable should read as a small, satisfying optional pickup. It should be visually distinct from decoys and tutorial markers, and its reward should be clear without hijacking the main memory task.

## Suggested Implementation
- Audit findable markers in memorize, face-up, WebGL, DOM fallback, and reduced-motion modes.
- Clarify `FindableKind` rewards in HUD, Codex, and first-time hints.
- Tune `FINDABLE_MATCH_SCORE` and `FINDABLE_MATCH_COMBO_SHARDS` against other bonuses.
- Ensure destroy forfeits and shuffle preserves behavior are explained.
- Bump `GAME_RULES_VERSION` if generation or reward values change.

## Acceptance Criteria
- Players can distinguish findables from glass decoy `?` tiles.
- Claim feedback shows the earned score or shard.
- Findables stay readable under silhouette and short-memorize pressure.
- Rewards do not obsolete secondary objectives.

## Verification
- Run findables tests.
- Manual test claim, destroy forfeit, shuffle preservation, and reduced motion.
- Capture findable states on mobile and desktop.

## Cross-links
- `REG-020-mutator-chapter-identity.md`
- `REG-048-secondary-objectives-bonus-clarity.md`
- `docs/FINDABLES.md`
