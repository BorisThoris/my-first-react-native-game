# Task 006: Settings Shell

## Status
Done (landed in renderer)

## Implementation notes
- Category-shell settings with Gameplay, Audio, Video, Accessibility, Controls (UI reference), and About (build + reset to defaults). Mock / future controls remain labeled as such.

## Priority
Medium

## Objective
Convert the settings experience into a premium category-shell layout while using current live settings behavior first.

## Source Reference
- `docs/ENDPRODUCTIMAGE2.png`
- `docs/new_design/SCREEN_SPEC_SETTINGS.md`
- `docs/new_design/CURRENT_VS_TARGET_GAP_ANALYSIS.md`

## Affected Areas
- `src/renderer/components/SettingsScreen.tsx`
- `src/renderer/components/SettingsScreen.module.css`

## Dependencies
- `TASK-001-theme-foundation-and-assets.md`
- `TASK-002-shared-ui-primitives.md`

## Implementation Outcomes
- Add left-side category navigation.
- Restage the settings content as a premium pane instead of a flat form grid.
- Map current live settings into Gameplay, Audio, Video, Accessibility, and future-gap categories.
- Keep mockup-only controls clearly separated until model work exists.

## Acceptance Criteria
- The settings screen matches the premium shell direction.
- Existing live settings remain understandable inside the new category structure.
- Mockup-only controls are not silently presented as fully supported behavior.

## Out of Scope
- Expanding the `Settings` schema
- Shipping a full `About` page
- Defining new gameplay balance options
