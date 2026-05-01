# DNG-072: E2E fixtures and screenshots

## Status
Done

## Priority
P1

## Subsystem
QA and release readiness

## Depends on
- `DNG-060`
- `DNG-061`

## Current repo context
Playwright tests and visual captures exist. Dev fixtures exist for some HUD and board states.

## Problem
Dungeon flows need stable fixtures for screenshots and E2E without relying on manual seed hunting.

## Target experience
Agents can open a known scenario for enemy floor, boss floor, trap room, shop, rest, treasure, event, exit lock, floor clear, and game over.

## Implementation notes
- Add fixture helpers for run states.
- Prefer deterministic seeds and selectors.
- Keep fixtures close to existing dev/test patterns.

## Acceptance criteria
- Each major dungeon state has a fixture or seed recipe.
- Screenshots can be captured for desktop and mobile smoke.
- E2E avoids flaky animation assumptions.

## Tests and verification
- Playwright smoke specs.
- Fixture unit tests if helpers are shared.

## Risks and edge cases
- Risk: fixtures drift from real generation. Mitigation: use real generation when possible, synthetic only for edge cases.

## Cross-links
- `../../refined-experience-gaps/REG-058-dev-sandbox-fixtures-and-story-state-matrix.md`
- `../../refined-experience-gaps/REG-062-e2e-flake-budget-and-ci-visual-sharding.md`

## Future handoff notes
Dungeon E2E recipes now cover enemy floor, boss floor, trap room, shop, rest, treasure, event, exit lock, floor clear, and game over. Board-heavy states have matching dev sandbox fixtures, and `e2e/dungeon-fixtures-smoke.spec.ts` can open every recipe plus capture representative desktop/mobile screenshots. Focused unit/type/lint checks were run; the Playwright browser spec is available for visual smoke batches.
