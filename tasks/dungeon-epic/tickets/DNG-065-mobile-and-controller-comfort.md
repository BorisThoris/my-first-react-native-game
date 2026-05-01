# DNG-065: Mobile and controller comfort

## Status
Done

## Priority
P0

## Subsystem
Presentation, audio, UX

## Depends on
- `DNG-060`
- `DNG-033`

## Current repo context
The app supports responsive layout, touch, keyboard focus, camera pan/zoom, and some controller/accessibility planning.

## Problem
Dungeon depth adds more decisions and board markers that must stay usable on phone, tablet, keyboard, and controller.

## Target experience
Every dungeon action can be performed comfortably without precision mouse input.

## Implementation notes
- Define focus order for occupied cards, exits, shops, rooms, powers, and prompts.
- Ensure touch targets and labels work on small viewports.
- Keep one-hand flow in mind for repeated play.

## Acceptance criteria
- Keyboard/controller can select occupied cards and read enemy info.
- Mobile layouts keep board primary.
- Prompts do not trap focus or hide required actions.

## Tests and verification
- Renderer focus tests.
- Mobile Playwright smoke where available.

## Risks and edge cases
- Risk: too many prompts. Mitigation: prefer inline board actions unless choices are required.

## Cross-links
- `../../refined-experience-gaps/REG-029-input-accessibility-and-controller-comfort.md`
- `../../refined-experience-gaps/REG-103-touch-drag-pan-zoom-and-one-hand-comfort.md`

## Future handoff notes
Dungeon comfort now has a stable focus-order contract for occupied cards, exits, shops, rooms, board powers, and required prompts. TileBoard exposes that contract plus board-primary mobile/touch-target metadata, and renderer tests cover keyboard selection of an occupied enemy patrol tile without pointer input. Future controller/gamepad work should map physical controls onto the same board application focus contract.
