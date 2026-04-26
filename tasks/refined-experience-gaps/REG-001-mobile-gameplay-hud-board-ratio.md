# REG-001: Mobile Gameplay HUD Board Ratio

## Status
Done

## Priority
P0

## Area
Mobile

## Evidence
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `src/renderer/components/GameLeftToolbar.tsx`
- `src/renderer/components/GameplayHudBar.tsx`
- `test-results/visual-screens/mobile/portrait/04-game-playing.png`
- `docs/new_design/TASKS/TASKS_HUD_PARITY.md`

## Problem
On phone portrait, the HUD and rail consume too much vertical and horizontal attention before the player reaches the board. The board should be the primary object during play, but current framing makes the surrounding status and controls feel equally weighted.

## Target Experience
The first gameplay glance on mobile should read as board-first. Score, moves, streak, floor, and immediate actions should remain accessible, but they should not push the board into a secondary role.

## Suggested Implementation
- Define a mobile gameplay layout budget for top HUD, board, action rail, and footer messaging.
- Collapse or compact secondary stats below the main score row.
- Move rarely used run actions behind an icon rail or overflow sheet.
- Keep the board centered and sized by available safe viewport height instead of fixed surrounding chrome.
- Consider a `Settings` compact-HUD preference only after the default mobile layout is strong.

## Acceptance Criteria
- At common phone portrait sizes, the board is visually primary without scrolling.
- Primary run state is readable in one glance: score, moves or floor state, and active turn context.
- Secondary stats do not compete with the board or main score.
- Touch targets remain at least practical mobile size and do not overlap safe-area insets.

## Verification
- Capture mobile portrait screenshots for active play at 360x740, 390x844, and 430x932.
- Run the relevant visual smoke spec after the layout is changed.
- Manually play a short run on touch input and verify no frequent action requires awkward reach.

## Cross-links
- `REG-003-gameplay-sidebar-integration.md`
- `REG-004-gameplay-hud-density-hierarchy.md`
- `REG-028-mobile-short-viewport-regression-hardening.md`
- `docs/new_design/TASKS/TASKS_HUD_PARITY.md`
