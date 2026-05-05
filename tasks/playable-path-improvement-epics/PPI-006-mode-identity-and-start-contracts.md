# PPI-006: Mode identity and start contracts

## Status
Done

## Priority
P1

## Area
Modes / product identity

## Evidence
- `e2e/playable-path-mode-matrix.spec.ts`
- `src/shared/run-mode-catalog.ts`
- `src/renderer/components/ChooseYourPathScreen.tsx`
- `tasks/refined-experience-gaps/REG-050-wild-gauntlet-meditation-mode-identity.md`
- `tasks/refined-experience-gaps/REG-081-challenge-mode-progression-and-unlock-gates.md`

## Problem
The mode matrix proves that most modes can start. It does not yet prove that each mode feels distinct after the run begins or that the player can immediately tell what contract they accepted.

## Target Experience
Every Choose Path mode has a distinct promise, visible start confirmation, HUD/run-state identity, and post-run summary treatment.

## Suggested Implementation
- Add lightweight mode-specific assertions after run start: HUD chip, inventory mode row, mutator/contract flag, timer, puzzle label, or practice/achievement policy.
- Improve copy where a mode starts but its rules are not obvious.
- Keep locked Endless clear as staged future scope, not a broken path.

## Acceptance Criteria
- E2E validates one mode-specific signal for each available mode.
- Inventory or HUD communicates mode constraints for Scholar, Pin Vow, Gauntlet, Meditation, Wild, Puzzle, Practice, Daily, and Dungeon Showcase.
- Game-over summary preserves mode identity where applicable.

## Verification
- `yarn playwright test e2e/playable-path-mode-matrix.spec.ts --workers=1`
- Unit tests for run-mode catalog or discovery rows if copy/model changes.

## Placeholder and asset contract
Mode poster final art is not required. Use existing mode art and copy.

## Cross-links
- `../refined-experience-gaps/REG-050-wild-gauntlet-meditation-mode-identity.md`
- `../refined-experience-gaps/REG-081-challenge-mode-progression-and-unlock-gates.md`
- `../refined-experience-gaps/REG-100-empty-loading-error-and-locked-states.md`
