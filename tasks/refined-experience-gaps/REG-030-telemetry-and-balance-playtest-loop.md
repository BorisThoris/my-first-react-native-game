# REG-030: Telemetry And Balance Playtest Loop

## Status
Open

## Priority
P1

## Area
Systems

## Evidence
- `src/shared/game.ts`
- `src/shared/relics.ts`
- `src/shared/mutators.ts`
- `src/shared/contracts.ts`
- `src/shared/save-data.ts`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`

## Problem
Telemetry is optional, but balance work needs practical instrumentation. Without run summaries and aggregate signals, it is difficult to tune relics, mutators, floor scaling, objectives, shops, and modes.

## Target Experience
Developers should be able to inspect anonymized or local playtest data showing run length, failure points, relic picks, mutators, score curves, economy events, and objective completion rates.

## Suggested Implementation
- Define a lightweight local telemetry event model for playtest builds.
- Capture run start, floor clear, death, relic choice, mutator exposure, objective progress, shop purchase, and post-run summary.
- Keep personally identifiable data out of events by default.
- Store local aggregate stats in `PlayerStatsPersisted` only when player-facing; otherwise use debug/export logs.
- Bump `SAVE_SCHEMA_VERSION` only for persisted player stats, and `GAME_RULES_VERSION` when data keys depend on scoring rules.

## Acceptance Criteria
- A playtest run can export or inspect a useful summary.
- Balance-relevant events are named consistently and documented.
- Telemetry can be disabled.
- Player-facing stats and developer-only telemetry are clearly separated.

## Verification
- Run a sample play session and inspect emitted summary.
- Unit test event shaping if shared code is added.
- Confirm telemetry does not block gameplay when disabled or unavailable.

## Cross-links
- `REG-019-relic-build-archetypes.md`
- `REG-020-mutator-chapter-identity.md`
- `REG-023-daily-weekly-results-loop.md`
