# New Design Tasks

## Purpose
This directory breaks the redesign into implementation-sized tasks. The tasks are ordered so that foundational work lands before screen-specific work.

## Priority Order
1. `TASK-001-theme-foundation-and-assets.md`
2. `TASK-002-shared-ui-primitives.md`
3. `TASK-003-main-menu-redesign.md`
4. `TASK-004-gameplay-hud-and-shell.md`
5. `TASK-005-card-states-and-fx.md`
6. `TASK-006-settings-shell.md`
7. `TASK-007-mode-selection-and-menu-ia.md`
8. `TASK-008-gap-surfaces-and-regression.md`

## Dependency Summary
- Theme and asset intake come first.
- Shared primitives land before per-screen work.
- Gameplay shell work should precede deep card FX polish.
- Mode-selection routing decisions should wait until the new visual language is stable.
- Visual regression refresh closes the sequence.

## Notes
- These tasks are implementation-oriented; status and notes in each `TASK-*.md` track what landed in the renderer versus what remains reference-level polish.
- **Live routes:** `modeSelect` (Choose Your Path), `collection`, `inventory`, and `codex` are implemented in `src/shared/contracts.ts` and wired in `App.tsx` / `useAppStore.ts`. Inventory and codex open as in-run overlays from the gameplay flyout; collection is reachable from the main menu.
- **Honest mock scope:** Settings categories that are UI-only (for example Controls reference copy, locked Endless on mode select) stay labeled in copy and tests per TASK-008.
