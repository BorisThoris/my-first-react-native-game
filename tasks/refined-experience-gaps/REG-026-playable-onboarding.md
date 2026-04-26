# REG-026: Playable Onboarding

## Status
Done

## Priority
P0

## Area
Gameplay

## Evidence
- `src/renderer/components/TutorialOverlay.tsx`
- `src/renderer/components/RulesModal.tsx`
- `src/renderer/components/GameScreen.tsx`
- `src/shared/save-data.ts`
- `docs/new_design/TASKS/TASKS_OVERLAYS_FTUE.md`

## Problem
Onboarding should become guided first-run interaction, not mostly text panels. Text can explain rules, but it does not teach the feel of flipping, matching, missing, scoring, and recovering inside a real run.

## Target Experience
First-time players should learn by doing a short guided sequence. The game should introduce the board, valid moves, match feedback, scoring, mistakes, relics or rewards, and then hand control back cleanly.

## Suggested Implementation
- Add a guided first-run scenario or tutorial mode with scripted board moments.
- Gate hints based on actual player actions, not only static screens.
- Persist completion and dismissed hints in `SaveData`.
- If tutorial logic depends on special rules, isolate it in a `RunModeDefinition` or tutorial-specific mode.
- Use `SAVE_SCHEMA_VERSION` if new onboarding fields are persisted and `GAME_RULES_VERSION` if tutorial scoring/rules affect completion.

## Acceptance Criteria
- New players can complete the first tutorial without reading a long rules modal.
- Returning players can skip, replay, or reset onboarding.
- Tutorial prompts do not appear during normal runs after completion unless explicitly requested.
- Mobile tutorial prompts do not cover the active card targets.

## Verification
- Test fresh profile, completed tutorial profile, and reset tutorial profile.
- Manually complete, skip, and replay onboarding.
- Capture tutorial prompts on phone and desktop.

## Cross-links
- `REG-005-in-game-rules-hints-disclosure.md`
- `REG-022-puzzle-library-and-authoring-flow.md`
- `REG-029-input-accessibility-and-controller-comfort.md`
