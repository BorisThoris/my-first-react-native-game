# REG-065: Long Content Tail Level Pack And Puzzle Curation

## Status
Open

## Priority
P2

## Area
Gameplay

## Evidence
- `src/shared/builtin-puzzles.ts`
- `src/shared/puzzle-import.ts`
- `docs/gameplay-depth/05-app-specific-idea-backlog.md`
- `docs/MARKET_SIMILAR_GAMES_RESEARCH.md`
- `docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md`

## Problem
Premium puzzle games often rely on curated content tails: level packs, challenge sets, themes, or authored puzzle collections. The current puzzle system needs a long-term curation plan beyond a small built-in library.

## Target Experience
Players should have reasons to return after mastering the main run loop: curated packs, challenge boards, seasonal dailies, difficulty ladders, and community-safe imports if supported.

## Suggested Implementation
- Define content pack taxonomy: tutorial, beginner, challenge, daily archive, event, and experimental.
- Add metadata for puzzle difficulty, tags, goals, author, and version.
- Store completion and medals in `SaveData`; bump `SAVE_SCHEMA_VERSION` if persisted.
- Validate puzzle imports with friendly errors and no unsafe payloads.
- Coordinate with `RunModeDefinition` if packs become selectable modes.

## Acceptance Criteria
- Puzzle content has clear difficulty and completion tracking.
- Built-in puzzle additions follow a contribution checklist.
- Imports fail safely with readable errors.
- Content packs do not require code changes for every new board if a data path is feasible.

## Verification
- Unit test puzzle import and validation.
- Manual complete/replay puzzle pack states.
- Capture puzzle library and completion screens.

## Cross-links
- `REG-022-puzzle-library-and-authoring-flow.md`
- `REG-041-run-export-replay-seed-integrity.md`
- `REG-011-meta-screens-reward-value.md`
