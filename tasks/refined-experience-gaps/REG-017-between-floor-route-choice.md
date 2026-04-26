# REG-017: Between-Floor Route Choice

## Status
Done

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/game.ts`
- `src/shared/run-mode-catalog.ts`
- `src/renderer/components/FloorClearOverlay.tsx`
- `src/renderer/components/GameScreen.tsx`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`

## Problem
Runs lack meaningful between-floor route choices such as shop, rest, event, elite, treasure, or branching risks. Floor clear currently resolves progress, but it does not create a strategic path decision.

## Target Experience
After key floors, the player should choose where to go next. The choice should make the run feel authored and replayable: safety, greed, build support, healing, shop access, or special events.

## Suggested Implementation
- Add a route-choice state to `RunState`.
- Define route node types and generation rules per `RunModeDefinition`.
- Start with a simple two or three option route picker after floor clear.
- Connect route nodes to shop, relic, event, rest, challenge, or puzzle encounters as those systems ship.
- Bump `GAME_RULES_VERSION` when route rules affect scoring, completion, or daily determinism.

## Acceptance Criteria
- Eligible floor clears present at least two meaningful next-route choices.
- Route choice is deterministic where seeded modes require determinism.
- Chosen route affects the next floor or encounter.
- UI works on mobile without hiding the confirm action.

## Verification
- Unit test route generation and seeded repeatability.
- Manual run through multiple route choices and back-to-back floors.
- Capture floor-clear route picker on phone and desktop.

## Cross-links
- `REG-015-shop-and-run-currency-system.md`
- `REG-020-mutator-chapter-identity.md`
- `REG-008-overlays-mobile-height-and-hierarchy.md`
