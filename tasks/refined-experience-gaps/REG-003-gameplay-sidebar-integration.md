# REG-003: Gameplay Sidebar Integration

## Status
Done

## Priority
P0

## Area
UI

## Evidence
- `src/renderer/components/GameLeftToolbar.tsx`
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `test-results/visual-screens/mobile/portrait/04-game-playing.png`
- `docs/new_design/TASKS/TASKS_NAVIGATION_STATE.md`

## Problem
The left gameplay rail feels visually disconnected from the rest of the game shell. It competes for space, especially on mobile, and its relationship to labels, flyouts, navigation, and pause/settings actions is not settled.

## Target Experience
The rail should feel like an integrated gameplay control spine. On compact screens it should collapse cleanly, while on larger screens it should either stay icon-only with tooltips or expose labels through deliberate flyout behavior.

## Suggested Implementation
- Decide one canonical rail model: collapsed icon rail, labeled desktop rail, or icon rail with flyout labels.
- Align rail color, border, elevation, and spacing with gameplay shell tokens.
- Make active, disabled, hover, focus, and pressed states consistent with the rest of the UI.
- On mobile, test whether actions belong in a bottom bar, compact side rail, or overflow sheet.
- If user preference is introduced, store it under `Settings` rather than save progression data.

## Acceptance Criteria
- Rail behavior is consistent between gameplay, pause, settings, and meta navigation paths.
- Mobile rail does not steal board space or create accidental taps.
- Desktop rail has clear affordances without visually detaching from the stage.
- Focus order and tooltips remain understandable for keyboard users.

## Verification
- Capture gameplay screenshots on phone portrait, phone landscape, tablet, and desktop.
- Keyboard-tab through the rail and confirm focus states are visible.
- Manually verify pause/settings/exit actions from gameplay.

## Cross-links
- `REG-001-mobile-gameplay-hud-board-ratio.md`
- `REG-004-gameplay-hud-density-hierarchy.md`
- `REG-029-input-accessibility-and-controller-comfort.md`
- `docs/new_design/TASKS/TASKS_NAVIGATION_STATE.md`
