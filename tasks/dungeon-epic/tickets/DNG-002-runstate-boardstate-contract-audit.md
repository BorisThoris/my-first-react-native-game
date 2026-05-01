# DNG-002: RunState and BoardState contract audit

## Status
Done

## Priority
P0

## Subsystem
Foundation and contracts

## Depends on
- `DNG-001`

## Current repo context
`RunState`, `BoardState`, `Tile`, and `EnemyHazardState` carry most dungeon state. Multiple modules read or mutate these shapes.

## Problem
Dungeon mechanics are expanding faster than the state contract. Hidden coupling risks replay drift, save migration bugs, and UI inconsistencies.

## Target experience
All dungeon state has an authoritative owner, lifecycle, and test path. Future features know whether data belongs on `Tile`, `BoardState`, `RunState`, a catalog, or a derived selector.

## Implementation notes
- Audit `src/shared/contracts.ts`, `src/shared/game.ts`, `src/shared/run-map.ts`, `src/shared/shop-rules.ts`, and renderer selectors.
- Produce a small contract table before making schema changes.
- Identify fields that are persisted versus transient.

## Audit artifact
The current contract audit lives in `tasks/dungeon-epic/05-state-contract-audit.md`.

Key locked decisions:
- `Tile` owns per-card dungeon metadata such as dungeon card kind/effect/state/HP, route specials, and room/key flags.
- `BoardState` owns per-floor dungeon topology: exits, locks, levers, objectives, moving enemy hazards, and floor-local route/biome metadata.
- `RunState` owns cross-floor run systems: route map, shop wallet/offers, side rooms, relic/favor state, dungeon counters, run-global keys, and active run summary inputs.
- Renderer components derive dungeon presentation from shared state and must not become rule owners.
- Moving enemy hazards and dungeon enemy card pairs are separate models; future work must state which model it changes.

## Acceptance criteria
- Each dungeon field has an owner and lifecycle note.
- Ambiguous state is either removed, derived, or documented.
- Any proposed persisted field includes migration/version notes.

## Tests and verification
- Typecheck after changes.
- Add invariant tests if contract drift is found.

## Risks and edge cases
- Risk: refactor churn. Mitigation: document first, then change one state boundary per PR.

## Cross-links
- `../00-current-system-map.md`
- `../../refined-experience-gaps/REG-089-final-rules-versioning-save-migration-gate.md`

## Future handoff notes
This ticket is complete. Before adding new dungeon state fields, update `05-state-contract-audit.md` or explicitly state why the existing owner/lifecycle rules already cover the change.
