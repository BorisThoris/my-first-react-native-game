# REG-029: Input Accessibility And Controller Comfort

## Status
Done

## Priority
P1

## Area
QA

## Evidence
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/TileBoard.tsx`
- `src/renderer/components/GameLeftToolbar.tsx`
- `src/renderer/components/OverlayModal.tsx`
- `src/renderer/components/SettingsScreen.tsx`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`

## Problem
Keyboard, touch, focus, safe-area, and potential controller input need a unified pass. Individual controls may be reachable, but the app needs consistent input comfort across gameplay, overlays, menus, and settings.

## Target Experience
Players should be able to operate core flows comfortably with mouse, touch, keyboard, and possibly controller. Focus should always be visible, actions should be predictable, and compact screens should respect safe areas.

## Suggested Implementation
- Inventory all interactive surfaces and their keyboard/touch behavior.
- Define focus order for gameplay board, rail, HUD actions, overlays, and menus.
- Add roving focus or grid navigation for cards if needed.
- Add larger touch affordances for compact screens without increasing visual dead space.
- If controller support is scoped, define a mapping layer before wiring individual components.

## Acceptance Criteria
- All major screens are usable by keyboard without losing visible focus.
- Touch targets are practical on phone layouts.
- Modal focus traps, escape behavior, and return focus are reliable.
- Reduced motion, contrast, and safe-area settings are respected where applicable.

## Verification
- Manual keyboard-only pass through main menu, Choose Path, gameplay, overlays, settings, and game over.
- Manual touch pass on phone viewport.
- Add component or e2e tests for focus traps and primary navigation where possible.

## Cross-links
- `REG-003-gameplay-sidebar-integration.md`
- `REG-008-overlays-mobile-height-and-hierarchy.md`
- `REG-026-playable-onboarding.md`
