# PPI-001: Deterministic playable path fixtures

## Status
Done

## Priority
P0

## Area
QA / E2E infrastructure

## Evidence
- `e2e/playable-path-interludes.spec.ts`
- `e2e/playablePathHelpers.ts`
- `src/renderer/App.tsx`
- `tasks/dungeon-epic/tickets/DNG-072-e2e-fixtures-and-screenshots.md`
- `tasks/refined-experience-gaps/REG-058-dev-sandbox-fixtures-and-story-state-matrix.md`

## Problem
The expanded playable-path harness can reach the broad app surface, but some important loops depend on whatever the first deterministic floor happens to expose. The shop test can skip when `Visit Shop` is unavailable, and route/shop/interlude flow flaked once by returning to menu before passing on retry.

## Target Experience
E2E specs can open known, valid app states for route choice, shop, side room, relic draft, game over, fresh profile, and active play without spending minutes manufacturing those states through fragile gameplay.

## Suggested Implementation
- Add a small dev-only E2E fixture API that can start named valid scenarios: `floorClearWithRouteChoices`, `floorClearWithShop`, `sideRoom`, `relicDraft`, `gameOver`, and `activeRunWithHazards`.
- Keep fixtures behind `import.meta.env.DEV`; never expose them in production builds.
- Fixture states must be created through existing shared factories or store actions where possible, not ad hoc partial objects.
- Add helper wrappers in `e2e/playablePathHelpers.ts` so specs do not call fixture internals directly.

## Acceptance Criteria
- Route/shop/side-room/relic/game-over E2E setup no longer depends on random first-floor availability.
- Existing live gameplay paths remain covered separately for at least one first-floor clear.
- Fixture helpers fail with clear errors outside Vite dev mode.
- No save schema or production runtime behavior changes are introduced.

## Verification
- `yarn typecheck`
- `yarn playwright test e2e/playable-path-interludes.spec.ts --workers=1`
- `yarn playwright test e2e/playable-path-navigation.spec.ts --workers=1`

## Placeholder and asset contract
Not applicable. This is fixture and QA infrastructure only.

## Cross-links
- `README.md`
- `../dungeon-epic/tickets/DNG-072-e2e-fixtures-and-screenshots.md`
- `../refined-experience-gaps/REG-058-dev-sandbox-fixtures-and-story-state-matrix.md`
- `../refined-experience-gaps/REG-062-e2e-flake-budget-and-ci-visual-sharding.md`
