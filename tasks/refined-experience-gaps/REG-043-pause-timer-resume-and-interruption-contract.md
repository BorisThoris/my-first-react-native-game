# REG-043: Pause Timer Resume And Interruption Contract

## Status
Done

## Priority
P1

## Area
Systems

## Evidence
- `src/renderer/store/useAppStore.ts`
- `src/renderer/store/runTimerResumeConditions.ts`
- `src/shared/game.ts`
- `src/shared/contracts.ts`
- `docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md`
- `docs/refinement-tasks/REF-004.md`

## Problem
Timers, pause, overlays, settings, inventory, codex, level complete, and app interruptions all affect run time. The player should never feel a timed run advanced while they were in a safe menu, nor should pause be exploitable or inconsistent.

## Target Experience
Pause and resume rules should be simple: when the game is asking for a timed action, the timer runs; when the player is in an intentional pause or meta overlay, the timer stops or behaves exactly as documented.

## Suggested Implementation
- Document timer ownership between pure `RunState` rules and renderer/store wall-clock state.
- Audit pause, run settings, inventory, codex, game over, level complete, visibility hidden, and app blur.
- Define gauntlet-specific rules for hard deadlines.
- Keep timer state in `RunState` where it affects rules or exports; bump `GAME_RULES_VERSION` if scoring or fail conditions change.
- Add tests for 0ms completion, resume boundaries, and overlay transitions.

## Acceptance Criteria
- Pause/resume behavior is consistent across keyboard, buttons, overlays, and app visibility.
- Timed modes cannot lose time in non-gameplay overlays unless explicitly designed.
- Restart preserves intended timer length and mode rules.
- Player-facing copy explains timed mode behavior.

## Verification
- Unit test timer resume conditions.
- Manual gauntlet, daily, pause, inventory, settings, and app background flows.
- Add e2e coverage for pause keyboard and overlay transitions.

## Cross-links
- `REG-008-overlays-mobile-height-and-hierarchy.md`
- `REG-050-wild-gauntlet-meditation-mode-identity.md`
- `REG-041-run-export-replay-seed-integrity.md`
