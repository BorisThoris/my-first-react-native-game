# DNG-014: Between-floor choice presentation

## Status
Done

## Priority
P1

## Subsystem
Run map and floor journey

## Depends on
- `DNG-010`
- `DNG-011`

## Current repo context
Floor clear and route choice surfaces exist but can become crowded as dungeon systems deepen.

## Problem
Players need concise route/reward decisions after a floor without losing momentum.

## Target experience
After clearing a floor, the player sees result, reward, and next route choices in a compact, readable flow.

## Implementation notes
- Decide whether route choice lives inside floor-clear modal, a follow-up sheet, or a route screen.
- Keep keyboard/touch flow short.
- Preserve achievement/toast stacking rules.

## Acceptance criteria
- Floor result and next choice are not visually competing.
- Route choices are reachable on phone/desktop.
- Continue path is unambiguous.

## Tests and verification
- Renderer tests for floor-clear with route choices.
- Mobile visual smoke if Playwright is available.

## Risks and edge cases
- Risk: modal stack complexity. Mitigation: one active decision surface at a time.

## Cross-links
- `../../refined-experience-gaps/REG-097-pause-and-overlay-final-decision-sheets.md`
- `DNG-060`

## Future handoff notes
Shipped 2026-05-01. Route choice remains inside the floor-clear modal, but the result notes are visually bounded, the route panel is labelled as the required active decision, Continue/shop/risk-wager actions do not compete while a route is required, and mobile/desktop reachability is preserved with the existing responsive route grid.
