# DNG-041: Shop node and vendor depth

## Status
Done

## Priority
P1

## Subsystem
Rooms, shops, treasure, events

## Depends on
- `DNG-011`
- `DNG-050`

## Current repo context
Shop rules, offers, rerolls, and shop screen exist.

## Problem
Shop nodes need stronger integration with route map, wallet pacing, and run builds.

## Target experience
Shops are meaningful but optional: players spend earned currency on consumables, services, relic support, or risk management.

## Implementation notes
- Align shop entry with map node and shop card on board.
- Define stock pools by floor/node/route.
- Keep reroll and sold-out states readable.

## Acceptance criteria
- Shop stock is deterministic and priced from shared rules.
- Shop route previews and board shop cards agree.
- Purchase effects update run state and UI once.

## Tests and verification
- Shop catalog/pricing tests.
- Store/renderer tests for purchase and reroll.

## Risks and edge cases
- Risk: shop becomes required for survival. Mitigation: balance with rest/reward pacing.

## Cross-links
- `../../refined-experience-gaps/REG-070-shop-vendor-stock-pricing-and-rerolls.md`
- `../../refined-experience-gaps/REG-152-shop-vendor-run-map-and-node-hooks.md`

## Future handoff notes
Implemented v1 deterministic stock/read model for floor-clear and board vendors, including reroll preview, board-shop stock distinction, incompatible purchase guards, and occupied-card contact precedence over utility shop actions. Price tuning remains for economy tickets.
