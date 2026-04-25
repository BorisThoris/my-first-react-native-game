# REG-022: Puzzle Library And Authoring Flow

## Status
Open

## Priority
P2

## Area
Gameplay

## Evidence
- `src/shared/run-mode-catalog.ts`
- `src/shared/game.ts`
- `src/renderer/components/ChooseYourPathScreen.tsx`
- `docs/gameplay-tasks/GP_AUDIT_ROLLUP.md`

## Problem
Puzzle mode needs a broader library, progress model, and cleaner import or editor path. Without that, puzzle mode risks feeling like a placeholder rather than a durable alternate way to play.

## Target Experience
Puzzle mode should feel like a curated challenge library with completion, medals or mastery, and an authoring/import path that can grow content without source-code friction.

## Suggested Implementation
- Define puzzle metadata, goals, difficulty, tags, and validation rules.
- Add puzzle library browsing and completion state.
- Add import/export format and a simple authoring or validation flow.
- Store puzzle completion in `SaveData`; bump `SAVE_SCHEMA_VERSION` if persisted.
- Use `GAME_RULES_VERSION` when puzzle validation depends on core rule changes.

## Acceptance Criteria
- Puzzle library supports multiple puzzles with visible progress.
- Puzzle detail view explains goal, rules, and completion status.
- Invalid puzzle imports fail with useful errors.
- Completion is persisted and shown in meta or mode surfaces.

## Verification
- Unit test puzzle validation and import parsing.
- Manual complete, replay, and failed puzzle attempts.
- Capture library, detail, completion, and import error states.

## Cross-links
- `REG-010-choose-path-discoverability.md`
- `REG-011-meta-screens-reward-value.md`
- `REG-026-playable-onboarding.md`
