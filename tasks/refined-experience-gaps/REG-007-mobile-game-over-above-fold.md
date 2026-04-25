# REG-007: Mobile Game Over Above Fold

## Status
Open

## Priority
P0

## Area
Mobile

## Evidence
- `src/renderer/components/GameOverScreen.tsx`
- `src/renderer/components/GameOverScreen.module.css`
- `src/shared/save-data.ts`
- `test-results/visual-screens/mobile/portrait/08-game-over.png`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`

## Problem
The game-over screen can push the next meaningful action below the fold on mobile. This weakens the retry loop and makes the outcome feel more like a report page than a tight game state.

## Target Experience
After losing or finishing a run, the player should immediately see the result, the main reward or lesson, and the next action: retry, choose path, or return to menu.

## Suggested Implementation
- Compress result header, score summary, and rewards into an above-the-fold block.
- Move detailed breakdowns behind tabs, accordions, or a post-run details drawer.
- Keep retry and choose-path actions sticky or visible near the top on mobile.
- If rewards or stats are expanded, read from `PlayerStatsPersisted` and `SaveData` rather than creating separate UI-only summaries.

## Acceptance Criteria
- On phone portrait, primary next actions are visible without scrolling.
- Final score, run outcome, and at least one reward or progress signal are visible above the fold.
- Detailed stats remain available but no longer dominate initial mobile view.
- Desktop layout keeps enough detail without becoming sparse.

## Verification
- Capture game-over states for loss, win, and abandoned run if supported.
- Check 360x740 and 390x844 phone portrait.
- Manually retry from game over and confirm state reset behavior.

## Cross-links
- `REG-011-meta-screens-reward-value.md`
- `REG-016-meta-progression-upgrades.md`
- `REG-028-mobile-short-viewport-regression-hardening.md`
