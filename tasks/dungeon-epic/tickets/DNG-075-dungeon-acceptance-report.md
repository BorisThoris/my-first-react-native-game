# DNG-075: Dungeon acceptance report

## Status
Not started

## Priority
P0

## Subsystem
QA and release readiness

## Depends on
- `DNG-070`
- `DNG-071`
- `DNG-072`
- `DNG-073`
- `DNG-074`

## Current repo context
The REG backlog has product acceptance and release gates. This epic needs a dungeon-specific closeout.

## Problem
After many future sessions, the team needs a concise proof that dungeon depth is complete enough to ship.

## Target experience
The acceptance report summarizes shipped mechanics, known deferrals, test coverage, screenshots, balance metrics, and remaining risks.

## Implementation notes
- Create a report from the ledger, tickets, and tests.
- Include local/offline scope and online deferral.
- Include manual QA scenarios for full dungeon run.

## Acceptance criteria
- Report lists every DNG ticket status.
- P0 tickets are complete or explicitly deferred with owner/rationale.
- Verification commands and representative screenshots are recorded.

## Tests and verification
- `yarn test`, `yarn typecheck`, `yarn lint`, `yarn build` at minimum for final pass.
- E2E/visual suite as available.

## Risks and edge cases
- Risk: report becomes stale. Mitigation: generate close to release and cite commit/test output.

## Cross-links
- `../../refined-experience-gaps/REG-119-bot-batch-plan-and-product-acceptance-report.md`
- `../03-execution-ledger.md`

## Future handoff notes
Do last for this epic.

