# CLG-001: Memory-tax review checklist

## Status
Done

## Priority
P0

## Source Theory
- Pass 1: detailed memory-tax rubric and task-readiness gate.
- Pass 8: core-loop protection gate and memory-tax review pass.

## Player Decision
Protect whether a mechanic asks the player to remember, infer, sequence, or prioritize instead of bypassing the board.

## Current System Connection
- `src/shared/game.ts`
- `src/shared/contracts.ts`
- `docs/BALANCE_NOTES.md`
- `tasks/gameplay-theorycrafting-epic/passes/01-core-loop-depth.md`

## Proposed Behavior
Create a reusable implementation review checklist that every future action, card, relic, floor, and prototype task must fill before work starts. The checklist should score all six memory-tax axes, classify the mechanic as skill test/tool/bailout/bypass, and state whether it can ship, prototype, defer, or reject.

## UI / Visual / Audio
Checklist must require Pass 7 tokens, player-facing preview, persistent reminder, result feedback, floor-clear causality, and a11y equivalent.

## Memory-Tax Score
0 by itself. This is a review gate, not a mechanic.

## Risks
If this becomes optional, future features can add hidden punishment or board-completion risk without review.

## Acceptance Criteria
- Checklist exists in the task pack and is linked from the conversion README.
- Checklist includes all Pass 1 axes and tax bands.
- Checklist includes ship/prototype/defer/reject decision output.
- Future task files can copy it without extra interpretation.

## Verification
- Added `src/shared/mechanic-feedback.ts` with memory-tax axes, tax-band calculation, mechanic classes, and semantic token coverage helpers.
- Added `src/shared/mechanic-feedback.test.ts`.
- `yarn test src/shared/mechanic-feedback.test.ts`
- `yarn typecheck:shared`

## Cross-links
- `../../passes/01-core-loop-depth.md`
- `../00-task-template.md`
