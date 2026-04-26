# REG-010: Choose Path Discoverability

## Status
Done

## Priority
P1

## Area
UI

## Evidence
- `src/renderer/components/ChooseYourPathScreen.tsx`
- `src/renderer/components/ChooseYourPathScreen.module.css`
- `src/shared/run-mode-catalog.ts`
- `test-results/visual-screens/mobile/portrait/01a-choose-your-path.png`
- `docs/new_design/TASKS/TASKS_NAVIGATION_STATE.md`

## Problem
Choose Path is visually useful, but mode library browsing, search, pagination dots, and start affordances are not clear enough. A player can understand that modes exist without immediately understanding how to browse, compare, and start.

## Target Experience
The player should quickly scan available modes, understand locked versus playable choices, search or filter intentionally, and start a run without hesitation.

## Suggested Implementation
- Clarify the relationship between featured mode, library list, search, filters, and pagination.
- Make the selected mode and primary start button unmistakable.
- Show locked mode reasons inline instead of relying on disabled ambiguity.
- Align labels with `RunModeDefinition` naming and future Endless-mode decisions.
- Ensure mode metadata does not overflow mobile cards.

## Acceptance Criteria
- The selected mode and start action are visible above the fold on mobile.
- Locked modes explain requirements or status in plain language.
- Search and browse affordances have visible empty, filtered, and no-result states.
- Pagination or dots are either self-evident or replaced with clearer controls.

## Verification
- Capture Choose Path with all modes visible, filtered search, no results, locked mode, and selected mode.
- Manually start each unlocked mode and confirm correct run setup.
- Keyboard and touch navigation should both select and start modes reliably.

## Cross-links
- `REG-018-endless-mode-shipping-plan.md`
- `REG-009-main-menu-mobile-landscape-density.md`
- `REG-029-input-accessibility-and-controller-comfort.md`
