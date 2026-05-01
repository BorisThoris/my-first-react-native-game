# DNG-070: Combinatoric test matrix

## Status
Done

## Priority
P0

## Subsystem
QA and release readiness

## Depends on
- `DNG-005`
- `DNG-020`

## Current repo context
Existing tests cover many mechanics, but no dungeon-specific combination matrix owns coverage.

## Problem
Dungeon systems interact across mode, node, archetype, objective, mutator, relic, card family, enemy, input, and viewport.

## Target experience
Major combinations are either tested, intentionally excluded, or documented as future coverage.

## Implementation notes
- Build a matrix with rows for mechanics and columns for contexts.
- Start with deterministic shared tests before visual/e2e.
- Include forbidden combos.

## Acceptance criteria
- Matrix exists and maps to test files.
- P0 combinations have coverage.
- New dungeon tickets update the matrix.

## Tests and verification
- Matrix drift test if represented in code.
- Manual review for Markdown matrix if not.

## Risks and edge cases
- Risk: matrix becomes performative. Mitigation: link each P0 row to an actual test or explicit reason.

## Cross-links
- `../../refined-experience-gaps/REG-120-mechanics-combinatoric-matrix-and-coverage.md`
- `DNG-071`

## Future handoff notes
The matrix now lives in `src/shared/dungeon-combinatoric-matrix.ts` with drift tests. P0 rows cover Safe/Greed/Mystery routes, boss floors, elite anchors, trap/decoy interactions, room/shop/rest/event one-shot behavior, relic/contract exclusions, keyboard/mobile coverage, and an explicit forbidden Stray-remove protected-anchor combination. Future dungeon tickets should add or update rows rather than leaving new mechanic combinations implicit.
