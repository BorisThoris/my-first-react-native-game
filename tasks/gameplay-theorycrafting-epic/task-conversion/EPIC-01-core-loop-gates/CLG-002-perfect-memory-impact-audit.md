# CLG-002: Perfect Memory impact audit

## Status
Done

## Priority
P0

## Source Theory
- Pass 1: Perfect categories stay separate.
- Pass 3: Perfect-impact language.

## Player Decision
Let the player understand when an action preserves a pure memory achievement and when it spends an assist.

## Current System Connection
- `RunState.powersUsedThisRun`
- Pin, peek, shuffle, row shuffle, destroy, stray remove, undo, gambit, flash, and wild rules.
- Floor-clear summary and mechanics encyclopedia surfaces.

## Proposed Behavior
Audit every existing and planned player action for Perfect Memory impact. Keep pin safe, mark assist powers as Perfect Memory locking, and require floor-clear copy that names the first blocking assist when possible.

## UI / Visual / Audio
Use concise button/tooltips and floor-clear copy:
- Pin: `Perfect Memory-safe.`
- Assist actions: `Assist used: Perfect Memory locked.`
- Destroy: add reward-forfeit copy.
- Shuffle: add spatial-memory warning.

## Memory-Tax Score
Information bypass 0, spatial disruption 0, mistake recovery 0, hidden punishment 0, board-completion risk 0, UI load 1. Total 1.

## Risks
Perfect score and Perfect Memory achievement can blur if the UI does not distinguish no-mistake play from no-assist play.

## Acceptance Criteria
- Every current action has a documented Perfect Memory classification.
- Floor-clear design has a place to show why Perfect Memory was blocked.
- Codex/help copy distinguishes perfect floor score from Perfect Memory.

## Verification
- `src/shared/power-verbs.ts` now carries centralized Perfect Memory impact and copy for every shipped power.
- Pin remains `allowed`; every other shipped action is classified as `locks_perfect_memory`.
- `yarn test src/shared/power-verbs.test.ts`
- `yarn typecheck:shared`

## Cross-links
- `../../passes/01-core-loop-depth.md`
- `../../passes/03-powers-and-action-buttons.md`
