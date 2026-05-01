# DNG-003: Dungeon rules versioning policy

## Status
Done

## Priority
P0

## Subsystem
Foundation and contracts

## Depends on
- `DNG-002`

## Current repo context
The code already uses `GAME_RULES_VERSION`, schedule/rules versions, and save schema concepts. Dungeon generation changes can affect replay and saved runs.

## Problem
Future dungeon changes need a clear rule for when to bump versions and how to keep old runs fair.

## Target experience
Players can resume local runs safely. Developers can reason about replay drift, daily drift, and generation changes.

## Implementation notes
- Define replay-affecting changes: board recipe, enemy movement, rewards, scoring, objective completion, route graph.
- Define non-replay changes: copy, visual-only telegraphs, Codex wording, reduced-motion rendering.
- Add a checklist to future DNG tickets.

## Acceptance criteria
- Ticket template references rules/save version policy.
- At least one unit test or doc check guards accidental unversioned generation changes where practical.

## Tests and verification
- Run deterministic generation tests after mechanics changes.
- Include migration tests when persisted shape changes.

## Risks and edge cases
- Risk: over-bumping versions. Mitigation: classify changes before implementation.

## Cross-links
- `../04-balance-and-invariants.md`
- `../../refined-experience-gaps/REG-121-rng-determinism-replay-drift-audit.md`

## Future handoff notes
When in doubt, mention the version decision in the final answer and ledger. DNG-003 v1 adds `DUNGEON_RULES_VERSION_POLICY_VERSION` and ticket-template guidance for replay-affecting vs copy/visual-only changes.
