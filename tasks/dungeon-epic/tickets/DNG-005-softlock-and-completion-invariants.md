# DNG-005: Softlock and completion invariants

## Status
Done

## Priority
P0

## Subsystem
Foundation and contracts

## Depends on
- `DNG-002`
- `DNG-004`

## Current repo context
`isBoardComplete`, board fairness inspection, decoy rules, exit activation, and hazard cleanup already exist but need to scale with richer dungeon mechanics.

## Problem
Keys, locks, enemies, traps, exits, wilds, decoys, destroy effects, and future hazards can create impossible boards if invariants are not centralized.

## Target experience
Every generated floor is finishable, and any intentionally blocked action has clear UI copy.

## Implementation notes
- Expanded `inspectBoardFairness` with dungeon-specific invariants for declared exits, lever-locked exits, moving enemy hazard tile references, dungeon pair metadata, mirrored enemy HP, and defeat-boss objective routes.
- Kept key-lock validation out of board-only fairness because keys can be carried on `RunState`; lever locks are floor-local and can be validated from board state.
- Extended `src/shared/softlock-fairness.test.ts` with corrupt-state cases for exits, levers, enemy hazards, dungeon card pairs, enemy HP, and boss objectives.

## Acceptance criteria
- Generated dungeon boards pass invariant checks across representative seeds.
- Completion remains possible after match, mismatch, destroy, shuffle, enemy contact, room, and exit interactions.
- Failure output names the broken pair/tile/objective.

## Tests and verification
- `yarn test src/shared/softlock-fairness.test.ts src/shared/game.test.ts`

## Risks and edge cases
- Risk: invariant checker rejects valid special floors. Mitigation: add explicit allowed blocker categories.

## Cross-links
- `../04-balance-and-invariants.md`
- `../../refined-experience-gaps/REG-087-anti-softlock-fairness-and-edge-case-suite.md`

## Future handoff notes
The checker is now ready to guard `DNG-020` taxonomy work. Future card families should add one targeted invalid-state test here when they introduce new state fields or objective dependencies.
