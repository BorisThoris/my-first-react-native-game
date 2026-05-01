# DNG-033: Enemy telegraph UI and accessibility

## Status
Done

## Priority
P0

## Subsystem
Enemies and bosses

## Depends on
- `DNG-030`
- `DNG-031`

## Current repo context
The WebGL scene renders active enemy markers and next-target telegraphs; focus labels announce enemy occupancy.

## Problem
Enemy readability needs final UX rules across graphics quality, reduced motion, mobile, keyboard, and screen readers.

## Target experience
Players can always identify occupied cards, next targets, enemy HP, damage, and boss/enemy distinction without relying only on color or motion.

## Implementation notes
- Tile focus/ARIA copy now distinguishes occupied moving enemy patrols from next-target telegraphs.
- Occupied and next-target labels include enemy label, HP, and damage.
- Copy uses the DNG-030/DNG-031 vocabulary: moving enemy patrols, not generic hazards.
- Existing WebGL markers already use static placement under reduced motion; this slice did not add a screenshot pass.

## Acceptance criteria
- Occupied and next-target states are visible in screenshots.
- ARIA labels include enemy label, HP, damage, and occupied state.
- Reduced-motion behavior is tested or manually verified.

## Tests and verification
- `yarn test src/renderer/components/TileBoard.test.tsx src/renderer/components/GameScreen.test.tsx`
- `yarn typecheck`

## Risks and edge cases
- Risk: markers obscure card identity. Mitigation: keep markers above but small, with hover/focus copy.

## Cross-links
- `DNG-060`
- `DNG-062`

## Future handoff notes
Visual marker shape/glyph polish and screenshot coverage should continue in `DNG-061`, `DNG-062`, and `DNG-072`.
