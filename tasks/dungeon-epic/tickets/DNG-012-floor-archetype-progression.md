# DNG-012: Floor archetype progression

## Status
Done

## Priority
P1

## Subsystem
Run map and floor journey

## Depends on
- `DNG-011`

## Current repo context
Floor archetypes such as trap hall, treasure gallery, script room, rush recall, and breather already exist in contracts and generation.

## Problem
Archetypes are present but need stronger pacing, identity, and synergy rules over a long run.

## Target experience
Players recognize floor styles and adapt: trap-heavy halls, treasure rooms, recall pressure, boss floors, breathers, and mystery/event spaces.

## Implementation notes
- Define archetype frequency bands.
- Tie archetypes to card budgets, hazards, objectives, and route previews.
- Keep mutator/archetype combos tested.

## Acceptance criteria
- Archetypes produce meaningfully different boards.
- Long-run schedule includes pressure and recovery.
- No archetype violates softlock invariants.

## Tests and verification
- Balance simulation over 12, 30, and 100 floor samples.
- Snapshot-like tests for archetype card budgets.

## Risks and edge cases
- Risk: visual identity lags rules. Mitigation: use HUD/card copy first, art slots later.

## Cross-links
- `../../refined-experience-gaps/REG-151-floor-archetype-mutator-objective-synergy-coverage.md`
- `DNG-070`

## Future handoff notes
Shipped 2026-05-01. Added a shared floor archetype progression contract over the authored twelve-floor endless cycle, including pacing roles, route affinities, budget expectations, frequency bands, and fairness-backed coverage tests for 12/30/100 floor samples.
