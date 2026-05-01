# DNG-015: Run history and dungeon journal

## Status
Not started

## Priority
P1

## Subsystem
Run map and floor journey

## Depends on
- `DNG-010`
- `DNG-050`

## Current repo context
Run history, run export, and profile summary modules exist. Dungeon events are not yet a rich journal.

## Problem
Deep dungeon runs need memory: route taken, bosses beaten, build decisions, treasure found, and failure cause.

## Target experience
After a run, players can understand what happened and why the run succeeded or failed.

## Implementation notes
- Define a compact local journal event set.
- Store only stable summary data, not full replay unless a replay ticket owns it.
- Include route, node, boss, relic, objective, and death/clear milestones.

## Acceptance criteria
- Game over/results can show dungeon journey highlights.
- Run export includes privacy-safe dungeon summary.
- Journal data remains local/offline.

## Tests and verification
- Unit tests for journal summarization.
- Save compatibility tests if persisted.

## Risks and edge cases
- Risk: bloated saves. Mitigation: cap journal length and store summaries.

## Cross-links
- `../../refined-experience-gaps/REG-085-run-history-build-replay-and-journal.md`
- `../../refined-experience-gaps/REG-041-run-export-replay-seed-integrity.md`

## Future handoff notes
Implement after route and reward contracts are stable.

