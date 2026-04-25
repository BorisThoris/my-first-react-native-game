# REG-005: In-Game Rules Hints Disclosure

## Status
Open

## Priority
P1

## Area
UI

## Evidence
- `src/renderer/components/GameScreen.tsx`
- `src/renderer/components/GameScreen.module.css`
- `src/renderer/components/TutorialOverlay.tsx`
- `src/renderer/components/RulesModal.tsx`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`
- `test-results/visual-screens/mobile/portrait/04-game-playing.png`

## Problem
Rules and help strips can consume valuable play space even after the player understands the mechanic. They are useful for first-run comprehension, but they become visual noise during repeated play.

## Target Experience
Rules should appear when they solve a current problem: first exposure, new mechanic, invalid move, or explicit help request. Experienced players should see a clean gameplay surface.

## Suggested Implementation
- Replace always-on helper strips with progressive disclosure.
- Add short contextual nudges for first exposure to mechanics, then persist dismissal.
- Put complete rules in a compact help modal or sheet accessible from gameplay.
- Keep onboarding flags in `SaveData` or an existing FTUE field, with `SAVE_SCHEMA_VERSION` migration if new persistence is added.
- Use `GAME_RULES_VERSION` if hints depend on changed rules or mode behavior.

## Acceptance Criteria
- First-time players receive enough guidance to make valid moves.
- Returning players are not forced to carry persistent rules text in the main play area.
- Help remains accessible during gameplay and pause.
- Hint dismissals survive reload when persistence is implemented.

## Verification
- Test a fresh profile and an existing profile.
- Manually trigger invalid move, first relic, first mutator, and first floor-clear contexts.
- Verify mobile screenshots show reduced permanent help chrome.

## Cross-links
- `REG-026-playable-onboarding.md`
- `REG-008-overlays-mobile-height-and-hierarchy.md`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`
