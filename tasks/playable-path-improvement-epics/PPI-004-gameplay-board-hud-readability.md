# PPI-004: Gameplay board and HUD readability

## Status
Done

## Priority
P0

## Area
Gameplay UI / responsive layout

## Evidence
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameplayHudBar.tsx`
- `src/renderer/components/GameLeftToolbar.tsx`
- `tasks/refined-experience-gaps/REG-001-mobile-gameplay-hud-board-ratio.md`
- `tasks/refined-experience-gaps/REG-104-gameplay-screen-final-composition.md`
- `tasks/refined-experience-gaps/REG-106-hud-final-information-architecture.md`

## Problem
The playable path proves the gameplay shell is reachable and functional, but active-play readability remains a product risk. The board, objective, route/hazard context, HUD, and power dock compete for attention, especially on mobile and short viewports.

## Target Experience
The board is visually primary, the HUD answers the top player questions quickly, and secondary details are available without permanently crowding active play.

## Suggested Implementation
- Audit active gameplay at desktop, tablet, phone portrait, and short landscape.
- Rebalance primary HUD hierarchy around score, lives, floor, objective, route/hazard pressure, and build state.
- Move secondary stats into details/drawer affordances where needed.
- Ensure the power dock teaches costs and disabled reasons without crowding the board.

## Acceptance Criteria
- Board, HUD, and toolbar do not overlap or require page scroll in target viewports.
- HUD primary state is readable in early, mid, and late run states.
- Objective, route, hazard, and build signals are visible when active but do not dominate ordinary floors.
- Touch target and keyboard access remain intact.

## Verification
- `yarn test:e2e:visual:smoke`
- `yarn playwright test e2e/playable-path-navigation.spec.ts --workers=1`
- Existing HUD/component tests plus new state-specific tests where layout logic changes.

## Placeholder and asset contract
No final art required. If new visual slots are needed, use existing UI assets or documented placeholders.

## Cross-links
- `../refined-experience-gaps/REG-001-mobile-gameplay-hud-board-ratio.md`
- `../refined-experience-gaps/REG-004-gameplay-hud-density-hierarchy.md`
- `../refined-experience-gaps/REG-104-gameplay-screen-final-composition.md`
- `../refined-experience-gaps/REG-106-hud-final-information-architecture.md`
- `../dungeon-epic/tickets/DNG-060-dungeon-hud-information-architecture.md`
