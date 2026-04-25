# REG-044: Meta Navigation Backstack And Return Model

## Status
Open

## Priority
P1

## Area
Systems

## Evidence
- `src/shared/contracts.ts`
- `src/renderer/App.tsx`
- `src/renderer/store/useAppStore.ts`
- `docs/new_design/TASKS/TASKS_NAVIGATION_STATE.md`
- `docs/new_design/NAVIGATION_MODEL.md`

## Problem
The app uses `ViewState`, return pointers, and frozen gameplay overlays. This works, but deeper meta navigation or chained overlays can clobber return paths and create confusing Back behavior if not deliberately bounded.

## Target Experience
Every route should have predictable Back, Close, Escape, and return behavior. In-run meta overlays should preserve run state and focus, while menu meta screens should behave like full destinations.

## Suggested Implementation
- Decide whether the single return-pointer model remains the long-term architecture or becomes a real stack.
- Map transitions for menu, Choose Path, settings, collection, inventory, codex, gameplay, pause, game over, and in-run overlays.
- Add tests for nested or denied transitions.
- Keep `ViewState` changes compatible with `DesktopApi` and any future deep-link or URL mapping.
- If a stack is introduced, define migration and reset behavior.

## Acceptance Criteria
- Back/Close always returns to the expected previous surface.
- Opening settings from meta screens does not lose the intended return target.
- In-run inventory/codex/settings do not resume timers incorrectly.
- Blank or impossible views are covered by tests.

## Verification
- Run navigation-flow and store tests.
- Manual pass through all menu and in-run meta routes.
- Add e2e matrix for playing -> inventory/codex/settings from memorize, playing, resolving, paused, and levelComplete.

## Cross-links
- `REG-003-gameplay-sidebar-integration.md`
- `REG-043-pause-timer-resume-and-interruption-contract.md`
- `REG-029-input-accessibility-and-controller-comfort.md`
