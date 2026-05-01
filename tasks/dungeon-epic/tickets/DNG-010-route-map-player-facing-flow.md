# DNG-010: Route map player-facing flow

## Status
Done

## Priority
P1

## Subsystem
Run map and floor journey

## Depends on
- `DNG-001`
- `DNG-004`

## Current repo context
`run-map.ts`, route choices, and Choose Path copy exist. The map state is functional but needs stronger player-facing flow.

## Problem
Route decisions can feel like abstract labels instead of a dungeon journey with risk, reward, and consequence.

## Target experience
Between floors, players quickly understand available routes, node type, risk, reward preview, and how the choice changes the next board.

## Implementation notes
- Define route display rows for safe, greed, mystery, combat, elite, shop, rest, event, treasure, boss.
- Keep selection deterministic and local.
- Avoid long modal text; use compact comparison language.

## Acceptance criteria
- Route choices show risk/reward in consistent columns.
- Current node and next node are derivable from `RunState`.
- The chosen route visibly affects the next floor.

## Tests and verification
- Shared tests for route choice outcome.
- Renderer tests for route choice labels and locked/invalid states.

## Risks and edge cases
- Risk: route UI duplicates generation logic. Mitigation: shared selectors produce presentation rows.

## Cross-links
- `../../refined-experience-gaps/REG-069-run-map-route-node-system.md`
- `../../refined-experience-gaps/REG-017-between-floor-route-choice.md`

## Future handoff notes
Implemented with shared route decision rows consumed by the floor-clear route panel. Future route polish should extend `getDungeonRouteDecisionPresentation` instead of duplicating route risk/reward logic in UI.
