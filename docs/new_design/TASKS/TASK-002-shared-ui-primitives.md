# Task 002: Shared UI Primitives

## Status
Planned

## Priority
High

## Objective
Rebuild the shared UI primitives so the redesign has one reusable presentation language across menu, gameplay, settings, and overlays.

## Source Reference
- `docs/new_design/COMPONENT_CATALOG.md`
- `docs/new_design/VISUAL_SYSTEM_SPEC.md`
- both reference images

## Affected Areas
- `src/renderer/ui/UiButton.tsx`
- `src/renderer/ui/Panel.tsx`
- `src/renderer/ui/ScreenTitle.tsx`
- `src/renderer/ui/StatTile.tsx`
- new shared primitive CSS modules as needed

## Dependencies
- `TASK-001-theme-foundation-and-assets.md`

## Implementation Outcomes
- Create the premium framed button family.
- Create the ornamental panel family.
- Expand title hierarchy to support display, section, and shell title bars.
- Add missing shared primitives such as icon capsules and segmented controls if needed.

## Acceptance Criteria
- Shared primitives can be reused without custom per-screen hacks.
- Buttons, panels, and titles all read as one design family.
- The primitive set is sufficient for menu, gameplay, settings, and overlays.

## Out of Scope
- Full screen rebuilds
- Mode-selection routing
- Card FX implementation
