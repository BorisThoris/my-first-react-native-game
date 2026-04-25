# REG-004: Gameplay HUD Density Hierarchy

## Status
Open

## Priority
P0

## Area
UI

## Evidence
- `src/renderer/components/GameplayHudBar.tsx`
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `src/shared/game.ts`
- `test-results/visual-screens/mobile/portrait/04-game-playing.png`
- `docs/new_design/TASKS/TASKS_HUD_PARITY.md`

## Problem
Secondary HUD stats compete with score, floor state, and the current run objective. The player has to visually parse too many similarly weighted labels during active play.

## Target Experience
The HUD should have a clear hierarchy: current outcome pressure first, useful tactical context second, and historical or secondary stats only when expanded or relevant.

## Suggested Implementation
- Define primary, secondary, and tertiary HUD data groups.
- Keep score, turn pressure, and immediate floor or objective state in the primary group.
- Move streak details, advanced modifiers, or passive bonuses to a compact drawer, tooltip, or run sheet.
- Use typography scale, contrast, and proximity to distinguish tactical state from passive stats.
- Keep data source expectations aligned with `RunState` and avoid duplicating derived values in UI state.

## Acceptance Criteria
- The most important run information is identifiable within one second in screenshots.
- Secondary stats are still accessible without permanently occupying primary HUD space.
- HUD wraps predictably at phone widths without overlapping or shrinking text into unreadability.
- Existing HUD data remains correct.

## Verification
- Capture active gameplay in early, mid, and late run states.
- Use keyboard and touch to open any expanded stat drawer or tooltip.
- Run affected component and visual tests if implementation changes component behavior.

## Cross-links
- `REG-001-mobile-gameplay-hud-board-ratio.md`
- `REG-003-gameplay-sidebar-integration.md`
- `REG-030-telemetry-and-balance-playtest-loop.md`
- `docs/new_design/TASKS/TASKS_HUD_PARITY.md`
