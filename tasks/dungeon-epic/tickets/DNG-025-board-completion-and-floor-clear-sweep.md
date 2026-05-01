# DNG-025: Board completion and floor-clear sweep

## Status
Done

## Priority
P0

## Subsystem
Board encounter system

## Depends on
- `DNG-005`
- `DNG-024`

## Current repo context
Floor completion uses `isBoardComplete` and `finalizeLevel`; enemy hazards can be defeated by floor-clear sweep.

## Problem
As systems deepen, floor clear must clean transient board state without awarding unintended rewards or hiding blockers.

## Target experience
When the last required card is resolved, the floor ends cleanly: threats are defeated/cleared, objectives finalize, rewards pay once, and UI shows a stable result.

## Implementation notes
- `finalizeLevel` now clears stale board `flippedTileIds` after floor-clear cleanup.
- Floor-local transient targeting state is cleared on level complete: pinned tile ids, peek reveals, flash reveals, stray-remove arm, region-shuffle row arm, and sticky block index.
- Active moving enemy hazards are defeated during floor clear and summarized through `enemyHazardsDefeatedThisFloor`; repeated exit activation after `levelComplete` remains idempotent.

## Acceptance criteria
- Floor clear cannot leave active hazards, stale flipped ids, or unresolved blockers.
- Rewards are idempotent.
- Level result includes enough information for summary/journal.

## Tests and verification
- `yarn test src/shared/game.test.ts src/shared/softlock-fairness.test.ts`
- `yarn typecheck`

## Risks and edge cases
- Risk: floor-clear cleanup masks generation bugs. Mitigation: run fairness checks before cleanup where possible.

## Cross-links
- `DNG-015`
- `DNG-074`

## Future handoff notes
Any new floor-local targeting/highlight/status field should be either explicitly preserved for the summary or cleared in `finalizeLevel` with a regression test.
