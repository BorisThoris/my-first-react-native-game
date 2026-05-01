# DNG-062: Enemy and boss VFX LOD

## Status
Done

## Priority
P1

## Subsystem
Presentation, audio, UX

## Depends on
- `DNG-033`
- `DNG-034`

## Current repo context
Enemy markers are lightweight Three meshes with motion gated by reduced motion.

## Problem
Threat visuals need stronger polish while respecting performance, reduced motion, photosensitivity, and mobile constraints.

## Target experience
Enemies and bosses feel present and responsive without obscuring cards or causing noisy/strobing effects.

## Implementation notes
- Define LOD tiers for low/medium/high graphics.
- Boss markers can be larger or shaped differently, not just brighter.
- Avoid rapid flashing and color-only distinctions.

## Acceptance criteria
- Each enemy kind has a readable visual identity.
- Bosses have a distinct marker and defeat moment.
- Reduced motion and low quality have stable static alternatives.

## Tests and verification
- Visual smoke tests.
- Photosensitivity review for rapid effects.

## Risks and edge cases
- Risk: performance regression. Mitigation: shared geometries/material reuse and bounded draw calls.

## Cross-links
- `../../refined-experience-gaps/REG-112-effect-lod-reduced-motion-and-visual-noise-control.md`
- `DNG-074`

## Future handoff notes
Enemy marker VFX now use a shared visual profile read model with distinct non-color-only shapes for sentinel, stalker, warden, observer, and boss patrols. Low quality lowers halo/motion intensity, reduced motion disables marker oscillation, and boss markers add a separate crown bar instead of relying on brightness alone. Final defeat audio/VFX assets remain deferred to the dedicated presentation/audio tickets.
