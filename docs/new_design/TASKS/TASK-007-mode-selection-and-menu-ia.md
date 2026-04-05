# Task 007: Mode Selection and Menu IA

## Status
Planned

## Priority
Medium

## Objective
Define and, if approved later, implement the `Choose Your Path` flow plus a clean IA strategy for the current app's extra live modes.

## Source Reference
- `docs/ENDPRODUCTIMAGE2.png`
- `docs/new_design/SCREEN_SPEC_MODE_SELECTION.md`
- `docs/new_design/SCREEN_SPEC_MAIN_MENU.md`

## Affected Areas
- future route or `ViewState` additions
- `src/renderer/App.tsx`
- `src/renderer/store/useAppStore.ts`
- main menu flow

## Dependencies
- `TASK-003-main-menu-redesign.md`
- approved product decision on whether mode selection becomes real live scope

## Implementation Outcomes
- Introduce a dedicated mode-selection surface if the team chooses literal reference fidelity.
- Map `Classic Run` and `Daily Challenge` cleanly to current behavior.
- Decide how `Endless Mode` differs from current arcade behavior, or leave it future scope.
- Move extra current live modes into a secondary surface.

## Acceptance Criteria
- The entry flow is cleaner than the current all-modes-on-menu layout.
- Current supported modes remain reachable.
- The redesign does not invent fake support for unsupported modes or screens.

## Out of Scope
- Full design of collection or codex
- New gameplay-mode rules unless explicitly approved
