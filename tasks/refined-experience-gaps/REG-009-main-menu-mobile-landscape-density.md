# REG-009: Main Menu Mobile Landscape Density

## Status
Done

## Priority
P1

## Area
Mobile

## Evidence
- `src/renderer/components/MainMenu.tsx`
- `src/renderer/components/MainMenu.module.css`
- `test-results/visual-screens/mobile/portrait/01-main-menu.png`
- `test-results/visual-screens/mobile/landscape/01-main-menu.png`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`

## Problem
The main menu is functional, but phone and landscape layouts still feel crowded in some regions and sparse or uneven in others. The menu does not yet have a consistently refined density across the viewports where players will first judge the app.

## Target Experience
The first screen should feel like a polished game hub. Primary play action, mode selection, profile progress, and secondary meta links should be organized by importance and fit naturally in portrait and landscape.

## Suggested Implementation
- Define separate layout rules for phone portrait, phone landscape, tablet, and desktop.
- Keep the primary play route dominant and immediately reachable.
- Reduce repeated decorative cards or oversized empty panels.
- Use concise labels and icon-supported actions for secondary routes.
- Ensure menu art and brand elements do not crowd actual navigation.

## Acceptance Criteria
- Portrait and landscape menu screenshots both show a clear primary action.
- No essential menu action is cropped or hidden at short heights.
- Secondary links do not compete equally with Play or Choose Path.
- The menu preserves a strong visual identity without excessive dead space.

## Verification
- Capture phone portrait, phone landscape, tablet, and desktop main menu states.
- Manually navigate from menu to Choose Path, Settings, Collection, Inventory, and Codex.
- Check text wrapping at the smallest supported width.

## Cross-links
- `REG-010-choose-path-discoverability.md`
- `REG-013-brand-logo-and-mode-art.md`
- `REG-014-design-system-dead-space-audit.md`
- `docs/new_design/TASKS/TASKS_META_AND_SHELL.md`
