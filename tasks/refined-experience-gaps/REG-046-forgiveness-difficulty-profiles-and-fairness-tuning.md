# REG-046: Forgiveness Difficulty Profiles And Fairness Tuning

## Status
Done

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/contracts.ts`
- `src/shared/game.ts`
- `docs/GAME_FORGIVENESS_DEEP_DIVE.md`
- `docs/GAME_FORGIVENESS_CODE_AUDIT.md`
- `docs/BALANCE_NOTES.md`
- `docs/new_design/SETTINGS_REFERENCE_CONTROLS_MATRIX.md`

## Problem
The app has several forgiveness systems, but difficulty profiles are not a first-class product choice. Players can still perceive mid-game as unfair if the survival and memorize curve are not readable.

## Target Experience
The default game should feel fair without removing skill. If difficulty profiles ship, they should be explicit rule variants with clear achievements, scoring, daily, and export implications.

## Suggested Implementation
- Audit current memorize constants, lives, first-miss grace, clean clear rewards, guards, combo shards, and parasite pressure.
- Decide whether difficulty is a real `Settings` control, a mode choice in `RunModeDefinition`, or deferred.
- If profiles affect rules, add explicit rule data and bump `GAME_RULES_VERSION`.
- Define achievement eligibility and daily/leaderboard fairness per profile.
- Use telemetry or playtest summaries from `PlayerStatsPersisted` only if player-facing stats are needed.

## Acceptance Criteria
- Default tuning has clear rationale and test coverage.
- Difficulty profile labels, if added, map to real rule changes.
- Daily/weekly modes do not become incomparable without explanation.
- Players understand why life or grace changed.

## Verification
- Run shared gameplay tests and endless simulation after tuning.
- Playtest fixed seeds to floor 6 and record results.
- Capture HUD and floor-clear copy that explains forgiveness outcomes.

## Cross-links
- `REG-036-reference-settings-controls-model-plan.md`
- `REG-030-telemetry-and-balance-playtest-loop.md`
- `REG-064-player-facing-copy-glossary-and-rules-language.md`
