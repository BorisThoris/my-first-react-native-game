# REG-048: Secondary Objectives Bonus Clarity

## Status
Open

## Priority
P1

## Area
Gameplay

## Evidence
- `src/shared/contracts.ts`
- `src/shared/game.ts`
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameplayHudBar.tsx`
- `docs/gameplay-depth/04-secondary-objectives.md`
- `docs/gameplay-tasks/GP-SECONDARY-OBJECTIVES.md`

## Problem
Secondary objectives exist, but their bonus logic can be easy to miss during play. Glass witness, cursed last, flip par, and scholar-style bonuses need clearer setup, tracking, and celebration.

## Target Experience
Objectives should feel like optional mastery goals that support the core loop. Players should know the target before they fail it, see progress while playing, and understand the reward after floor clear.

## Suggested Implementation
- Add compact pre-floor and in-floor objective language.
- Display failed, active, and completed states without crowding the HUD.
- Ensure bonus tags and floor-clear summaries use consistent wording.
- Keep objective state in `RunState` and `LevelResult`.
- Bump `GAME_RULES_VERSION` for scoring, generation, or objective rule changes.

## Acceptance Criteria
- Active objective conditions are visible before or during the floor.
- Failed objectives explain why they failed when useful.
- Floor-clear summary celebrates completed bonuses.
- Objective copy matches Codex and tests.

## Verification
- Unit test objective outcomes.
- Manual test each objective success and failure path.
- Capture HUD and floor-clear states for each objective.

## Cross-links
- `REG-021-quests-contracts-objective-board.md`
- `REG-064-player-facing-copy-glossary-and-rules-language.md`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`
