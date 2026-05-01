# DNG-061: Board stage encounter presentation

## Status
Done

## Priority
P0

## Subsystem
Presentation, audio, UX

## Depends on
- `DNG-020`
- `DNG-033`

## Current repo context
The board stage is WebGL-driven with card effects, board camera, enemy markers, and fallback handling.

## Problem
Dungeon mechanics need board-level visual hierarchy: card faces, enemy markers, traps, treasure, objectives, and route anchors must not visually compete.

## Target experience
The board reads as a dungeon encounter with clear layers: cards, active threats, next telegraphs, objective highlights, match effects, and power previews.

## Implementation notes
- Define z/layer policy for card effects, enemy markers, telegraphs, power previews, and score pop anchors.
- Add LOD/reduced-motion rules.
- Verify no marker hides important card text.

## Acceptance criteria
- Visual layers are documented and tested where possible.
- Enemy, trap, treasure, and objective states remain distinguishable.
- Low graphics mode preserves critical information.

## Tests and verification
- Playwright/canvas smoke for representative dungeon floors.
- Renderer unit tests for props/selectors.

## Risks and edge cases
- Risk: one-note visual clutter. Mitigation: reserve strong effects for active/urgent states.

## Cross-links
- `../../refined-experience-gaps/REG-105-board-stage-camera-dais-and-depth-finalization.md`
- `DNG-062`

## Future handoff notes
Board stage hierarchy now has a named `dng-061-v1` layer policy exposed on the TileBoard frame and tested through renderer coverage. Enemy current markers occupy the upper-right card corner while next-target telegraphs occupy the lower-left corner, keeping center card text clear; low quality and reduced motion retain critical threat readability without adding new VFX assets.
