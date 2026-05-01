# DNG-074: Performance, memory, and GPU budget

## Status
Done

## Priority
P0

## Subsystem
QA and release readiness

## Depends on
- `DNG-061`
- `DNG-062`

## Current repo context
WebGL board uses shared geometries, textures, quality presets, and performance tests/spikes.

## Problem
Dungeon markers, effects, prompts, and long sessions can regress frame pacing and memory.

## Target experience
Dungeon floors remain responsive on target devices and degrade gracefully through quality presets.

## Implementation notes
- Track draw calls/materials for enemy markers and board overlays.
- Reuse geometry/materials where possible.
- Test context loss and long sessions.

## Acceptance criteria
- Enemy/boss/trap visuals stay within documented budgets.
- Low quality and reduced motion remain readable.
- No obvious memory leak across floor transitions.

## Tests and verification
- Typecheck/build.
- Performance smoke or existing board perf sample.
- WebGL context loss tests where applicable.

## Risks and edge cases
- Risk: visual polish adds hidden GPU cost. Mitigation: shared resources and LOD.

## Cross-links
- `../../refined-experience-gaps/REG-109-performance-budget-quality-preset-enforcement.md`
- `../../refined-experience-gaps/REG-110-memory-gpu-leak-and-context-lifecycle.md`

## Future handoff notes
Run after major visual effect work. DNG-074 v1 adds a static dungeon board stage performance budget for moving enemy/boss markers, documents trap-card overlay cost as card-surface only, and keeps existing WebGL context restore/remount recovery named in the budget.
