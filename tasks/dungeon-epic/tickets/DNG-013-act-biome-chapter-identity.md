# DNG-013: Act, biome, and chapter identity

## Status
Done

## Priority
P2

## Subsystem
Run map and floor journey

## Depends on
- `DNG-012`

## Current repo context
Board state already has optional act/biome fields and chapter schedule concepts.

## Problem
Long dungeon runs need macro-structure beyond rising floor numbers.

## Target experience
The run feels like moving through acts or biomes, with rule pressure, copy, audio, and board identity changing over time.

## Implementation notes
- Define act length and biome rotation.
- Tie biome to palette/copy/audio hooks without requiring final assets.
- Ensure route choices can preview upcoming biome pressure.

## Acceptance criteria
- Act/biome metadata appears in HUD or route surfaces.
- Schedule is deterministic and tested.
- Biome copy does not hide actual mechanics.

## Tests and verification
- Schedule tests for act boundaries.
- Renderer smoke tests for HUD copy.

## Risks and edge cases
- Risk: cosmetic-only identity. Mitigation: connect biome to at least one rule, archetype, or reward tendency.

## Cross-links
- `../../refined-experience-gaps/REG-077-chapter-act-floor-biome-structure.md`
- `DNG-063`

## Future handoff notes
Shipped 2026-05-01. Added shared act/biome presentation hooks for palette, audio, pressure, and route previews, and surfaced upcoming biome pressure in the floor-clear next-floor preview. Final art/audio assets remain deferred.
