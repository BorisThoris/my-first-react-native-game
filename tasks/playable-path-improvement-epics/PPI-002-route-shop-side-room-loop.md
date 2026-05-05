# PPI-002: Route, shop, and side-room loop

## Status
Done

## Priority
P0

## Area
Gameplay / UI

## Evidence
- `e2e/playable-path-interludes.spec.ts`
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/ShopScreen.tsx`
- `src/renderer/components/SideRoomScreen.tsx`
- `tasks/dungeon-epic/tickets/DNG-010-route-map-player-facing-flow.md`
- `tasks/dungeon-epic/tickets/DNG-040-room-interaction-model.md`

## Problem
Route choice, shops, and side rooms are strong systems, but the current playable-path proof is conditional. A run may expose route, shop, or neither in the tested floor, which makes the most important between-floor loop feel less product-solid than the mode and navigation surfaces.

## Target Experience
The player can clearly choose a route, understand its reward/risk, enter any side room, use or skip it, visit the vendor, see wallet and stock changes, and continue to the next board with the chosen route stamped into the run.

## Suggested Implementation
- Use deterministic fixtures from `PPI-001` for Safe, Greed, and Mystery route outcomes.
- Assert route selection updates floor-clear copy, dungeon node copy, HUD or next-floor preview, and next-board route card state.
- Add guaranteed shop scenarios for buy, blocked buy, reroll, claimed item, back to summary, and continue.
- Add side-room scenarios for primary claim, choice claim, skip, and shop-after-side-room handoff.

## Acceptance Criteria
- E2E covers Safe, Greed, and Mystery route choices.
- Shop E2E covers at least one purchase, one insufficient or incompatible offer, reroll visibility, and continue/back behavior.
- Side-room E2E covers claim and skip paths.
- Wallet deltas are visible in the shop and remain consistent when returning to floor summary or gameplay.

## Verification
- `yarn playwright test e2e/playable-path-interludes.spec.ts --workers=1`
- Focused unit tests for route/shop side effects if new shared logic is added.

## Placeholder and asset contract
No final art required. Use existing side-room, shop, and overlay presentation.

## Cross-links
- `PPI-001-deterministic-playable-path-fixtures.md`
- `../dungeon-epic/tickets/DNG-010-route-map-player-facing-flow.md`
- `../dungeon-epic/tickets/DNG-040-room-interaction-model.md`
- `../dungeon-epic/tickets/DNG-041-shop-node-and-vendor-depth.md`
- `../refined-experience-gaps/REG-069-run-map-route-node-system.md`
- `../refined-experience-gaps/REG-070-shop-vendor-stock-pricing-and-rerolls.md`
